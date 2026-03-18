import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../common/Layout'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'

const SECTION_ITEMS = [
	{ key: 'basic', label: '기본 정보' },
	{ key: 'profile', label: '프로필' },
	{ key: 'employment', label: '근무경력' },
	{ key: 'account', label: '계좌 정보' },
	{ key: 'documents', label: '서류 업로드' },
	{ key: 'lessons', label: '수업관리' },
	{ key: 'schedule', label: '스케줄 관리' },
	{ key: 'zoom', label: 'Zoom 연동' },
	{ key: 'security', label: '보안' },
]

const SAVABLE_SECTIONS = new Set(['basic', 'profile', 'account', 'zoom', 'security'])

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

const isValidSectionKey = (value) => SECTION_ITEMS.some((item) => item.key === value)

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

	const sectionMeta = useMemo(() => {
		switch (activeSection) {
			case 'basic':
				return { title: '기본 정보', desc: '이름, 연락처, 프로필 사진을 수정합니다.' }
			case 'profile':
				return { title: '프로필', desc: '튜터 소개와 영상 정보를 관리합니다.' }
			case 'employment':
				return { title: '근무경력', desc: '근무/학력/자격 정보 영역입니다.' }
			case 'account':
				return { title: '계좌 정보', desc: '정산을 위한 계좌 정보를 수정합니다.' }
			case 'documents':
				return { title: '서류 업로드', desc: '증빙 서류 업로드 영역입니다.' }
			case 'lessons':
				return { title: '수업관리', desc: '수업 관련 설정을 관리합니다.' }
			case 'schedule':
				return { title: '스케줄 관리', desc: '가용 시간/예약 스케줄을 관리합니다.' }
			case 'zoom':
				return { title: 'Zoom 연동', desc: '기본 Zoom URL을 설정합니다.' }
			case 'security':
				return { title: '보안', desc: '비밀번호를 변경합니다.' }
			default:
				return { title: '프로필 수정', desc: '' }
		}
	}, [activeSection])

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

	const handleImageChange = (event) => {
		const file = event.target.files?.[0]
		if (!file) return
		setSelectedFile(file)
		setPreviewImg((prev) => {
			if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
			return URL.createObjectURL(file)
		})
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setSuccess('')

		if (!SAVABLE_SECTIONS.has(activeSection)) return

		if (activeSection === 'security' && form.password !== form.passwordConfirm) {
			setError('비밀번호 확인이 일치하지 않습니다.')
			return
		}

		setSaving(true)
		try {
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
			}
			if (selectedFile) {
				body.append('profileImg', selectedFile)
			}

			await api.put('/tutors', body, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			await refreshUser()
			setSuccess('저장되었습니다.')
			setForm((prev) => ({ ...prev, password: '', passwordConfirm: '' }))
		} catch (submitError) {
			setError(submitError?.response?.data?.message || '저장에 실패했습니다.')
		} finally {
			setSaving(false)
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
	const canSave = SAVABLE_SECTIONS.has(activeSection)

	return (
		<Layout>
			<section className='bg-[#f8fafc] py-6'>
				<div className='mx-auto w-full max-w-[1140px] px-3'>
					<div className='mb-4 flex items-end justify-between'>
						<div>
							<h2 className='mb-1 text-[1.75rem] font-bold text-slate-900'>프로필 수정</h2>
							<div className='text-sm text-slate-500'>튜터 정보를 수정하세요</div>
						</div>
						<Link to='/tutor/mypage' className='inline-flex h-[31px] items-center rounded-full border border-slate-300 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50'>
							마이페이지로
						</Link>
					</div>

					<div className='grid gap-6 lg:grid-cols-[280px_1fr]'>
						<aside className='lg:sticky lg:top-[90px] lg:h-fit'>
							<div className='rounded-[16px] border border-[#e5e7eb] bg-white p-4 shadow-sm'>
								<div className='mb-3 flex items-center gap-3'>
									<div className='flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full bg-[#4f46e5] text-xl font-bold text-white'>
										{previewImg ? (
											<img src={previewImg} alt='프로필' className='h-full w-full object-cover' />
										) : profileInitial}
									</div>
									<div>
										<div className='font-bold text-slate-900'>{sidebarName}</div>
										<div className='text-xs text-slate-500'>{sidebarLoginId}</div>
									</div>
								</div>

								<div className='my-3 h-px bg-slate-200' />

								<div className='grid gap-1.5'>
									{SECTION_ITEMS.map((item) => (
										<button
											key={item.key}
											type='button'
											onClick={() => handleSectionChange(item.key)}
											className={`rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${activeSection === item.key ? 'bg-[#4f46e5] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
										>
											{item.label}
										</button>
									))}
								</div>
							</div>

							<div className='mt-3 rounded-[16px] border border-[#e5e7eb] bg-white p-3 text-xs text-slate-500 shadow-sm'>
								정보 수정 후 각 섹션의 저장 버튼을 눌러 주세요.
							</div>
						</aside>

						<main>
							<form onSubmit={handleSubmit} className='space-y-4 rounded-[16px] border border-[#e5e7eb] bg-white p-6 shadow-sm'>
								<div>
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
									<div className='grid gap-3'>
										<Input label='기본 Zoom URL' name='defaultZoomUrl' value={form.defaultZoomUrl} onChange={handleChange} />
									</div>
								)}

								{activeSection === 'security' && (
									<div className='rounded-[14px] border border-slate-200 bg-slate-50 p-4'>
										<p className='mb-3 text-sm font-semibold text-slate-700'>새 비밀번호를 입력하면 변경됩니다.</p>
										<div className='grid gap-3 md:grid-cols-2'>
											<Input label='새 비밀번호' name='password' type='password' value={form.password} onChange={handleChange} />
											<Input label='비밀번호 확인' name='passwordConfirm' type='password' value={form.passwordConfirm} onChange={handleChange} />
										</div>
									</div>
								)}

								{activeSection === 'employment' && (
									<PlaceholderPanel
										title='근무경력/학력/자격 섹션'
										description='원본과 동일한 카드/추가/삭제 UI는 다음 단계에서 연결합니다.'
									/>
								)}

								{activeSection === 'documents' && (
									<PlaceholderPanel
										title='서류 업로드 섹션'
										description='원본처럼 교육/학위/자격증 파일 업로드 UI를 다음 단계에서 연결합니다.'
									/>
								)}

								{activeSection === 'lessons' && (
									<PlaceholderPanel
										title='수업관리 섹션'
										description='수업 관리 상세 편집 항목을 원본 흐름대로 이어서 맞출 예정입니다.'
									/>
								)}

								{activeSection === 'schedule' && (
									<div className='rounded-[14px] border border-slate-200 bg-slate-50 p-4'>
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
									<button
										type='submit'
										disabled={saving || !canSave}
										className='inline-flex h-[38px] items-center rounded-md bg-[#4f46e5] px-5 text-sm font-semibold text-white hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-50'
									>
										{saving ? '저장 중...' : '저장'}
									</button>
								</div>
							</form>
						</main>
					</div>
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
			className='h-[38px] w-full rounded-md border border-[#ced4da] px-3 text-sm text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-[rgba(79,70,229,0.15)]'
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
			className='w-full resize-y rounded-md border border-[#ced4da] px-3 py-2 text-sm text-slate-800 focus:border-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-[rgba(79,70,229,0.15)]'
		/>
	</label>
)

const PlaceholderPanel = ({ title, description }) => (
	<div className='rounded-[14px] border border-dashed border-slate-300 bg-slate-50 p-4'>
		<div className='text-sm font-semibold text-slate-800'>{title}</div>
		<p className='mt-1 text-sm text-slate-500'>{description}</p>
	</div>
)

export default TutorProfileEdit
