import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../common/Layout'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'
import '../../styles/tutor-detail.css'

const DAY_TITLES = ['일', '월', '화', '수', '목', '금', '토']
const MAX_WEEK_OFFSET = 9

const formatDateTime = (date) => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	const seconds = String(date.getSeconds()).padStart(2, '0')
	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

const buildDateRange = () => {
	const start = new Date()
	start.setHours(0, 0, 0, 0)
	start.setDate(start.getDate() - start.getDay())
	const end = new Date(start)
	end.setDate(end.getDate() + (MAX_WEEK_OFFSET * 7) + 6)
	end.setHours(23, 59, 59, 0)
	return { start: formatDateTime(start), end: formatDateTime(end) }
}

const parseTimeline = (timeline) => {
	if (!timeline) return []
	return timeline
		.split(/\s*\|\|\|\s*/)
		.map((item) => item.trim())
		.filter(Boolean)
		.map((item) => {
			const tripleSeparatorIndex = item.indexOf(':::')
			if (tripleSeparatorIndex >= 0) {
				return {
					year: item.slice(0, tripleSeparatorIndex).trim(),
					text: item.slice(tripleSeparatorIndex + 3).trim(),
				}
			}
			const singleSeparatorIndex = item.indexOf(':')
			if (singleSeparatorIndex >= 0) {
				return {
					year: item.slice(0, singleSeparatorIndex).trim(),
					text: item.slice(singleSeparatorIndex + 1).trim(),
				}
			}
			return {
				year: '',
				text: item,
			}
		})
}

const getWeekStart = (baseDate = new Date()) => {
	const date = new Date(baseDate)
	date.setHours(0, 0, 0, 0)
	date.setDate(date.getDate() - date.getDay())
	return date
}

const addDays = (date, days) => {
	const next = new Date(date)
	next.setDate(next.getDate() + days)
	return next
}

