import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../common/Layout'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'

const dayOptions = [
	{ value: 'MON', label: '월요일' },
	{ value: 'TUE', label: '화요일' },
	{ value: 'WED', label: '수요일' },
	{ value: 'THU', label: '목요일' },
	{ value: 'FRI', label: '금요일' },
	{ value: 'SAT', label: '토요일' },
	{ value: 'SUN', label: '일요일' },
]

const makeEmptyRange = () => ({ dayOfWeek: 'MON', startTime: '09:00', endTime: '18:00' })

const TutorScheduleEditContent = () => {
	const { isLoading: authLoading, isLogin, hasRole } = useAuth()
	const [ranges, setRanges] = useState([makeEmptyRange()])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const sortedRanges = useMemo(() => {
		const indexMap = dayOptions.reduce((acc, item, index) => ({ ...acc, [item.value]: index }), {})
		return [...ranges].sort((a, b) => {
			const dayDiff = (indexMap[a.dayOfWeek] ?? 99) - (indexMap[b.dayOfWeek] ?? 99)
			if (dayDiff !== 0) return dayDiff
			return String(a.startTime).localeCompare(String(b.startTime))
		})
	}, [ranges])

	useEffect(() => {
		if (authLoading) return
		if (!isLogin) {
			setLoading(false)
			return
		}

		const loadTimeRanges = async () => {
			setLoading(true)
			setError('')
			try {
				const response = await api.get('/tutors/me/time-ranges')
				const items = response.data?.data || []
				if (!items.length) {
					setRanges([makeEmptyRange()])
					return
				}
				setRanges(items.map((item) => ({
					id: item.id,
					dayOfWeek: item.dayOfWeek || 'MON',
					startTime: String(item.startTime || '09:00').slice(0, 5),
					endTime: String(item.endTime || '18:00').slice(0, 5),
				})))
			} catch {
				setError('기본 시간대를 불러오지 못했습니다.')
			} finally {
				setLoading(false)
			}
		}

		loadTimeRanges()
	}, [authLoading, isLogin])

	const addRange = () => {
		setRanges((prev) => [...prev, makeEmptyRange()])
	}

	const removeRange = (index) => {
		setRanges((prev) => {
			if (prev.length === 1) return prev
			return prev.filter((_, i) => i !== index)
		})
	}

	const updateRange = (index, key, value) => {
		setRanges((prev) => prev.map((item, i) => i === index ? { ...item, [key]: value } : item))
	}

	const validateRanges = () => {
		for (const item of ranges) {
			if (!item.dayOfWeek || !item.startTime || !item.endTime) {
				return '요일/시작/종료 시간을 모두 입력해 주세요.'
			}
			if (item.startTime >= item.endTime) {
				return '종료 시간은 시작 시간보다 늦어야 합니다.'
			}
		}
		return ''
	}

	const handleSave = async () => {
		setError('')
		setSuccess('')
		const validationMessage = validateRanges()
		if (validationMessage) {
			setError(validationMessage)
			return
		}

		setSaving(true)
		try {
			await api.post('/tutors/me/time-ranges', sortedRanges.map((item) => ({
				dayOfWeek: item.dayOfWeek,
				startTime: item.startTime,
				endTime: item.endTime,
			})))
			setSuccess('기본 수업 가능 시간이 저장되었습니다.')
		} catch (err) {
			setError(err?.response?.data?.message || '시간 저장에 실패했습니다.')
		} finally {
			setSaving(false)
		}
	}

	if (authLoading || loading) {
		return (
			<Layout>
				<div className='flex min-h-[60vh] items-center justify-center'>
					<div className='h-10 w-10 animate-spin rounded-full border-4 border-[#4f46e5] border-t-transparent' />
				</div>
			</Layout>
		)
	}

	if (!isLogin) {
		return (
			<Layout>
				<div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
					<h2 className='text-2xl font-bold text-slate-900'>로그인이 필요합니다</h2>
					<Link to='/login' className='rounded-xl bg-[#4f46e5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338ca]'>로그인하기</Link>
				</div>
			</Layout>
		)
	}

	if (!hasRole('ROLE_TUTOR') && !hasRole('ROLE_TUTOR_PENDING')) {
		return (
			<Layout>
				<div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
					<h2 className='text-2xl font-bold text-slate-900'>튜터 권한이 필요합니다</h2>
					<Link to='/tutor/register' className='rounded-xl bg-[#4f46e5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338ca]'>튜터 등록하기</Link>
				</div>
			</Layout>
		)
	}

	return (
		<Layout>
			<section className='bg-[#f8fafc] px-4 py-10'>
				<div className='mx-auto max-w-4xl'>
					<div className='mb-6 flex items-center justify-between'>
						<div>
							<h1 className='text-3xl font-extrabold text-slate-900'>스케줄 관리</h1>
							<p className='mt-2 text-sm text-slate-500'>요일별 기본 수업 가능 시간을 설정하세요.</p>
						</div>
						<Link to='/tutor/mypage' className='rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>마이페이지</Link>
					</div>

					<div className='space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
						{ranges.map((item, index) => (
							<div key={`${item.id || 'new'}-${index}`} className='grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_1fr_1fr_auto]'>
								<select value={item.dayOfWeek} onChange={(event) => updateRange(index, 'dayOfWeek', event.target.value)} className='rounded-lg border border-slate-300 px-3 py-2 text-sm'>
									{dayOptions.map((day) => (
										<option key={day.value} value={day.value}>{day.label}</option>
									))}
								</select>
								<input type='time' value={item.startTime} onChange={(event) => updateRange(index, 'startTime', event.target.value)} className='rounded-lg border border-slate-300 px-3 py-2 text-sm' />
								<input type='time' value={item.endTime} onChange={(event) => updateRange(index, 'endTime', event.target.value)} className='rounded-lg border border-slate-300 px-3 py-2 text-sm' />
								<button type='button' onClick={() => removeRange(index)} className='rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50'>삭제</button>
							</div>
						))}

						<div className='flex flex-wrap justify-between gap-2 pt-2'>
							<button type='button' onClick={addRange} className='rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>시간대 추가</button>
							<button type='button' onClick={handleSave} disabled={saving} className='rounded-xl bg-[#4f46e5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'>
								{saving ? '저장 중...' : '저장'}
							</button>
						</div>

						{error && <p className='text-sm font-semibold text-red-500'>{error}</p>}
						{success && <p className='text-sm font-semibold text-emerald-600'>{success}</p>}
					</div>
				</div>
			</section>
		</Layout>
	)
}

export default TutorScheduleEditContent
