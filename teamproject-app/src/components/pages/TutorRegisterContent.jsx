import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../common/Layout'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'

const initialForm = {
	basicPhone: '',
	headline: '',
	bio: '',
	selfIntro: '',
	videoUrl: '',
	basicBankName: '',
	basicAccountNumber: '',
	basicAccountHolder: '',
	subject: '',
	price: '',
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
	degreeName: '',
	major: '',
}

const TutorRegisterContent = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { isLoading: authLoading, isLogin, hasAnyRole, refreshUser } = useAuth()

	const [form, setForm] = useState(initialForm)
	const [fields, setFields] = useState([])
	const [subjects, setSubjects] = useState([])
	const [selectedFieldIds, setSelectedFieldIds] = useState([])
	const [profileImg, setProfileImg] = useState(null)
	const [careerForm, setCareerForm] = useState(initialCareerForm)
	const [educationForm, setEducationForm] = useState(initialEducationForm)
	const [careers, setCareers] = useState([])
	const [educations, setEducations] = useState([])
	const [degrees, setDegrees] = useState([])
	const [loadingMeta, setLoadingMeta] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const stepMeta = useMemo(() => {
		switch (location.pathname) {
			case '/tutor/register1':
				return {
					step: 2,
					total: 4,
					progress: 50,
					title: '튜터 회원가입 (2/4단계)',
					desc: '학력/경력 입력 화면을 React로 통합해 제공합니다.',
				}
			case '/tutor/register2':
				return {
					step: 3,
					total: 4,
					progress: 75,
					title: '튜터 회원가입 (3/4단계)',
					desc: '수업 카드 및 분야 선택 화면을 React로 통합해 제공합니다.',
				}
			case '/tutor/register3':
				return {
					step: 4,
					total: 4,
					progress: 100,
					title: '튜터 회원가입 (4/4단계)',
					desc: '최종 등록 화면을 React로 통합해 제공합니다.',
				}
			default:
				return {
					step: 1,
					total: 4,
					progress: 25,
					title: '튜터 회원가입 (1/4단계)',
					desc: '기본 정보를 입력하면 바로 튜터 권한이 활성화됩니다.',
				}
		}
	}, [location.pathname])

	useEffect(() => {
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
	}, [])

	const selectedPrimaryField = useMemo(() => {
		if (!selectedFieldIds.length) return null
		return fields.find((item) => item.id === selectedFieldIds[0]) || null
	}, [fields, selectedFieldIds])

	const handleChange = (event) => {
		const { name, value } = event.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const toggleField = (fieldId) => {
		setSelectedFieldIds((prev) => {
			if (prev.includes(fieldId)) {
				return prev.filter((id) => id !== fieldId)
			}
			return [...prev, fieldId]
		})
	}

	const handleImageChange = (event) => {
		const file = event.target.files?.[0]
		if (!file) return
		setProfileImg(file)
	}

	const handleCareerFormChange = (event) => {
		const { name, value } = event.target
		setCareerForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleEducationFormChange = (event) => {
		const { name, value } = event.target
		setEducationForm((prev) => ({ ...prev, [name]: value }))
	}

	const addCareer = () => {
		if (!careerForm.companyName.trim()) return
		setCareers((prev) => ([...prev, { ...careerForm }]))
		setCareerForm(initialCareerForm)
	}

	const removeCareer = (index) => {
		setCareers((prev) => prev.filter((_, i) => i !== index))
	}

	const addEducation = () => {
		if (!educationForm.schoolName.trim()) return
		setEducations((prev) => ([
			...prev,
			{
				schoolName: educationForm.schoolName,
				startYear: educationForm.startYear,
				graduatedYear: educationForm.graduatedYear,
			},
		]))
		setDegrees((prev) => ([
			...prev,
			{
				degreeName: educationForm.degreeName,
				major: educationForm.major,
			},
		]))
		setEducationForm(initialEducationForm)
	}

	const removeEducation = (index) => {
		setEducations((prev) => prev.filter((_, i) => i !== index))
		setDegrees((prev) => prev.filter((_, i) => i !== index))
	}

	const buildLessonCardsJson = () => {
		if (!form.subject || !form.price || !selectedPrimaryField) {
			return '[]'
		}

		const price = Number(form.price)
		if (Number.isNaN(price) || price <= 0) {
			return '[]'
		}

		return JSON.stringify([
			{
				subject: form.subject,
				field: selectedPrimaryField.name,
				fieldId: selectedPrimaryField.id,
				price,
			},
		])
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setSuccess('')

		if (!form.basicPhone.trim()) {
			setError('연락처를 입력해 주세요.')
			return
		}

		if (!selectedFieldIds.length) {
			setError('최소 1개 이상의 언어 분야를 선택해 주세요.')
			return
		}

		setSubmitting(true)
		try {
			const careersPayload = careers.map((item) => ({
				companyName: item.companyName,
				jobCategory: item.jobCategory,
				jobRole: item.jobRole,
				startYear: item.startYear ? Number(item.startYear) : null,
				endYear: item.endYear ? Number(item.endYear) : null,
			}))
			const educationsPayload = educations.map((item) => ({
				schoolName: item.schoolName,
				startYear: item.startYear ? Number(item.startYear) : null,
				graduatedYear: item.graduatedYear ? Number(item.graduatedYear) : null,
			}))
			const degreesPayload = degrees.map((item) => ({
				degreeName: item.degreeName,
				major: item.major,
			}))

			const body = new FormData()
			body.append('basicPhone', form.basicPhone)
			body.append('headline', form.headline)
			body.append('bio', form.bio)
			body.append('selfIntro', form.selfIntro)
			body.append('videoUrl', form.videoUrl)
			body.append('basicBankName', form.basicBankName)
			body.append('basicAccountNumber', form.basicAccountNumber)
			body.append('basicAccountHolder', form.basicAccountHolder)
			body.append('careersJson', JSON.stringify(careersPayload))
			body.append('educationsJson', JSON.stringify(educationsPayload))
			body.append('degreesJson', JSON.stringify(degreesPayload))
			body.append('certificateTextsJson', '[]')
			body.append('lessonCardsJson', buildLessonCardsJson())
			selectedFieldIds.forEach((fieldId) => body.append('fieldIds', fieldId))
			if (profileImg) {
				body.append('profileImg', profileImg)
			}

			await api.post('/tutors/profile', body, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			await refreshUser().catch(() => null)
			setSuccess('튜터 등록이 완료되었습니다.')
			setTimeout(() => navigate('/tutor/mypage'), 700)
		} catch (err) {
			setError(err?.response?.data?.message || '튜터 등록에 실패했습니다.')
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
				<div className='mx-auto max-w-4xl'>
					<div className='mb-6'>
						<h1 className='text-3xl font-extrabold text-slate-900'>{stepMeta.title}</h1>
						<p className='mt-2 text-sm text-slate-500'>{stepMeta.desc}</p>
						<div className='mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200'>
							<div
								className='h-full rounded-full bg-[#4f46e5] transition-all'
								style={{ width: `${stepMeta.progress}%` }}
							/>
						</div>
						<p className='mt-2 text-xs font-semibold text-slate-500'>STEP {stepMeta.step} / {stepMeta.total}</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
						<div className='grid gap-4 md:grid-cols-2'>
							<Input label='연락처' name='basicPhone' value={form.basicPhone} onChange={handleChange} required />
							<Input label='한 줄 소개' name='headline' value={form.headline} onChange={handleChange} />
							<Input label='영상 URL' name='videoUrl' value={form.videoUrl} onChange={handleChange} />
							<div>
								<label className='mb-1 block text-sm font-semibold text-slate-700'>프로필 이미지</label>
								<input type='file' accept='image/*' onChange={handleImageChange} className='block w-full text-sm text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700' />
							</div>
						</div>

						<div className='grid gap-4 md:grid-cols-2'>
							<TextArea label='소개' name='bio' value={form.bio} onChange={handleChange} rows={3} />
							<TextArea label='자기소개' name='selfIntro' value={form.selfIntro} onChange={handleChange} rows={3} />
						</div>

						<div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
							<p className='mb-3 text-sm font-semibold text-slate-700'>정산 계좌 정보</p>
							<div className='grid gap-4 md:grid-cols-3'>
								<Input label='은행명' name='basicBankName' value={form.basicBankName} onChange={handleChange} />
								<Input label='계좌번호' name='basicAccountNumber' value={form.basicAccountNumber} onChange={handleChange} />
								<Input label='예금주' name='basicAccountHolder' value={form.basicAccountHolder} onChange={handleChange} />
							</div>
						</div>

						<div className='rounded-xl border border-slate-200 p-4'>
							<p className='mb-2 text-sm font-semibold text-slate-700'>경력 추가 (선택)</p>
							<div className='grid gap-3 md:grid-cols-2'>
								<Input label='회사명' name='companyName' value={careerForm.companyName} onChange={handleCareerFormChange} />
								<Input label='직무 카테고리' name='jobCategory' value={careerForm.jobCategory} onChange={handleCareerFormChange} />
								<Input label='직무명' name='jobRole' value={careerForm.jobRole} onChange={handleCareerFormChange} />
								<div className='grid gap-3 grid-cols-2'>
									<Input label='시작연도' name='startYear' type='number' value={careerForm.startYear} onChange={handleCareerFormChange} />
									<Input label='종료연도' name='endYear' type='number' value={careerForm.endYear} onChange={handleCareerFormChange} />
								</div>
							</div>
							<div className='mt-3 flex justify-end'>
								<button type='button' onClick={addCareer} className='rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>경력 추가</button>
							</div>
							{!!careers.length && (
								<div className='mt-3 space-y-2'>
									{careers.map((item, index) => (
										<div key={`${item.companyName}-${index}`} className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
											<p className='text-sm text-slate-700'>
												{item.companyName}
												{item.jobRole ? ` · ${item.jobRole}` : ''}
												{item.startYear ? ` (${item.startYear}` : ''}
												{item.endYear ? `~${item.endYear})` : item.startYear ? ')' : ''}
											</p>
											<button type='button' onClick={() => removeCareer(index)} className='text-xs font-semibold text-red-500'>삭제</button>
										</div>
									))}
								</div>
							)}
						</div>

						<div className='rounded-xl border border-slate-200 p-4'>
							<p className='mb-2 text-sm font-semibold text-slate-700'>학력/학위 추가 (선택)</p>
							<div className='grid gap-3 md:grid-cols-2'>
								<Input label='학교명' name='schoolName' value={educationForm.schoolName} onChange={handleEducationFormChange} />
								<Input label='학위명' name='degreeName' value={educationForm.degreeName} onChange={handleEducationFormChange} />
								<Input label='전공' name='major' value={educationForm.major} onChange={handleEducationFormChange} />
								<div className='grid gap-3 grid-cols-2'>
									<Input label='입학연도' name='startYear' type='number' value={educationForm.startYear} onChange={handleEducationFormChange} />
									<Input label='졸업연도' name='graduatedYear' type='number' value={educationForm.graduatedYear} onChange={handleEducationFormChange} />
								</div>
							</div>
							<div className='mt-3 flex justify-end'>
								<button type='button' onClick={addEducation} className='rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>학력 추가</button>
							</div>
							{!!educations.length && (
								<div className='mt-3 space-y-2'>
									{educations.map((item, index) => (
										<div key={`${item.schoolName}-${index}`} className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
											<p className='text-sm text-slate-700'>
												{item.schoolName}
												{degrees[index]?.degreeName ? ` · ${degrees[index].degreeName}` : ''}
												{degrees[index]?.major ? ` (${degrees[index].major})` : ''}
											</p>
											<button type='button' onClick={() => removeEducation(index)} className='text-xs font-semibold text-red-500'>삭제</button>
										</div>
									))}
								</div>
							)}
						</div>

						<div>
							<p className='mb-3 text-sm font-semibold text-slate-700'>수업 가능 언어 분야</p>
							<div className='grid gap-2 sm:grid-cols-2 md:grid-cols-3'>
								{fields.map((field) => {
									const checked = selectedFieldIds.includes(field.id)
									return (
										<label key={field.id} className='flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm'>
											<input type='checkbox' checked={checked} onChange={() => toggleField(field.id)} />
											<span>{field.name}</span>
										</label>
									)
								})}
							</div>
						</div>

						<div className='rounded-xl border border-slate-200 p-4'>
							<p className='mb-2 text-sm font-semibold text-slate-700'>대표 수업 카드 (선택)</p>
							<p className='mb-3 text-xs text-slate-500'>과목과 가격을 입력하면 등록 시 첫 수업 카드가 함께 생성됩니다.</p>
							<div className='grid gap-4 md:grid-cols-2'>
								<label className='block'>
									<span className='mb-1 block text-sm font-semibold text-slate-700'>과목</span>
									<select
										name='subject'
										value={form.subject}
										onChange={handleChange}
										className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#4f46e5] focus:outline-none'
									>
										<option value=''>선택 안 함</option>
										{subjects.map((subject) => (
											<option key={subject.id} value={subject.name}>{subject.name}</option>
										))}
									</select>
								</label>
								<Input label='가격(원)' name='price' type='number' value={form.price} onChange={handleChange} />
							</div>
						</div>

						{error && <p className='text-sm font-semibold text-red-500'>{error}</p>}
						{success && <p className='text-sm font-semibold text-emerald-600'>{success}</p>}

						<div className='flex justify-end gap-2'>
							<Link to='/' className='rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>취소</Link>
							<button type='submit' disabled={submitting} className='rounded-xl bg-[#4f46e5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'>
								{submitting ? '등록 중...' : '튜터 등록하기'}
							</button>
						</div>
					</form>
				</div>
			</section>
		</Layout>
	)
}

const Input = ({ label, name, value, onChange, type = 'text', required = false }) => (
	<label className='block'>
		<span className='mb-1 block text-sm font-semibold text-slate-700'>{label}</span>
		<input
			type={type}
			name={name}
			value={value}
			onChange={onChange}
			required={required}
			className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#4f46e5] focus:outline-none'
		/>
	</label>
)

const TextArea = ({ label, name, value, onChange, rows = 3 }) => (
	<label className='block'>
		<span className='mb-1 block text-sm font-semibold text-slate-700'>{label}</span>
		<textarea
			name={name}
			value={value}
			onChange={onChange}
			rows={rows}
			className='w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#4f46e5] focus:outline-none'
		/>
	</label>
)

export default TutorRegisterContent
