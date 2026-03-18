import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../common/Layout'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'
import '../../styles/tutor-register.css'

const STEP_PATHS = ['/tutor/register', '/tutor/register1', '/tutor/register2', '/tutor/register3']
const STORAGE_KEYS = {
	step1: 'tutorRegisterStep1',
	step2: 'tutorRegisterStep2',
	step3: 'tutorRegisterStep3',
	step4: 'tutorRegisterStep4',
}

const BANK_OPTIONS = [
	'국민은행', '우리은행', '신한은행', '하나은행', '카카오뱅크', 'NH농협', '기업은행', '토스뱅크',
	'부산은행', '광주은행', '전북은행', '제주은행', '새마을금고', '우체국', 'SC제일은행',
]

const DAY_OPTIONS = [
	{ value: 'MON', label: '월요일' },
	{ value: 'TUE', label: '화요일' },
	{ value: 'WED', label: '수요일' },
	{ value: 'THU', label: '목요일' },
	{ value: 'FRI', label: '금요일' },
	{ value: 'SAT', label: '토요일' },
	{ value: 'SUN', label: '일요일' },
]

const initialBasicForm = {
	basicPhone: '',
	basicBankName: '',
	basicAccountNumber: '',
	basicAccountHolder: '',
	headline: '',
	bio: '',
	selfIntro: '',
	videoUrl: '',
}

const initialCareerForm = {
	companyName: '',
	jobCategory: '',
	jobRole: '',
	startYear: '',
	endYear: '',
}

const initialEducationForm = {
	schoolName: '',
	startYear: '',
	graduatedYear: '',
}

const initialDegreeForm = {
	degreeName: '',
	major: '',
}

const initialCertificateTextForm = {
	name: '',
	issuer: '',
}

const initialLessonForm = {
	subjectId: '',
	fieldId: '',
	price: '',
}

const makeEmptyTimeRange = (dayOfWeek = 'MON') => ({ dayOfWeek, startTime: '08:00', endTime: '09:30' })
const makeEmptyAvailability = () => ({ date: '', startTime: '09:00', endTime: '09:30' })

const readStored = (key, fallback) => {
	if (typeof window === 'undefined') return fallback
	try {
		const raw = window.sessionStorage.getItem(key)
		if (!raw) return fallback
		return { ...fallback, ...JSON.parse(raw) }
	} catch {
		return fallback
	}
}

const readStoredArray = (key, field) => {
	if (typeof window === 'undefined') return []
	try {
		const raw = window.sessionStorage.getItem(key)
		if (!raw) return []
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed?.[field]) ? parsed[field] : []
	} catch {
		return []
	}
}

const saveStored = (key, payload) => {
	if (typeof window === 'undefined') return
	window.sessionStorage.setItem(key, JSON.stringify(payload))
}

const clearRegisterStorage = () => {
	if (typeof window === 'undefined') return
	Object.values(STORAGE_KEYS).forEach((key) => window.sessionStorage.removeItem(key))
}

const toNullableNumber = (value) => {
	const trimmed = String(value ?? '').trim()
	if (!trimmed) return null
	const parsed = Number(trimmed)
	return Number.isFinite(parsed) ? parsed : null
}

const fileToStoredObject = (file) => new Promise((resolve, reject) => {
	const reader = new FileReader()
	reader.onload = () => resolve({
		name: file.name,
		type: file.type,
		size: file.size,
		data: reader.result,
	})
	reader.onerror = reject
	reader.readAsDataURL(file)
})

const base64ToFile = (storedFile) => {
	const parts = String(storedFile?.data || '').split(',')
	if (parts.length < 2) {
		throw new Error('파일 데이터가 올바르지 않습니다.')
	}
	const mime = parts[0].match(/:(.*?);/)?.[1] || storedFile.type || 'application/octet-stream'
	const binary = atob(parts[1])
	const bytes = new Uint8Array(binary.length)
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index)
	}
	return new File([bytes], storedFile.name || 'upload.bin', { type: mime })
}

const toLocalDateTimeString = (date) => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	const seconds = String(date.getSeconds()).padStart(2, '0')
	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

const getAvailabilityWindow = () => {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const start = new Date(today)
	start.setDate(today.getDate() - today.getDay())
	start.setHours(0, 0, 0, 0)
	const end = new Date(start)
	end.setDate(end.getDate() + (9 * 7) + 6)
	end.setHours(23, 59, 59, 0)
	return {
		start: toLocalDateTimeString(start),
		end: toLocalDateTimeString(end),
	}
}

const DAY_INDEX_TO_ENUM = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const DAY_ORDER = Object.fromEntries(DAY_OPTIONS.map((item, index) => [item.value, index]))
const KOR_DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

const pad2 = (value) => String(value).padStart(2, '0')

const formatDateOnly = (date) => {
	const year = date.getFullYear()
	const month = pad2(date.getMonth() + 1)
	const day = pad2(date.getDate())
	return `${year}-${month}-${day}`
}

const addDays = (date, days) => {
	const next = new Date(date)
	next.setDate(next.getDate() + days)
	return next
}

const getWeekStart = (baseDate = new Date()) => {
	const date = new Date(baseDate)
	date.setHours(0, 0, 0, 0)
	date.setDate(date.getDate() - date.getDay())
	return date
}

const formatCalendarRange = (startDate) => {
	const endDate = addDays(startDate, 6)
	return `${startDate.getFullYear()}.${pad2(startDate.getMonth() + 1)}.${pad2(startDate.getDate())} ~ ${endDate.getFullYear()}.${pad2(endDate.getMonth() + 1)}.${pad2(endDate.getDate())}`
}

const formatCalendarDay = (date) => `${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`

const addMinutesToTime = (time, minutes) => {
	const [rawHour = '0', rawMinute = '0'] = String(time || '00:00').split(':')
	const totalMinutes = (Number(rawHour) * 60) + Number(rawMinute) + minutes
	const hour = Math.floor(totalMinutes / 60)
	const minute = totalMinutes % 60
	return `${pad2(hour)}:${pad2(minute)}`
}

const buildHalfHourSlots = (startTime, endTime) => {
	const slots = []
	let cursor = startTime
	while (cursor < endTime) {
		const next = addMinutesToTime(cursor, 30)
		if (next <= endTime) {
			slots.push(cursor)
		}
		cursor = next
	}
	return slots
}

const buildAvailabilityKey = (date, startTime, endTime) => `${date}_${startTime}_${endTime}`

const sortAvailabilitySlots = (left, right) => {
	const leftKey = `${left.date}_${left.startTime}_${left.endTime}`
	const rightKey = `${right.date}_${right.startTime}_${right.endTime}`
	return leftKey.localeCompare(rightKey)
}

