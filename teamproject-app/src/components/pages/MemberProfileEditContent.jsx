import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Check, Info, Lock, User } from 'lucide-react'
import Layout from '../common/Layout'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'

const PASSWORD_RULE = /^(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/

const resolveSection = (value) => (value === 'security' ? 'security' : 'basic')

const MemberProfileEdit = () => {
	const { isLoading: authLoading, isLogin, hasRole, refreshUser } = useAuth()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()

	const [profile, setProfile] = useState({
		loginId: '',
		username: '',
		nickname: '',
		name: '',
		email: '',
		profileImg: '',
	})
	const [previewImg, setPreviewImg] = useState('')
	const [selectedFile, setSelectedFile] = useState(null)
	const previewObjectUrlRef = useRef('')

	const [activeSection, setActiveSection] = useState(resolveSection(searchParams.get('section')))
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
	const [securityVerified, setSecurityVerified] = useState(false)

	const [loading, setLoading] = useState(true)
	const [verifying, setVerifying] = useState(false)
	const [savingBasic, setSavingBasic] = useState(false)
	const [savingSecurity, setSavingSecurity] = useState(false)

	const [verifyError, setVerifyError] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const canAccess = hasRole('ROLE_USER') || hasRole('ROLE_ADMIN')

	const clearFeedback = () => {
		setError('')
		setSuccess('')
	}

	const syncSection = useCallback((nextSection) => {
		const safeSection = resolveSection(nextSection)
		setActiveSection(safeSection)
		setSearchParams({ section: safeSection }, { replace: true })
		clearFeedback()
	}, [setSearchParams])

	const loadProfile = useCallback(async () => {
		setLoading(true)
		clearFeedback()
		try {
			const response = await api.get('/users/me')
			const user = response.data?.data || {}
			const userProfile = {
				loginId: user.username || '',
				username: user.username || '',
				nickname: user.nickname || '',
				name: user.name || '',
				email: user.email || '',
				profileImg: user.profileImg || '',
			}
			setProfile(userProfile)
			if (previewObjectUrlRef.current) {
				URL.revokeObjectURL(previewObjectUrlRef.current)
				previewObjectUrlRef.current = ''
			}
			setPreviewImg(userProfile.profileImg)
		} catch {
			setError('회원 정보를 불러오지 못했습니다.')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		const sectionFromQuery = resolveSection(searchParams.get('section'))
		setActiveSection(sectionFromQuery)
	}, [searchParams])

	useEffect(() => {
		if (authLoading) return
		if (!isLogin) {
			setLoading(false)
			return
		}
		loadProfile()
	}, [authLoading, isLogin, loadProfile])

	useEffect(() => () => {
		if (previewObjectUrlRef.current) {
			URL.revokeObjectURL(previewObjectUrlRef.current)
		}
	}, [])

	const handleImageChange = (event) => {
		const file = event.target.files?.[0]
		if (!file) return
		if (previewObjectUrlRef.current) {
			URL.revokeObjectURL(previewObjectUrlRef.current)
		}
		const nextPreview = URL.createObjectURL(file)
		previewObjectUrlRef.current = nextPreview
		setSelectedFile(file)
		setPreviewImg(nextPreview)
	}

	const handleBasicSave = async () => {
		clearFeedback()
		if (!profile.name.trim()) {
			setError('이름을 입력해 주세요.')
			return
		}

		setSavingBasic(true)
		try {
			const formData = new FormData()
			formData.set('name', profile.name.trim())
			if (selectedFile) {
				formData.set('profileImg', selectedFile)
			}

			await api.put('/users', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			await refreshUser().catch(() => null)
			setSelectedFile(null)
			setSuccess('기본 정보가 저장되었습니다.')
			await loadProfile()
		} catch (err) {
			setError(err?.response?.data?.message || '기본 정보 저장에 실패했습니다.')
		} finally {
			setSavingBasic(false)
		}
	}

	const handleVerifyCurrentPassword = async () => {
		setVerifyError('')
		clearFeedback()

		if (!profile.loginId) {
			setVerifyError('아이디 정보를 불러올 수 없습니다.')
			return
		}
		if (!currentPassword.trim()) {
			setVerifyError('현재 비밀번호를 입력하세요.')
			return
		}

		setVerifying(true)
		try {
			const response = await api.post('/auth/login', {
				username: profile.loginId,
				password: currentPassword,
				rememberMe: false,
			})
			const payload = response.data
			const isSuccess = payload?.success === true
			if (!isSuccess) {
				setVerifyError(payload?.message || '비밀번호가 올바르지 않습니다.')
				return
			}
			setSecurityVerified(true)
			setVerifyError('')
			setSuccess('현재 비밀번호 확인이 완료되었습니다.')
		} catch (err) {
			setVerifyError(err?.response?.data?.message || '비밀번호가 올바르지 않습니다.')
		} finally {
			setVerifying(false)
		}
	}

	const handleSecuritySave = async () => {
		clearFeedback()

		if (!securityVerified) {
			setError('현재 비밀번호를 먼저 확인해주세요.')
			return
		}
		if (!newPassword) {
			setError('새 비밀번호를 입력해 주세요.')
			return
		}
		if (currentPassword === newPassword) {
			setError('현재 비밀번호와 같습니다.')
			return
		}
		if (newPassword !== newPasswordConfirm) {
			setError('비밀번호가 일치하지 않습니다.')
			return
		}
		if (!PASSWORD_RULE.test(newPassword)) {
			setError('비밀번호는 6자 이상이며 특수문자를 1개 이상 포함해야 합니다.')
			return
		}

		setSavingSecurity(true)
		try {
			const formData = new FormData()
			formData.set('password', newPassword)
			formData.set('passwordConfirm', newPasswordConfirm)

			await api.put('/users', formData)
			setSuccess('비밀번호가 변경되었습니다.')
			setNewPassword('')
			setNewPasswordConfirm('')
			setTimeout(() => navigate('/member/mypage'), 500)
		} catch (err) {
			setError(err?.response?.data?.message || '보안 설정 저장에 실패했습니다.')
		} finally {
			setSavingSecurity(false)
		}
	}

	const sidebarDisplayName = useMemo(() => profile.name || '회원', [profile.name])
	const sidebarLoginId = useMemo(() => profile.loginId || '아이디', [profile.loginId])
	const sectionButtonClass = (section) => {
		if (activeSection === section) {
			return 'flex w-full items-center rounded-xl bg-[#2563eb] px-[14px] py-3 text-left text-[15px] font-semibold text-white'
		}
		return 'flex w-full items-center rounded-xl px-[14px] py-3 text-left text-[15px] font-medium text-[#334155] transition hover:bg-[#f1f5f9]'
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

	if (!canAccess) {
		return (
			<Layout>
				<div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
					<h2 className='text-2xl font-bold text-slate-900'>접근 권한이 없습니다</h2>
					<Link to='/tutor/mypage' className='rounded-xl bg-slate-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800'>튜터 마이페이지</Link>
				</div>
			</Layout>
		)
	}

	return (
		<Layout>
			<section className='bg-[#f8fafc] py-6'>
				<div className='mx-auto max-w-[1140px] px-3'>
					<div className='mb-4 flex items-end justify-between'>
						<div>
							<h2 className='mb-1 text-[2rem] font-bold text-slate-900'>프로필 수정</h2>
							<div className='text-sm text-[#64748b]'>회원 정보를 수정하세요</div>
						</div>
						<Link to='/member/mypage' className='inline-flex items-center gap-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50'>
							<ArrowLeft className='h-4 w-4' strokeWidth={2} />
							마이페이지로
						</Link>
					</div>

					<div className='flex flex-col gap-6 lg:flex-row'>
						<aside className='w-full lg:sticky lg:top-[90px] lg:h-fit lg:w-[280px] lg:flex-none'>
							<div className='rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm'>
								<div className='flex items-center gap-3 px-1 pb-3'>
									<div className='flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full bg-sky-500 text-white'>
										{previewImg ? (
											<img src={previewImg} alt='프로필' className='h-full w-full object-cover' />
										) : (
											<span className='text-2xl'>👤</span>
										)}
									</div>
									<div>
										<div className='font-bold text-slate-900'>{sidebarDisplayName}</div>
										<div className='text-sm text-[#64748b]'>{sidebarLoginId}</div>
									</div>
								</div>

								<div className='my-2 h-px bg-[#e5e7eb]' />

								<div className='space-y-1'>
									<button type='button' className={sectionButtonClass('basic')} onClick={() => syncSection('basic')}>
										<User className='mr-2 h-4 w-4' strokeWidth={2} />
										기본 정보
									</button>
									<button type='button' className={sectionButtonClass('security')} onClick={() => syncSection('security')}>
										<Lock className='mr-2 h-4 w-4' strokeWidth={2} />
										보안
									</button>
								</div>
							</div>

							<div className='mt-3 rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm'>
								<div className='flex items-start gap-1.5 text-sm text-[#64748b]'>
									<Info className='mt-0.5 h-4 w-4 shrink-0' strokeWidth={2} />
									<span>정보 수정 후 각 섹션의 저장 버튼을 눌러주세요.</span>
								</div>
							</div>
						</aside>

						<main className='flex-1'>
							{activeSection === 'basic' ? (
								<>
									<div className='rounded-2xl border border-[#e5e7eb] bg-white p-7 shadow-sm'>
										<div className='mb-1 text-base font-extrabold text-slate-900'>기본 정보</div>
										<div className='mb-3 text-[0.85rem] text-[#64748b]'>이름, 프로필 이미지를 수정하세요</div>

										<div className='mb-3 rounded-[14px] border border-[#e5e7eb] bg-white p-4'>
											<div className='grid gap-3 md:grid-cols-2'>
												<label className='block'>
													<span className='mb-2 block text-sm font-semibold text-[#334155]'>이메일</span>
													<input
														type='text'
														value={profile.username}
														disabled
														className='w-full rounded-xl border border-[#e5e7eb] bg-slate-50 px-3 py-2 text-sm text-slate-500'
													/>
												</label>
												<label className='block'>
													<span className='mb-2 block text-sm font-semibold text-[#334155]'>닉네임</span>
													<input
														type='text'
														value={profile.nickname}
														disabled
														className='w-full rounded-xl border border-[#e5e7eb] bg-slate-50 px-3 py-2 text-sm text-slate-500'
													/>
												</label>
											</div>
										</div>

										<div className='mb-3 rounded-[14px] border border-[#e5e7eb] bg-white p-4'>
											<label className='block'>
												<span className='mb-2 block text-sm font-semibold text-[#334155]'>이름 <span className='text-red-500'>*</span></span>
												<input
													type='text'
													value={profile.name}
													onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
													className='w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm text-slate-800 focus:border-[rgba(37,99,235,0.55)] focus:outline-none focus:ring-4 focus:ring-[rgba(37,99,235,0.15)]'
													required
												/>
											</label>
										</div>

										<div className='rounded-[14px] border border-[#e5e7eb] bg-white p-4'>
											<div className='mb-2 text-sm font-semibold text-slate-900'>프로필 이미지</div>
											<div className='flex flex-wrap items-center gap-3'>
												<div className='flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-sky-500 text-white'>
													{previewImg ? (
														<img src={previewImg} alt='프로필 미리보기' className='h-full w-full object-cover' />
													) : (
														<span className='text-[2rem] leading-none'>👤</span>
													)}
												</div>
												<div className='flex-1'>
													<div className='flex flex-wrap items-center justify-between gap-2'>
														<div>
															<div className='text-sm font-semibold text-slate-900'>파일 업로드</div>
															<div className='text-xs text-[#64748b]'>JPG, PNG 가능 · 최대 5MB</div>
														</div>
														<label htmlFor='editProfileImg' className='inline-flex cursor-pointer items-center rounded-full border border-[#93c5fd] px-4 py-1.5 text-xs font-semibold text-[#2563eb] transition hover:bg-[#eff6ff]'>
															파일 선택
														</label>
														<input id='editProfileImg' type='file' accept='image/*' onChange={handleImageChange} className='hidden' />
													</div>
												</div>
											</div>
										</div>
									</div>

									{error && <p className='mt-3 text-sm font-semibold text-red-500'>{error}</p>}
									{success && <p className='mt-3 text-sm font-semibold text-emerald-600'>{success}</p>}

									<div className='mt-4 flex justify-end'>
										<button
											type='button'
											onClick={handleBasicSave}
											disabled={savingBasic}
											className='inline-flex h-[38px] items-center rounded-full bg-[#2563eb] px-4 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60'
										>
											<Check className='mr-1 h-4 w-4' strokeWidth={2.5} />
											{savingBasic ? '저장 중...' : '기본 정보 저장'}
										</button>
									</div>
								</>
							) : (
								<>
									<div className='rounded-2xl border border-[#e5e7eb] bg-white p-7 shadow-sm'>
										<div className='mb-1 text-base font-extrabold text-slate-900'>보안</div>
										<div className='mb-3 text-[0.85rem] text-[#64748b]'>비밀번호를 변경하세요</div>

										{!securityVerified && (
											<div className='rounded-[14px] border border-[#e5e7eb] bg-white p-4'>
												<div className='mb-3 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2 text-sm text-[#1e40af]'>
													<Info className='mr-1 inline h-4 w-4' strokeWidth={2} />
													보안 탭 접근을 위해 현재 비밀번호를 확인합니다.
												</div>
												<div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_180px] md:items-end'>
													<label className='block'>
														<span className='mb-2 block text-sm font-semibold text-[#334155]'>현재 비밀번호</span>
														<input
															type='password'
															value={currentPassword}
															onChange={(event) => {
																setCurrentPassword(event.target.value)
																if (verifyError) setVerifyError('')
															}}
															placeholder='현재 비밀번호 입력'
															className='w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[rgba(37,99,235,0.55)] focus:outline-none focus:ring-4 focus:ring-[rgba(37,99,235,0.15)]'
														/>
													</label>
													<button
														type='button'
														onClick={handleVerifyCurrentPassword}
														disabled={verifying}
														className='inline-flex h-[38px] w-full items-center justify-center rounded-full border border-[#93c5fd] px-4 text-sm font-semibold text-[#2563eb] transition hover:bg-[#eff6ff] disabled:cursor-not-allowed disabled:opacity-70'
													>
														{verifying ? '확인 중...' : '확인'}
													</button>
												</div>
												{verifyError && <div className='mt-2 text-sm text-red-500'>{verifyError}</div>}
											</div>
										)}

										{securityVerified && (
											<div className='rounded-[14px] border border-[#e5e7eb] bg-white p-4'>
												<div className='mb-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-sm text-[#92400e]'>
													<div><AlertTriangle className='mr-1 inline h-4 w-4' strokeWidth={2} />비밀번호 변경 시에만 입력하세요. 빈칸으로 두면 기존 비밀번호가 유지됩니다.</div>
													<div><AlertTriangle className='mr-1 inline h-4 w-4' strokeWidth={2} />비밀번호는 6자 이상이며 특수문자를 1개 이상 포함해야 합니다.</div>
												</div>
												<div className='grid gap-3 md:grid-cols-2'>
													<label className='block'>
														<span className='mb-2 block text-sm font-semibold text-[#334155]'>새 비밀번호</span>
														<input
															type='password'
															value={newPassword}
															onChange={(event) => setNewPassword(event.target.value)}
															placeholder='변경 시에만 입력'
															className='w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[rgba(37,99,235,0.55)] focus:outline-none focus:ring-4 focus:ring-[rgba(37,99,235,0.15)]'
														/>
													</label>
													<label className='block'>
														<span className='mb-2 block text-sm font-semibold text-[#334155]'>비밀번호 확인</span>
														<input
															type='password'
															value={newPasswordConfirm}
															onChange={(event) => setNewPasswordConfirm(event.target.value)}
															placeholder='비밀번호 확인'
															className='w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[rgba(37,99,235,0.55)] focus:outline-none focus:ring-4 focus:ring-[rgba(37,99,235,0.15)]'
														/>
													</label>
												</div>
											</div>
										)}
									</div>

									{error && <p className='mt-3 text-sm font-semibold text-red-500'>{error}</p>}
									{success && <p className='mt-3 text-sm font-semibold text-emerald-600'>{success}</p>}

									<div className='mt-4 flex justify-end'>
										<button
											type='button'
											onClick={handleSecuritySave}
											disabled={savingSecurity}
											className='inline-flex h-[38px] items-center rounded-full bg-[#2563eb] px-4 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60'
										>
											<Check className='mr-1 h-4 w-4' strokeWidth={2.5} />
											{savingSecurity ? '변경 중...' : '비밀번호 변경'}
										</button>
									</div>
								</>
							)}
						</main>
					</div>
				</div>
			</section>
		</Layout>
	)
}

export default MemberProfileEdit
