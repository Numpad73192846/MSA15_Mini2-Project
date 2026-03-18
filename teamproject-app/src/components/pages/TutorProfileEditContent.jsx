import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Banknote, BookOpen, Briefcase, Calendar, FileText, FileUp, Info, Shield, User, Video } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../common/Layout'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'
import '../../styles/tutor-profile-edit.css'

const SECTION_ITEMS = [
  { key: 'basic', label: '기본 정보', icon: User },
  { key: 'profile', label: '프로필', icon: FileText },
  { key: 'employment', label: '근무경력', icon: Briefcase },
  { key: 'account', label: '계좌 정보', icon: Banknote },
  { key: 'documents', label: '서류 업로드', icon: FileUp },
  { key: 'lessons', label: '수업관리', icon: BookOpen },
  { key: 'schedule', label: '스케줄 관리', icon: Calendar },
  { key: 'zoom', label: 'Zoom 연동', icon: Video },
  { key: 'security', label: '보안', icon: Shield },
]

const FORM_SAVE_SECTIONS = new Set(['basic', 'profile', 'employment', 'account', 'documents', 'zoom', 'security'])

const initialForm = {
	name: '',
	phone: '',
	headline: '',
	bio: '',
	selfIntro: '',
	videoUrl: '',
	defaultZoomUrl: '',
	bankName: '',
	accountNumber: '',
	accountHolder: '',
	password: '',
	passwordConfirm: '',
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
	id: '',
	subjectId: '',
	fieldId: '',
	price: '',
	description: '',
}

const emptyDocumentMap = () => ({
	EDUCATION: [],
	DEGREE: [],
	CERTIFICATE: [],
})

const isValidSectionKey = (value) => SECTION_ITEMS.some((item) => item.key === value)
const normalizeYearValue = (value) => (value === null || value === undefined || value === '' ? '' : String(value))

const toNullableNumber = (value) => {
	const trimmed = String(value ?? '').trim()
	if (!trimmed) return null
	const parsed = Number(trimmed)
	return Number.isFinite(parsed) ? parsed : null
}

const normalizeCareerItem = (item = {}) => ({
	companyName: item.companyName || '',
	jobCategory: item.jobCategory || '',
	jobRole: item.jobRole || '',
	startYear: normalizeYearValue(item.startYear),
	endYear: normalizeYearValue(item.endYear),
})

const normalizeEducationItem = (item = {}) => ({
	schoolName: item.schoolName || '',
	startYear: normalizeYearValue(item.startYear),
	graduatedYear: normalizeYearValue(item.graduatedYear),
})

const parseDegreeText = (value) => {
	const trimmed = String(value || '').trim()
	if (!trimmed) return { degreeName: '', major: '' }
	const matched = trimmed.match(/^(.+?)\s*\((.+)\)$/)
	if (!matched) return { degreeName: trimmed, major: '' }
	return {
		degreeName: matched[1].trim(),
		major: matched[2].trim(),
	}
}

const normalizeDegreeItem = (value) => {
	const parsed = parseDegreeText(value)
	return {
		degreeName: parsed.degreeName,
		major: parsed.major,
	}
}

const buildDegreeText = ({ degreeName, major }) => {
	const safeDegreeName = String(degreeName || '').trim()
	const safeMajor = String(major || '').trim()
	if (safeDegreeName && safeMajor) return `${safeDegreeName} (${safeMajor})`
	return safeDegreeName || safeMajor
}

const parseCertificateText = (value) => {
	const trimmed = String(value || '').trim()
	if (!trimmed) return { name: '', issuer: '' }
	const matched = trimmed.match(/^(.+?)\s*\((.+)\)$/)
	if (!matched) return { name: trimmed, issuer: '' }
	return {
		name: matched[1].trim(),
		issuer: matched[2].trim(),
	}
}