const sortTimeRanges = (left, right) => {
	const dayDiff = (DAY_ORDER[left.dayOfWeek] ?? 99) - (DAY_ORDER[right.dayOfWeek] ?? 99)
	if (dayDiff !== 0) return dayDiff
	const leftKey = `${left.startTime}_${left.endTime}`
	const rightKey = `${right.startTime}_${right.endTime}`
	return leftKey.localeCompare(rightKey)
}

const TutorRegisterContent = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { isLoading: authLoading, isLogin, hasAnyRole, refreshUser, userInfo } = useAuth()

	const currentStep = useMemo(() => {
		const index = STEP_PATHS.indexOf(location.pathname)
		return index >= 0 ? index : 0
	}, [location.pathname])

	const stepMeta = useMemo(() => {
		const meta = [
			{ title: '튜터 회원가입 (1/4단계)', desc: '기본 정보를 입력하고 다음 단계로 이동합니다.' },
			{ title: '튜터 회원가입 (2/4단계)', desc: '학력, 학위, 자격증, 경력을 저장합니다.' },
			{ title: '튜터 회원가입 (3/4단계)', desc: '수업 카드와 활동 분야를 구성합니다.' },
			{ title: '튜터 회원가입 (4/4단계)', desc: '기본 시간대와 실제 수업 가능 슬롯을 저장하고 등록을 완료합니다.' },
		]
		return {
			...meta[currentStep],
			step: currentStep + 1,
			total: 4,
			progress: (currentStep + 1) * 25,
		}
	}, [currentStep])

	const [basicForm, setBasicForm] = useState(() => readStored(STORAGE_KEYS.step1, initialBasicForm))
	const [profileImage, setProfileImage] = useState(() => readStored(STORAGE_KEYS.step1, { profileImage: null }).profileImage || null)

	const [careerForm, setCareerForm] = useState(initialCareerForm)
	const [careers, setCareers] = useState(() => readStoredArray(STORAGE_KEYS.step2, 'careers'))
	const [educationForm, setEducationForm] = useState(initialEducationForm)
	const [educations, setEducations] = useState(() => readStoredArray(STORAGE_KEYS.step2, 'educations'))
	const [degreeForm, setDegreeForm] = useState(initialDegreeForm)
	const [degrees, setDegrees] = useState(() => readStoredArray(STORAGE_KEYS.step2, 'degrees'))
	const [certificateTextForm, setCertificateTextForm] = useState(initialCertificateTextForm)
	const [certificateTexts, setCertificateTexts] = useState(() => readStoredArray(STORAGE_KEYS.step2, 'certificateTexts'))
	const [academicCertificates, setAcademicCertificates] = useState(() => readStoredArray(STORAGE_KEYS.step2, 'academicCertificates'))
	const [degreeCertificates, setDegreeCertificates] = useState(() => readStoredArray(STORAGE_KEYS.step2, 'degreeCertificates'))
	const [certificateFiles, setCertificateFiles] = useState(() => readStoredArray(STORAGE_KEYS.step2, 'certificateFiles'))

	const [fields, setFields] = useState([])
	const [subjects, setSubjects] = useState([])
	const [selectedFieldIds, setSelectedFieldIds] = useState(() => readStoredArray(STORAGE_KEYS.step3, 'selectedFieldIds'))
	const [lessonForm, setLessonForm] = useState(initialLessonForm)
	const [lessonCards, setLessonCards] = useState(() => readStoredArray(STORAGE_KEYS.step3, 'lessonCards'))

	const [timeRanges, setTimeRanges] = useState(() => {
		const items = readStoredArray(STORAGE_KEYS.step4, 'timeRanges')
		return items.length ? items : [makeEmptyTimeRange()]
	})
	const [availabilityForm, setAvailabilityForm] = useState(makeEmptyAvailability)
	const [availabilitySlots, setAvailabilitySlots] = useState(() => readStoredArray(STORAGE_KEYS.step4, 'availabilitySlots'))
	const profileInputRef = useRef(null)
	const [calendarWeekStart, setCalendarWeekStart] = useState(() => getWeekStart())

	const [loadingMeta, setLoadingMeta] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	useEffect(() => {
		saveStored(STORAGE_KEYS.step1, { ...basicForm, profileImage })
	}, [basicForm, profileImage])

	useEffect(() => {
		saveStored(STORAGE_KEYS.step2, {
			careers,
			educations,
			degrees,
			certificateTexts,
			academicCertificates,
			degreeCertificates,
			certificateFiles,
		})
	}, [academicCertificates, careers, certificateFiles, certificateTexts, degreeCertificates, degrees, educations])

	useEffect(() => {
		saveStored(STORAGE_KEYS.step3, { selectedFieldIds, lessonCards })
	}, [lessonCards, selectedFieldIds])

	useEffect(() => {
		saveStored(STORAGE_KEYS.step4, { timeRanges, availabilitySlots })
	}, [availabilitySlots, timeRanges])

	useEffect(() => {
		if (currentStep < 2) return
		const loadMeta = async () => {
			setLoadingMeta(true)
			try {
				const [fieldRes, subjectRes] = await Promise.all([
					api.get('/language-fields'),
					api.get('/subjects'),
				])
				setFields(fieldRes.data?.data || [])
				setSubjects(subjectRes.data?.data || [])
			} catch {
				setError('튜터 등록에 필요한 기본 데이터를 불러오지 못했습니다.')
			} finally {
				setLoadingMeta(false)
			}
		}

		loadMeta()
	}, [currentStep])

	useEffect(() => {
		if (!userInfo?.name) return
		setBasicForm((prev) => prev)
	}, [userInfo])

	const subjectMap = useMemo(() => new Map(subjects.map((item) => [String(item.id), item.name])), [subjects])
	const fieldMap = useMemo(() => new Map(fields.map((item) => [String(item.id), item.name])), [fields])
	const generalFields = useMemo(() => fields.filter((item) => item.category !== 'DOMAIN'), [fields])
	const domainFields = useMemo(() => fields.filter((item) => item.category === 'DOMAIN'), [fields])
	const nextPath = STEP_PATHS[currentStep + 1]
	const prevPath = STEP_PATHS[currentStep - 1] || '/'
	const displayName = userInfo?.name || '회원'
	const calendarDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(calendarWeekStart, index)), [calendarWeekStart])
	const weekRangeLabel = useMemo(() => formatCalendarRange(calendarWeekStart), [calendarWeekStart])
	const baseRangesByDay = useMemo(() => {
		return timeRanges.reduce((acc, item) => {
			if (!item.dayOfWeek || !item.startTime || !item.endTime || item.startTime >= item.endTime) return acc
			if (!acc[item.dayOfWeek]) acc[item.dayOfWeek] = []
			acc[item.dayOfWeek].push(item)
			return acc
		}, {})
	}, [timeRanges])
	const groupedTimeRanges = useMemo(
		() => DAY_OPTIONS.map((day) => ({
			...day,
			ranges: [...(baseRangesByDay[day.value] || [])].sort(sortTimeRanges),
		})),
		[baseRangesByDay],
	)
	const calendarSlotsByDay = useMemo(() => {
		return calendarDays.map((day) => {
			const dayEnum = DAY_INDEX_TO_ENUM[day.getDay()]
			const ranges = baseRangesByDay[dayEnum] || []
			const slotSet = new Set()
			ranges.forEach((range) => {
				buildHalfHourSlots(range.startTime, range.endTime).forEach((slot) => slotSet.add(slot))
			})
			return Array.from(slotSet).sort()
		})
	}, [baseRangesByDay, calendarDays])
	const availabilityKeySet = useMemo(
		() => new Set(availabilitySlots.map((item) => buildAvailabilityKey(item.date, item.startTime, item.endTime))),
		[availabilitySlots],
	)
	const currentWeekDateSet = useMemo(() => new Set(calendarDays.map((day) => formatDateOnly(day))), [calendarDays])
	const currentWeekAvailability = useMemo(
		() => availabilitySlots.filter((item) => currentWeekDateSet.has(item.date)).sort(sortAvailabilitySlots),
		[availabilitySlots, currentWeekDateSet],
	)

	const handleBasicChange = (event) => {
		const { name, value } = event.target
		setBasicForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleObjectChange = (setter) => (event) => {
		const { name, value } = event.target
		setter((prev) => ({ ...prev, [name]: value }))
	}

	const handleProfileImageChange = async (event) => {
		const file = event.target.files?.[0]
		if (!file) return
		try {
			setProfileImage(await fileToStoredObject(file))
			setError('')
		} catch {
			setError('프로필 이미지를 처리하지 못했습니다.')
		}
	}

	const clearProfileImage = () => {
		setProfileImage(null)
		setError('')
	}

	const openProfilePicker = () => {
		profileInputRef.current?.click()
	}

	const appendStoredFiles = (setter) => async (event) => {
		const filesToStore = Array.from(event.target.files || [])
		if (!filesToStore.length) return
		try {
			const storedFiles = await Promise.all(filesToStore.map(fileToStoredObject))
			setter((prev) => [...prev, ...storedFiles])
			event.target.value = ''
			setError('')
		} catch {
			setError('파일을 처리하지 못했습니다.')
		}
	}

	const addCareer = () => {
		if (!careerForm.companyName.trim()) {
			setError('회사명을 입력해 주세요.')
			return
		}
		setCareers((prev) => [...prev, { ...careerForm }])
		setCareerForm(initialCareerForm)
		setError('')
	}

	const addEducation = () => {
		if (!educationForm.schoolName.trim()) {
			setError('학교명을 입력해 주세요.')
			return
		}
		setEducations((prev) => [...prev, { ...educationForm }])
		setEducationForm(initialEducationForm)
		setError('')
	}

	const addDegree = () => {
		if (!degreeForm.degreeName.trim()) {
			setError('학위명을 입력해 주세요.')
			return
		}
		setDegrees((prev) => [...prev, { ...degreeForm }])
		setDegreeForm(initialDegreeForm)
		setError('')
	}

	const addCertificateText = () => {
		if (!certificateTextForm.name.trim()) {
			setError('자격증명을 입력해 주세요.')
			return
		}
		setCertificateTexts((prev) => [...prev, { ...certificateTextForm }])
		setCertificateTextForm(initialCertificateTextForm)
		setError('')
	}

	const addLessonCard = () => {
		const subjectId = String(lessonForm.subjectId || '')
		const fieldId = String(lessonForm.fieldId || '')
		const price = Number(lessonForm.price)
		if (!subjectId || !fieldId) {
			setError('과목과 분야를 선택해 주세요.')
			return
		}
		if (!lessonForm.price || Number.isNaN(price) || price <= 0) {
			setError('수업 가격을 올바르게 입력해 주세요.')
			return
		}
		const subjectName = subjectMap.get(subjectId) || ''
		const fieldName = fieldMap.get(fieldId) || ''
		setLessonCards((prev) => [...prev, { subjectId, subjectName, fieldId, fieldName, price: lessonForm.price }])
		setSelectedFieldIds((prev) => (prev.includes(fieldId) ? prev : [...prev, fieldId]))
		setLessonForm(initialLessonForm)
		setError('')
	}

	const removeLessonCard = (indexToRemove) => {
		const nextItems = lessonCards.filter((_, index) => index !== indexToRemove)
		setLessonCards(nextItems)
		setSelectedFieldIds(Array.from(new Set(nextItems.map((item) => item.fieldId).filter(Boolean))))
		setError('')
	}

	const addTimeRangeForDay = (dayOfWeek) => {
		setTimeRanges((prev) => [...prev, makeEmptyTimeRange(dayOfWeek)].sort(sortTimeRanges))
		setError('')
		setSuccess('')
	}

	const updateTimeRangeForDay = (dayOfWeek, rangeIndex, key, value) => {
		let matchedIndex = -1
		setTimeRanges((prev) => prev
			.map((item) => {
				if (item.dayOfWeek !== dayOfWeek) return item
				matchedIndex += 1
				if (matchedIndex !== rangeIndex) return item
				return { ...item, [key]: value }
			})
			.sort(sortTimeRanges))
		setError('')
		setSuccess('')
	}

	const removeTimeRangeForDay = (dayOfWeek, rangeIndex) => {
		let matchedIndex = -1
		setTimeRanges((prev) => prev
			.filter((item) => {
				if (item.dayOfWeek !== dayOfWeek) return true
				matchedIndex += 1
				return matchedIndex !== rangeIndex
			})
			.sort(sortTimeRanges))
		setError('')
		setSuccess('')
	}

	const addAvailabilitySlot = () => {
		if (!availabilityForm.date || !availabilityForm.startTime || !availabilityForm.endTime) {
			setError('날짜와 시간을 모두 입력해 주세요.')
			return
		}
		if (availabilityForm.startTime >= availabilityForm.endTime) {
			setError('종료 시간은 시작 시간보다 늦어야 합니다.')
			return
		}
		setAvailabilitySlots((prev) => [...prev, { ...availabilityForm }])
		setAvailabilityForm(makeEmptyAvailability())
		setError('')
	}
	const goToPreviousWeek = () => {
		setCalendarWeekStart((prev) => addDays(prev, -7))
	}

	const goToNextWeek = () => {
		setCalendarWeekStart((prev) => addDays(prev, 7))
	}

	const toggleAvailabilitySlot = (date, startTime) => {
		const dateText = formatDateOnly(date)
		const endTime = addMinutesToTime(startTime, 30)
		const targetKey = buildAvailabilityKey(dateText, startTime, endTime)

		setAvailabilitySlots((prev) => {
			const exists = prev.some((item) => buildAvailabilityKey(item.date, item.startTime, item.endTime) === targetKey)
			const nextItems = exists
				? prev.filter((item) => buildAvailabilityKey(item.date, item.startTime, item.endTime) !== targetKey)
				: [...prev, { date: dateText, startTime, endTime }]
			return nextItems.sort(sortAvailabilitySlots)
		})
		setError('')
		setSuccess('')
	}

	const applyCurrentWeekPattern = () => {
		if (!currentWeekAvailability.length) {
			setError('이번 주에 선택된 가능한 시간이 없습니다.')
			setSuccess('')
			return
		}

		setAvailabilitySlots((prev) => {
			const nextItems = [...prev]
			const keySet = new Set(nextItems.map((item) => buildAvailabilityKey(item.date, item.startTime, item.endTime)))

			currentWeekAvailability.forEach((item) => {
				const baseDate = new Date(`${item.date}T00:00:00`)
				for (let week = 1; week <= 9; week += 1) {
					const nextDate = formatDateOnly(addDays(baseDate, week * 7))
					const key = buildAvailabilityKey(nextDate, item.startTime, item.endTime)
					if (!keySet.has(key)) {
						nextItems.push({ ...item, date: nextDate })
						keySet.add(key)
					}
				}
			})

			return nextItems.sort(sortAvailabilitySlots)
		})

		setError('')
		setSuccess('이번 주 설정을 앞으로 9주까지 반영했습니다.')
	}

	const validateCurrentStep = () => {
		if (currentStep === 0) {
			if (!basicForm.basicPhone.trim() || !basicForm.basicBankName.trim() || !basicForm.basicAccountNumber.trim() || !basicForm.basicAccountHolder.trim() || !basicForm.headline.trim() || !basicForm.bio.trim() || !basicForm.selfIntro.trim()) {
				return '필수 항목을 모두 입력해 주세요.'
			}
		}
		if (currentStep === 2 && !selectedFieldIds.length) {
			return '최소 1개 이상의 분야를 선택해 주세요.'
		}
		if (currentStep === 3) {
			for (const item of timeRanges) {
				if (!item.dayOfWeek || !item.startTime || !item.endTime) {
					return '기본 시간대의 요일과 시간을 모두 입력해 주세요.'
				}
				if (item.startTime >= item.endTime) {
					return '기본 시간대 종료 시간은 시작 시간보다 늦어야 합니다.'
				}
			}
			for (const item of availabilitySlots) {
				if (!item.date || !item.startTime || !item.endTime) {
					return '수업 가능 슬롯의 날짜와 시간을 모두 입력해 주세요.'
				}
				if (item.startTime >= item.endTime) {
					return '수업 가능 슬롯 종료 시간은 시작 시간보다 늦어야 합니다.'
				}
			}
		}
		return ''
	}

	const uploadStoredFiles = async (docType, files) => {
		for (const fileInfo of files) {
			const formData = new FormData()
			formData.append('docType', docType)
			formData.append('file', base64ToFile(fileInfo))
			await api.post('/tutors/documents', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
		}
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setSuccess('')

		const validationMessage = validateCurrentStep()
		if (validationMessage) {
			setError(validationMessage)
			return
		}

		if (currentStep < 3) {
			navigate(nextPath)
			return
		}

		setSubmitting(true)
		try {
			const lessonCardsPayload = lessonCards.map((item) => ({
				subject: item.subjectName,
				field: item.fieldName,
				fieldId: item.fieldId,
				price: Number(item.price),
			}))
			const careersPayload = careers.map((item) => ({
				companyName: item.companyName,
				jobCategory: item.jobCategory,
				jobRole: item.jobRole,
				startYear: toNullableNumber(item.startYear),
				endYear: toNullableNumber(item.endYear),
			}))
			const educationsPayload = educations.map((item) => ({
				schoolName: item.schoolName,
				startYear: toNullableNumber(item.startYear),
				graduatedYear: toNullableNumber(item.graduatedYear),
			}))
			const degreesPayload = degrees.map((item) => ({
				degreeName: item.degreeName,
				major: item.major,
			}))
			const certificateTextsPayload = certificateTexts.map((item) => ({
				name: item.name,
				issuer: item.issuer,
			}))
			const timeRangesPayload = timeRanges.map((item) => ({
				dayOfWeek: item.dayOfWeek,
				startTime: item.startTime,
				endTime: item.endTime,
			}))
			const availabilityPayload = availabilitySlots.map((item) => ({
				startAt: `${item.date}T${item.startTime}:00`,
				endAt: `${item.date}T${item.endTime}:00`,
				status: 'OPEN',
			}))

			const profileBody = new FormData()
			profileBody.append('basicPhone', basicForm.basicPhone)
			profileBody.append('headline', basicForm.headline)
			profileBody.append('bio', basicForm.bio)
			profileBody.append('selfIntro', basicForm.selfIntro)
			profileBody.append('videoUrl', basicForm.videoUrl)
			profileBody.append('basicBankName', basicForm.basicBankName)
			profileBody.append('basicAccountNumber', basicForm.basicAccountNumber)
			profileBody.append('basicAccountHolder', basicForm.basicAccountHolder)
			profileBody.append('careersJson', JSON.stringify(careersPayload))
			profileBody.append('educationsJson', JSON.stringify(educationsPayload))
			profileBody.append('degreesJson', JSON.stringify(degreesPayload))
			profileBody.append('certificateTextsJson', JSON.stringify(certificateTextsPayload))
			profileBody.append('lessonCardsJson', JSON.stringify(lessonCardsPayload))
			selectedFieldIds.forEach((fieldId) => profileBody.append('fieldIds', fieldId))
			if (profileImage?.data) {
				profileBody.append('profileImg', base64ToFile(profileImage))
			}

			await api.post('/tutors/profile', profileBody, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			await api.put('/tutors/documents/certificate-texts', certificateTextsPayload)
			await uploadStoredFiles('EDUCATION', academicCertificates)
			await uploadStoredFiles('DEGREE', degreeCertificates)
			await uploadStoredFiles('CERTIFICATE', certificateFiles)
			await api.post('/tutors/me/time-ranges', timeRangesPayload)

			const { start, end } = getAvailabilityWindow()
			await api.post('/tutors/me/availability', availabilityPayload, {
				params: { start, end },
			})

			clearRegisterStorage()
			await refreshUser().catch(() => null)
			setSuccess('튜터 등록이 완료되었습니다.')
			setTimeout(() => navigate('/tutor/mypage'), 500)
		} catch (submitError) {
			setError(submitError?.response?.data?.message || '튜터 등록에 실패했습니다.')
		} finally {
			setSubmitting(false)
		}
	}

	if (authLoading || loadingMeta) {
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
					<p className='text-sm text-slate-500'>튜터 등록은 로그인 후 진행할 수 있습니다.</p>
					<Link to='/login' className='rounded-xl bg-[#4f46e5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338ca]'>로그인하기</Link>
				</div>
			</Layout>
		)
	}

	if (hasAnyRole('ROLE_TUTOR')) {
		return (
			<Layout>
				<div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
					<h2 className='text-2xl font-bold text-slate-900'>이미 튜터 권한이 등록되어 있습니다</h2>
					<p className='text-sm text-slate-500'>튜터 마이페이지에서 정보를 확인하거나 수정할 수 있습니다.</p>
					<Link to='/tutor/mypage' className='rounded-xl bg-[#4f46e5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338ca]'>튜터 마이페이지로 이동</Link>
				</div>
			</Layout>
		)
	}

	return (
		<Layout>
			<section className='register-page px-4 py-10'>
				<div className='register-shell mx-auto max-w-[720px]'>
					<div className='register-header mb-4 text-center'>
                        <h1 className='register-step-title'>{stepMeta.title}</h1>
                        <p className='register-step-desc'>{stepMeta.desc}</p>
                        <div className='register-progress mt-4'>
                            <div className='register-progress-bar transition-all' style={{ width: `${stepMeta.progress}%` }} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className='register-form-card'>
						{currentStep === 0 && (
							<>
								<SectionCard title='1. 기본 정보' description='연락처를 입력해 주세요. 이름은 자동으로 입력됩니다.'>
									<div className='grid gap-4 md:grid-cols-2'>
										<Input label='이름' value={displayName} disabled />
										<Input label='연락처' name='basicPhone' value={basicForm.basicPhone} onChange={handleBasicChange} placeholder='010-0000-0000' required />
									</div>
								</SectionCard>

								<SectionCard title='2. 계좌 정보' description='정산을 위한 계좌 정보를 입력해 주세요.'>
									<div className='grid gap-4 md:grid-cols-3'>
										<Select label='은행명' name='basicBankName' value={basicForm.basicBankName} onChange={handleBasicChange} options={BANK_OPTIONS.map((item) => ({ value: item, label: item }))} placeholder='은행을 선택하세요' />
										<Input label='계좌번호' name='basicAccountNumber' value={basicForm.basicAccountNumber} onChange={handleBasicChange} placeholder='계좌번호 입력' required />
										<Input label='예금주' name='basicAccountHolder' value={basicForm.basicAccountHolder} onChange={handleBasicChange} placeholder='예금주명 입력' required />
									</div>
								</SectionCard>

                                <SectionCard title='3. 프로필 사진 및 소개' description='학생에게 보여질 프로필 사진과 소개 정보를 입력해 주세요.'>
                                    <div className='register-profile-panel'>
                                        <div className='register-upload-head'>
                                            <div>
                                                <p className='register-upload-title'>프로필 사진</p>
                                                <p className='register-upload-sub'>학생에게 노출될 대표 이미지를 업로드해 주세요. JPG, PNG 최대 5MB</p>
                                            </div>
                                            <div className='flex flex-wrap gap-2'>
                                                <button type='button' onClick={openProfilePicker} className='register-outline-button'>파일 선택</button>
                                                {profileImage?.data && (
                                                    <button type='button' onClick={clearProfileImage} className='register-profile-delete'>삭제</button>
                                                )}
                                            </div>
                                        </div>
                                        <input ref={profileInputRef} type='file' accept='image/*' onChange={handleProfileImageChange} className='hidden' />
                                        {profileImage?.data ? (
                                            <div className='register-profile-preview-card'>
                                                <div className='register-profile-preview-media'>
                                                    <img src={profileImage.data} alt='프로필 미리보기' className='register-profile-preview-image' />
                                                </div>
                                                <div className='register-profile-preview-body'>
                                                    <div>
                                                        <p className='register-profile-preview-title'>업로드된 프로필 이미지</p>
                                                        <p className='register-profile-preview-sub'>현재 등록 단계에서 임시 저장되며 마지막 단계에서 함께 업로드됩니다.</p>
                                                    </div>
                                                    <div className='flex flex-wrap gap-2'>
                                                        <button type='button' onClick={openProfilePicker} className='register-outline-button'>수정</button>
                                                        <button type='button' onClick={clearProfileImage} className='register-profile-delete'>삭제</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='register-profile-empty'>아직 선택된 프로필 이미지가 없습니다.</div>
                                        )}
                                    </div>
                                    <div className='grid gap-4 md:grid-cols-2'>
                                        <div className='grid gap-4'>
                                            <Input label='한 줄 소개' name='headline' value={basicForm.headline} onChange={handleBasicChange} placeholder='예) 영어 회화 전문 10년 경력, TOEIC 만점 강사' required />
                                            <Input label='소개 영상 URL' name='videoUrl' value={basicForm.videoUrl} onChange={handleBasicChange} placeholder='https://youtube.com/watch?v=...' />
                                        </div>
                                        <div className='grid gap-4'>
                                            <TextArea label='소개' name='bio' value={basicForm.bio} onChange={handleBasicChange} rows={5} placeholder={'예)\n안녕하세요! 영어 회화 전문 튜터 김튜터입니다.\n미국에서 10년간 거주하며 현지 경험을 쌓았고, 귀국 후 영어 강의를 시작했습니다.\n학생 개개인의 수준과 목표에 맞춰 맞춤형 수업을 제공합니다.'} />
                                            <TextArea label='강의 스타일' name='selfIntro' value={basicForm.selfIntro} onChange={handleBasicChange} rows={5} placeholder={'예)\n✔ 교육 철학: 학생 중심의 맞춤형 교육\n✔ 강점: 실생활 회화 중심, 즉각적인 피드백\n✔ 제공 가치: 자신감 있는 영어 구사 능력 향상'} />
                                        </div>
                                    </div>
                                </SectionCard>
							</>
						)}
						                        {currentStep === 1 && (
                            <>
                                <SectionCard title='1. 학력' description='학교와 재학/졸업 연도를 입력해 주세요.' badge='학력 등록'>
                                    <div className='grid gap-3 md:grid-cols-3'>
                                        <Input label='학교명' name='schoolName' value={educationForm.schoolName} onChange={handleObjectChange(setEducationForm)} placeholder='학교명 입력' />
                                        <Input label='입학년도' name='startYear' type='number' value={educationForm.startYear} onChange={handleObjectChange(setEducationForm)} placeholder='예) 2019' />
                                        <Input label='졸업년도' name='graduatedYear' type='number' value={educationForm.graduatedYear} onChange={handleObjectChange(setEducationForm)} placeholder='예) 2023' />
                                    </div>
                                    <div className='flex justify-end'>
                                        <button type='button' onClick={addEducation} className='register-outline-button'>학력 추가</button>
                                    </div>
                                    <DetailEntryList items={educations} tone='education' getTitle={(item) => item.schoolName} getSubtitle={(item) => (item.startYear || item.graduatedYear ? `${item.startYear || '-'} ~ ${item.graduatedYear || '현재'}` : '학력 정보 미입력')} onRemove={(index) => setEducations((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} emptyText='등록된 학력 정보가 없습니다.' />
                                    <FileUploader label='학력 증빙 서류' files={academicCertificates} onChange={appendStoredFiles(setAcademicCertificates)} onRemove={(index) => setAcademicCertificates((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} />
                                </SectionCard>

                                <SectionCard title='2. 학위' description='취득한 학위와 전공을 입력해 주세요.' badge='학위 등록' variant='degree'>
                                    <div className='grid gap-3 md:grid-cols-2'>
                                        <Input label='학위명' name='degreeName' value={degreeForm.degreeName} onChange={handleObjectChange(setDegreeForm)} placeholder='예) 학사, 석사' />
                                        <Input label='전공' name='major' value={degreeForm.major} onChange={handleObjectChange(setDegreeForm)} placeholder='전공명 입력' />
                                    </div>
                                    <div className='flex justify-end'>
                                        <button type='button' onClick={addDegree} className='register-outline-button'>학위 추가</button>
                                    </div>
                                    <DetailEntryList items={degrees} tone='degree' getTitle={(item) => item.degreeName} getSubtitle={(item) => item.major || '전공 정보 없음'} onRemove={(index) => setDegrees((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} emptyText='등록된 학위 정보가 없습니다.' />
                                    <FileUploader label='학위 증빙 서류' files={degreeCertificates} onChange={appendStoredFiles(setDegreeCertificates)} onRemove={(index) => setDegreeCertificates((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} />
                                </SectionCard>

                                <SectionCard title='3. 자격증 정보' description='자격증명과 발급기관, 증빙 파일을 함께 저장합니다.' badge='자격 등록' variant='cert'>
                                    <div className='grid gap-3 md:grid-cols-2'>
                                        <Input label='자격증명' name='name' value={certificateTextForm.name} onChange={handleObjectChange(setCertificateTextForm)} placeholder='자격증명 입력' />
                                        <Input label='발급기관' name='issuer' value={certificateTextForm.issuer} onChange={handleObjectChange(setCertificateTextForm)} placeholder='발급기관 입력' />
                                    </div>
                                    <div className='flex justify-end'>
                                        <button type='button' onClick={addCertificateText} className='register-outline-button'>자격증 추가</button>
                                    </div>
                                    <DetailEntryList items={certificateTexts} tone='cert' getTitle={(item) => item.name} getSubtitle={(item) => item.issuer || '발급기관 정보 없음'} onRemove={(index) => setCertificateTexts((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} emptyText='등록된 자격증 정보가 없습니다.' />
                                    <FileUploader label='자격증 파일' files={certificateFiles} onChange={appendStoredFiles(setCertificateFiles)} onRemove={(index) => setCertificateFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} />
                                </SectionCard>

                                <SectionCard title='4. 근무 경력' description='회사와 직무 정보를 입력해 주세요. 경력이 많다면 여러 건을 추가할 수 있습니다.' badge='경력 등록'>
                                    <div className='grid gap-3 md:grid-cols-2'>
                                        <Input label='회사명' name='companyName' value={careerForm.companyName} onChange={handleObjectChange(setCareerForm)} placeholder='회사명 입력' />
                                        <Input label='직무 분야' name='jobCategory' value={careerForm.jobCategory} onChange={handleObjectChange(setCareerForm)} placeholder='예) 영어 교육, 회화' />
                                        <Input label='직무명' name='jobRole' value={careerForm.jobRole} onChange={handleObjectChange(setCareerForm)} placeholder='예) 강사, 연구원' />
                                        <div className='grid grid-cols-2 gap-3'>
                                            <Input label='시작년도' name='startYear' type='number' value={careerForm.startYear} onChange={handleObjectChange(setCareerForm)} placeholder='예) 2021' />
                                            <Input label='종료년도' name='endYear' type='number' value={careerForm.endYear} onChange={handleObjectChange(setCareerForm)} placeholder='예) 2024' />
                                        </div>
                                    </div>
                                    <div className='flex justify-end'>
                                        <button type='button' onClick={addCareer} className='register-outline-button'>경력 추가</button>
                                    </div>
                                    <CareerEntryList items={careers} onRemove={(index) => setCareers((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} emptyText='등록된 경력 정보가 없습니다.' />
                                </SectionCard>
                            </>
                        )}
{currentStep === 2 && (
							<SectionCard title='수업 구성 (과목 + 분야 + 수업당 가격)' description='과목과 분야를 선택하고 수업당 가격을 입력해 주세요.'>
								<ChoiceGroup label='과목'>
									{subjects.map((item) => (
										<PillButton key={item.id} active={String(lessonForm.subjectId) === String(item.id)} onClick={() => setLessonForm((prev) => ({ ...prev, subjectId: String(item.id) }))}>
											{item.name}
										</PillButton>
									))}
								</ChoiceGroup>

								<ChoiceGroup label='일반 분야'>
									{generalFields.map((item) => (
										<PillButton key={item.id} active={String(lessonForm.fieldId) === String(item.id)} onClick={() => setLessonForm((prev) => ({ ...prev, fieldId: String(item.id) }))}>
											{item.name}
										</PillButton>
									))}
								</ChoiceGroup>

								<ChoiceGroup label='분야별'>
									{domainFields.map((item) => (
										<PillButton key={item.id} active={String(lessonForm.fieldId) === String(item.id)} onClick={() => setLessonForm((prev) => ({ ...prev, fieldId: String(item.id) }))}>
											{item.name}
										</PillButton>
									))}
									<p className='register-choice-note'>일반 분야/분야별 중 하나만 선택됩니다.</p>
								</ChoiceGroup>

								<div className='grid gap-3 md:grid-cols-[1fr_auto] md:items-end'>
									<Input label='수업당 가격(원)' name='price' type='number' value={lessonForm.price} onChange={handleObjectChange(setLessonForm)} placeholder='예) 30000' min='0' step='1000' />
									<button type='button' onClick={addLessonCard} className='register-outline-button register-outline-button--wide'>수업 추가</button>
								</div>

								<LessonChipList items={lessonCards} onRemove={removeLessonCard} emptyText='등록된 수업 카드가 없습니다.' />
								<p className='register-choice-note'>추가된 수업이 실제 노출 및 결제 단가로 사용됩니다.</p>
							</SectionCard>
						)}
                        {currentStep === 3 && (
                            <div className='register-schedule-main'>
                                <div className='register-schedule-heading'>
                                    <div className='register-schedule-title register-schedule-title--main'>수업 가능 시간대</div>
                                    <p className='register-schedule-sub register-schedule-sub--main'>요일별 기본 시간대를 설정하고, 캘린더에서 실제 수업 가능한 시간을 선택해 주세요.</p>
                                </div>

                                <div className='register-schedule-block'>
                                    <div className='register-schedule-title'>기본 수업 가능 시간대</div>
                                    <p className='register-schedule-sub'>요일별로 여러 구간을 추가할 수 있습니다. 예: 08:00~09:30, 20:00~23:30</p>
                                    <div className='register-day-range-grid'>
                                        {groupedTimeRanges.map((day) => (
                                            <div key={day.value} className='register-day-range-card'>
                                                <div className='register-day-range-head'>
                                                    <div className='register-day-range-name'>{day.label}</div>
                                                    <button type='button' onClick={() => addTimeRangeForDay(day.value)} className='register-base-range-add'>시간대 추가</button>
                                                </div>
                                                {day.ranges.length ? (
                                                    <div className='register-day-range-list'>
                                                        {day.ranges.map((range, rangeIndex) => (
                                                            <div key={`${day.value}-${rangeIndex}`} className='register-day-range-item'>
                                                                <input
                                                                    type='time'
                                                                    value={range.startTime}
                                                                    onChange={(event) => updateTimeRangeForDay(day.value, rangeIndex, 'startTime', event.target.value)}
                                                                    className='register-time-input'
                                                                />
                                                                <span className='register-time-sep'>~</span>
                                                                <input
                                                                    type='time'
                                                                    value={range.endTime}
                                                                    onChange={(event) => updateTimeRangeForDay(day.value, rangeIndex, 'endTime', event.target.value)}
                                                                    className='register-time-input'
                                                                />
                                                                <button type='button' onClick={() => removeTimeRangeForDay(day.value, rangeIndex)} className='register-base-range-remove'>삭제</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className='register-day-range-empty'>설정된 시간대 없음</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className='register-schedule-footnote'>설정된 시간대만 캘린더에 표시됩니다.</p>
                                </div>

                                <div className='register-schedule-block register-schedule-block--white'>
                                    <div className='register-schedule-title'>주간 캘린더</div>
                                    <p className='register-schedule-sub'>가능한 시간을 클릭해 선택 또는 해제해 주세요.</p>
                                    <div className='mb-3 flex flex-wrap items-center gap-2'>
                                        <div className='tc-toolbar'>
                                            <button type='button' className='tc-iconbtn' onClick={goToPreviousWeek} aria-label='이전 주'>‹</button>
                                            <div className='tc-range'>{weekRangeLabel}</div>
                                            <button type='button' className='tc-iconbtn' onClick={goToNextWeek} aria-label='다음 주'>›</button>
                                        </div>
                                    </div>

                                    <div className='weekly_calendar_wrap'>
                                        <div className='weekly_head'>
                                            <ul className='dayHead'>
                                                {calendarDays.map((day) => (
                                                    <li key={formatDateOnly(day)}>
                                                        <div className='head_in'>
                                                            <p className='dayTit fw-bold'>{KOR_DAY_LABELS[day.getDay()]}</p>
                                                            <p className='dayDate en'>{formatCalendarDay(day)}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className='weekly_con'>
                                            <ul className='dayCon'>
                                                {calendarDays.map((day, index) => (
                                                    <li key={formatDateOnly(day)}>
                                                        <div className='con_in'>
                                                            {calendarSlotsByDay[index].length ? calendarSlotsByDay[index].map((slot) => {
                                                                const endTime = addMinutesToTime(slot, 30)
                                                                const slotKey = buildAvailabilityKey(formatDateOnly(day), slot, endTime)
                                                                const isSelected = availabilityKeySet.has(slotKey)
                                                                return (
                                                                    <div key={slotKey} className={`sch_time ${isSelected ? 'selected' : ''}`.trim()}>
                                                                        <button type='button' onClick={() => toggleAvailabilitySlot(day, slot)}>{slot}</button>
                                                                    </div>
                                                                )
                                                            }) : (
                                                                <div className='register-calendar-empty-col'>시간 없음</div>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className='mt-4 flex flex-wrap items-center gap-2'>
                                        <button type='button' className='register-outline-button' onClick={applyCurrentWeekPattern}>
                                            <span className='text-base leading-none'>↻</span>
                                            <span>이번 주 설정을 9주까지 적용</span>
                                        </button>
                                        <small className='text-sm text-slate-500'>현재 주의 패턴을 앞으로 9주간 반복합니다.</small>
                                    </div>

                                    <div className='register-slot-summary'>
                                        <div className='register-slot-summary-head'>
                                            <p className='register-slot-summary-title'>이번 주 선택 슬롯</p>
                                            <span className='register-slot-summary-count'>{currentWeekAvailability.length}개 선택</span>
                                        </div>
                                        {currentWeekAvailability.length ? (
                                            <div className='register-slot-summary-list'>
                                                {currentWeekAvailability.map((item) => (
                                                    <span key={buildAvailabilityKey(item.date, item.startTime, item.endTime)} className='register-slot-badge'>
                                                        {formatCalendarDay(new Date(`${item.date}T00:00:00`))} · {item.startTime} ~ {item.endTime}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className='register-empty'>이번 주에 선택된 슬롯이 없습니다.</p>
                                        )}
                                    </div>
                                </div>

                                <div className='register-tip-box'>
                                    <div className='register-tip-icon'>i</div>
                                    <div>
                                        <div className='register-tip-title'>팁: 예약률을 높이려면</div>
                                        <p className='register-tip-text'>가능한 시간대를 다양하게 설정하면 학생들의 예약 확률이 높아집니다.</p>
                                    </div>
                                </div>
                            </div>
                        )}
						{error && <p className='text-sm font-semibold text-red-500'>{error}</p>}
						{success && <p className='text-sm font-semibold text-emerald-600'>{success}</p>}
						<div className={`register-step-nav ${currentStep === 0 ? 'is-single' : ''}`}>
							{currentStep > 0 && (
								<Link to={prevPath} className={`register-prev-button ${currentStep === 3 ? 'is-outline' : ''}`}>
									이전
								</Link>
							)}
							<button
								type='submit'
								disabled={submitting}
								className={`register-submit-button ${currentStep === 0 ? 'is-full' : ''} ${currentStep === 3 ? 'is-complete' : ''}`.trim()}
							>
								{submitting ? '처리 중...' : currentStep === 3 ? '회원가입 완료' : '다음 단계로'}
							</button>
						</div>
					</form>
				</div>
			</section>
		</Layout>
	)
}

const SectionCard = ({ title, description, children, badge = null, variant = 'default' }) => (
  <div className={`register-section-card ${variant !== 'default' ? `register-section-card--${variant}` : ''}`}>
    <div className='register-section-head'>
      <div>
        <h3 className='register-section-title'>{title}</h3>
        <p className='register-section-desc'>{description}</p>
      </div>
      {badge ? <span className='register-section-badge'>{badge}</span> : null}
    </div>
    <div className='register-section-body'>{children}</div>
  </div>
)

const ChoiceGroup = ({ label, children }) => (
  <div className='register-choice-group'>
    <label className='register-choice-label'>{label}</label>
    <div className='register-pill-wrap'>{children}</div>
  </div>
)

const PillButton = ({ active, children, onClick }) => (
  <button type='button' onClick={onClick} className={`register-pill ${active ? 'is-active' : ''}`}>
    {children}
  </button>
)

const Input = ({ label, name, value, onChange, type = 'text', required = false, disabled = false, placeholder = '', min, step }) => (
  <label className='block'>
    {label && <span className='mb-1 block text-sm font-semibold text-slate-700'>{label}</span>}
    <input type={type} name={name} value={value} onChange={onChange} required={required} disabled={disabled} placeholder={placeholder} min={min} step={step} className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-4 focus:ring-[rgba(37,99,235,0.15)] disabled:bg-slate-100' />
  </label>
)

const TextArea = ({ label, name, value, onChange, rows = 3, placeholder = '' }) => (
  <label className='block'>
    <span className='mb-1 block text-sm font-semibold text-slate-700'>{label}</span>
    <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} className='w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-4 focus:ring-[rgba(37,99,235,0.15)]' />
  </label>
)

const Select = ({ label, name, value, onChange, options, placeholder }) => (
  <label className='block'>
    {label && <span className='mb-1 block text-sm font-semibold text-slate-700'>{label}</span>}
    <select name={name} value={value} onChange={onChange} className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-[rgba(79,70,229,0.15)]'>
      <option value=''>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </label>
)

const DetailEntryList = ({ items, tone = 'education', getTitle, getSubtitle, onRemove, emptyText }) => (
  items.length ? (
    <div className='register-detail-list'>
      {items.map((item, index) => (
        <div key={`${getTitle(item)}-${index}`} className={`register-detail-card register-detail-card--${tone}`}>
          <div className={`register-detail-icon register-detail-icon--${tone}`}>{tone === 'education' ? '학' : tone === 'degree' ? '위' : '증'}</div>
          <div className='register-detail-main'>
            <p className='register-detail-title'>{getTitle(item)}</p>
            <p className='register-detail-sub'>{getSubtitle(item)}</p>
          </div>
          <button type='button' onClick={() => onRemove(index)} className='register-detail-remove'>삭제</button>
        </div>
      ))}
    </div>
  ) : <p className='register-empty'>{emptyText}</p>
)

const CareerEntryList = ({ items, onRemove, emptyText }) => (
  items.length ? (
    <div className='register-career-list'>
      {items.map((item, index) => (
        <div key={`${item.companyName}-${item.jobRole}-${index}`} className='register-career-card'>
          <div className='register-career-year-col'>
            <div className='register-career-year-title'>기간</div>
            <div className='register-career-year-value'>{item.startYear || '-'} ~ {item.endYear || '현재'}</div>
          </div>
          <div className='register-career-main-col'>
            <div className='register-career-company'>{item.companyName || '회사명 없음'}</div>
            <div className='register-career-role'>{[item.jobCategory, item.jobRole].filter(Boolean).join(' · ') || '직무 정보 없음'}</div>
          </div>
          <button type='button' onClick={() => onRemove(index)} className='register-career-remove'>삭제</button>
        </div>
      ))}
    </div>
  ) : <p className='register-empty'>{emptyText}</p>
)
const LessonChipList = ({ items, onRemove, emptyText }) => (
  items.length ? (
    <div className='register-chip-list'>
      {items.map((item, index) => (
        <div key={`${item.subjectName}-${item.fieldName}-${index}`} className='register-chip'>
          <div className='register-chip-content'>
            <span className='register-chip-label'>{item.subjectName} / {item.fieldName}</span>
            <span className='register-chip-sub'>{Number(item.price).toLocaleString('ko-KR')}원</span>
          </div>
          <button type='button' onClick={() => onRemove(index)} className='register-chip-remove' aria-label='삭제'>×</button>
        </div>
      ))}
    </div>
  ) : <p className='register-empty'>{emptyText}</p>
)

const FileUploader = ({ label, files, onChange, onRemove }) => (
  <div className='register-upload-panel'>
    <div className='register-upload-head'>
      <div>
        <p className='register-upload-title'>{label}</p>
        <p className='register-upload-sub'>PDF, JPG, PNG 파일을 여러 개 업로드할 수 있습니다.</p>
      </div>
      <label className='register-outline-button'>
        파일 선택
        <input type='file' multiple accept='.pdf,.jpg,.jpeg,.png' className='hidden' onChange={onChange} />
      </label>
    </div>
    {files.length ? (
      <div className='register-file-list-card'>
        {files.map((item, index) => (
          <div key={`${item.name}-${index}`} className='register-file-row'>
            <div className='register-file-main'>
              <span className='register-file-name'>{item.name}</span>
              <span className='register-file-meta'>{Math.max(1, Math.round((item.size || 0) / 1024))}KB</span>
            </div>
            <div className='register-file-actions'>
              <button type='button' onClick={() => onRemove(index)} className='register-file-remove'>삭제</button>
            </div>
          </div>
        ))}
      </div>
    ) : <p className='register-empty'>업로드된 파일이 없습니다.</p>}
  </div>
)
export default TutorRegisterContent
