import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../common/Layout'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'

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

const makeEmptyTimeRange = () => ({ dayOfWeek: 'MON', startTime: '09:00', endTime: '18:00' })
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

	const subjectMap = useMemo(() => new Map(subjects.map((item) => [item.id, item.name])), [subjects])
	const fieldMap = useMemo(() => new Map(fields.map((item) => [item.id, item.name])), [fields])
	const nextPath = STEP_PATHS[currentStep + 1]
	const prevPath = STEP_PATHS[currentStep - 1] || '/'
	const displayName = userInfo?.name || '회원'

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
		const subjectId = lessonForm.subjectId
		const fieldId = lessonForm.fieldId
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
			<section className='bg-[#f8fafc] px-4 py-10'>
				<div className='mx-auto max-w-5xl'>
					<div className='mb-6'>
						<h1 className='text-3xl font-extrabold text-slate-900'>{stepMeta.title}</h1>
						<p className='mt-2 text-sm text-slate-500'>{stepMeta.desc}</p>
						<div className='mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200'>
							<div className='h-full rounded-full bg-[#4f46e5] transition-all' style={{ width: `${stepMeta.progress}%` }} />
						</div>
						<p className='mt-2 text-xs font-semibold text-slate-500'>STEP {stepMeta.step} / {stepMeta.total}</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
						{currentStep === 0 && (
							<>
								<SectionCard title='기본 정보' description='회원 이름은 현재 계정 정보를 그대로 사용합니다.'>
									<div className='grid gap-4 md:grid-cols-2'>
										<Input label='이름' value={displayName} disabled />
										<Input label='연락처' name='basicPhone' value={basicForm.basicPhone} onChange={handleBasicChange} required />
									</div>
								</SectionCard>

								<SectionCard title='계좌 정보' description='정산을 위한 기본 계좌 정보를 입력합니다.'>
									<div className='grid gap-4 md:grid-cols-3'>
										<Select label='은행명' name='basicBankName' value={basicForm.basicBankName} onChange={handleBasicChange} options={BANK_OPTIONS.map((item) => ({ value: item, label: item }))} placeholder='은행 선택' />
										<Input label='계좌번호' name='basicAccountNumber' value={basicForm.basicAccountNumber} onChange={handleBasicChange} required />
										<Input label='예금주' name='basicAccountHolder' value={basicForm.basicAccountHolder} onChange={handleBasicChange} required />
									</div>
								</SectionCard>

								<SectionCard title='프로필/소개' description='프로필 사진과 소개 정보를 저장합니다.'>
									<div className='grid gap-4 md:grid-cols-2'>
										<div>
											<label className='mb-1 block text-sm font-semibold text-slate-700'>프로필 이미지</label>
											<input type='file' accept='image/*' onChange={handleProfileImageChange} className='block w-full text-sm text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700' />
											{profileImage?.data && <img src={profileImage.data} alt='프로필 미리보기' className='mt-3 h-44 w-full rounded-xl border border-slate-200 object-cover' />}
										</div>
										<div className='grid gap-4'>
											<Input label='한 줄 소개' name='headline' value={basicForm.headline} onChange={handleBasicChange} required />
											<Input label='소개 영상 URL' name='videoUrl' value={basicForm.videoUrl} onChange={handleBasicChange} />
										</div>
									</div>
									<div className='grid gap-4 md:grid-cols-2'>
										<TextArea label='소개' name='bio' value={basicForm.bio} onChange={handleBasicChange} rows={5} />
										<TextArea label='강의 스타일' name='selfIntro' value={basicForm.selfIntro} onChange={handleBasicChange} rows={5} />
									</div>
								</SectionCard>
							</>
						)}
						{currentStep === 1 && (
							<>
								<SectionCard title='학력' description='학력 정보와 학력 증빙 파일을 저장합니다.'>
									<div className='grid gap-3 md:grid-cols-3'>
										<Input label='학교명' name='schoolName' value={educationForm.schoolName} onChange={handleObjectChange(setEducationForm)} />
										<Input label='입학연도' name='startYear' type='number' value={educationForm.startYear} onChange={handleObjectChange(setEducationForm)} />
										<Input label='졸업연도' name='graduatedYear' type='number' value={educationForm.graduatedYear} onChange={handleObjectChange(setEducationForm)} />
									</div>
									<div className='flex justify-end'>
										<button type='button' onClick={addEducation} className='rounded-xl border border-[#4f46e5] px-4 py-2 text-sm font-semibold text-[#4f46e5] hover:bg-indigo-50'>학력 추가</button>
									</div>
									<ListRows items={educations} render={(item) => `${item.schoolName} · ${item.startYear || '-'}${item.graduatedYear ? ` ~ ${item.graduatedYear}` : ''}`} onRemove={(index) => setEducations((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} emptyText='등록된 학력 정보가 없습니다.' />
									<FileUploader label='학력 증빙 파일' files={academicCertificates} onChange={appendStoredFiles(setAcademicCertificates)} onRemove={(index) => setAcademicCertificates((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} />
								</SectionCard>

								<SectionCard title='학위' description='학위명과 전공, 학위 증빙 파일을 저장합니다.'>
									<div className='grid gap-3 md:grid-cols-2'>
										<Input label='학위명' name='degreeName' value={degreeForm.degreeName} onChange={handleObjectChange(setDegreeForm)} />
										<Input label='전공' name='major' value={degreeForm.major} onChange={handleObjectChange(setDegreeForm)} />
									</div>
									<div className='flex justify-end'>
										<button type='button' onClick={addDegree} className='rounded-xl border border-[#4f46e5] px-4 py-2 text-sm font-semibold text-[#4f46e5] hover:bg-indigo-50'>학위 추가</button>
									</div>
									<ListRows items={degrees} render={(item) => `${item.degreeName}${item.major ? ` (${item.major})` : ''}`} onRemove={(index) => setDegrees((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} emptyText='등록된 학위 정보가 없습니다.' />
									<FileUploader label='학위 증빙 파일' files={degreeCertificates} onChange={appendStoredFiles(setDegreeCertificates)} onRemove={(index) => setDegreeCertificates((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} />
								</SectionCard>

								<SectionCard title='자격증 및 경력' description='자격증 텍스트, 자격증 파일, 경력 정보를 저장합니다.'>
									<div className='grid gap-4 lg:grid-cols-2'>
										<div className='space-y-4'>
											<div className='grid gap-3 md:grid-cols-2'>
												<Input label='자격증명' name='name' value={certificateTextForm.name} onChange={handleObjectChange(setCertificateTextForm)} />
												<Input label='발급기관' name='issuer' value={certificateTextForm.issuer} onChange={handleObjectChange(setCertificateTextForm)} />
											</div>
											<div className='flex justify-end'>
												<button type='button' onClick={addCertificateText} className='rounded-xl border border-[#4f46e5] px-4 py-2 text-sm font-semibold text-[#4f46e5] hover:bg-indigo-50'>자격증 추가</button>
											</div>
											<ListRows items={certificateTexts} render={(item) => `${item.name}${item.issuer ? ` · ${item.issuer}` : ''}`} onRemove={(index) => setCertificateTexts((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} emptyText='등록된 자격증 텍스트가 없습니다.' />
											<FileUploader label='자격증 파일' files={certificateFiles} onChange={appendStoredFiles(setCertificateFiles)} onRemove={(index) => setCertificateFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} />
										</div>
										<div className='space-y-4'>
											<div className='grid gap-3 md:grid-cols-2'>
												<Input label='회사명' name='companyName' value={careerForm.companyName} onChange={handleObjectChange(setCareerForm)} />
												<Input label='직무 카테고리' name='jobCategory' value={careerForm.jobCategory} onChange={handleObjectChange(setCareerForm)} />
												<Input label='직무명' name='jobRole' value={careerForm.jobRole} onChange={handleObjectChange(setCareerForm)} />
												<div className='grid grid-cols-2 gap-3'>
													<Input label='시작연도' name='startYear' type='number' value={careerForm.startYear} onChange={handleObjectChange(setCareerForm)} />
													<Input label='종료연도' name='endYear' type='number' value={careerForm.endYear} onChange={handleObjectChange(setCareerForm)} />
												</div>
											</div>
											<div className='flex justify-end'>
												<button type='button' onClick={addCareer} className='rounded-xl border border-[#4f46e5] px-4 py-2 text-sm font-semibold text-[#4f46e5] hover:bg-indigo-50'>경력 추가</button>
											</div>
											<ListRows items={careers} render={(item) => `${item.companyName}${item.jobRole ? ` · ${item.jobRole}` : ''}${item.startYear ? ` (${item.startYear}` : ''}${item.endYear ? ` ~ ${item.endYear})` : item.startYear ? ')' : ''}`} onRemove={(index) => setCareers((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} emptyText='등록된 경력이 없습니다.' />
										</div>
									</div>
								</SectionCard>
							</>
						)}

						{currentStep === 2 && (
							<>
								<SectionCard title='활동 분야' description='최소 1개 이상의 활동 분야를 선택해 주세요.'>
									<div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
										{fields.map((field) => (
											<label key={field.id} className='flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'>
												<input type='checkbox' checked={selectedFieldIds.includes(field.id)} onChange={() => setSelectedFieldIds((prev) => prev.includes(field.id) ? prev.filter((id) => id !== field.id) : [...prev, field.id])} />
												<span>{field.name}</span>
											</label>
										))}
									</div>
								</SectionCard>

								<SectionCard title='수업 카드' description='과목, 분야, 가격을 조합해 여러 개의 수업 카드를 추가할 수 있습니다.'>
									<div className='grid gap-3 md:grid-cols-3'>
										<Select label='과목' name='subjectId' value={lessonForm.subjectId} onChange={handleObjectChange(setLessonForm)} options={subjects.map((item) => ({ value: item.id, label: item.name }))} placeholder='과목 선택' />
										<Select label='분야' name='fieldId' value={lessonForm.fieldId} onChange={handleObjectChange(setLessonForm)} options={fields.map((item) => ({ value: item.id, label: item.name }))} placeholder='분야 선택' />
										<Input label='가격(원)' name='price' type='number' value={lessonForm.price} onChange={handleObjectChange(setLessonForm)} />
									</div>
									<div className='flex justify-end'>
										<button type='button' onClick={addLessonCard} className='rounded-xl border border-[#4f46e5] px-4 py-2 text-sm font-semibold text-[#4f46e5] hover:bg-indigo-50'>수업 카드 추가</button>
									</div>
									<ListRows items={lessonCards} render={(item) => `${item.subjectName} · ${item.fieldName} · ${Number(item.price).toLocaleString('ko-KR')}원`} onRemove={(index) => setLessonCards((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} emptyText='등록된 수업 카드가 없습니다.' />
								</SectionCard>
							</>
						)}

						{currentStep === 3 && (
							<>
								<SectionCard title='기본 수업 가능 시간' description='요일별 기본 시간대를 저장합니다.'>
									<div className='space-y-3'>
										{timeRanges.map((item, index) => (
											<div key={`${item.dayOfWeek}-${index}`} className='grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_1fr_1fr_auto]'>
												<Select label='요일' name='dayOfWeek' value={item.dayOfWeek} onChange={(event) => setTimeRanges((prev) => prev.map((range, currentIndex) => currentIndex === index ? { ...range, dayOfWeek: event.target.value } : range))} options={DAY_OPTIONS.map((day) => ({ value: day.value, label: day.label }))} placeholder='요일 선택' />
												<Input label='시작' type='time' value={item.startTime} onChange={(event) => setTimeRanges((prev) => prev.map((range, currentIndex) => currentIndex === index ? { ...range, startTime: event.target.value } : range))} />
												<Input label='종료' type='time' value={item.endTime} onChange={(event) => setTimeRanges((prev) => prev.map((range, currentIndex) => currentIndex === index ? { ...range, endTime: event.target.value } : range))} />
												<button type='button' onClick={() => setTimeRanges((prev) => prev.length === 1 ? prev : prev.filter((_, currentIndex) => currentIndex !== index))} className='mt-6 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50'>삭제</button>
											</div>
										))}
										<button type='button' onClick={() => setTimeRanges((prev) => [...prev, makeEmptyTimeRange()])} className='rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>시간대 추가</button>
									</div>
								</SectionCard>

								<SectionCard title='실제 수업 가능 슬롯' description='날짜별 실제 예약 가능 시간을 추가합니다.'>
									<div className='grid gap-3 md:grid-cols-3'>
										<Input label='날짜' type='date' name='date' value={availabilityForm.date} onChange={handleObjectChange(setAvailabilityForm)} />
										<Input label='시작' type='time' name='startTime' value={availabilityForm.startTime} onChange={handleObjectChange(setAvailabilityForm)} />
										<Input label='종료' type='time' name='endTime' value={availabilityForm.endTime} onChange={handleObjectChange(setAvailabilityForm)} />
									</div>
									<div className='flex justify-end'>
										<button type='button' onClick={addAvailabilitySlot} className='rounded-xl border border-[#4f46e5] px-4 py-2 text-sm font-semibold text-[#4f46e5] hover:bg-indigo-50'>슬롯 추가</button>
									</div>
									<ListRows items={availabilitySlots} render={(item) => `${item.date} · ${item.startTime} ~ ${item.endTime}`} onRemove={(index) => setAvailabilitySlots((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} emptyText='등록된 가능 슬롯이 없습니다.' />
								</SectionCard>
							</>
						)}

						{error && <p className='text-sm font-semibold text-red-500'>{error}</p>}
						{success && <p className='text-sm font-semibold text-emerald-600'>{success}</p>}

						<div className='flex flex-wrap justify-between gap-2'>
							<Link to={prevPath} className='rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>이전</Link>
							<div className='flex gap-2'>
								{currentStep === 0 && <button type='button' onClick={clearRegisterStorage} className='rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>임시저장 초기화</button>}
								<button type='submit' disabled={submitting} className='rounded-xl bg-[#4f46e5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'>
									{submitting ? '처리 중...' : currentStep === 3 ? '튜터 등록 완료' : '다음 단계'}
								</button>
							</div>
						</div>
					</form>
				</div>
			</section>
		</Layout>
	)
}

const SectionCard = ({ title, description, children }) => (
	<div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
		<div className='mb-3'>
			<h3 className='text-base font-bold text-slate-900'>{title}</h3>
			<p className='mt-1 text-sm text-slate-500'>{description}</p>
		</div>
		<div className='space-y-4'>{children}</div>
	</div>
)

const Input = ({ label, name, value, onChange, type = 'text', required = false, disabled = false }) => (
	<label className='block'>
		{label && <span className='mb-1 block text-sm font-semibold text-slate-700'>{label}</span>}
		<input type={type} name={name} value={value} onChange={onChange} required={required} disabled={disabled} className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#4f46e5] focus:outline-none disabled:bg-slate-100' />
	</label>
)

const TextArea = ({ label, name, value, onChange, rows = 3 }) => (
	<label className='block'>
		<span className='mb-1 block text-sm font-semibold text-slate-700'>{label}</span>
		<textarea name={name} value={value} onChange={onChange} rows={rows} className='w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#4f46e5] focus:outline-none' />
	</label>
)

const Select = ({ label, name, value, onChange, options, placeholder }) => (
	<label className='block'>
		{label && <span className='mb-1 block text-sm font-semibold text-slate-700'>{label}</span>}
		<select name={name} value={value} onChange={onChange} className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#4f46e5] focus:outline-none'>
			<option value=''>{placeholder}</option>
			{options.map((option) => (
				<option key={option.value} value={option.value}>{option.label}</option>
			))}
		</select>
	</label>
)

const ListRows = ({ items, render, onRemove, emptyText }) => (
	items.length ? (
		<div className='space-y-2'>
			{items.map((item, index) => (
				<div key={`${render(item)}-${index}`} className='flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2'>
					<p className='text-sm text-slate-700'>{render(item)}</p>
					<button type='button' onClick={() => onRemove(index)} className='text-xs font-semibold text-red-500'>삭제</button>
				</div>
			))}
		</div>
	) : <p className='rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500'>{emptyText}</p>
)

const FileUploader = ({ label, files, onChange, onRemove }) => (
	<div className='rounded-xl border border-dashed border-slate-300 bg-white p-4'>
		<div className='flex flex-wrap items-center justify-between gap-3'>
			<div>
				<p className='text-sm font-semibold text-slate-900'>{label}</p>
				<p className='text-xs text-slate-500'>PDF, JPG, PNG 파일을 임시 저장한 뒤 최종 단계에서 업로드합니다.</p>
			</div>
			<label className='cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
				파일 선택
				<input type='file' multiple accept='.pdf,.jpg,.jpeg,.png' className='hidden' onChange={onChange} />
			</label>
		</div>
		<ListRows items={files} render={(item) => `${item.name} · ${Math.round((item.size || 0) / 1024)}KB`} onRemove={onRemove} emptyText='선택된 파일이 없습니다.' />
	</div>
)

export default TutorRegisterContent
