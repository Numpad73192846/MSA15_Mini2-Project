import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AiAssistantModal from '../common/AiAssistantModal'
import Layout from '../common/Layout'
import MessageThreadModal from '../common/MessageThreadModal'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'
import bookIcon from '../../assets/image/mypage/book.svg'
import remainIcon from '../../assets/image/mypage/remain.svg'
import doneIcon from '../../assets/image/mypage/done.svg'

const tabItems = [
	{ key: 'bookings', label: '예약 내역' },
	{ key: 'reviews', label: '내 리뷰' },
	{ key: 'schedule', label: '주간 스케줄' },
]

const EMPTY_LIST = []

const formatDate = (value, options) => {
	if (!value) return '-'
	const date = value instanceof Date ? value : new Date(value)
	if (Number.isNaN(date.getTime())) return '-'
	return new Intl.DateTimeFormat('ko-KR', options).format(date)
}

const formatCurrency = (value) => {
	const amount = Number(value || 0)
	return `${amount.toLocaleString('ko-KR')}원`
}

const parseBookingStartAt = (booking) => {
	if (booking?.startAt) {
		const fromStartAt = new Date(booking.startAt)
		if (!Number.isNaN(fromStartAt.getTime())) return fromStartAt
	}
	if (booking?.lessonDate && booking?.startTime) {
		const fromLesson = new Date(`${booking.lessonDate}T${booking.startTime}`)
		if (!Number.isNaN(fromLesson.getTime())) return fromLesson
	}
	return null
}

const toLessonTime = (booking) => {
	const date = parseBookingStartAt(booking)
	return date ? date.getTime() : Number.MAX_SAFE_INTEGER
}

const formatLessonDateText = (booking) => {
	if (booking?.lessonDate) return booking.lessonDate
	const date = parseBookingStartAt(booking)
	return date ? formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'
}

