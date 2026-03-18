import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

const formatDateTime = (value) => {
	if (!value) return '-'
	const date = value instanceof Date ? value : new Date(value)
	if (Number.isNaN(date.getTime())) return '-'
	return new Intl.DateTimeFormat('ko-KR', {
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(date)
}

const MessageThreadModal = ({
	isOpen,
	onClose,
	viewer = 'tutor',
	bookingId,
	tutorId,
	tutorName,
	studentId,
	studentName,
	subject,
}) => {
	const [messages, setMessages] = useState([])
	const [content, setContent] = useState('')
	const [loading, setLoading] = useState(false)
	const [sending, setSending] = useState(false)
	const [error, setError] = useState('')
	const [notice, setNotice] = useState('')
	const [replyWritable, setReplyWritable] = useState(true)

	const counterpartName = useMemo(() => (
		viewer === 'tutor'
			? (studentName || '학생')
			: (tutorName || '튜터')
	), [studentName, tutorName, viewer])

	useEffect(() => {
		if (!isOpen || !bookingId) return

		const loadThread = async () => {
			setLoading(true)
			setError('')
			setNotice('')
			try {
				if (viewer === 'tutor') {
					const response = await api.get('/tutor/messages/thread', { params: { studentId, bookingId } })
					setMessages(response.data?.data || [])
					setReplyWritable(true)
				} else {
					const [threadResponse, writableResponse] = await Promise.all([
						api.get('/tutor/messages/thread/member', { params: { tutorId, bookingId } }),
						api.get('/tutor/messages/reply-writable', { params: { tutorId, bookingId } }),
					])
					setMessages(threadResponse.data?.data || [])
					setReplyWritable(writableResponse.data?.data !== false)
				}
			} catch (requestError) {
				setMessages([])
				setError(requestError?.response?.data?.message || '메시지 내역을 불러오지 못했습니다.')
			} finally {
				setLoading(false)
			}
		}

		loadThread()
	}, [bookingId, isOpen, studentId, tutorId, viewer])

	useEffect(() => {
		if (!isOpen) {
			setContent('')
			setError('')
			setNotice('')
			setMessages([])
			setReplyWritable(true)
		}
	}, [isOpen])

	if (!isOpen) return null

	const handleSend = async (event) => {
		event.preventDefault()
		setError('')
		setNotice('')

		const trimmedContent = content.trim()
		if (!trimmedContent) {
			setError('메시지 내용을 입력해 주세요.')
			return
		}

		setSending(true)
		try {
			if (viewer === 'tutor') {
				await api.post('/tutor/messages', {
					studentId,
					bookingId,
					content: trimmedContent,
				})
			} else {
				await api.post('/tutor/messages/reply', {
					tutorId,
					bookingId,
					content: trimmedContent,
				})
			}

			const reloadEndpoint = viewer === 'tutor' ? '/tutor/messages/thread' : '/tutor/messages/thread/member'
			const reloadParams = viewer === 'tutor'
				? { studentId, bookingId }
				: { tutorId, bookingId }
			const response = await api.get(reloadEndpoint, { params: reloadParams })
			setMessages(response.data?.data || [])
			setContent('')
			setNotice('메시지를 전송했습니다.')
		} catch (requestError) {
			setError(requestError?.response?.data?.message || '메시지 전송에 실패했습니다.')
		} finally {
			setSending(false)
		}
	}

	return (
		<div className='fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-3 py-6'>
			<div className={`flex w-full flex-col bg-white shadow-2xl ${viewer === 'tutor' ? 'max-w-[560px] rounded-[18px]' : 'max-w-2xl rounded-2xl'}`}>
				<div className={`flex items-center justify-between px-5 ${viewer === 'tutor' ? 'border-b-0 pb-0 pt-5' : 'border-b border-slate-200 py-4'}`}>
					<div>
						<h3 className='text-lg font-bold text-slate-900'>메시지 보내기</h3>
						<p className='mt-1 text-sm text-slate-500'>{counterpartName} · {subject || '수업'}</p>
					</div>
					<button type='button' onClick={onClose} className='rounded-md px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700'>
						닫기
					</button>
				</div>

				<div className='px-5 py-5'>
					<div className='mb-3'>
						<div className='mb-1 text-sm text-slate-500'>받는 {viewer === 'tutor' ? '학생' : '튜터'}</div>
						<div className='text-xl font-bold text-slate-900'>{counterpartName}</div>
						<div className='mt-1 text-sm text-slate-500'>{subject || '수업'} · 예약 ID {bookingId}</div>
					</div>

					<div className='mb-3'>
						<div className='mb-2 text-sm text-slate-500'>메시지 내역</div>
						<div className='max-h-[320px] min-h-[180px] overflow-y-auto rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-3'>
							{loading ? (
								<div className='py-10 text-center text-sm text-slate-500'>메시지를 불러오는 중입니다...</div>
							) : messages.length === 0 ? (
								<div className='py-10 text-center text-sm text-slate-500'>아직 메시지가 없습니다.</div>
							) : messages.map((message) => {
								const isOwn = viewer === 'tutor'
									? message.senderRole === 'TUTOR'
									: message.senderRole === 'STUDENT'
								return (
									<div key={message.id || `${message.senderRole}-${message.createdAt}`} className={`mb-2 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
										<div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${isOwn ? 'bg-[#4f46e5] text-white' : 'bg-white text-slate-800 ring-1 ring-slate-200'}`}>
											<div className={`mb-1 text-xs font-semibold ${isOwn ? 'text-indigo-100' : 'text-slate-500'}`}>
												{message.senderRole === 'TUTOR' ? (tutorName || '튜터') : (studentName || '학생')}
											</div>
											<div className='whitespace-pre-wrap break-words text-sm leading-6'>{message.content || '-'}</div>
											<div className={`mt-2 text-right text-[11px] ${isOwn ? 'text-indigo-100' : 'text-slate-400'}`}>{formatDateTime(message.createdAt)}</div>
										</div>
									</div>
								)
							})}
						</div>
					</div>

					<form onSubmit={handleSend}>
						{error && <div className='mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600'>{error}</div>}
						{notice && <div className='mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600'>{notice}</div>}

						{viewer === 'member' && !replyWritable ? (
							<div className='rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500'>
								현재 이 예약에는 답장을 작성할 수 없습니다.
							</div>
						) : (
							<>
								<div className='mb-3'>
									<div className='mb-2 text-sm text-slate-500'>메시지 입력</div>
									<textarea
										value={content}
										onChange={(event) => setContent(event.target.value)}
										className='min-h-[96px] w-full resize-none rounded-[12px] border border-[#dbe4f0] bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#93c5fd] focus:shadow-[0_0_0_0.2rem_rgba(37,99,235,0.15)]'
										placeholder='메시지 내용을 입력하세요.'
									/>
								</div>
								<div className='flex justify-end gap-2'>
									<button type='button' onClick={onClose} className='inline-flex h-10 items-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-200'>
										취소
									</button>
									<button type='submit' disabled={sending} className='inline-flex min-w-[120px] h-10 items-center justify-center rounded-xl bg-[#4f46e5] px-4 text-sm font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'>
										{sending ? '전송 중...' : '메시지 전송'}
									</button>
								</div>
							</>
						)}
					</form>
				</div>
			</div>
		</div>
	)
}

export default MessageThreadModal
