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
			<div className='flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl'>
				<div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
					<div>
						<h3 className='text-lg font-bold text-slate-900'>{counterpartName}와의 메시지</h3>
						<p className='mt-1 text-sm text-slate-500'>{subject || '수업'} · 예약 ID {bookingId}</p>
					</div>
					<button type='button' onClick={onClose} className='rounded-md px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700'>
						닫기
					</button>
				</div>

				<div className='max-h-[420px] space-y-3 overflow-y-auto bg-slate-50 px-5 py-5'>
					{loading ? (
						<div className='rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500'>메시지를 불러오는 중입니다...</div>
					) : messages.length === 0 ? (
						<div className='rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500'>등록된 메시지가 없습니다.</div>
					) : messages.map((message) => {
						const isOwn = viewer === 'tutor'
							? message.senderRole === 'TUTOR'
							: message.senderRole === 'STUDENT'
						return (
							<div key={message.id || `${message.senderRole}-${message.createdAt}`} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
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

				<form onSubmit={handleSend} className='border-t border-slate-200 px-5 py-4'>
					{error && <div className='mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600'>{error}</div>}
					{notice && <div className='mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600'>{notice}</div>}
					{viewer === 'member' && !replyWritable ? (
						<div className='rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500'>
							현재 이 예약에는 답장을 작성할 수 없습니다.
						</div>
					) : (
						<>
							<textarea
								value={content}
								onChange={(event) => setContent(event.target.value)}
								className='min-h-[110px] w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#4f46e5]'
								placeholder='메시지를 입력해 주세요.'
							/>
							<div className='mt-3 flex justify-end gap-2'>
								<button type='button' onClick={onClose} className='inline-flex h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
									닫기
								</button>
								<button type='submit' disabled={sending} className='inline-flex h-10 items-center rounded-xl bg-[#4f46e5] px-4 text-sm font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'>
									{sending ? '전송 중...' : '메시지 보내기'}
								</button>
							</div>
						</>
					)}
				</form>
			</div>
		</div>
	)
}

export default MessageThreadModal