const formatLessonTimeText = (booking) => {
	if (booking?.startTime) return booking.startTime
	const date = parseBookingStartAt(booking)
	return date ? formatDate(date, { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'
}

const formatDurationLabel = (booking) => {
	const hours = Number(booking?.durationHours || 0)
	if (Number.isFinite(hours) && hours > 0) {
		if (Number.isInteger(hours)) return `${hours}시간`
		return `${Math.round(hours * 60)}분`
	}
	if (booking?.startAt && booking?.endAt) {
		const start = new Date(booking.startAt)
		const end = new Date(booking.endAt)
		if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
			const mins = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
			if (mins >= 60 && mins % 60 === 0) return `${mins / 60}시간`
			if (mins > 0) return `${mins}분`
		}
	}
	return '30분'
}

const getTutorId = (booking) => String(
	booking?.tutorId
	|| booking?.tutorUserId
	|| booking?.tutorProfileId
	|| booking?.tutor_id
	|| ''
)

const getStatusMeta = (status) => {
	switch (status) {
		case 'CONFIRMED':
			return { label: '확정', className: 'bg-emerald-500 text-white' }
		case 'PENDING':
			return { label: '대기중', className: 'bg-amber-300 text-slate-900' }
		case 'COMPLETED':
			return { label: '완료', className: 'bg-slate-500 text-white' }
		case 'CANCELLED':
			return { label: '취소', className: 'bg-slate-300 text-slate-700' }
		default:
			return { label: status || '상태확인중', className: 'bg-slate-200 text-slate-700' }
	}
}

const canCancelPaidBooking = (booking) => {
	const startAt = parseBookingStartAt(booking)
	if (!startAt) return false
	const deadline = new Date(startAt.getTime() - (3 * 24 * 60 * 60 * 1000))
	return Date.now() <= deadline.getTime()
}

const normalizeZoomJoinUrl = (rawUrl) => {
	const trimmed = String(rawUrl || '').trim()
	if (!trimmed) return 'https://zoom.us/wc/join'
	return /^https?:\/\//i.test(trimmed) ? trimmed : 'https://zoom.us/wc/join'
}

const getWeekStart = (baseDate) => {
	const date = new Date(baseDate)
	date.setHours(0, 0, 0, 0)
	date.setDate(date.getDate() - date.getDay())
	return date
}

const isSameDay = (left, right) => (
	left.getFullYear() === right.getFullYear()
	&& left.getMonth() === right.getMonth()
	&& left.getDate() === right.getDate()
)

const buildAiDefaults = (booking, memberName) => ({
	tutorName: booking?.tutorName || '',
	studentName: memberName || '',
	subject: booking?.subject || '',
	lessonContext: booking
		? [
			`${booking.tutorName || '튜터'} 튜터와 진행한 ${booking.subject || '수업'} 내용`,
			`수업 날짜: ${formatLessonDateText(booking)}`,
			`수업 시간: ${formatLessonTimeText(booking)} (${formatDurationLabel(booking)})`,
			'핵심 학습 내용:',
			'학생이 어려워한 부분:',
			'복습/숙제:',
		].join('\n')
		: '',
})

const MemberMyPage = () => {
	const navigate = useNavigate()
	const { isLoading: authLoading, isLogin } = useAuth()
	const [activeTab, setActiveTab] = useState('bookings')
	const [weekOffset, setWeekOffset] = useState(0)
	const [selectedTutorId, setSelectedTutorId] = useState('')
	const [mypage, setMypage] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [payLoading, setPayLoading] = useState(false)
	const [payMessage, setPayMessage] = useState('')
	const [payError, setPayError] = useState('')
	const [cancelLoadingId, setCancelLoadingId] = useState('')
	const [aiModalOpen, setAiModalOpen] = useState(false)
	const [aiDefaults, setAiDefaults] = useState(buildAiDefaults(null, ''))
	const [threadTarget, setThreadTarget] = useState(null)

	const loadMypage = useCallback(async () => {
		setLoading(true)
		setError('')
		try {
			const response = await api.get('/users/me/mypage')
			setMypage(response.data?.data || null)
		} catch {
			setError('마이페이지 정보를 불러오지 못했습니다.')
			setMypage(null)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		if (authLoading) return
		if (!isLogin) {
			setLoading(false)
			return
		}
		loadMypage()
	}, [authLoading, isLogin, loadMypage])

	const handlePayAll = async () => {
		setPayMessage('')
		setPayError('')
		setPayLoading(true)
		try {
			const response = await api.post('/bookings/pay-all', { paymentMethod: 'CARD' })
			const result = response.data?.data || {}
			const targetCount = Number(result.targetCount || 0)
			const successCount = Number(result.successCount || 0)
			const failedCount = Number(result.failedCount || 0)

			if (targetCount === 0) {
				setPayMessage('결제 가능한 예정 수업이 없습니다.')
			} else if (failedCount === 0) {
				setPayMessage(`총 ${successCount}건 결제가 완료되었습니다.`)
			} else {
				setPayError(`총 ${targetCount}건 중 ${successCount}건 결제 완료, ${failedCount}건 실패했습니다.`)
			}
			await loadMypage()
		} catch (err) {
			setPayError(err?.response?.data?.message || '통합 결제에 실패했습니다.')
		} finally {
			setPayLoading(false)
		}
	}

	const handleCancelBooking = async (bookingId) => {
		if (!bookingId) return
		if (!window.confirm('정말로 예약을 취소하시겠습니까?')) return

		setPayError('')
		setPayMessage('')
		setCancelLoadingId(bookingId)
		try {
			const response = await api.put(`/bookings/${bookingId}/cancel`)
			if (response.data?.success === false) {
				setPayError(response.data?.message || '취소에 실패했습니다.')
				return
			}
			setPayMessage('예약이 취소되었습니다.')
			await loadMypage()
		} catch (err) {
			setPayError(err?.response?.data?.message || '취소 처리 중 오류가 발생했습니다.')
		} finally {
			setCancelLoadingId('')
		}
	}

	const handlePayBooking = async (booking) => {
		if (!booking?.bookingId) return
		setPayMessage('')
		setPayError('')
		setPayLoading(true)
		try {
			const amount = Number(booking.price || 0)
			await api.post(`/bookings/${booking.bookingId}/pay`, {
				paymentMethod: 'CARD',
				amount: Number.isFinite(amount) ? amount : 0,
			})
			setPayMessage('개별 결제가 완료되었습니다.')
			await loadMypage()
		} catch (err) {
			setPayError(err?.response?.data?.message || '개별 결제에 실패했습니다.')
		} finally {
			setPayLoading(false)
		}
	}

	const openAiSummary = () => {
		const sourceBooking = nextZoomBooking || paidUpcomingBookings[0] || upcomingBookings[0] || pastBookings[0] || null
		setAiDefaults(buildAiDefaults(sourceBooking, mypage?.name || mypage?.nickname || ''))
		setAiModalOpen(true)
	}

	const openMessageThread = (message) => {
		if (!message?.bookingId || !message?.tutorId) return
		setThreadTarget({
			bookingId: message.bookingId,
			tutorId: message.tutorId,
			tutorName: message.tutorName,
			subject: message.subject,
		})
	}

	const closeMessageThread = () => {
		setThreadTarget(null)
	}

	const stats = mypage?.memberStats || {}
	const upcomingBookings = mypage?.upcomingBookings ?? EMPTY_LIST
	const pastBookings = mypage?.pastBookings ?? EMPTY_LIST
	const studentReviews = mypage?.studentReviews ?? EMPTY_LIST
	const tutorMessages = mypage?.tutorMessages ?? EMPTY_LIST

	const paidUpcomingBookings = useMemo(
		() => upcomingBookings
			.filter((booking) => booking.status === 'CONFIRMED' && Boolean(booking.paidAt))
			.sort((left, right) => toLessonTime(left) - toLessonTime(right)),
		[upcomingBookings]
	)

	const nextZoomBooking = paidUpcomingBookings[0] || null
	const hasPayableBookings = upcomingBookings.some((booking) => booking.status === 'CONFIRMED' && !booking.paidAt)
	const payableBookingsCount = upcomingBookings.filter((booking) => booking.status === 'CONFIRMED' && !booking.paidAt).length
	const profileInitial = (mypage?.name || mypage?.nickname || '회').charAt(0)

	const allScheduleBookings = useMemo(
		() => [...upcomingBookings, ...pastBookings].filter((booking) => booking && booking.status !== 'CANCELLED'),
		[upcomingBookings, pastBookings]
	)

	const tutorFilterOptions = useMemo(() => {
		const map = new Map()
		allScheduleBookings.forEach((booking) => {
			const id = getTutorId(booking)
			if (!id) return
			if (!map.has(id)) {
				map.set(id, booking.tutorName || `튜터 ${id}`)
			}
		})
		return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
	}, [allScheduleBookings])

	useEffect(() => {
		if (!selectedTutorId) return
		const exists = tutorFilterOptions.some((item) => item.value === selectedTutorId)
		if (!exists) {
			setSelectedTutorId('')
		}
	}, [selectedTutorId, tutorFilterOptions])

	const currentWeekStart = useMemo(() => {
		const today = new Date()
		today.setDate(today.getDate() + weekOffset * 7)
		return getWeekStart(today)
	}, [weekOffset])

	const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
		const date = new Date(currentWeekStart)
		date.setDate(currentWeekStart.getDate() + index)
		return date
	}), [currentWeekStart])

	const weeklySourceBookings = useMemo(() => {
		if (!selectedTutorId) return allScheduleBookings
		return allScheduleBookings.filter((booking) => getTutorId(booking) === selectedTutorId)
	}, [allScheduleBookings, selectedTutorId])

	const weeklyBookings = useMemo(() => weekDays.map((day) => ({
		day,
		items: weeklySourceBookings
			.filter((booking) => {
				const bookingDate = parseBookingStartAt(booking)
				if (!bookingDate) return false
				return isSameDay(bookingDate, day)
			})
			.sort((left, right) => toLessonTime(left) - toLessonTime(right)),
	})), [weeklySourceBookings, weekDays])

	const weeklyHasAnyBooking = weeklyBookings.some((item) => item.items.length > 0)

	return (
		<Layout>
			<section className='bg-[#f8fafc] py-12'>
				<div className='mx-auto w-full max-w-[1140px] px-3'>
					<div className='mb-6'>
						<h2 className='mb-1 flex items-center text-3xl font-bold text-slate-900'>
							<img src={bookIcon} alt='마이페이지' className='mr-2 h-8 w-8' />
							마이페이지
						</h2>
						<p className='mb-0 text-slate-500'>프로필과 학습 내역을 관리하세요</p>
					</div>

					{authLoading || loading ? (
						<div className='rounded-2xl border border-slate-200 bg-white py-20 text-center text-slate-500 shadow-sm'>마이페이지를 불러오는 중입니다...</div>
					) : !isLogin ? (
						<div className='rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm'>
							<h2 className='text-2xl font-bold text-slate-900'>로그인이 필요합니다</h2>
							<p className='mt-2 text-slate-500'>회원 전용 마이페이지는 로그인 후 이용할 수 있습니다.</p>
							<Link to='/login' className='mt-6 inline-flex rounded-full bg-[#4f46e5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4338ca]'>로그인하러 가기</Link>
						</div>
					) : error || !mypage ? (
						<div className='rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm'>{error || '마이페이지 정보를 찾을 수 없습니다.'}</div>
					) : (
						<div className='grid gap-6 lg:grid-cols-12'>
							<div className='space-y-4 lg:col-span-4'>
								<div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
									<div className='text-center'>
										<div className='mx-auto mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-sky-500 text-5xl text-white'>
											{mypage.profileImg ? <img src={mypage.profileImg} alt='프로필 이미지' className='h-full w-full object-cover' /> : profileInitial}
										</div>
										<h3 className='mb-1 text-xl font-bold text-slate-900'>{mypage.name || '회원'}</h3>
										<p className='mb-3 text-sm text-slate-500'>{mypage.email || mypage.username || '-'}</p>
										<div className='mb-3'>
											<span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700'>회원</span>
										</div>

										<Link to='/member/profile-edit' className='mb-2 inline-flex h-[38px] w-full items-center justify-center rounded-md border border-[#4f46e5] px-4 text-sm font-semibold text-[#4f46e5] transition hover:bg-indigo-50'>
											회원정보 수정
										</Link>
										<button type='button' onClick={() => navigate('/tutors')} className='inline-flex h-[38px] w-full items-center justify-center rounded-md bg-[#4f46e5] px-4 text-sm font-semibold text-white transition hover:bg-[#4338ca]'>
											튜터 찾기
										</button>
									</div>
								</div>

								<div className='rounded-xl border border-[#4f46e5] bg-white shadow-sm'>
									<div className='border-b border-slate-200 px-4 py-3'>
										<h3 className='text-base font-bold text-slate-900'>내 수업</h3>
									</div>
									<div className='p-4'>
										{nextZoomBooking ? (
											<>
												<div className='mb-2 text-sm text-slate-500'>결제 완료된 다음 수업</div>
												<div className='font-semibold text-slate-900'>{nextZoomBooking.tutorName} 튜터</div>
												<div className='mt-1 text-sm text-slate-500'>
													날짜 {formatLessonDateText(nextZoomBooking)} | 시간 {formatLessonTimeText(nextZoomBooking)} ({formatDurationLabel(nextZoomBooking)})
												</div>
												<div className='mb-3 text-sm text-slate-500'>{nextZoomBooking.subject || '수업'}</div>
												<a href={normalizeZoomJoinUrl(nextZoomBooking.zoomJoinUrl)} target='_blank' rel='noreferrer' className='inline-flex h-[38px] w-full items-center justify-center rounded-md bg-[#4f46e5] px-4 text-sm font-semibold text-white transition hover:bg-[#4338ca]'>Zoom 입장</a>
											</>
										) : (
											<div className='py-2 text-center text-sm text-slate-500'>결제 완료된 예정 수업이 없습니다.</div>
										)}
									</div>
								</div>
							</div>

							<div className='space-y-4 lg:col-span-8'>
								<div className='grid gap-3 md:grid-cols-2'>
									<div className='rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm'>
										<div className='mb-2 flex justify-center'>
											<img src={remainIcon} alt='예정된 수업' className='h-[76px] w-[76px]' />
										</div>
										<div className='text-[1.625rem] font-bold text-[#4f46e5]'>{stats.upcomingLessons || 0}</div>
										<div className='mt-1 text-sm text-slate-500'>예정된 수업</div>
									</div>
									<div className='rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm'>
										<div className='mb-2 flex justify-center'>
											<img src={doneIcon} alt='완료한 수업' className='h-[76px] w-[76px]' />
										</div>
										<div className='text-[1.625rem] font-bold text-emerald-600'>{stats.completedLessons || 0}</div>
										<div className='mt-1 text-sm text-slate-500'>완료한 수업</div>
									</div>
								</div>

								<div className='rounded-xl border border-slate-200 bg-white shadow-sm'>
									<div className='border-b-0 bg-white px-4 pb-0 pt-4'>
										<h3 className='text-sm font-bold text-slate-900'>튜터 메시지</h3>
									</div>
									<div className='grid gap-2 p-3'>
										{tutorMessages.length === 0 ? (
											<div className='py-3 text-center text-sm text-slate-500'>메시지가 없습니다.</div>
										) : tutorMessages.slice(0, 5).map((message) => (
											<button
												key={message.id || `${message.tutorId}-${message.createdAt}`}
												type='button'
												onClick={() => openMessageThread(message)}
												disabled={!message?.bookingId || !message?.tutorId}
												className='w-full rounded-[14px] border border-[#e9edf5] bg-white px-3 py-3 text-left shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition hover:-translate-y-[1px] hover:border-[#cdd9ff] hover:shadow-[0_8px_20px_rgba(37,99,235,0.12)] disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:border-[#e9edf5] disabled:hover:shadow-[0_4px_14px_rgba(15,23,42,0.04)]'
											>
												<div className='flex items-start justify-between gap-2'>
													<div>
														<div className='font-semibold text-slate-900'>{message.tutorName || '튜터'} 튜터</div>
														<div className='text-sm text-[#4f46e5]'>{message.subject || '과목 정보 없음'}</div>
													</div>
													<div className='text-xs text-slate-400'>{formatDate(message.createdAt, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
												</div>
												<div className='mt-2 line-clamp-2 text-sm text-slate-500'>{message.content || '내용이 없습니다.'}</div>
												{message?.bookingId && message?.tutorId && <div className='mt-2 text-xs font-semibold text-[#4f46e5]'>대화 열기</div>}
											</button>
										))}
									</div>
								</div>

								<div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
									<div className='flex items-center justify-between gap-2'>
										<div>
											<h3 className='mb-1 text-sm font-bold text-slate-900'>AI 수업 요약</h3>
											<p className='text-sm text-slate-500'>Zoom 수업 내용을 입력하면 요약 포맷으로 정리해드립니다.</p>
										</div>
										<button type='button' onClick={openAiSummary} className='inline-flex h-[31px] items-center rounded-md border border-[#4f46e5] px-3 text-xs font-semibold text-[#4f46e5] hover:bg-indigo-50'>AI 수업 요약 작성</button>
									</div>
								</div>

								<div>
									<div className='mb-3 flex border-b border-slate-200'>
										{tabItems.map((tab) => (
											<button
												key={tab.key}
												type='button'
												onClick={() => setActiveTab(tab.key)}
												className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${activeTab === tab.key ? 'border-[#4f46e5] text-[#4f46e5]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
											>
												{tab.label}
											</button>
										))}
									</div>

									{activeTab === 'bookings' && (
										<div className='space-y-3'>
											<div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
												<div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
													<h4 className='text-sm font-bold text-slate-900'>예정된 수업</h4>
													<button
														type='button'
														onClick={handlePayAll}
														disabled={payLoading || !hasPayableBookings}
														className='inline-flex h-[31px] items-center rounded-md bg-[#4f46e5] px-3 text-xs font-semibold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'
													>
														{payLoading ? '처리중...' : (payableBookingsCount > 0 ? `튜터 통합 결제 (${payableBookingsCount}건)` : '튜터 통합 결제')}
													</button>
												</div>

												{payError && <p className='mb-2 text-sm font-semibold text-red-500'>{payError}</p>}
												{payMessage && <p className='mb-2 text-sm font-semibold text-emerald-600'>{payMessage}</p>}

												<div className='space-y-2'>
													{upcomingBookings.length === 0 ? (
														<div className='py-3 text-center text-sm text-slate-500'>예정된 수업이 없습니다.</div>
													) : upcomingBookings.map((booking) => {
														const status = getStatusMeta(booking.status)
														const isPaid = Boolean(booking.paidAt)
														const canCancel = booking.status === 'PENDING' || (booking.status === 'CONFIRMED' && isPaid && canCancelPaidBooking(booking))
														const cancelPolicyHint = booking.status === 'CONFIRMED' && isPaid && !canCancelPaidBooking(booking)
														return (
															<div key={booking.bookingId} className='rounded-lg border border-slate-200 p-3'>
																<div className='mb-2 flex items-start justify-between gap-2'>
																	<div>
																		<div className='font-semibold text-slate-900'>{booking.tutorName} 튜터</div>
																		<div className='mt-1 text-xs text-slate-500'>날짜 {formatLessonDateText(booking)} | 시간 {formatLessonTimeText(booking)} ({formatDurationLabel(booking)})</div>
																	</div>
																	<span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
																</div>
																<div className='flex flex-wrap items-center justify-between gap-2'>
																	<span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700'>{booking.subject || '수업'}</span>
																	<div className='flex flex-wrap items-center gap-2'>
																		<span className='text-sm font-semibold text-[#4f46e5]'>{formatCurrency(booking.price)}</span>
																		{isPaid && <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700'>결제완료</span>}
																		{booking.status === 'CONFIRMED' && !isPaid && (
																			<button type='button' onClick={() => handlePayBooking(booking)} disabled={payLoading} className='inline-flex h-[29px] items-center rounded-md bg-[#4f46e5] px-2.5 text-xs font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'>{payLoading ? '결제중...' : '결제하기'}</button>
																		)}
																		{canCancel && (
																			<button
																				type='button'
																				onClick={() => handleCancelBooking(booking.bookingId)}
																				disabled={cancelLoadingId === booking.bookingId}
																				className='inline-flex h-[29px] items-center rounded-md border border-red-300 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60'
																			>
																				{cancelLoadingId === booking.bookingId ? '취소중...' : '취소'}
																			</button>
																		)}
																	</div>
																</div>
																{cancelPolicyHint && <div className='mt-1 text-right text-xs text-slate-500'>취소 가능 기간(수업 3일 전) 경과</div>}
															</div>
														)
													})}
												</div>
											</div>

											<div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
												<h4 className='mb-3 text-sm font-bold text-slate-900'>지난 수업</h4>
												<div className='space-y-2'>
													{pastBookings.length === 0 ? (
														<div className='py-3 text-center text-sm text-slate-500'>지난 수업이 없습니다.</div>
													) : pastBookings.map((booking) => {
														const isCompleted = booking.status === 'COMPLETED'
														const hasReview = Boolean(booking.reviewId)
														return (
															<div key={booking.bookingId} className='rounded-lg border border-slate-200 p-3 opacity-80'>
																<div className='mb-2 flex items-start justify-between gap-2'>
																	<div>
																		<div className='font-semibold text-slate-900'>{booking.tutorName} 튜터</div>
																		<div className='mt-1 text-xs text-slate-500'>날짜 {formatLessonDateText(booking)} | 시간 {formatLessonTimeText(booking)} ({formatDurationLabel(booking)})</div>
																	</div>
																	<span className='rounded-full bg-slate-500 px-2 py-0.5 text-xs font-semibold text-white'>완료</span>
																</div>
																<div className='flex flex-wrap items-center justify-between gap-2'>
																	<span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700'>{booking.subject || '수업'}</span>
																	<div className='flex items-center gap-2'>
																		{hasReview && <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700'>리뷰작성완료</span>}
																		{isCompleted && !hasReview && booking.tutorProfileId && (
																			<Link to={`/tutors/${booking.tutorProfileId}?review=1&bookingId=${booking.bookingId}`} className='inline-flex h-[29px] items-center rounded-md border border-[#4f46e5] px-2.5 text-xs font-semibold text-[#4f46e5] hover:bg-indigo-50'>리뷰 작성</Link>
																		)}
																	</div>
																</div>
															</div>
														)
													})}
												</div>
											</div>
										</div>
									)}

									{activeTab === 'reviews' && (
										<div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
											<h4 className='mb-3 text-sm font-bold text-slate-900'>내가 작성한 리뷰</h4>
											<div className='space-y-3'>
												{studentReviews.length === 0 ? (
													<div className='py-3 text-center text-sm text-slate-500'>작성한 리뷰가 없습니다.</div>
												) : studentReviews.map((review) => (
													<button
														key={review.reviewId}
														type='button'
														onClick={() => review.tutorProfileId && navigate(`/tutors/${review.tutorProfileId}`)}
														className='w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:bg-slate-100'
													>
														<div className='mb-2 flex items-center justify-between gap-2'>
															<div className='font-semibold text-slate-900'>
																{review.tutorName || '튜터'} 튜터 <span className='ml-1 text-xs text-[#4f46e5] opacity-80'>자세히 보기</span>
															</div>
															<div className='text-sm text-amber-500'>{'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}</div>
														</div>
														<p className='mb-1 text-sm text-slate-600'>{review.content || '-'}</p>
														<div className='text-xs text-slate-500'>{formatDate(review.createdAt, { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
													</button>
												))}
											</div>
										</div>
									)}

									{activeTab === 'schedule' && (
										<div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
											<h4 className='mb-3 text-sm font-bold text-slate-900'>주간 스케줄</h4>
											<div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
												<label htmlFor='memberWeeklyTutorFilter' className='text-sm text-slate-500'>튜터별 수업 보기</label>
												<select
													id='memberWeeklyTutorFilter'
													value={selectedTutorId}
													onChange={(event) => setSelectedTutorId(event.target.value)}
													className='h-[31px] w-full max-w-[280px] rounded-md border border-slate-300 px-3 text-sm focus:border-[#4f46e5] focus:outline-none'
												>
													<option value=''>전체 튜터</option>
													{tutorFilterOptions.map((item) => (
														<option key={item.value} value={item.value}>{item.label}</option>
													))}
												</select>
											</div>

											<div className='mb-3 flex items-center justify-between gap-2'>
												<button type='button' onClick={() => setWeekOffset((prev) => prev - 1)} className='flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-100'>
													&lt;
												</button>
												<div className='rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700'>
													{formatDate(weekDays[0], { year: 'numeric', month: '2-digit', day: '2-digit' })} ~ {formatDate(weekDays[6], { month: '2-digit', day: '2-digit' })}
												</div>
												<button type='button' onClick={() => setWeekOffset((prev) => prev + 1)} className='flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-100'>
													&gt;
												</button>
											</div>

											<div className='grid gap-2 lg:grid-cols-7'>
												{weeklyBookings.map(({ day, items }) => (
													<div key={day.toISOString()} className='rounded-xl border border-slate-200 bg-slate-50 p-2.5'>
														<div className='mb-2 border-b border-slate-200 pb-1.5'>
															<div className='text-sm font-bold text-slate-900'>{formatDate(day, { weekday: 'short' })}</div>
															<div className='text-xs text-slate-500'>{formatDate(day, { month: '2-digit', day: '2-digit' })}</div>
														</div>
														<div className='space-y-1.5'>
															{items.length === 0 ? (
																<div className='rounded-lg bg-white px-2 py-3 text-center text-xs text-slate-400'>예약 없음</div>
															) : items.map((booking) => (
																<div key={booking.bookingId} className='rounded-lg bg-white px-2 py-2 text-xs shadow-sm ring-1 ring-slate-200'>
																	<div className='font-bold text-slate-900'>{booking.tutorName || '튜터'}</div>
																	<div className='mt-0.5 text-slate-600'>{booking.subject || '수업'}</div>
																	<div className='mt-1 font-medium text-red-500'>● {formatLessonTimeText(booking)}</div>
																</div>
															))}
														</div>
													</div>
												))}
											</div>

											<small className='mt-2 block text-sm text-slate-500'><span className='rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white'>●</span> 예약된 내 수업</small>
											<div className='mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500'>
												{weeklyHasAnyBooking ? '예약된 시간에 마우스를 올리면 튜터 정보를 볼 수 있습니다.' : '이번 주에는 예약된 수업이 없습니다.'}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</section>
			<AiAssistantModal
				isOpen={aiModalOpen}
				onClose={() => setAiModalOpen(false)}
				mode='lesson-summary'
				defaults={aiDefaults}
			/>
			<MessageThreadModal
				isOpen={Boolean(threadTarget)}
				onClose={closeMessageThread}
				viewer='member'
				bookingId={threadTarget?.bookingId}
				tutorId={threadTarget?.tutorId}
				tutorName={threadTarget?.tutorName}
				studentName={mypage?.name || mypage?.nickname || '회원'}
				subject={threadTarget?.subject}
			/>
		</Layout>
	)
}

export default MemberMyPage