const normalizeLessonItem = (item = {}) => ({
	id: item.id || '',
	subjectId: item.subjectId === null || item.subjectId === undefined ? '' : String(item.subjectId),
	fieldId: item.fieldId === null || item.fieldId === undefined ? '' : String(item.fieldId),
	price: item.price === null || item.price === undefined ? '' : String(item.price),
	description: item.description || '',
	title: item.title || '',
})
const formatBytes = (value) => {
	const size = Number(value || 0)
	if (!size) return '0 B'
	if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
	if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`
	return `${size} B`
}

const getDocumentStatus = (doc) => {
	if (doc?.rejectReason) return '반려'
	if (doc?.reviewedAt) return '승인 완료'
	return '검토 대기'
}

const normalizeZoomUrl = (value) => {
	const trimmed = String(value || '').trim()
	if (!trimmed) return ''
	if (/^https?:\/\//i.test(trimmed)) return trimmed
	if (trimmed.startsWith('zoom.us/') || trimmed.startsWith('www.zoom.us/')) {
		return `https://${trimmed}`
	}
	return trimmed
}
const TutorProfileEdit = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { isLoading: authLoading, isLogin, hasRole, refreshUser } = useAuth()

	const [activeSection, setActiveSection] = useState('basic')
	const [form, setForm] = useState(initialForm)
	const [previewImg, setPreviewImg] = useState('')
	const [selectedFile, setSelectedFile] = useState(null)
	const [sidebarName, setSidebarName] = useState('튜터')
	const [sidebarLoginId, setSidebarLoginId] = useState('')
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const [employmentLoaded, setEmploymentLoaded] = useState(false)
	const [employmentLoading, setEmploymentLoading] = useState(false)
	const [careers, setCareers] = useState([])
	const [careerDraft, setCareerDraft] = useState(initialCareerForm)

	const [documentsLoaded, setDocumentsLoaded] = useState(false)
	const [documentsLoading, setDocumentsLoading] = useState(false)
	const [educations, setEducations] = useState([])
	const [educationDraft, setEducationDraft] = useState(initialEducationForm)
	const [degrees, setDegrees] = useState([])
	const [degreeDraft, setDegreeDraft] = useState(initialDegreeForm)
	const [certificateTexts, setCertificateTexts] = useState([])
	const [certificateTextDraft, setCertificateTextDraft] = useState(initialCertificateTextForm)
	const [existingDocs, setExistingDocs] = useState(emptyDocumentMap)
	const [pendingEducationFiles, setPendingEducationFiles] = useState([])
	const [pendingDegreeFiles, setPendingDegreeFiles] = useState([])
	const [pendingCertificateFiles, setPendingCertificateFiles] = useState([])

	const [lessonsLoaded, setLessonsLoaded] = useState(false)
	const [lessonsLoading, setLessonsLoading] = useState(false)
	const [subjectOptions, setSubjectOptions] = useState([])
	const [fieldOptions, setFieldOptions] = useState([])
	const [lessons, setLessons] = useState([])
	const [lessonDraft, setLessonDraft] = useState(initialLessonForm)
	const [lessonSaving, setLessonSaving] = useState(false)
	const [lessonDeletingId, setLessonDeletingId] = useState('')

	useEffect(() => {
		const sectionFromQuery = new URLSearchParams(location.search).get('section')
		if (sectionFromQuery && isValidSectionKey(sectionFromQuery)) {
			setActiveSection(sectionFromQuery)
		}
	}, [location.search])

	useEffect(() => () => {
		if (previewImg && previewImg.startsWith('blob:')) {
			URL.revokeObjectURL(previewImg)
		}
	}, [previewImg])

	useEffect(() => {
		if (authLoading) return
		if (!isLogin) {
			setLoading(false)
			return
		}

		const fetchProfile = async () => {
			setLoading(true)
			setError('')
			try {
				const response = await api.get('/tutors/me')
				const data = response.data?.data
				const profile = data?.tutorProfile || {}

				setForm({
					name: profile.name || '',
					phone: profile.phone || '',
					headline: profile.headline || '',
					bio: profile.bio || '',
					selfIntro: profile.selfIntro || '',
					videoUrl: profile.videoUrl || '',
					defaultZoomUrl: profile.defaultZoomUrl || '',
					bankName: profile.bankName || '',
					accountNumber: profile.accountNumber || '',
					accountHolder: profile.accountHolder || '',
					password: '',
					passwordConfirm: '',
				})

				setSidebarName(profile.name || profile.nickname || '튜터')
				setSidebarLoginId(profile.email || '')
				setPreviewImg(profile.profileImg || '')
			} catch {
				setError('프로필 정보를 불러오지 못했습니다.')
			} finally {
				setLoading(false)
			}
		}

		fetchProfile()
	}, [authLoading, isLogin])

	const loadEmploymentSection = useCallback(async (force = false) => {
		if (!isLogin || authLoading || (employmentLoaded && !force)) return

		setEmploymentLoading(true)
		try {
			const response = await api.get('/tutors/careers')
			setCareers((response.data?.data || []).map(normalizeCareerItem))
			setEmploymentLoaded(true)
		} catch (loadError) {
			setError(loadError?.response?.data?.message || '근무경력 정보를 불러오지 못했습니다.')
		} finally {
			setEmploymentLoading(false)
		}
	}, [authLoading, employmentLoaded, isLogin])

	const loadDocumentsSection = useCallback(async (force = false) => {
		if (!isLogin || authLoading || (documentsLoaded && !force)) return

		setDocumentsLoading(true)
		try {
			const [educationResponse, documentResponse] = await Promise.all([
				api.get('/tutors/educations'),
				api.get('/tutors/documents'),
			])

			const educationItems = educationResponse.data?.data || []
			const documentItems = documentResponse.data?.data || []

			setEducations(educationItems.map(normalizeEducationItem))
			setDegrees(educationItems.map((item) => normalizeDegreeItem(item.degree)))
			setCertificateTexts(
				documentItems
					.filter((doc) => doc.docType === 'CERTIFICATE_TEXT')
					.map((doc) => ({
						id: doc.id || `${doc.originalName}-${doc.createdAt || ''}`,
						...parseCertificateText(doc.originalName),
					}))
			)
			setExistingDocs({
				EDUCATION: documentItems.filter((doc) => doc.docType === 'EDUCATION'),
				DEGREE: documentItems.filter((doc) => doc.docType === 'DEGREE'),
				CERTIFICATE: documentItems.filter((doc) => doc.docType === 'CERTIFICATE'),
			})
			setPendingEducationFiles([])
			setPendingDegreeFiles([])
			setPendingCertificateFiles([])
			setDocumentsLoaded(true)
		} catch (loadError) {
			setError(loadError?.response?.data?.message || '서류 정보를 불러오지 못했습니다.')
		} finally {
			setDocumentsLoading(false)
		}
	}, [authLoading, documentsLoaded, isLogin])

	const loadLessonsSection = useCallback(async (force = false) => {
		if (!isLogin || authLoading || (lessonsLoaded && !force)) return

		setLessonsLoading(true)
		try {
			const [subjectResponse, fieldResponse, lessonResponse] = await Promise.all([
				subjectOptions.length && !force ? Promise.resolve({ data: { data: subjectOptions } }) : api.get('/subjects'),
				fieldOptions.length && !force ? Promise.resolve({ data: { data: fieldOptions } }) : api.get('/language-fields'),
				api.get('/lessons/my'),
			])

			setSubjectOptions(subjectResponse.data?.data || [])
			setFieldOptions(fieldResponse.data?.data || [])
			setLessons((lessonResponse.data?.data || []).map(normalizeLessonItem))
			setLessonDraft(initialLessonForm)
			setLessonsLoaded(true)
		} catch (loadError) {
			setError(loadError?.response?.data?.message || '수업 정보를 불러오지 못했습니다.')
		} finally {
			setLessonsLoading(false)
		}
	}, [authLoading, fieldOptions, isLogin, lessonsLoaded, subjectOptions])

	useEffect(() => {
		if (activeSection === 'employment') {
			void loadEmploymentSection()
			return
		}
		if (activeSection === 'documents') {
			void loadDocumentsSection()
			return
		}
		if (activeSection === 'lessons') {
			void loadLessonsSection()
		}
	}, [activeSection, loadDocumentsSection, loadEmploymentSection, loadLessonsSection])

	const sectionMeta = useMemo(() => {
		switch (activeSection) {
			case 'basic':
				return { title: '기본 정보', desc: '이름, 연락처, 프로필 사진을 수정합니다.' }
			case 'profile':
				return { title: '프로필', desc: '튜터 소개와 영상 정보를 관리합니다.' }
			case 'employment':
				return { title: '근무경력', desc: '근무 경력을 조회하고 수정합니다.' }
			case 'account':
				return { title: '계좌 정보', desc: '정산을 위한 계좌 정보를 수정합니다.' }
			case 'documents':
				return { title: '서류 업로드', desc: '학력, 학위, 자격 증빙 정보를 관리합니다.' }
			case 'lessons':
				return { title: '수업관리', desc: '과목, 분야, 가격 정보를 등록하고 수정합니다.' }
			case 'schedule':
				return { title: '스케줄 관리', desc: '가용 시간과 예약 스케줄을 관리합니다.' }
			case 'zoom':
				return { title: 'Zoom 연동', desc: '기본 Zoom URL을 설정합니다.' }
			case 'security':
				return { title: '보안', desc: '비밀번호를 변경합니다.' }
			default:
				return { title: '프로필 수정', desc: '' }
		}
	}, [activeSection])

	const subjectMap = useMemo(() => new Map(subjectOptions.map((item) => [String(item.id), item.name])), [subjectOptions])
	const fieldMap = useMemo(() => new Map(fieldOptions.map((item) => [String(item.id), item.name])), [fieldOptions])
	const generalFieldOptions = useMemo(() => fieldOptions.filter((item) => item.category !== 'DOMAIN'), [fieldOptions])
	const domainFieldOptions = useMemo(() => fieldOptions.filter((item) => item.category === 'DOMAIN'), [fieldOptions])
	const normalizedZoomUrl = useMemo(() => normalizeZoomUrl(form.defaultZoomUrl), [form.defaultZoomUrl])

	const handleSectionChange = (sectionKey) => {
		setActiveSection(sectionKey)
		const search = new URLSearchParams(location.search)
		search.set('section', sectionKey)
		navigate({ pathname: location.pathname, search: `?${search.toString()}` }, { replace: true })
		setError('')
		setSuccess('')
	}

	const handleChange = (event) => {
		const { name, value } = event.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleDraftChange = (setter) => (event) => {
		const { name, value } = event.target
		setter((prev) => ({ ...prev, [name]: value }))
	}

	const handleImageChange = (event) => {
		const file = event.target.files?.[0]
		if (!file) return
		setSelectedFile(file)
		setPreviewImg((prev) => {
			if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
			return URL.createObjectURL(file)
		})
	}

	const appendFiles = (setter) => (event) => {
		const files = Array.from(event.target.files || [])
		if (!files.length) return
		setter((prev) => [...prev, ...files])
		event.target.value = ''
	}

	const addCareer = () => {
		if (!careerDraft.companyName.trim()) {
			setError('회사명을 입력해 주세요.')
			return
		}
		setCareers((prev) => [...prev, normalizeCareerItem(careerDraft)])
		setCareerDraft(initialCareerForm)
		setError('')
		setSuccess('')
	}

	const addEducation = () => {
		if (!educationDraft.schoolName.trim()) {
			setError('학교명을 입력해 주세요.')
			return
		}
		setEducations((prev) => [...prev, normalizeEducationItem(educationDraft)])
		setEducationDraft(initialEducationForm)
		setError('')
		setSuccess('')
	}

	const addDegree = () => {
		if (!degreeDraft.degreeName.trim()) {
			setError('학위명을 입력해 주세요.')
			return
		}
		setDegrees((prev) => [...prev, { ...degreeDraft }])
		setDegreeDraft(initialDegreeForm)
		setError('')
		setSuccess('')
	}

	const addCertificateText = () => {
		if (!certificateTextDraft.name.trim()) {
			setError('자격증명을 입력해 주세요.')
			return
		}
		setCertificateTexts((prev) => [
			...prev,
			{
				id: `certificate-text-${Date.now()}`,
				name: certificateTextDraft.name.trim(),
				issuer: certificateTextDraft.issuer.trim(),
			},
		])
		setCertificateTextDraft(initialCertificateTextForm)
		setError('')
		setSuccess('')
	}

	const buildLessonTitle = (subjectId, fieldId) => {
		const subjectName = subjectMap.get(subjectId) || ''
		const fieldName = fieldMap.get(fieldId) || ''
		return fieldName ? `${subjectName}-${fieldName}` : subjectName
	}

	const saveProfileSection = async () => {
		const body = new FormData()
		body.append('name', form.name || '')
		body.append('phone', form.phone || '')
		body.append('headline', form.headline || '')
		body.append('bio', form.bio || '')
		body.append('selfIntro', form.selfIntro || '')
		body.append('videoUrl', form.videoUrl || '')
		body.append('defaultZoomUrl', form.defaultZoomUrl || '')
		body.append('bankName', form.bankName || '')
		body.append('accountNumber', form.accountNumber || '')
		body.append('accountHolder', form.accountHolder || '')

		if (form.password) {
			body.append('password', form.password)
			body.append('passwordConfirm', form.passwordConfirm || '')
		}
		if (selectedFile) {
			body.append('profileImg', selectedFile)
		}

		await api.put('/tutors', body, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})

		await refreshUser().catch(() => null)
		setSelectedFile(null)
		setForm((prev) => ({ ...prev, password: '', passwordConfirm: '' }))
		setSuccess('저장되었습니다.')
	}

	const saveEmploymentSection = async () => {
		const payload = careers.map((item) => ({
			companyName: item.companyName.trim(),
			jobCategory: item.jobCategory.trim(),
			jobRole: item.jobRole.trim(),
			startYear: toNullableNumber(item.startYear),
			endYear: toNullableNumber(item.endYear),
		}))

		await api.post('/tutors/careers', payload)
		await loadEmploymentSection(true)
		setSuccess('근무경력이 저장되었습니다.')
	}

	const uploadDocumentFiles = async (docType, files) => {
		for (const file of files) {
			const body = new FormData()
			body.append('docType', docType)
			body.append('file', file)
			await api.post('/tutors/documents', body, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
		}
	}

	const saveDocumentsSection = async () => {
		const maxLength = Math.max(educations.length, degrees.length)
		const educationPayload = Array.from({ length: maxLength }, (_, index) => {
			const education = educations[index] || {}
			const degree = degrees[index] || {}
			const schoolName = String(education.schoolName || '').trim()
			const degreeText = buildDegreeText(degree)

			if (!schoolName && !degreeText) return null

			return {
				schoolName: schoolName || '학력 정보',
				degree: degreeText || '학위 미입력',
				startYear: toNullableNumber(education.startYear),
				graduatedYear: toNullableNumber(education.graduatedYear),
			}
		}).filter(Boolean)

		await api.post('/tutors/educations', educationPayload)
		await api.put('/tutors/documents/certificate-texts', certificateTexts.map((item) => ({
			name: item.name.trim(),
			issuer: item.issuer.trim(),
		})))
		await uploadDocumentFiles('EDUCATION', pendingEducationFiles)
		await uploadDocumentFiles('DEGREE', pendingDegreeFiles)
		await uploadDocumentFiles('CERTIFICATE', pendingCertificateFiles)
		await loadDocumentsSection(true)
		setSuccess('서류 정보가 저장되었습니다.')
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setSuccess('')

		if (!FORM_SAVE_SECTIONS.has(activeSection)) return

		if (activeSection === 'security' && form.password !== form.passwordConfirm) {
			setError('비밀번호 확인이 일치하지 않습니다.')
			return
		}

		setSaving(true)
		try {
			if (activeSection === 'employment') {
				await saveEmploymentSection()
			} else if (activeSection === 'documents') {
				await saveDocumentsSection()
			} else {
				await saveProfileSection()
			}
		} catch (submitError) {
			setError(submitError?.response?.data?.message || '저장에 실패했습니다.')
		} finally {
			setSaving(false)
		}
	}

	const saveLesson = async () => {
		setError('')
		setSuccess('')

		if (!lessonDraft.subjectId || !lessonDraft.fieldId) {
			setError('과목과 분야를 선택해 주세요.')
			return
		}

		const price = Number(lessonDraft.price)
		if (!lessonDraft.price || Number.isNaN(price) || price <= 0) {
			setError('수업료를 올바르게 입력해 주세요.')
			return
		}

		setLessonSaving(true)
		try {
			const payload = {
				subjectId: lessonDraft.subjectId,
				fieldId: lessonDraft.fieldId,
				title: buildLessonTitle(lessonDraft.subjectId, lessonDraft.fieldId),
				description: lessonDraft.description.trim(),
				price,
			}

			if (lessonDraft.id) {
				await api.put(`/lessons/${lessonDraft.id}`, payload)
				setSuccess('수업이 수정되었습니다.')
			} else {
				await api.post('/lessons', payload)
				setSuccess('수업이 추가되었습니다.')
			}

			await loadLessonsSection(true)
		} catch (lessonError) {
			setError(lessonError?.response?.data?.message || '수업 저장에 실패했습니다.')
		} finally {
			setLessonSaving(false)
		}
	}

	const deleteLesson = async (lessonId) => {
		if (!window.confirm('이 수업을 삭제하시겠습니까?')) return

		setError('')
		setSuccess('')
		setLessonDeletingId(lessonId)
		try {
			await api.delete(`/lessons/${lessonId}`)
			await loadLessonsSection(true)
			setSuccess('수업이 삭제되었습니다.')
		} catch (lessonError) {
			setError(lessonError?.response?.data?.message || '수업 삭제에 실패했습니다.')
		} finally {
			setLessonDeletingId('')
		}
	}
	if (authLoading || loading) {
		return (
			<Layout>
				<section className='bg-[#f8fafc] py-10'>
					<div className='flex min-h-[60vh] items-center justify-center'>
						<div className='h-10 w-10 animate-spin rounded-full border-4 border-[#4f46e5] border-t-transparent' />
					</div>
				</section>
			</Layout>
		)
	}

	if (!isLogin) {
		return (
			<Layout>
				<section className='bg-[#f8fafc] py-10'>
					<div className='mx-auto w-full max-w-[1140px] px-3'>
						<div className='rounded-[16px] border border-[#e5e7eb] bg-white px-6 py-16 text-center shadow-sm'>
							<h2 className='text-2xl font-bold text-slate-900'>로그인이 필요합니다</h2>
							<Link to='/login' className='mt-6 inline-flex h-[38px] items-center rounded-md bg-[#4f46e5] px-5 text-sm font-semibold text-white hover:bg-[#4338ca]'>
								로그인하기
							</Link>
						</div>
					</div>
				</section>
			</Layout>
		)
	}

	if (!hasRole('ROLE_TUTOR') && !hasRole('ROLE_TUTOR_PENDING')) {
		return (
			<Layout>
				<section className='bg-[#f8fafc] py-10'>
					<div className='mx-auto w-full max-w-[1140px] px-3'>
						<div className='rounded-[16px] border border-[#e5e7eb] bg-white px-6 py-16 text-center shadow-sm'>
							<h2 className='text-2xl font-bold text-slate-900'>접근 권한이 없습니다</h2>
							<Link to='/member/mypage' className='mt-6 inline-flex h-[38px] items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
								회원 마이페이지
							</Link>
						</div>
					</div>
				</section>
			</Layout>
		)
	}

	const profileInitial = String(sidebarName || '튜').charAt(0)
	const canSave = FORM_SAVE_SECTIONS.has(activeSection)

	return (
		<Layout>
			<section className='profile-edit-page bg-[#f8fafc] py-6'>
				<div className='mx-auto w-full max-w-[1140px] px-3'>
					<div className='mb-4 flex items-end justify-between'>
						<div>
							<h2 className='mb-1 text-[1.75rem] font-bold text-slate-900'>프로필 수정</h2>
							<div className='text-sm text-slate-500'>튜터 정보를 수정하세요</div>
						</div>
						<Link to='/tutor/mypage' className='inline-flex h-[31px] items-center rounded-full border border-slate-300 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50'>
            <ArrowLeft className='mr-1 h-3.5 w-3.5' />
            마이페이지로
          </Link>
					</div>

					<div className='profile-edit-shell grid gap-6 lg:grid-cols-[280px_1fr]'>
						<aside className='profile-edit-sidebar lg:sticky lg:top-[90px] lg:h-fit'>
							<div className='profile-edit-card rounded-[16px] border border-[#e5e7eb] bg-white p-4 shadow-sm'>
								<div className='mb-3 flex items-center gap-3'>
									<div className='flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full bg-[#4f46e5] text-xl font-bold text-white'>
										{previewImg ? <img src={previewImg} alt='프로필' className='h-full w-full object-cover' /> : profileInitial}
									</div>
									<div>
										<div className='font-bold text-slate-900'>{sidebarName}</div>
										<div className='text-xs text-slate-500'>{sidebarLoginId}</div>
									</div>
								</div>

								<div className='my-3 h-px bg-slate-200' />

								<div className='profile-edit-menu grid gap-1.5'>
              {SECTION_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.key}
                    type='button'
                    onClick={() => handleSectionChange(item.key)}
                    className={activeSection === item.key ? 'profile-edit-menu-item is-active' : 'profile-edit-menu-item'}
                  >
                    <Icon className='h-[18px] w-[18px] shrink-0' />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className='profile-edit-card mt-3 rounded-[16px] border border-[#e5e7eb] bg-white p-3 text-xs text-slate-500 shadow-sm'>
            <div className='flex items-start gap-2'>
              <Info className='mt-0.5 h-4 w-4 shrink-0 text-slate-400' />
              <span>정보 수정 후 각 섹션의 저장 버튼을 눌러주세요.</span>
            </div>
          </div>
        </aside>

						<main>
							<form onSubmit={handleSubmit} className='profile-edit-card profile-edit-main-card space-y-4 rounded-[16px] border border-[#e5e7eb] bg-white p-6 shadow-sm'>
            <div className='profile-edit-panel-header'>
              <h3 className='text-lg font-extrabold text-slate-900'>{sectionMeta.title}</h3>
              <p className='mt-1 text-sm text-slate-500'>{sectionMeta.desc}</p>
            </div>

								{activeSection === 'basic' && (
									<div className='grid gap-4'>
										<div className='grid gap-4 md:grid-cols-[150px_1fr]'>
											<div>
												<div className='h-28 w-28 overflow-hidden rounded-full bg-slate-100'>
													{previewImg ? (
														<img src={previewImg} alt='프로필 미리보기' className='h-full w-full object-cover' />
													) : (
														<div className='flex h-full w-full items-center justify-center text-3xl font-bold text-slate-500'>{profileInitial}</div>
													)}
												</div>
												<input
													type='file'
													accept='image/*'
													onChange={handleImageChange}
													className='mt-3 block w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-slate-700'
												/>
											</div>
											<div className='grid gap-3 md:grid-cols-2'>
												<Input label='이름' name='name' value={form.name} onChange={handleChange} required />
												<Input label='연락처' name='phone' value={form.phone} onChange={handleChange} />
											</div>
										</div>
									</div>
								)}

								{activeSection === 'profile' && (
									<div className='grid gap-3'>
										<Input label='한 줄 소개' name='headline' value={form.headline} onChange={handleChange} />
										<TextArea label='소개' name='bio' value={form.bio} onChange={handleChange} rows={4} />
										<TextArea label='자기소개' name='selfIntro' value={form.selfIntro} onChange={handleChange} rows={5} />
										<Input label='소개 영상 URL' name='videoUrl' value={form.videoUrl} onChange={handleChange} />
									</div>
								)}

								{activeSection === 'account' && (
									<div className='grid gap-3 md:grid-cols-2'>
										<Input label='은행명' name='bankName' value={form.bankName} onChange={handleChange} />
										<Input label='예금주' name='accountHolder' value={form.accountHolder} onChange={handleChange} />
										<div className='md:col-span-2'>
											<Input label='계좌번호' name='accountNumber' value={form.accountNumber} onChange={handleChange} />
										</div>
									</div>
								)}

																{activeSection === 'zoom' && (
									<div className='space-y-4'>
										<div className='profile-edit-soft-card rounded-[14px] border border-slate-200 bg-slate-50 p-4'>
											<div className='profile-edit-info-box'>
												<Info className='mt-0.5 h-4 w-4 shrink-0 text-[#4f46e5]' />
												<div>
													<div className='text-sm font-bold text-slate-900'>기본 Zoom 참여 링크</div>
													<p className='mt-1 text-sm text-slate-600'>새 예약 생성 시 기본 참여 링크로 사용됩니다. 개인 회의실 링크나 고정 회의 링크를 입력하는 방식이 원본과 가장 가깝습니다.</p>
												</div>
											</div>
											<div className='mt-4'>
												<Input
													label='기본 Zoom 참여 링크'
													name='defaultZoomUrl'
													type='url'
													value={form.defaultZoomUrl}
													onChange={handleChange}
													placeholder='https://zoom.us/j/1234567890'
												/>
												<p className='mt-2 text-xs text-slate-500'>비밀번호, 대기실 설정 같은 보안 옵션은 Zoom 관리자 페이지에서 별도로 관리합니다.</p>
											</div>
											<div className='mt-4 flex flex-wrap gap-2'>
												<button
													type='button'
													onClick={() => setForm((prev) => ({ ...prev, defaultZoomUrl: 'https://zoom.us/j/1234567890' }))}
													className='inline-flex h-[34px] items-center rounded-md border border-[#4f46e5] px-3 text-xs font-semibold text-[#4f46e5] hover:bg-indigo-50'
												>
													예시 링크 채우기
												</button>
												<button
													type='button'
													onClick={() => setForm((prev) => ({ ...prev, defaultZoomUrl: '' }))}
													className='inline-flex h-[34px] items-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100'
												>
													입력 초기화
												</button>
											</div>
											<div className='profile-edit-zoom-preview mt-4 rounded-[12px] border border-slate-200 bg-white p-4'>
												<div className='text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500'>링크 미리보기</div>
												{normalizedZoomUrl ? (
													<a href={normalizedZoomUrl} target='_blank' rel='noreferrer' className='mt-2 block break-all text-sm font-semibold text-[#4f46e5] hover:underline'>
														{normalizedZoomUrl}
													</a>
												) : (
													<p className='mt-2 text-sm text-slate-500'>링크를 입력하면 여기에 표시됩니다.</p>
												)}
											</div>
										</div>

										<div className='profile-edit-soft-card rounded-[14px] border border-slate-200 bg-slate-50 p-4'>
											<div className='flex items-center gap-2 text-sm font-bold text-slate-900'>
												<Shield className='h-4 w-4 text-emerald-600' />
												<span>운영 가이드</span>
											</div>
											<ul className='profile-edit-guide-list mt-3 space-y-2 text-sm text-slate-600'>
												<li>Zoom 링크를 바꿔도 이미 생성된 예약에는 즉시 반영되지 않을 수 있습니다.</li>
												<li>실제 수업 전에 링크가 정상 접속되는지 한 번 확인하는 흐름이 원본 동작과 가장 비슷합니다.</li>
												<li>보안 설정은 Zoom 서비스 측에서 별도로 관리해야 합니다.</li>
											</ul>
										</div>
									</div>
								)}

								{activeSection === 'security' && (
									<div className='profile-edit-soft-card rounded-[14px] border border-slate-200 bg-slate-50 p-4'>
										<p className='mb-3 text-sm font-semibold text-slate-700'>새 비밀번호를 입력하면 변경됩니다.</p>
										<div className='grid gap-3 md:grid-cols-2'>
											<Input label='새 비밀번호' name='password' type='password' value={form.password} onChange={handleChange} />
											<Input label='비밀번호 확인' name='passwordConfirm' type='password' value={form.passwordConfirm} onChange={handleChange} />
										</div>
									</div>
								)}

								{activeSection === 'employment' && (
									<div className='space-y-4'>
										<div className='profile-edit-soft-card rounded-[14px] border border-slate-200 bg-slate-50 p-4'>
											<div className='grid gap-3 md:grid-cols-2'>
												<Input label='회사명' name='companyName' value={careerDraft.companyName} onChange={handleDraftChange(setCareerDraft)} />
												<Input label='직무 카테고리' name='jobCategory' value={careerDraft.jobCategory} onChange={handleDraftChange(setCareerDraft)} />
												<Input label='직무명' name='jobRole' value={careerDraft.jobRole} onChange={handleDraftChange(setCareerDraft)} />
												<div className='grid grid-cols-2 gap-3'>
													<Input label='시작연도' name='startYear' type='number' value={careerDraft.startYear} onChange={handleDraftChange(setCareerDraft)} />
													<Input label='종료연도' name='endYear' type='number' value={careerDraft.endYear} onChange={handleDraftChange(setCareerDraft)} />
												</div>
											</div>
											<div className='mt-3 flex justify-end'>
												<button type='button' onClick={addCareer} className='inline-flex h-[38px] items-center rounded-md border border-[#4f46e5] px-4 text-sm font-semibold text-[#4f46e5] hover:bg-indigo-50'>
													경력 추가
												</button>
											</div>
										</div>

										{employmentLoading ? (
											<SectionLoading text='근무경력을 불러오는 중입니다.' />
										) : careers.length ? (
											<div className='space-y-2'>
												{careers.map((item, index) => (
													<div key={`${item.companyName}-${index}`} className='profile-edit-career-card'>
														<div className='profile-edit-career-period'>
															<div className='profile-edit-career-period-label'>기간</div>
															<div className='profile-edit-career-period-value'>
																{item.startYear || '-'}
																{item.endYear ? ` - ${item.endYear}` : item.startYear ? ' - 재직 중' : ''}
															</div>
														</div>
														<div className='profile-edit-career-main'>
															<div className='profile-edit-career-company'>{item.companyName}</div>
															<div className='profile-edit-career-role'>
																{[item.jobCategory, item.jobRole].filter(Boolean).join(' / ') || '직무 정보 없음'}
															</div>
														</div>
														<button
															type='button'
															onClick={() => setCareers((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
															className='profile-edit-remove-btn'
														>
															삭제
														</button>
													</div>
												))}
											</div>
										) : (
											<EmptyState text='등록된 근무경력이 없습니다.' />
										)}
									</div>
								)}

								{activeSection === 'documents' && (
									<div className='space-y-4'>
										{documentsLoading ? (
											<SectionLoading text='서류 정보를 불러오는 중입니다.' />
										) : (
											<>
												<div className='profile-edit-soft-card rounded-[14px] border border-slate-200 bg-slate-50 p-4'>
													<div className='mb-3'>
														<h4 className='text-sm font-bold text-slate-900'>학력</h4>
														<p className='mt-1 text-xs text-slate-500'>학교명과 기간을 저장한 뒤, 학력 증빙 파일을 업로드할 수 있습니다.</p>
													</div>
													<div className='grid gap-3 md:grid-cols-3'>
														<Input label='학교명' name='schoolName' value={educationDraft.schoolName} onChange={handleDraftChange(setEducationDraft)} />
														<Input label='입학연도' name='startYear' type='number' value={educationDraft.startYear} onChange={handleDraftChange(setEducationDraft)} />
														<Input label='졸업연도' name='graduatedYear' type='number' value={educationDraft.graduatedYear} onChange={handleDraftChange(setEducationDraft)} />
													</div>
													<div className='mt-3 flex justify-end'>
														<button type='button' onClick={addEducation} className='inline-flex h-[38px] items-center rounded-md border border-[#4f46e5] px-4 text-sm font-semibold text-[#4f46e5] hover:bg-indigo-50'>
															학력 추가
														</button>
													</div>
													<div className='mt-4 space-y-2'>
														{educations.length ? educations.map((item, index) => (
                                    <div key={`${item.schoolName}-${index}`} className='profile-edit-text-card profile-edit-text-card--education'>
                                      <div className='profile-edit-text-icon'>학</div>
                                      <div className='profile-edit-text-main'>
                                        <div className='profile-edit-text-title'>{item.schoolName}</div>
                                        <div className='profile-edit-text-sub'>
                                          {item.startYear || '-'}
                                          {item.graduatedYear ? ` - ${item.graduatedYear}` : ' - 재학/미입력'}
                                        </div>
                                      </div>
                                      <button
                                        type='button'
                                        onClick={() => setEducations((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                                        className='profile-edit-remove-btn text-sm font-semibold text-red-500'
                                      >
                                        {'삭제'}
                                      </button>
                                    </div>
                                  )) : <EmptyState text='등록된 학력 정보가 없습니다.' />}
													</div>
													<div className='profile-edit-upload-card mt-4 rounded-[12px] border border-dashed border-slate-300 bg-white p-4'>
														<div className='flex flex-wrap items-center justify-between gap-3'>
															<div>
																<div className='text-sm font-semibold text-slate-900'>학력 증빙 파일</div>
																<div className='text-xs text-slate-500'>PDF, JPG, PNG 파일을 추가할 수 있습니다.</div>
															</div>
															<label className='inline-flex h-[38px] cursor-pointer items-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
																파일 선택
																<input type='file' multiple accept='.pdf,.jpg,.jpeg,.png' className='hidden' onChange={appendFiles(setPendingEducationFiles)} />
															</label>
														</div>
														<PendingFileList files={pendingEducationFiles} onRemove={(index) => setPendingEducationFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} />
														<ExistingDocumentList items={existingDocs.EDUCATION} />
													</div>
												</div>

												<div className='profile-edit-soft-card rounded-[14px] border border-slate-200 bg-slate-50 p-4'>
													<div className='mb-3'>
														<h4 className='text-sm font-bold text-slate-900'>학위</h4>
														<p className='mt-1 text-xs text-slate-500'>학위명과 전공을 저장한 뒤, 학위 증빙 파일을 업로드할 수 있습니다.</p>
													</div>
													<div className='grid gap-3 md:grid-cols-2'>
														<Input label='학위명' name='degreeName' value={degreeDraft.degreeName} onChange={handleDraftChange(setDegreeDraft)} />
														<Input label='전공' name='major' value={degreeDraft.major} onChange={handleDraftChange(setDegreeDraft)} />
													</div>
													<div className='mt-3 flex justify-end'>
														<button type='button' onClick={addDegree} className='inline-flex h-[38px] items-center rounded-md border border-[#4f46e5] px-4 text-sm font-semibold text-[#4f46e5] hover:bg-indigo-50'>
															학위 추가
														</button>
													</div>
													<div className='mt-4 space-y-2'>
														{degrees.length ? degrees.map((item, index) => (
                                    <div key={`${item.degreeName}-${index}`} className='profile-edit-text-card profile-edit-text-card--degree'>
                                      <div className='profile-edit-text-icon'>위</div>
                                      <div className='profile-edit-text-main'>
                                        <div className='profile-edit-text-title'>{item.degreeName}</div>
                                        <div className='profile-edit-text-sub'>{item.major || '전공 미입력'}</div>
                                      </div>
                                      <button
                                        type='button'
                                        onClick={() => setDegrees((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                                        className='profile-edit-remove-btn text-sm font-semibold text-red-500'
                                      >
                                        {'삭제'}
                                      </button>
                                    </div>
                                  )) : <EmptyState text='등록된 학위 정보가 없습니다.' />}
													</div>
													<div className='profile-edit-upload-card mt-4 rounded-[12px] border border-dashed border-slate-300 bg-white p-4'>
														<div className='flex flex-wrap items-center justify-between gap-3'>
															<div>
																<div className='text-sm font-semibold text-slate-900'>학위 증빙 파일</div>
																<div className='text-xs text-slate-500'>PDF, JPG, PNG 파일을 추가할 수 있습니다.</div>
															</div>
															<label className='inline-flex h-[38px] cursor-pointer items-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
																파일 선택
																<input type='file' multiple accept='.pdf,.jpg,.jpeg,.png' className='hidden' onChange={appendFiles(setPendingDegreeFiles)} />
															</label>
														</div>
														<PendingFileList files={pendingDegreeFiles} onRemove={(index) => setPendingDegreeFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} />
														<ExistingDocumentList items={existingDocs.DEGREE} />
													</div>
												</div>

												<div className='profile-edit-soft-card rounded-[14px] border border-slate-200 bg-slate-50 p-4'>
													<div className='mb-3'>
														<h4 className='text-sm font-bold text-slate-900'>자격증</h4>
														<p className='mt-1 text-xs text-slate-500'>자격증명 텍스트와 증빙 파일을 각각 관리할 수 있습니다.</p>
													</div>
													<div className='grid gap-3 md:grid-cols-2'>
														<Input label='자격증명' name='name' value={certificateTextDraft.name} onChange={handleDraftChange(setCertificateTextDraft)} />
														<Input label='발급기관' name='issuer' value={certificateTextDraft.issuer} onChange={handleDraftChange(setCertificateTextDraft)} />
													</div>
													<div className='mt-3 flex justify-end'>
														<button type='button' onClick={addCertificateText} className='inline-flex h-[38px] items-center rounded-md border border-[#4f46e5] px-4 text-sm font-semibold text-[#4f46e5] hover:bg-indigo-50'>
															자격증 추가
														</button>
													</div>
													<div className='mt-4 space-y-2'>
														{certificateTexts.length ? certificateTexts.map((item, index) => (
                                    <div key={item.id || `${item.name}-${index}`} className='profile-edit-text-card profile-edit-text-card--cert'>
                                      <div className='profile-edit-text-icon'>증</div>
                                      <div className='profile-edit-text-main'>
                                        <div className='profile-edit-text-title'>{item.name}</div>
                                        <div className='profile-edit-text-sub'>{item.issuer || '발급기관 미입력'}</div>
                                      </div>
                                      <button
                                        type='button'
                                        onClick={() => setCertificateTexts((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
                                        className='profile-edit-remove-btn text-sm font-semibold text-red-500'
                                      >
                                        {'삭제'}
                                      </button>
                                    </div>
                                  )) : <EmptyState text='등록된 자격증 텍스트가 없습니다.' />}
													</div>
													<div className='profile-edit-upload-card mt-4 rounded-[12px] border border-dashed border-slate-300 bg-white p-4'>
														<div className='flex flex-wrap items-center justify-between gap-3'>
															<div>
																<div className='text-sm font-semibold text-slate-900'>자격증 증빙 파일</div>
																<div className='text-xs text-slate-500'>기존 업로드 파일은 조회만 가능하며, 새 파일은 저장 시 업로드됩니다.</div>
															</div>
															<label className='inline-flex h-[38px] cursor-pointer items-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
																파일 선택
																<input type='file' multiple accept='.pdf,.jpg,.jpeg,.png' className='hidden' onChange={appendFiles(setPendingCertificateFiles)} />
															</label>
														</div>
														<PendingFileList files={pendingCertificateFiles} onRemove={(index) => setPendingCertificateFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index))} />
														<ExistingDocumentList items={existingDocs.CERTIFICATE} />
													</div>
												</div>
											</>
										)}
									</div>
								)}

																{activeSection === 'lessons' && (
									<div className='space-y-4'>
										{lessonsLoading ? (
											<SectionLoading text='수업 정보를 불러오는 중입니다.' />
										) : (
											<>
												<div className='profile-edit-soft-card rounded-[14px] border border-slate-200 bg-slate-50 p-4'>
													<div className='mb-4'>
														<h4 className='text-sm font-bold text-slate-900'>수업 카드 편집</h4>
														<p className='mt-1 text-xs text-slate-500'>원본 화면처럼 과목과 분야를 먼저 고른 뒤 수업료와 설명을 입력합니다. 현재 React 화면에서는 저장 즉시 API에 반영됩니다.</p>
													</div>

													<div className='space-y-4'>
														<div>
															<div className='text-sm font-bold text-slate-900'>과목</div>
															<div className='profile-edit-choice-group mt-3'>
																{subjectOptions.map((item) => {
																	const isActive = String(lessonDraft.subjectId) === String(item.id)
																	return (
																		<button
																			key={item.id}
																			type='button'
																			onClick={() => setLessonDraft((prev) => ({ ...prev, subjectId: String(item.id) }))}
																			className={isActive ? 'profile-edit-choice-button is-active' : 'profile-edit-choice-button'}
																		>
																			{item.name}
																		</button>
																	)
																})}
															</div>
														</div>

														<div>
															<div className='text-sm font-bold text-slate-900'>일반 분야</div>
															<div className='profile-edit-choice-group mt-3'>
																{generalFieldOptions.map((item) => {
																	const isActive = String(lessonDraft.fieldId) === String(item.id)
																	return (
																		<button
																			key={item.id}
																			type='button'
																			onClick={() => setLessonDraft((prev) => ({ ...prev, fieldId: String(item.id) }))}
																			className={isActive ? 'profile-edit-choice-button is-active' : 'profile-edit-choice-button'}
																		>
																			{item.name}
																		</button>
																	)
																})}
															</div>
														</div>

														<div>
															<div className='text-sm font-bold text-slate-900'>분야별</div>
															<div className='profile-edit-choice-group mt-3'>
																{domainFieldOptions.map((item) => {
																	const isActive = String(lessonDraft.fieldId) === String(item.id)
																	return (
																		<button
																			key={item.id}
																			type='button'
																			onClick={() => setLessonDraft((prev) => ({ ...prev, fieldId: String(item.id) }))}
																			className={isActive ? 'profile-edit-choice-button is-active' : 'profile-edit-choice-button'}
																		>
																			{item.name}
																		</button>
																	)
																})}
															</div>
															<p className='profile-edit-helper-note mt-2 text-xs text-slate-500'>일반 분야와 분야별 중 하나만 선택하면 됩니다.</p>
														</div>

														<div className='grid gap-3 md:grid-cols-[minmax(0,220px)_1fr] md:items-end'>
															<Input
																label='수업료(원)'
																name='price'
																type='number'
																value={lessonDraft.price}
																onChange={handleDraftChange(setLessonDraft)}
																placeholder='예: 30000'
															/>
															<div className='flex flex-wrap justify-end gap-2'>
																{lessonDraft.id && (
																	<button type='button' onClick={() => setLessonDraft(initialLessonForm)} className='inline-flex h-[38px] items-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
																		수정 취소
																	</button>
																)}
																<button type='button' onClick={saveLesson} disabled={lessonSaving} className='inline-flex h-[38px] items-center rounded-md bg-[#4f46e5] px-5 text-sm font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-50'>
																	{lessonSaving ? '처리 중...' : lessonDraft.id ? '수업 수정' : '수업 추가'}
																</button>
															</div>
														</div>

														<TextArea
															label='설명 (선택)'
															name='description'
															value={lessonDraft.description}
															onChange={handleDraftChange(setLessonDraft)}
															rows={3}
															placeholder='수업 설명을 입력하세요.'
														/>

														<div className='profile-edit-hint-box rounded-[12px] border border-dashed border-[#cbd5e1] bg-white px-4 py-3 text-sm text-slate-600'>
															현재 선택: <span className='font-semibold text-slate-900'>{subjectMap.get(String(lessonDraft.subjectId)) || '과목 미선택'}</span>
															{' / '}
															<span className='font-semibold text-slate-900'>{fieldMap.get(String(lessonDraft.fieldId)) || '분야 미선택'}</span>
															<span className='ml-2 text-xs text-slate-500'>저장 버튼을 누르면 즉시 반영됩니다.</span>
														</div>
													</div>
												</div>

												<div className='space-y-2'>
													{lessons.length ? lessons.map((item) => (
														<div key={item.id} className='profile-edit-list-card profile-edit-lesson-card'>
															<div className='profile-edit-lesson-main'>
																<div className='profile-edit-lesson-title'>
																	{subjectMap.get(String(item.subjectId)) || item.title || '과목 미지정'}
																	{fieldMap.get(String(item.fieldId)) ? ` · ${fieldMap.get(String(item.fieldId))}` : ''}
																</div>
																<div className='profile-edit-lesson-meta'>{item.description || '설명 없음'}</div>
																<div className='profile-edit-lesson-price'>{Number(item.price || 0).toLocaleString('ko-KR')}원</div>
															</div>
															<div className='profile-edit-lesson-actions'>
																<button type='button' onClick={() => setLessonDraft({ ...item })} className='inline-flex h-[36px] items-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
																	수정
																</button>
																<button type='button' onClick={() => deleteLesson(item.id)} disabled={lessonDeletingId === item.id} className='inline-flex h-[36px] items-center rounded-md border border-red-200 px-3 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50'>
																	{lessonDeletingId === item.id ? '삭제 중...' : '삭제'}
																</button>
															</div>
														</div>
													)) : <EmptyState text='등록된 수업이 없습니다.' />}
												</div>
											</>
										)}
									</div>
								)}

								{activeSection === 'schedule' && (
									<div className='profile-edit-soft-card rounded-[14px] border border-slate-200 bg-slate-50 p-4'>
										<p className='mb-3 text-sm text-slate-600'>주간 스케줄 상세 편집은 별도 화면에서 관리합니다.</p>
										<Link to='/tutor/schedule-edit' className='inline-flex h-[31px] items-center rounded-md bg-[#4f46e5] px-3 text-xs font-semibold text-white hover:bg-[#4338ca]'>
											스케줄 편집으로 이동
										</Link>
									</div>
								)}

								{error && <p className='text-sm font-semibold text-red-500'>{error}</p>}
								{success && <p className='text-sm font-semibold text-emerald-600'>{success}</p>}

								<div className='flex justify-end gap-2 pt-2'>
									<Link to='/tutor/mypage' className='inline-flex h-[38px] items-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
										취소
									</Link>
									{canSave && (
										<button type='submit' disabled={saving} className='inline-flex h-[38px] items-center rounded-md bg-[#4f46e5] px-5 text-sm font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-50'>
											{saving ? '저장 중...' : '저장'}
										</button>
									)}
								</div>
							</form>
						</main>
					</div>
				</div>
			</section>
		</Layout>
	)
}

const Input = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }) => (
	<label className='block'>
		<span className='mb-1 block text-sm font-semibold text-slate-700'>{label}</span>
		<input
			type={type}
			name={name}
			value={value}
			onChange={onChange}
			required={required}
			placeholder={placeholder}
			className='h-[38px] w-full rounded-md border border-[#ced4da] px-3 text-sm text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-[rgba(79,70,229,0.15)]'
		/>
	</label>
)
const TextArea = ({ label, name, value, onChange, rows = 3, placeholder = '' }) => (
	<label className='block'>
		<span className='mb-1 block text-sm font-semibold text-slate-700'>{label}</span>
		<textarea
			name={name}
			value={value}
			onChange={onChange}
			rows={rows}
			placeholder={placeholder}
			className='w-full resize-y rounded-md border border-[#ced4da] px-3 py-2 text-sm text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-[rgba(79,70,229,0.15)]'
		/>
	</label>
)
const Select = ({ label, name, value, onChange, options, placeholder }) => (
	<label className='block'>
		<span className='mb-1 block text-sm font-semibold text-slate-700'>{label}</span>
		<select
			name={name}
			value={value}
			onChange={onChange}
			className='h-[38px] w-full rounded-md border border-[#ced4da] bg-white px-3 text-sm text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-[rgba(79,70,229,0.15)]'
		>
			<option value=''>{placeholder}</option>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	</label>
)

const EmptyState = ({ text }) => (
	<div className='profile-edit-empty rounded-[12px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500'>
		{text}
	</div>
)

const SectionLoading = ({ text }) => (
	<div className='flex items-center gap-3 rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500'>
		<div className='h-5 w-5 animate-spin rounded-full border-2 border-[#4f46e5] border-t-transparent' />
		<span>{text}</span>
	</div>
)

const PendingFileList = ({ files, onRemove }) => {
  if (!files.length) return null

  return (
    <div className='mt-4 space-y-2'>
      {files.map((file, index) => (
        <div key={`${file.name}-${index}`} className='profile-edit-file-card profile-edit-file-card--pending flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-3'>
          <div>
            <div className='font-semibold text-slate-900'>{file.name}</div>
            <div className='mt-1 text-xs text-slate-500'>{formatBytes(file.size)}</div>
          </div>
          <button type='button' onClick={() => onRemove(index)} className='profile-edit-remove-btn text-sm font-semibold text-red-500'>
            {'제거'}
          </button>
        </div>
      ))}
    </div>
  )
}

const ExistingDocumentList = ({ items }) => {
  if (!items.length) return null

  return (
    <div className='mt-4 space-y-2'>
      {items.map((doc) => (
        <div key={doc.id || doc.no} className='profile-edit-file-card flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-3'>
          <div>
            <a href={doc.filePath} target='_blank' rel='noreferrer' className='font-semibold text-[#4f46e5] hover:underline'>
              {doc.originalName}
            </a>
            <div className='mt-1 text-xs text-slate-500'>
              {getDocumentStatus(doc)} {'·'} {formatBytes(doc.fileSize)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TutorProfileEdit