const formatMonthDay = (date) => `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
const formatDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const formatWeekRange = (weekStart) => `${weekStart.getFullYear()}.${formatMonthDay(weekStart)} ~ ${formatMonthDay(addDays(weekStart, 6))}`

const timeToMinutes = (time) => {
	const matched = String(time || '').match(/^(\d{2}):(\d{2})$/)
	if (!matched) return Number.NaN
	return Number(matched[1]) * 60 + Number(matched[2])
}

const minutesToTime = (totalMinutes) => {
	const hour = Math.floor(totalMinutes / 60)
	const minute = totalMinutes % 60
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const formatDurationLabel = (durationMinutes) => {
	if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return '0분'
	if (durationMinutes % 60 === 0) return `${durationMinutes / 60}시간`
	return `${durationMinutes}분`
}

const buildMergedSelection = (slotItems, stepMinutes = 30) => {
	const groupedByDate = new Map()
	slotItems.forEach((item) => {
		const start = new Date(item.startAt)
		if (Number.isNaN(start.getTime())) return
		const date = formatDateKey(start)
		const time = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
		const minute = timeToMinutes(time)
		if (!Number.isFinite(minute) || minute % stepMinutes !== 0) return
		if (!groupedByDate.has(date)) groupedByDate.set(date, new Set())
		groupedByDate.get(date).add(minute)
	})

	const merged = []
	Array.from(groupedByDate.entries())
		.sort((a, b) => a[0].localeCompare(b[0]))
		.forEach(([date, minuteSet]) => {
			const sortedMinutes = Array.from(minuteSet).sort((a, b) => a - b)
			if (sortedMinutes.length === 0) return

			let blockStart = sortedMinutes[0]
			let previous = sortedMinutes[0]

			for (let index = 1; index < sortedMinutes.length; index += 1) {
				const current = sortedMinutes[index]
				if (current === previous + stepMinutes) {
					previous = current
					continue
				}
				const end = previous + stepMinutes
				merged.push({
					date,
					startTime: minutesToTime(blockStart),
					endTime: minutesToTime(end),
					durationMinutes: end - blockStart,
				})
				blockStart = current
				previous = current
			}

			const end = previous + stepMinutes
			merged.push({
				date,
				startTime: minutesToTime(blockStart),
				endTime: minutesToTime(end),
				durationMinutes: end - blockStart,
			})
		})

	return merged
}

const getProfileImageUrl = (img) => {
	if (!img) return ''
	const trimmed = String(img).trim()
	if (trimmed.startsWith('http') || trimmed.startsWith('/')) return trimmed
	return `/${trimmed}`
}

const TutorDetailContent = () => {
	const { id } = useParams()
	const { isLogin, hasRole, userInfo } = useAuth()
	const [activeTab, setActiveTab] = useState('intro')
	const [detail, setDetail] = useState(null)
	const [reviews, setReviews] = useState([])
	const [availabilities, setAvailabilities] = useState([])
	const [weekOffset, setWeekOffset] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [selectedSlotIds, setSelectedSlotIds] = useState([])
	const [bookingSubject, setBookingSubject] = useState('')
	const [bookingMessage, setBookingMessage] = useState('')
	const [bookingLoading, setBookingLoading] = useState(false)
	const [bookingError, setBookingError] = useState('')
	const [reviewModalOpen, setReviewModalOpen] = useState(false)
	const [reviewSubmitting, setReviewSubmitting] = useState(false)
	const [reviewLoadingBookings, setReviewLoadingBookings] = useState(false)
	const [reviewError, setReviewError] = useState('')
	const [reviewBookingOptions, setReviewBookingOptions] = useState([])
	const [reviewForm, setReviewForm] = useState({
		id: '',
		bookingId: '',
		rating: 0,
		content: '',
	})

	useEffect(() => {
		const fetchDetail = async () => {
			setLoading(true)
			setError('')
			try {
				const detailResponse = await api.get(`/tutors/${id}`)
				const tutorData = detailResponse.data?.data?.tutor
				setDetail(detailResponse.data?.data || null)

				if (tutorData?.userId) {
					const [reviewResult, availabilityResult] = await Promise.allSettled([
						api.get(`/reviews/tutor/${tutorData.userId}`),
						api.get(`/tutors/${tutorData.userId}/availability`, { params: buildDateRange() }),
					])

					if (reviewResult.status === 'fulfilled') {
						setReviews(reviewResult.value.data?.data || [])
					} else {
						setReviews([])
					}

					if (availabilityResult.status === 'fulfilled') {
						setAvailabilities(availabilityResult.value.data?.data || [])
					} else {
						setAvailabilities([])
					}
				} else {
					setReviews([])
					setAvailabilities([])
				}
			} catch {
				setError('튜터 상세 정보를 불러오지 못했습니다.')
			} finally {
				setLoading(false)
			}
		}

		fetchDetail()
	}, [id])

	const tutor = detail?.tutor
	const isTutorViewer = hasRole('ROLE_TUTOR') || hasRole('ROLE_TUTOR_PENDING') || hasRole('ROLE_ADMIN')
	const canBook = detail?.canBook && !isTutorViewer
	const canWriteReview = isLogin && !isTutorViewer
	const currentUserId = userInfo?.userId || userInfo?.id || ''
	const isEditReview = Boolean(reviewForm.id)
	const reviewSelectOptions = isEditReview
		? [{ bookingId: reviewForm.bookingId, subject: '선택된 수업' }]
		: reviewBookingOptions

	const resolveCurrentUserId = useCallback(async () => {
		if (currentUserId) return currentUserId
		try {
			const response = await api.get('/users/me')
			if (response.data?.success === false) return ''
			return response.data?.data?.id || ''
		} catch {
			return ''
		}
	}, [currentUserId])

	const refreshReviews = useCallback(async (tutorUserId) => {
		if (!tutorUserId) {
			setReviews([])
			return
		}
		try {
			const response = await api.get(`/reviews/tutor/${tutorUserId}`)
			if (response.data?.success === false) {
				setReviews([])
				return
			}
			setReviews(response.data?.data || [])
		} catch {
			setReviews([])
		}
	}, [])

	const resetReviewModalState = useCallback(() => {
		setReviewError('')
		setReviewSubmitting(false)
		setReviewLoadingBookings(false)
		setReviewBookingOptions([])
		setReviewForm({
			id: '',
			bookingId: '',
			rating: 0,
			content: '',
		})
	}, [])

	const closeReviewModal = useCallback(() => {
		if (reviewSubmitting) return
		setReviewModalOpen(false)
		resetReviewModalState()
	}, [resetReviewModalState, reviewSubmitting])

	const openReviewCreateModal = useCallback(async (preselectBookingId = '') => {
		if (!tutor?.userId || !canWriteReview) return
		setReviewModalOpen(true)
		resetReviewModalState()
		setReviewLoadingBookings(true)
		try {
			const viewerId = await resolveCurrentUserId()
			if (!viewerId) {
				setReviewError('로그인이 필요합니다.')
				return
			}
			const bookingsResponse = await api.get(`/bookings/student/${viewerId}`, { params: { tutorId: tutor.userId } })
			if (bookingsResponse.data?.success === false) {
				setReviewError(bookingsResponse.data?.message || '리뷰 작성 가능한 수업을 불러오지 못했습니다.')
				return
			}
			const eligible = (bookingsResponse.data?.data || [])
				.filter((booking) => booking.status === 'COMPLETED' && !booking.reviewId)
			setReviewBookingOptions(eligible)
			const preselected = preselectBookingId
				? eligible.find((booking) => (booking.bookingId || booking.id) === preselectBookingId)
				: null
			setReviewForm((prev) => ({ ...prev, bookingId: (preselected?.bookingId || preselected?.id || '') }))
		} catch (err) {
			setReviewError(err?.response?.data?.message || '리뷰 작성 가능한 수업을 불러오지 못했습니다.')
		} finally {
			setReviewLoadingBookings(false)
		}
	}, [canWriteReview, resetReviewModalState, resolveCurrentUserId, tutor?.userId])

	const openReviewEditModal = (review) => {
		setReviewModalOpen(true)
		setReviewError('')
		setReviewSubmitting(false)
		setReviewLoadingBookings(false)
		setReviewBookingOptions([])
		setReviewForm({
			id: review?.id || '',
			bookingId: review?.bookingId || '',
			rating: Number(review?.rating || 0),
			content: review?.content || '',
		})
	}

	const handleReviewSave = async () => {
		if (!reviewForm.rating) {
			setReviewError('평점을 선택해주세요.')
			return
		}
		if (!reviewForm.content.trim()) {
			setReviewError('후기 내용을 입력해주세요.')
			return
		}
		if (!isEditReview && !reviewForm.bookingId) {
			setReviewError('수업을 선택해주세요.')
			return
		}
		setReviewSubmitting(true)
		setReviewError('')
		try {
			const payload = isEditReview
				? { rating: Number(reviewForm.rating), content: reviewForm.content.trim() }
				: { bookingId: reviewForm.bookingId, rating: Number(reviewForm.rating), content: reviewForm.content.trim() }
			const response = isEditReview
				? await api.put(`/reviews/${reviewForm.id}`, payload)
				: await api.post('/reviews', payload)

			if (response.data?.success === false) {
				setReviewError(response.data?.message || '리뷰 저장에 실패했습니다.')
				return
			}
			await refreshReviews(tutor?.userId)
			setReviewModalOpen(false)
			resetReviewModalState()
		} catch (err) {
			setReviewError(err?.response?.data?.message || '리뷰 저장에 실패했습니다.')
		} finally {
			setReviewSubmitting(false)
		}
	}

	const handleReviewDelete = async (reviewId) => {
		if (!reviewId) return
		if (!window.confirm('리뷰를 삭제할까요?')) return
		try {
			const response = await api.delete(`/reviews/${reviewId}`)
			if (response.data?.success === false) {
				window.alert(response.data?.message || '리뷰 삭제에 실패했습니다.')
				return
			}
			await refreshReviews(tutor?.userId)
		} catch (err) {
			window.alert(err?.response?.data?.message || '리뷰 삭제 중 오류가 발생했습니다.')
		}
	}

	const handleBook = async () => {
		if (!tutor) return
		if (mergedSelectedBlocks.length === 0) {
			setBookingError('시간을 선택해주세요.')
			return
		}
		if (!bookingSubject) {
			setBookingError('과목을 선택해주세요.')
			return
		}
		if (!isLogin) {
			window.alert('로그인이 필요합니다.')
			window.location.href = '/login'
			return
		}
		setBookingLoading(true)
		setBookingError('')
		try {
			let successCount = 0
			let failCount = 0

			for (const block of mergedSelectedBlocks) {
				try {
					const response = await api.post(`/bookings/tutor/${tutor.userId}`, {
						date: block.date,
						time: block.startTime,
						endTime: block.endTime,
						subject: bookingSubject,
						message: bookingMessage,
					})
					if (response.data?.success === false) {
						failCount += 1
					} else {
						successCount += 1
					}
				} catch {
					failCount += 1
				}
			}

			if (successCount > 0 && failCount === 0) {
				window.alert('예약 요청이 완료되었습니다. 튜터의 승인을 기다려주세요.')
				window.location.reload()
				return
			}
			if (successCount > 0) {
				window.alert(`일부 예약만 완료되었습니다. 성공: ${successCount}, 실패: ${failCount}`)
				window.location.reload()
				return
			}
			setBookingError('예약에 실패했습니다. 다시 시도해주세요.')
		} catch (err) {
			setBookingError(err?.response?.data?.message || '예약 처리 중 오류가 발생했습니다.')
		} finally {
			setBookingLoading(false)
		}
	}

	const weekStart = useMemo(() => {
		const start = getWeekStart()
		start.setDate(start.getDate() + (weekOffset * 7))
		return start
	}, [weekOffset])

	const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart])

	const weekSlotsByDate = useMemo(() => {
		const grouped = new Map(weekDates.map((date) => [formatDateKey(date), []]))
		availabilities.forEach((item) => {
			const start = new Date(item.startAt)
			if (Number.isNaN(start.getTime())) return
			const key = formatDateKey(start)
			if (grouped.has(key)) grouped.get(key).push(item)
		})
		grouped.forEach((items, key) => {
			items.sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
			grouped.set(key, items)
		})
		return grouped
	}, [availabilities, weekDates])
	const selectedSlotItems = useMemo(() => {
		if (selectedSlotIds.length === 0) return []
		const selectedSet = new Set(selectedSlotIds)
		return availabilities
			.filter((item) => selectedSet.has(item.id))
			.sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
	}, [availabilities, selectedSlotIds])
	const mergedSelectedBlocks = useMemo(() => buildMergedSelection(selectedSlotItems, 30), [selectedSlotItems])
	const selectedTimeText = useMemo(() => {
		if (mergedSelectedBlocks.length === 0) return ''
		return mergedSelectedBlocks
			.map((block) => `${block.date} ${block.startTime}~${block.endTime} (${formatDurationLabel(block.durationMinutes)})`)
			.join('\n')
	}, [mergedSelectedBlocks])
	const subjects = useMemo(() => (tutor?.subjects || '').split(',').map((item) => item.trim()).filter(Boolean), [tutor?.subjects])
	const introLines = useMemo(() => (tutor?.selfIntro || '').split('\n').map((item) => item.trim()).filter(Boolean), [tutor?.selfIntro])
	const educationItems = useMemo(() => parseTimeline(tutor?.educationTimeline), [tutor?.educationTimeline])
	const careerItems = useMemo(() => parseTimeline(tutor?.careerTimeline), [tutor?.careerTimeline])
	const certificateItems = useMemo(() => (tutor?.certificates || '').split('|').map((item) => item.trim()).filter(Boolean), [tutor?.certificates])

	useEffect(() => {
		if (!canWriteReview || !tutor?.userId) return
		const params = new URLSearchParams(window.location.search)
		if (params.get('review') !== '1') return
		const preselectBookingId = params.get('bookingId') || ''
		openReviewCreateModal(preselectBookingId).finally(() => {
			window.history.replaceState({}, '', window.location.pathname)
		})
	}, [canWriteReview, openReviewCreateModal, tutor?.userId])

	return (
		<Layout>
			<section className='tutor-detail-page px-3 py-12'>
				<div className='mx-auto w-full max-w-[1320px]'>
					<Link to='/tutors' className='mb-3 inline-flex items-center rounded-full border border-[#4f46e5] px-4 py-2 text-base text-[#4f46e5] transition hover:bg-[#4f46e5] hover:text-white'>
						<span className='mr-2'>←</span>목록으로
					</Link>

					{loading ? (
						<div className='py-20 text-center text-[#6c757d]'>튜터 상세 정보를 불러오는 중입니다...</div>
					) : error || !tutor ? (
						<div className='rounded-md border border-black/15 bg-white py-16 text-center text-[#6c757d] shadow-[0_.125rem_.25rem_rgba(0,0,0,0.075)]'>{error || '튜터 정보를 찾을 수 없습니다.'}</div>
					) : (
						<div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
							<div className='space-y-4 lg:col-span-8'>
								<div className='rounded-md border border-black/15 bg-white shadow-[0_.125rem_.25rem_rgba(0,0,0,0.075)]'>
									<div className='p-4'>
										<div className='flex items-start gap-3'>
											<div className={`flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-full text-[32px] text-white ${tutor.profileImg ? '' : 'bg-[#4f46e5]'}`}>
												{tutor.profileImg ? (
													<img src={getProfileImageUrl(tutor.profileImg)} alt='프로필 이미지' className='h-full w-full object-cover' />
												) : (
													(tutor.nickname || '김').charAt(0)
												)}
											</div>
											<div className='flex-1'>
												<h1 className='mb-1 text-[1.75rem] font-bold text-[#212529]'>{tutor.nickname || '튜터명'}</h1>
												{reviews.length > 0 ? (
													<div className='mb-2 text-[#6c757d]'>
														<span className='mr-1'>⭐</span>
														<span className='font-semibold'>{(reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)}</span>
														<span className='text-[#6c757d]'>({reviews.length}개의리뷰)</span>
													</div>
												) : (
													<div className='mb-2 text-[#6c757d]'>
														<span className='mr-1'>⭐</span>
														<span className='font-semibold'>아직 리뷰가 없습니다</span>
													</div>
												)}
												<div className='mb-3 flex flex-wrap gap-1'>
													{subjects.map((subject) => (
														<span key={subject} className='inline-flex rounded-md bg-[#f8f9fa] px-[0.65em] py-[0.35em] text-[0.75em] font-bold text-black'>{subject}</span>
													))}
												</div>
												<div className='text-sm text-[#6c757d]'>⏱️ 경력 <span>{tutor.experience || '정보 없음'}</span></div>
											</div>
										</div>
									</div>
								</div>

								<div className='rounded-md border border-black/15 bg-white shadow-[0_.125rem_.25rem_rgba(0,0,0,0.075)]'>
									<div className='p-4'>
										<h3 className='mb-3 text-[1.25rem] font-bold text-[#212529]'>튜터 정보</h3>
										<ul className='tutor-info-tabs mb-2'>
											{[
												{ key: 'intro', label: '자기소개' },
												{ key: 'education', label: '학력' },
												{ key: 'career', label: '근무경력' },
												{ key: 'certificate', label: '자격증' },
											].map((tab) => (
												<li key={tab.key} className='nav-item'>
													<button type='button' className={`nav-link ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
														{tab.label}
													</button>
												</li>
											))}
										</ul>
										<div className='tutor-info-tab-content mb-4'>
											{activeTab === 'intro' && (
												<div>
													<div className='mb-3'>
														<div className='mb-1 text-sm font-semibold text-[#6c757d]'>소개</div>
														<div className='text-[#6c757d]'>{tutor.bio || '등록된 자기소개가 없습니다.'}</div>
													</div>
													<div>
														<div className='mb-1 text-sm font-semibold text-[#6c757d]'>강의 스타일</div>
														{introLines.length > 0
															? introLines.map((line, index) => <div key={index} className='text-[#6c757d]'>{line.startsWith('-') ? line : `- ${line}`}</div>)
															: <div className='text-[#6c757d]'>등록된 강의 스타일 정보가 없습니다.</div>}
													</div>
												</div>
											)}
											{activeTab === 'education' && (
												educationItems.length > 0
													? <div className='timeline-list'>{educationItems.map((item, index) => <div key={index} className='timeline-item'><div className='timeline-year'>{item.year}</div><div className='timeline-text'>{item.text}</div></div>)}</div>
													: <div className='text-[#6c757d]'>등록된 학력 정보가 없습니다.</div>
											)}
											{activeTab === 'career' && (
												careerItems.length > 0
													? <div className='timeline-list'>{careerItems.map((item, index) => <div key={index} className='timeline-item'><div className='timeline-year'>{item.year}</div><div className='timeline-text'>{item.text}</div></div>)}</div>
													: <div className='text-[#6c757d]'>등록된 근무경력 정보가 없습니다.</div>
											)}
											{activeTab === 'certificate' && (
												certificateItems.length > 0
													? <div>{certificateItems.map((item) => <div key={item}>{item}</div>)}</div>
													: <div className='text-[#6c757d]'>등록된 자격증 정보가 없습니다.</div>
											)}
										</div>
									</div>
								</div>

								<div className='rounded-md border border-black/15 bg-white shadow-[0_.125rem_.25rem_rgba(0,0,0,0.075)]'>
									<div className='p-4'>
										<div className='mb-4 flex items-center justify-between gap-3'>
											<h3 className='text-[1.25rem] font-bold text-[#212529]'>수강 후기 ({reviews.length})</h3>
											{canWriteReview && (
												<button
													type='button'
													className='inline-flex items-center rounded-md border border-[#4f46e5] bg-[#4f46e5] px-3 py-[0.375rem] text-sm text-white transition-colors hover:border-[#4338ca] hover:bg-[#4338ca]'
													onClick={openReviewCreateModal}
												>
													리뷰 작성
												</button>
											)}
										</div>
										{reviews.length === 0 ? (
											<p className='text-[#6c757d]'>아직 등록된 후기가 없습니다.</p>
										) : (
											<div className='space-y-3'>
												{reviews.map((review) => {
													const canManageReview = Boolean(currentUserId) && review.studentId === currentUserId
													return (
													<div key={review.id} className='review-item rounded-md border border-black/15 bg-white'>
														<div className='p-4'>
															<div className='mb-2 flex items-start justify-between'>
																<div className='font-bold'>
																	<span>{review.studentName || '익명'}</span>
																	<span className='ml-1 text-[#4f46e5]'>님의 후기</span>
																</div>
																<div className='text-[#ffc107]'>{Array.from({ length: 5 }, (_, index) => (index < review.rating ? '★' : '☆')).join('')}</div>
															</div>
															<p className='mb-2 text-[#212529]'>{review.content}</p>
															<div className='text-sm text-[#6c757d]'>{review.createdAt?.slice(0, 10)}</div>
															{canManageReview && (
																<div className='mt-2 flex gap-2'>
																	<button
																		type='button'
																		className='inline-flex items-center rounded-md border border-[#4f46e5] bg-white px-2.5 py-1 text-xs text-[#4f46e5] transition-colors hover:bg-[#eef2ff]'
																		onClick={() => openReviewEditModal(review)}
																	>
																		수정
																	</button>
																	<button
																		type='button'
																		className='inline-flex items-center rounded-md border border-[#dc3545] bg-white px-2.5 py-1 text-xs text-[#dc3545] transition-colors hover:bg-[#fff1f2]'
																		onClick={() => handleReviewDelete(review.id)}
																	>
																		삭제
																	</button>
																</div>
															)}
														</div>
													</div>
												)})}
											</div>
										)}
									</div>
								</div>
							</div>

							<div className='lg:col-span-4'>
								<div className='sticky top-[90px] rounded-md border border-black/15 bg-white shadow-[0_.125rem_.25rem_rgba(0,0,0,0.075)]'>
									{tutor.videoUrl && (
										<div className='tutorVideo-wrap border-b border-black/10' id='videoWrap'>
											<div className='resize'>
												<iframe
													id='tutorVideo'
													src={tutor.videoUrl}
													className='re'
													title='YouTube video player'
													allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
													allowFullScreen
												/>
											</div>
										</div>
									)}
									<div className='p-4'>
										<div className='mb-3 flex items-center justify-between'>
											<div className='font-bold text-[#212529]'>수업 예약</div>
											<div className='font-semibold text-[#4f46e5]'>시간당 {tutor.price ? Number(tutor.price).toLocaleString() : 0}원</div>
										</div>
										<h4 className='mb-3 text-base font-bold text-[#212529]'>수업 가능 시간</h4>
										<div className='mb-3'>
											<div className='tc-toolbar mb-3'>
												<button type='button' className='tc-iconbtn' aria-label='이전 주' disabled={weekOffset === 0} onClick={() => setWeekOffset((prev) => Math.max(prev - 1, 0))}>
													<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M15.5 5.5 9 12l6.5 6.5' /></svg>
												</button>
												<div className='tc-range'>{formatWeekRange(weekStart)}</div>
												<button type='button' className='tc-iconbtn' aria-label='다음 주' disabled={weekOffset >= MAX_WEEK_OFFSET} onClick={() => setWeekOffset((prev) => Math.min(prev + 1, MAX_WEEK_OFFSET))}>
													<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M8.5 18.5 15 12 8.5 5.5' /></svg>
												</button>
											</div>

											<div className='weekly_calendar_wrap'>
												<div className='weekly_head'>
													<ul className='dayHead'>
														{weekDates.map((date, index) => (
															<li key={`head-${formatDateKey(date)}`}>
																<div className='head_in'>
																	<p className='dayTit'>{DAY_TITLES[index]}</p>
																	<p className='dayDate'>{formatMonthDay(date)}</p>
																</div>
															</li>
														))}
													</ul>
												</div>
												<div className='weekly_con'>
													<ul className='dayCon'>
														{weekDates.map((date, index) => {
															const dateKey = formatDateKey(date)
															const dateSlots = weekSlotsByDate.get(dateKey) || []
															return (
																<li key={`body-${dateKey}`}>
																	<div className='con_in' data-date-label={`${DAY_TITLES[index]} ${formatMonthDay(date)}`}>
																		{dateSlots.map((item) => {
																			const start = new Date(item.startAt)
																			const isPast = !Number.isNaN(start.getTime()) && start < new Date()
																			const selected = selectedSlotIds.includes(item.id)
																			const slotClass = [
																				'sch_time',
																				item.status === 'BOOKED' ? 'booked' : '',
																				isPast ? 'off' : '',
																				selected ? 'selected' : '',
																			].filter(Boolean).join(' ')
																			return (
																				<div key={item.id} className={slotClass}>
																					<a
																						href='#!'
																					onClick={(event) => {
																						event.preventDefault()
																						if (!canBook || item.status === 'BOOKED' || isPast) return
																						setSelectedSlotIds((prev) => (prev.includes(item.id) ? prev.filter((idValue) => idValue !== item.id) : [...prev, item.id]))
																						setBookingError('')
																					}}
																				>
																						{!Number.isNaN(start.getTime()) ? `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}` : '--:--'}
																					</a>
																				</div>
																			)
																		})}
																	</div>
																</li>
															)
														})}
													</ul>
												</div>
											</div>
											<small className='mt-2 block text-sm text-[#6c757d]'>
												<span className='rounded bg-[#4f46e5] px-2 py-0.5 text-white'>●</span> 수업 가능
												<span className='ml-2 rounded bg-[#dc3545] px-2 py-0.5 text-white'>●</span> 예약됨
											</small>
										</div>

										{canBook && (
											<div>
												<div className='mb-3'>
													<label className='mb-2 block text-base text-[#212529]'>선택된 시간</label>
													<textarea className='block w-full rounded-md border border-[#ced4da] bg-white px-3 py-[0.375rem] text-base text-[#212529] outline-none' rows={3} value={selectedTimeText} placeholder='캘린더에서 시간을 선택해주세요' readOnly />
													<div className='mt-1 text-xs text-[#6c757d]'>같은 날짜도 여러 시간을 선택할 수 있으며, 연속 시간은 한 수업으로 묶여 표시됩니다.</div>
												</div>
												<div className='mb-3'>
													<label className='mb-2 block text-base text-[#212529]'>과목 *</label>
													<select value={bookingSubject} onChange={(e) => setBookingSubject(e.target.value)} className='block w-full rounded-md border border-[#ced4da] bg-white px-3 py-[0.375rem] text-base text-[#212529] outline-none focus:border-[#4f46e5] focus:shadow-[0_0_0_0.25rem_rgba(79,70,229,0.25)]'>
														<option value=''>선택</option>
														{subjects.map((s) => <option key={s} value={s}>{s}</option>)}
													</select>
												</div>
												<div className='mb-3'>
													<label className='mb-2 block text-base text-[#212529]'>요청사항</label>
													<textarea value={bookingMessage} onChange={(e) => setBookingMessage(e.target.value)} rows={3} className='block w-full rounded-md border border-[#ced4da] bg-white px-3 py-[0.375rem] text-base text-[#212529] outline-none' placeholder='추가로 전달할 내용을 입력하세요' />
												</div>
											</div>
										)}

										{bookingError && <p className='mb-3 text-sm text-[#dc3545]'>{bookingError}</p>}
										{canBook && (
											<button type='button' onClick={handleBook} disabled={mergedSelectedBlocks.length === 0 || bookingLoading} className='inline-flex w-full items-center justify-center rounded-md border border-[#4f46e5] bg-[#4f46e5] px-3 py-[0.375rem] text-base text-white transition-colors hover:border-[#4338ca] hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'>
												{bookingLoading ? '예약 처리 중...' : '예약하기'}
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{reviewModalOpen && (
					<div
						className='fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 px-4'
						onClick={(event) => {
							if (event.target === event.currentTarget) closeReviewModal()
						}}
					>
						<div className='w-full max-w-[560px] rounded-lg bg-white shadow-2xl'>
							<div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
								<h5 className='text-lg font-bold text-[#212529]'>{isEditReview ? '리뷰 수정' : '리뷰 작성'}</h5>
								<button
									type='button'
									className='inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100'
									onClick={closeReviewModal}
									disabled={reviewSubmitting}
									aria-label='닫기'
								>
									×
								</button>
							</div>
							<div className='space-y-4 px-5 py-4'>
								<div>
									<label className='mb-2 block text-sm font-semibold text-[#212529]'>수업 선택 <span className='text-[#dc3545]'>*</span></label>
									<select
										className='block w-full rounded-md border border-[#ced4da] bg-white px-3 py-[0.5rem] text-sm text-[#212529] outline-none focus:border-[#4f46e5] focus:shadow-[0_0_0_0.25rem_rgba(79,70,229,0.2)] disabled:bg-slate-100'
										value={reviewForm.bookingId}
										onChange={(event) => setReviewForm((prev) => ({ ...prev, bookingId: event.target.value }))}
										disabled={isEditReview || reviewLoadingBookings || reviewSelectOptions.length === 0}
									>
										{reviewLoadingBookings && <option value=''>불러오는 중...</option>}
										{!reviewLoadingBookings && reviewSelectOptions.length === 0 && <option value=''>완료된 수업이 없습니다.</option>}
										{!reviewLoadingBookings && !isEditReview && reviewSelectOptions.length > 0 && <option value=''>수업 선택 (필수)</option>}
										{!reviewLoadingBookings && reviewSelectOptions.map((booking) => (
											<option key={booking.bookingId || booking.id || 'selected'} value={booking.bookingId || booking.id || ''}>
												{booking.lessonDate && booking.startTime
													? `${booking.lessonDate} ${booking.startTime} - ${booking.subject || '수업'}`
													: (booking.subject || '선택된 수업')}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className='mb-2 block text-sm font-semibold text-[#212529]'>평점 <span className='text-[#dc3545]'>*</span></label>
									<div className='flex flex-wrap gap-2'>
										{[1, 2, 3, 4, 5].map((rating) => (
											<button
												key={rating}
												type='button'
												className={`rounded-md border px-3 py-1.5 text-sm transition ${Number(reviewForm.rating) === rating ? 'border-[#f59e0b] bg-[#f59e0b] text-white' : 'border-[#f59e0b] bg-white text-[#f59e0b] hover:bg-[#fff7ed]'}`}
												onClick={() => setReviewForm((prev) => ({ ...prev, rating }))}
												disabled={reviewSubmitting}
											>
												{'★'.repeat(rating)}
											</button>
										))}
									</div>
								</div>

								<div>
									<label className='mb-2 block text-sm font-semibold text-[#212529]'>후기 내용 <span className='text-[#dc3545]'>*</span></label>
									<textarea
										className='block w-full rounded-md border border-[#ced4da] bg-white px-3 py-2 text-sm text-[#212529] outline-none focus:border-[#4f46e5] focus:shadow-[0_0_0_0.25rem_rgba(79,70,229,0.2)]'
										rows={5}
										placeholder='수업에 대한 솔직한 후기를 작성해주세요.'
										value={reviewForm.content}
										onChange={(event) => setReviewForm((prev) => ({ ...prev, content: event.target.value }))}
										disabled={reviewSubmitting}
									/>
								</div>

								{reviewError && <p className='text-sm text-[#dc3545]'>{reviewError}</p>}
							</div>
							<div className='flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4'>
								<button
									type='button'
									className='inline-flex items-center rounded-md border border-slate-400 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100'
									onClick={closeReviewModal}
									disabled={reviewSubmitting}
								>
									취소
								</button>
								<button
									type='button'
									className='inline-flex items-center rounded-md border border-[#4f46e5] bg-[#4f46e5] px-3 py-2 text-sm text-white transition-colors hover:border-[#4338ca] hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'
									onClick={handleReviewSave}
									disabled={reviewSubmitting || (!isEditReview && reviewSelectOptions.length === 0)}
								>
									{reviewSubmitting ? '저장 중...' : '저장'}
								</button>
							</div>
						</div>
					</div>
				)}
			</section>
		</Layout>
	)
}

export default TutorDetailContent
