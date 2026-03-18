import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AiAssistantModal from '../common/AiAssistantModal'
import Layout from '../common/Layout'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'
import classIcon from '../../assets/image/tutors/class.svg'
import moneyIcon from '../../assets/image/tutors/money.svg'
import studentIcon from '../../assets/image/tutors/student.svg'
import defaultProfileImage from '../../assets/image/tutors/default.png'

const tabItems = [
	{ key: 'schedule', label: '일정' },
	{ key: 'reviews', label: '리뷰' },
	{ key: 'earnings', label: '수익' },
	{ key: 'weekly', label: '주간 스케줄' },
]

const EMPTY_LIST = []

const parseDate = (value) => {
	if (!value) return null
	const date = value instanceof Date ? value : new Date(value)
	return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (value, options) => {
	const date = parseDate(value)
	if (!date) return '-'
	return new Intl.DateTimeFormat('ko-KR', options).format(date)
}

const formatDateTime = (value) => formatDate(value, {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hour12: false,
})

const formatCurrency = (value) => {
	const amount = Number(value || 0)
	return `${amount.toLocaleString('ko-KR')}원`
}

const formatHours = (value) => {
	const hours = Number(value)
	if (!Number.isFinite(hours) || hours <= 0) return '-'
	return Number.isInteger(hours) ? `${hours}시간` : `${hours.toFixed(1)}시간`
}

const formatYearMonth = (value) => {
	if (!value) return '-'
	const [year, month] = String(value).split('-')
	if (!year || !month) return String(value)
	return `${year}년 ${Number(month)}월`
}

const toTimeValue = (value) => {
	const date = parseDate(value)
	return date ? date.getTime() : Number.MAX_SAFE_INTEGER
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

const buildAiDefaults = (lesson, tutorName) => ({
	tutorName: tutorName || '',
	studentName: lesson?.studentName || lesson?.studentNickname || '',
	subject: lesson?.subject || '',
	lessonContext: lesson
		? [
			`${lesson.studentName || lesson.studentNickname || '학생'} 학생과 진행한 ${lesson.subject || '수업'} 정리`,
			`수업 일정: ${formatDateTime(lesson.startAt)}`,
			`수업료: ${formatCurrency(lesson.price)}`,
			'핵심 진행 내용:',
			'학생 반응 및 이해도:',
			'다음 수업 계획:',
		].join('\n')
		: '',
})

const getStudentKey = (lesson) => String(
	lesson?.studentId
	|| lesson?.studentName
	|| lesson?.studentNickname
	|| lesson?.bookingId
	|| ''
)

const getStatusMeta = (status) => {
	switch (status) {
		case 'CONFIRMED':
			return { label: '확정', className: 'bg-emerald-100 text-emerald-700' }
		case 'PENDING':
			return { label: '대기', className: 'bg-amber-100 text-amber-700' }
		case 'COMPLETED':
			return { label: '완료', className: 'bg-slate-200 text-slate-700' }
		case 'CANCELLED':
			return { label: '취소', className: 'bg-rose-100 text-rose-700' }
		default:
			return { label: status || '확인 중', className: 'bg-slate-100 text-slate-600' }
	}
}

const resolveReviewWriter = (review) => (
	review?.studentName
	|| review?.studentNickname
	|| review?.nickname
	|| '익명'
)

const renderStars = (rating) => {
	const rounded = Math.max(0, Math.min(5, Math.round(Number(rating || 0))))
	return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`
}

const toEmbedVideoUrl = (value) => {
	const url = String(value || '').trim()
	if (!url) return ''
	if (url.includes('youtube.com/embed/')) return url
	const shortMatch = url.match(/youtu\.be\/([^?&/]+)/)
	if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`
	const watchMatch = url.match(/[?&]v=([^&]+)/)
	if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`
	return url
}

const StatCard = ({ icon, alt, value, label, valueClassName }) => (
	<div className='min-w-0 flex-1 rounded-[18px] border border-[#e5e7eb] bg-white shadow-sm'>
		<div className='px-4 py-5 text-center'>
			<div className='mb-2 flex justify-center'>
				<img src={icon} alt={alt} className='h-9 w-9' />
			</div>
			<div className={`text-[1.25rem] font-bold ${valueClassName}`}>{value}</div>
			<div className='mt-1 text-xs text-slate-500'>{label}</div>
		</div>
	</div>
)

const LessonListItem = ({ lesson, muted = false }) => {
	const status = getStatusMeta(lesson?.status)
	return (
		<div className={`rounded-[14px] border border-[#e9edf5] bg-white px-4 py-3 ${muted ? 'opacity-85' : ''}`}>
			<div className='mb-1 flex flex-wrap items-center justify-between gap-2'>
				<div className='text-sm font-semibold text-slate-900'>{lesson?.studentName || '-'}</div>
				<span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
			</div>
			<div className='text-sm text-slate-700'>{lesson?.subject || '수업'}</div>
			<div className='mt-1 text-xs text-slate-500'>
				{formatDateTime(lesson?.startAt)} ~ {formatDate(lesson?.endAt, { hour: '2-digit', minute: '2-digit', hour12: false })}
			</div>
			<div className='mt-1 text-xs text-[#4f46e5]'>수업료 {formatCurrency(lesson?.price)}</div>
		</div>
	)
}

const EmptyPanel = ({ message }) => (
	<div className='rounded-[14px] border border-dashed border-slate-300 py-6 text-center text-sm text-slate-500'>
		{message}
	</div>
)

const TutorMyPage = () => {
	const { isLoading: authLoading, isLogin, hasRole } = useAuth()
	const [searchParams] = useSearchParams()
	const [activeTab, setActiveTab] = useState('schedule')
	const [weekOffset, setWeekOffset] = useState(0)
	const [selectedStudentKey, setSelectedStudentKey] = useState('')
	const [mypage, setMypage] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [aiModalOpen, setAiModalOpen] = useState(false)
	const [aiMode, setAiMode] = useState('lesson-summary')
	const [aiDefaults, setAiDefaults] = useState(buildAiDefaults(null, ''))

	useEffect(() => {
		if (authLoading) return
		if (!isLogin) {
			setLoading(false)
			return
		}

		const fetchMypage = async () => {
			setLoading(true)
			setError('')
			try {
				const response = await api.get('/tutors/me')
				setMypage(response.data?.data || null)
			} catch {
				setError('튜터 마이페이지 정보를 불러오지 못했습니다.')
				setMypage(null)
			} finally {
				setLoading(false)
			}
		}

		fetchMypage()
	}, [authLoading, isLogin])

	const profile = mypage?.tutorProfile || null
	const languageFields = mypage?.languageFields ?? EMPTY_LIST
	const upcomingLessons = mypage?.upcomingLessons ?? EMPTY_LIST
	const pastLessons = mypage?.pastLessons ?? EMPTY_LIST
	const tutorReviews = mypage?.tutorReviews ?? EMPTY_LIST
	const monthlyEarnings = mypage?.monthlyEarnings ?? EMPTY_LIST

	const stats = useMemo(() => ({
		totalLessons: mypage?.tutorStats?.totalLessons ?? 0,
		totalEarnings: mypage?.tutorStats?.totalEarnings ?? 0,
		activeStudents: mypage?.tutorStats?.activeStudents ?? 0,
		ratingAvg: mypage?.tutorStats?.ratingAvg ?? profile?.ratingAvg ?? 0,
		reviewCount: mypage?.tutorStats?.reviewCount ?? profile?.reviewCount ?? 0,
	}), [mypage, profile])

	const allLessons = useMemo(
		() => [...upcomingLessons, ...pastLessons].filter((lesson) => lesson && lesson.status !== 'CANCELLED'),
		[upcomingLessons, pastLessons]
	)

	const studentOptions = useMemo(() => {
		const map = new Map()
		allLessons.forEach((lesson) => {
			const key = getStudentKey(lesson)
			if (!key) return
			if (!map.has(key)) {
				map.set(key, lesson?.studentName || lesson?.studentNickname || '학생')
			}
		})
		return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
	}, [allLessons])

	useEffect(() => {
		const tab = searchParams.get('tab')
		if (tab && tabItems.some((item) => item.key === tab)) {
			setActiveTab(tab)
		}
		const student = searchParams.get('student')
		if (student) {
			setSelectedStudentKey(student)
		}
	}, [searchParams])

	useEffect(() => {
		if (!selectedStudentKey) return
		const exists = studentOptions.some((option) => option.value === selectedStudentKey)
		if (!exists) setSelectedStudentKey('')
	}, [selectedStudentKey, studentOptions])

	const currentWeekStart = useMemo(() => {
		const today = new Date()
		today.setDate(today.getDate() + (weekOffset * 7))
		return getWeekStart(today)
	}, [weekOffset])

	const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
		const day = new Date(currentWeekStart)
		day.setDate(currentWeekStart.getDate() + index)
		return day
	}), [currentWeekStart])

	const weeklySourceLessons = useMemo(() => {
		if (!selectedStudentKey) return allLessons
		return allLessons.filter((lesson) => getStudentKey(lesson) === selectedStudentKey)
	}, [allLessons, selectedStudentKey])

	const weeklyByDay = useMemo(() => weekDays.map((day) => ({
		day,
		items: weeklySourceLessons
			.filter((lesson) => {
				const lessonDate = parseDate(lesson?.startAt)
				return lessonDate ? isSameDay(lessonDate, day) : false
			})
			.sort((left, right) => toTimeValue(left?.startAt) - toTimeValue(right?.startAt)),
	})), [weekDays, weeklySourceLessons])

	const weekRangeLabel = useMemo(() => (
		`${formatDate(weekDays[0], { year: 'numeric', month: '2-digit', day: '2-digit' })} ~ ${formatDate(weekDays[6], { month: '2-digit', day: '2-digit' })}`
	), [weekDays])

	const isTutor = hasRole('ROLE_TUTOR') || hasRole('ROLE_TUTOR_PENDING')
	const profileName = profile?.name || profile?.nickname || '-'
	const profileEmail = profile?.email || '-'
	const profileHeadline = profile?.headline || '등록된 한 줄 소개가 없습니다.'
	const profileBio = profile?.bio || profile?.selfIntro || '등록된 소개가 없습니다.'
	const profileVideoUrl = toEmbedVideoUrl(profile?.videoUrl)

	const openAiAssistant = (mode) => {
		const sourceLesson = upcomingLessons[0] || pastLessons[0] || allLessons[0] || null
		setAiMode(mode)
		setAiDefaults(buildAiDefaults(sourceLesson, profileName === '-' ? '' : profileName))
		setAiModalOpen(true)
	}

	if (authLoading || loading) {
		return (
			<Layout>
				<section className='bg-[#f8fafc] py-12'>
					<div className='mx-auto flex min-h-[50vh] w-full max-w-[1140px] items-center justify-center px-3'>
						<div className='h-10 w-10 animate-spin rounded-full border-4 border-[#4f46e5] border-t-transparent' />
					</div>
				</section>
			</Layout>
		)
	}

	if (!isLogin) {
		return (
			<Layout>
				<section className='bg-[#f8fafc] py-12'>
					<div className='mx-auto w-full max-w-[1140px] px-3'>
						<div className='rounded-[18px] border border-[#e5e7eb] bg-white px-6 py-16 text-center shadow-sm'>
							<h2 className='text-2xl font-bold text-slate-900'>로그인이 필요합니다</h2>
							<p className='mt-2 text-slate-500'>튜터 마이페이지는 로그인 후 이용할 수 있습니다.</p>
							<Link to='/login' className='mt-6 inline-flex h-[38px] items-center rounded-md bg-[#4f46e5] px-5 text-sm font-semibold text-white hover:bg-[#4338ca]'>
								로그인하기
							</Link>
						</div>
					</div>
				</section>
			</Layout>
		)
	}

	if (!isTutor) {
		return (
			<Layout>
				<section className='bg-[#f8fafc] py-12'>
					<div className='mx-auto w-full max-w-[1140px] px-3'>
						<div className='rounded-[18px] border border-[#e5e7eb] bg-white px-6 py-16 text-center shadow-sm'>
							<h2 className='text-2xl font-bold text-slate-900'>접근 권한이 없습니다</h2>
							<p className='mt-2 text-slate-500'>튜터 계정에서만 접근 가능합니다.</p>
							<Link to='/member/mypage' className='mt-6 inline-flex h-[38px] items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
								회원 마이페이지로
							</Link>
						</div>
					</div>
				</section>
			</Layout>
		)
	}

	if (error) {
		return (
			<Layout>
				<section className='bg-[#f8fafc] py-12'>
					<div className='mx-auto w-full max-w-[1140px] px-3'>
						<div className='rounded-[18px] border border-[#e5e7eb] bg-white px-6 py-16 text-center shadow-sm'>
							<h2 className='text-2xl font-bold text-slate-900'>오류가 발생했습니다</h2>
							<p className='mt-2 text-slate-500'>{error}</p>
							<button
								type='button'
								onClick={() => window.location.reload()}
								className='mt-6 inline-flex h-[38px] items-center rounded-md bg-[#4f46e5] px-5 text-sm font-semibold text-white hover:bg-[#4338ca]'
							>
								다시 시도
							</button>
						</div>
					</div>
				</section>
			</Layout>
		)
	}

	return (
		<Layout>
			<section className='bg-[#f8fafc] py-12'>
				<div className='mx-auto w-full max-w-[1140px] px-3'>
					<div className='mb-6 rounded-md border-l-4 border-[#4f46e5] bg-[#f8f9fa] p-4'>
						<h2 className='mb-1 text-[1.75rem] font-bold text-slate-900'>튜터 마이페이지</h2>
						<p className='mb-0 text-sm text-slate-500'>프로필과 활동 내역을 관리하세요</p>
					</div>

					<div className='grid gap-6 lg:grid-cols-12'>
						<aside className='space-y-3 lg:col-span-4'>
							<div className='rounded-[18px] border border-[#e5e7eb] bg-white shadow-sm'>
								<div className='p-7 text-center'>
									<div className='mx-auto mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#eef2ff]'>
										{profile?.profileImg ? (
											<img src={profile.profileImg} alt='프로필 이미지' className='h-full w-full object-cover' />
										) : (
											<img src={defaultProfileImage} alt='기본 프로필 이미지' className='h-full w-full object-cover' />
										)}
									</div>
									<h3 className='mb-1 text-lg font-bold text-slate-900'>{profileName}</h3>
									<p className='mb-3 text-sm text-slate-500'>{profileEmail}</p>

									{languageFields.length > 0 && (
										<div className='mb-3 flex flex-wrap justify-center gap-2'>
											{languageFields.map((field) => (
												<span key={field.id || field.name} className='rounded-full bg-[#4f46e5] px-2.5 py-1 text-xs font-semibold text-white'>
													{field.name}
												</span>
											))}
										</div>
									)}

									<div className='mb-3'>
										<span className='text-base text-amber-400'>{renderStars(stats.ratingAvg)}</span>
										<span className='ml-1 text-sm font-semibold text-slate-700'>{Number(stats.ratingAvg || 0).toFixed(1)}</span>
										<span className='ml-1 text-xs text-slate-500'>({stats.reviewCount} 리뷰)</span>
									</div>

									<Link to='/tutor/profile-edit' className='inline-flex h-[38px] w-full items-center justify-center rounded-md bg-[#4f46e5] px-4 text-sm font-semibold text-white hover:bg-[#4338ca]'>
										튜터 정보 수정
									</Link>
								</div>
							</div>

							<div className='rounded-[18px] border border-[#e5e7eb] bg-white shadow-sm'>
								{profileVideoUrl && (
									<div className='overflow-hidden rounded-t-[18px] border-b border-slate-200'>
										<div className='relative w-full overflow-hidden pb-[56.25%]'>
											<iframe
												title='튜터 소개 영상'
												src={profileVideoUrl}
												className='absolute left-0 top-0 h-full w-full'
												allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
												allowFullScreen
											/>
										</div>
									</div>
								)}
								<div className='space-y-4 p-7'>
									<div>
										<h4 className='mb-2 text-sm font-bold text-slate-900'>한 줄 소개</h4>
										<p className='mb-0 text-sm text-slate-500'>{profileHeadline}</p>
									</div>
									<div>
										<h4 className='mb-2 text-sm font-bold text-slate-900'>소개</h4>
										<p className='mb-0 whitespace-pre-wrap text-sm text-slate-500'>{profileBio}</p>
									</div>
								</div>
							</div>
						</aside>

						<div className='space-y-4 lg:col-span-8'>
							<div className='flex flex-col gap-3 sm:flex-row'>
								<StatCard icon={classIcon} alt='총 수업' value={stats.totalLessons} label='총 수업' valueClassName='text-[#4f46e5]' />
								<StatCard icon={moneyIcon} alt='총 수익' value={formatCurrency(stats.totalEarnings)} label='총 수익 (원)' valueClassName='text-emerald-600' />
								<StatCard icon={studentIcon} alt='활성 학생' value={stats.activeStudents} label='활성 학생' valueClassName='text-sky-600' />
							</div>

							<div className='rounded-[18px] border border-[#e5e7eb] bg-white shadow-sm'>
								<div className='flex flex-wrap items-center justify-between gap-2 p-5'>
									<div>
										<h3 className='mb-1 text-sm font-bold text-slate-900'>AI 수업 도우미</h3>
										<p className='mb-0 text-sm text-slate-500'>수업 요약과 과제 초안을 빠르게 작성할 수 있습니다.</p>
									</div>
									<div className='flex gap-2'>
										<button type='button' onClick={() => openAiAssistant('lesson-summary')} className='inline-flex h-[31px] items-center rounded-md border border-[#4f46e5] px-3 text-xs font-semibold text-[#4f46e5] hover:bg-indigo-50'>
											AI 수업 요약
										</button>
										<button type='button' onClick={() => openAiAssistant('homework')} className='inline-flex h-[31px] items-center rounded-md bg-[#4f46e5] px-3 text-xs font-semibold text-white hover:bg-[#4338ca]'>
											AI 과제 초안
										</button>
									</div>
								</div>
							</div>

							<div>
								<div className='mb-3 flex flex-wrap border-b border-slate-200'>
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

								{activeTab === 'schedule' && (
									<div className='space-y-3'>
										<div className='rounded-[18px] border border-[#e5e7eb] bg-white p-5 shadow-sm'>
											<div className='flex flex-wrap items-center justify-between gap-2'>
												<div>
													<strong className='text-sm text-slate-900'>스케줄 관리 방식 선택</strong>
													<p className='mb-0 mt-1 text-sm text-slate-500'>이번 주만 수정하거나 전체 스케줄을 수정할 수 있습니다.</p>
												</div>
												<Link to='/tutor/schedule-edit' className='inline-flex h-[31px] items-center rounded-md border border-[#4f46e5] px-3 text-xs font-semibold text-[#4f46e5] hover:bg-indigo-50'>
													이번 주 편집
												</Link>
											</div>
										</div>

										<div className='rounded-[18px] border border-[#e5e7eb] bg-white shadow-sm'>
											<div className='p-6'>
												<h4 className='mb-3 text-sm font-bold text-slate-900'>다가오는 수업</h4>
												<div className='grid gap-2'>
													{upcomingLessons.length === 0
														? <EmptyPanel message='다가오는 수업이 없습니다.' />
														: upcomingLessons.map((lesson) => <LessonListItem key={lesson.bookingId || `${lesson.studentId}-${lesson.startAt}`} lesson={lesson} />)
													}
												</div>
											</div>
										</div>

										<div className='rounded-[18px] border border-[#e5e7eb] bg-white shadow-sm'>
											<div className='p-6'>
												<h4 className='mb-3 text-sm font-bold text-slate-900'>지난 수업</h4>
												<div className='grid gap-2'>
													{pastLessons.length === 0
														? <EmptyPanel message='지난 수업 내역이 없습니다.' />
														: pastLessons.map((lesson) => <LessonListItem key={lesson.bookingId || `${lesson.studentId}-${lesson.startAt}`} lesson={lesson} muted />)
													}
												</div>
											</div>
										</div>
									</div>
								)}

								{activeTab === 'reviews' && (
									<div className='rounded-[18px] border border-[#e5e7eb] bg-white shadow-sm'>
										<div className='p-6'>
											<h4 className='mb-3 text-sm font-bold text-slate-900'>최근 리뷰</h4>
											<div className='grid gap-3'>
												{tutorReviews.length === 0 ? (
													<EmptyPanel message='아직 받은 리뷰가 없습니다.' />
												) : tutorReviews.map((review) => (
													<div key={review.reviewId || `${review.studentId}-${review.createdAt}`} className='rounded-[14px] bg-[#f8f9fa] p-4'>
														<div className='mb-2 flex items-center justify-between gap-2'>
															<div className='text-sm font-semibold text-slate-900'>{resolveReviewWriter(review)}</div>
															<div className='text-sm text-amber-500'>{renderStars(review.rating)}</div>
														</div>
														<p className='mb-1 text-sm text-slate-700'>{review.content || '-'}</p>
														<div className='text-xs text-slate-500'>
															{formatDate(review.createdAt, { year: 'numeric', month: '2-digit', day: '2-digit' })}
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								)}

								{activeTab === 'earnings' && (
									<div className='rounded-[18px] border border-[#e5e7eb] bg-white shadow-sm'>
										<div className='p-6'>
											<h4 className='mb-3 text-sm font-bold text-slate-900'>월별 수익</h4>
											{monthlyEarnings.length === 0 ? (
												<EmptyPanel message='수익 데이터가 없습니다.' />
											) : (
												<div className='overflow-x-auto'>
													<table className='min-w-full text-sm'>
														<thead>
															<tr className='border-b border-slate-200 text-left text-slate-500'>
																<th className='pb-2 pr-3 font-semibold'>월</th>
																<th className='pb-2 pr-3 font-semibold'>수업 수</th>
																<th className='pb-2 pr-3 font-semibold'>총 시간</th>
																<th className='pb-2 text-right font-semibold'>수익</th>
															</tr>
														</thead>
														<tbody>
															{monthlyEarnings.map((row) => (
																<tr key={row.yearMonth} className='border-b border-slate-100 last:border-0'>
																	<td className='py-2.5 pr-3 text-slate-800'>{formatYearMonth(row.yearMonth)}</td>
																	<td className='py-2.5 pr-3 text-slate-700'>{row.lessonCount ?? 0}회</td>
																	<td className='py-2.5 pr-3 text-slate-700'>{formatHours(row.totalHours)}</td>
																	<td className='py-2.5 text-right font-semibold text-emerald-600'>{formatCurrency(row.totalEarnings)}</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											)}
										</div>
									</div>
								)}

								{activeTab === 'weekly' && (
									<div className='rounded-[18px] border border-[#e5e7eb] bg-white shadow-sm'>
										<div className='p-6'>
											<h4 className='mb-3 text-sm font-bold text-slate-900'>주간 스케줄</h4>

											<div className='mb-3 flex flex-wrap items-center gap-2'>
												<label htmlFor='weeklyStudentFilter' className='text-sm text-slate-500'>학생 필터</label>
												<select
													id='weeklyStudentFilter'
													value={selectedStudentKey}
													onChange={(event) => setSelectedStudentKey(event.target.value)}
													className='h-[31px] w-full max-w-[220px] rounded-md border border-slate-300 px-3 text-sm focus:border-[#4f46e5] focus:outline-none'
												>
													<option value=''>전체 학생</option>
													{studentOptions.map((student) => (
														<option key={student.value} value={student.value}>{student.label}</option>
													))}
												</select>
											</div>

											<div className='mb-3 rounded-[12px] border border-slate-200 px-3 py-2 text-sm text-slate-500'>
												예약된 시간에 마우스를 올리면 학생/수업 정보를 볼 수 있습니다.
											</div>

											<div className='mb-3 flex items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white px-3 py-2'>
												<button
													type='button'
													onClick={() => setWeekOffset((prev) => prev - 1)}
													className='flex h-[34px] w-[34px] items-center justify-center rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50'
												>
													&lt;
												</button>
												<div className='rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-[#4f46e5]'>
													{weekRangeLabel}
												</div>
												<button
													type='button'
													onClick={() => setWeekOffset((prev) => prev + 1)}
													className='flex h-[34px] w-[34px] items-center justify-center rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50'
												>
													&gt;
												</button>
											</div>

											<div className='grid gap-2 lg:grid-cols-7'>
												{weeklyByDay.map(({ day, items }) => (
													<div key={day.toISOString()} className='rounded-[14px] border border-slate-200 bg-slate-50 p-2.5'>
														<div className='mb-2 border-b border-slate-200 pb-1.5 text-center'>
															<div className='text-sm font-bold text-slate-900'>{formatDate(day, { weekday: 'short' })}</div>
															<div className='text-xs text-slate-500'>{formatDate(day, { month: '2-digit', day: '2-digit' })}</div>
														</div>
														<div className='space-y-1.5'>
															{items.length === 0 ? (
																<div className='rounded-lg bg-white px-2 py-3 text-center text-xs text-slate-400'>-</div>
															) : items.map((lesson) => (
																<div key={lesson.bookingId || `${lesson.studentId}-${lesson.startAt}`} className='rounded-lg bg-white px-2 py-2 text-xs ring-1 ring-slate-200'>
																	<div className='font-semibold text-slate-900'>{lesson.studentName || '-'}</div>
																	<div className='text-slate-600'>{lesson.subject || '수업'}</div>
																	<div className='mt-0.5 font-medium text-rose-500'>● {formatDate(lesson.startAt, { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
																</div>
															))}
														</div>
													</div>
												))}
											</div>

											<small className='mt-2 block text-sm text-slate-500'>
												<span className='rounded-full bg-[#4f46e5] px-2 py-0.5 text-xs font-semibold text-white'>●</span> 수업 가능
												<span className='ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white'>●</span> 예약됨
											</small>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>
			<AiAssistantModal
				isOpen={aiModalOpen}
				onClose={() => setAiModalOpen(false)}
				mode={aiMode}
				defaults={aiDefaults}
			/>
		</Layout>
	)
}

export default TutorMyPage

