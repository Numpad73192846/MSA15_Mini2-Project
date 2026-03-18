import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

const ENDPOINT_BY_MODE = {
	'lesson-summary': '/ai/lesson-summary',
	homework: '/ai/homework',
}

const TITLE_BY_MODE = {
	'lesson-summary': 'AI 수업 요약',
	homework: 'AI 과제 초안',
}

const DESCRIPTION_BY_MODE = {
	'lesson-summary': '수업 내용과 핵심 포인트를 입력하면 요약 포맷으로 정리합니다.',
	homework: '수업 맥락을 입력하면 학생에게 전달할 과제 초안을 생성합니다.',
}

const createForm = (defaults) => ({
	tutorName: defaults?.tutorName || '',
	studentName: defaults?.studentName || '',
	subject: defaults?.subject || '',
	lessonContext: defaults?.lessonContext || '',
})

const AiAssistantModal = ({ isOpen, onClose, mode = 'lesson-summary', defaults }) => {
	const [form, setForm] = useState(createForm(defaults))
	const [result, setResult] = useState('')
	const [error, setError] = useState('')
	const [notice, setNotice] = useState('')
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!isOpen) return
		setForm(createForm(defaults))
		setResult('')
		setError('')
		setNotice('')
	}, [defaults, isOpen, mode])

	const title = useMemo(() => TITLE_BY_MODE[mode] || 'AI 도우미', [mode])
	const description = useMemo(() => DESCRIPTION_BY_MODE[mode] || '', [mode])

	if (!isOpen) return null

	const updateField = (event) => {
		const { name, value } = event.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleGenerate = async (event) => {
		event.preventDefault()
		setError('')
		setNotice('')
		setResult('')

		if (!form.lessonContext.trim()) {
			setError('수업 내용을 입력해 주세요.')
			return
		}

		setLoading(true)
		try {
			const response = await api.post(ENDPOINT_BY_MODE[mode] || ENDPOINT_BY_MODE['lesson-summary'], {
				tutorName: form.tutorName.trim(),
				studentName: form.studentName.trim(),
				subject: form.subject.trim(),
				lessonContext: form.lessonContext.trim(),
			})
			const text = response.data?.data?.text || ''
			if (!text) {
				setError('생성 결과가 비어 있습니다.')
				return
			}
			setResult(text)
		} catch (requestError) {
			setError(requestError?.response?.data?.message || `${title} 생성에 실패했습니다.`)
		} finally {
			setLoading(false)
		}
	}

	const handleCopy = async () => {
		if (!result) return
		try {
			await navigator.clipboard.writeText(result)
			setNotice('결과를 클립보드에 복사했습니다.')
		} catch {
			setNotice('복사에 실패했습니다. 직접 선택해서 복사해 주세요.')
		}
	}

	return (
		<div className='fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-3 py-6'>
			<div className='w-full max-w-3xl rounded-2xl bg-white shadow-2xl'>
				<div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
					<div>
						<h3 className='text-lg font-bold text-slate-900'>{title}</h3>
						<p className='mt-1 text-sm text-slate-500'>{description}</p>
					</div>
					<button type='button' onClick={onClose} className='rounded-md px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700'>
						닫기
					</button>
				</div>

				<form onSubmit={handleGenerate} className='grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
					<div className='space-y-4'>
						<div className='grid gap-4 sm:grid-cols-2'>
							<label className='block'>
								<span className='mb-1 block text-sm font-semibold text-slate-700'>튜터명</span>
								<input
									name='tutorName'
									value={form.tutorName}
									onChange={updateField}
									className='h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-[#4f46e5]'
									placeholder='튜터 이름'
								/>
							</label>
							<label className='block'>
								<span className='mb-1 block text-sm font-semibold text-slate-700'>학생명</span>
								<input
									name='studentName'
									value={form.studentName}
									onChange={updateField}
									className='h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-[#4f46e5]'
									placeholder='학생 이름'
								/>
							</label>
						</div>

						<label className='block'>
							<span className='mb-1 block text-sm font-semibold text-slate-700'>과목</span>
							<input
								name='subject'
								value={form.subject}
								onChange={updateField}
								className='h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-[#4f46e5]'
								placeholder='수업 과목'
							/>
						</label>

						<label className='block'>
							<span className='mb-1 block text-sm font-semibold text-slate-700'>수업 내용</span>
							<textarea
								name='lessonContext'
								value={form.lessonContext}
								onChange={updateField}
								className='min-h-[240px] w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#4f46e5]'
								placeholder='이번 수업에서 다룬 내용, 숙제, 학생 반응, 다음 수업 메모 등을 입력해 주세요.'
							/>
						</label>

						{error && <div className='rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600'>{error}</div>}

						<div className='flex flex-wrap justify-end gap-2'>
							<button type='button' onClick={onClose} className='inline-flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
								취소
							</button>
							<button type='submit' disabled={loading} className='inline-flex h-10 items-center rounded-xl bg-[#4f46e5] px-4 text-sm font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'>
								{loading ? '생성 중...' : `${title} 생성`}
							</button>
						</div>
					</div>

					<div className='flex min-h-[420px] flex-col rounded-2xl border border-slate-200 bg-slate-50'>
						<div className='flex items-center justify-between border-b border-slate-200 px-4 py-3'>
							<div className='text-sm font-semibold text-slate-800'>생성 결과</div>
							<button type='button' onClick={handleCopy} disabled={!result} className='inline-flex h-8 items-center rounded-lg border border-[#4f46e5] px-3 text-xs font-semibold text-[#4f46e5] hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50'>
								복사
							</button>
						</div>
						<div className='flex-1 px-4 py-4'>
							{result ? (
								<pre className='whitespace-pre-wrap break-words text-sm leading-6 text-slate-700'>{result}</pre>
							) : (
								<div className='flex h-full items-center justify-center text-center text-sm text-slate-400'>
									생성된 결과가 여기에 표시됩니다.
								</div>
							)}
						</div>
						{notice && <div className='border-t border-slate-200 px-4 py-3 text-sm text-emerald-600'>{notice}</div>}
					</div>
				</form>
			</div>
		</div>
	)
}

export default AiAssistantModal
