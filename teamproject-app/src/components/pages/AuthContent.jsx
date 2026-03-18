import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../common/Layout'
import useAuth from '../../utils/hooks/useAuth'
import api from '../../services/api'
import naverLogo from '../../assets/image/guide/naver.png'

const initialSignupState = {
	username: '',
	nickname: '',
	name: '',
	password: '',
	passwordCheck: '',
	role: 'ROLE_USER',
}

const Auth = ({ initialTab = 'login' }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const { login, isLoading } = useAuth()
	const [activeTab, setActiveTab] = useState(initialTab)
	const [loginForm, setLoginForm] = useState({ username: '', password: '', rememberMe: false, rememberId: false })
	const [signupForm, setSignupForm] = useState(initialSignupState)
	const [checkedState, setCheckedState] = useState({ username: false, nickname: false })
	const [fieldErrors, setFieldErrors] = useState({})
	const [authError, setAuthError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		const tabFromQuery = new URLSearchParams(location.search).get('tab')
		if (tabFromQuery === 'signup') {
			setActiveTab('signup')
			return
		}
		setActiveTab(initialTab)
	}, [initialTab, location.search])

	useEffect(() => {
		const rememberedUsername = localStorage.getItem('rememberedUsername')
		if (rememberedUsername) {
			setLoginForm((prev) => ({
				...prev,
				username: rememberedUsername,
				rememberId: true,
			}))
		}
	}, [])

	const updateLoginField = (event) => {
		const { name, type, checked, value } = event.target
		setLoginForm((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}))
	}

	const updateSignupField = (event) => {
		const { name, value } = event.target
		setSignupForm((prev) => ({
			...prev,
			[name]: value,
		}))
		if (name === 'username' || name === 'nickname') {
			setCheckedState((prev) => ({ ...prev, [name]: false }))
		}
		setFieldErrors((prev) => ({ ...prev, [name]: '' }))
	}

	const validateFields = async (fields) => {
		const response = await api.post(`/users/validate?fields=${fields.join(',')}`, signupForm)
		const data = response.data
		const errors = data?.data || {}
		setFieldErrors((prev) => ({ ...prev, ...errors }))
		return errors
	}

	const checkDuplicate = async (type) => {
		const value = signupForm[type]
		if (!value.trim()) {
			setFieldErrors((prev) => ({ ...prev, [type]: `${type === 'username' ? '아이디' : '닉네임'}를 입력해주세요.` }))
			return false
		}

		const validationErrors = await validateFields([type])
		if (validationErrors[type]) {
			setCheckedState((prev) => ({ ...prev, [type]: false }))
			return false
		}

		const endpoint = type === 'username'
			? `/users/check-username?username=${encodeURIComponent(value)}`
			: `/users/check-nickname?nickname=${encodeURIComponent(value)}`

		try {
			const response = await api.get(endpoint)
			const available = response.data?.data === true
			setCheckedState((prev) => ({ ...prev, [type]: available }))
			setFieldErrors((prev) => ({
				...prev,
				[type]: available
					? `사용 가능한 ${type === 'username' ? '아이디' : '닉네임'}입니다.`
					: `이미 존재하는 ${type === 'username' ? '아이디' : '닉네임'}입니다.`
			}))
			return available
		} catch {
			setCheckedState((prev) => ({ ...prev, [type]: false }))
			setFieldErrors((prev) => ({
				...prev,
				[type]: `${type === 'username' ? '아이디' : '닉네임'} 중복 확인 중 오류가 발생했습니다.`,
			}))
			return false
		}
	}

	const handleLogin = async (event) => {
		event.preventDefault()
		setAuthError('')
		setIsSubmitting(true)

		try {
			await login(loginForm.username, loginForm.password, loginForm.rememberMe)
			if (loginForm.rememberId) {
				localStorage.setItem('rememberedUsername', loginForm.username)
			} else {
				localStorage.removeItem('rememberedUsername')
			}
		} catch (error) {
			setAuthError(error.response?.data?.message || error.message || '로그인에 실패했습니다.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleSignup = async (event) => {
		event.preventDefault()
		setAuthError('')
		setIsSubmitting(true)

		if (!checkedState.username || !checkedState.nickname) {
			setAuthError('아이디와 닉네임 중복 확인을 완료해주세요.')
			setIsSubmitting(false)
			return
		}

		const errors = await validateFields(['username', 'nickname', 'name', 'password', 'passwordCheck'])
		if (Object.keys(errors).filter((key) => errors[key]).length > 0) {
			setIsSubmitting(false)
			return
		}

		try {
			const signupResponse = await api.post('/users', signupForm)
			if (signupResponse.data?.success === false) {
				setAuthError(signupResponse.data?.message || '회원가입에 실패했습니다.')
				setIsSubmitting(false)
				return
			}

			await login(signupForm.username, signupForm.password, false)
			navigate(signupForm.role === 'ROLE_TUTOR' ? '/tutor/register' : '/')
		} catch (error) {
			setAuthError(error.response?.data?.message || error.message || '회원가입에 실패했습니다.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const isTutorMode = signupForm.role === 'ROLE_TUTOR'
	const loginWithGoogle = () => { window.location.href = '/oauth2/authorization/google' }
	const loginWithNaver = () => { window.location.href = '/oauth2/authorization/naver' }
	const loginWithKakao = () => { window.location.href = '/oauth2/authorization/kakao' }

	return (
		<Layout>
			<section className='bg-[#f8fafc] py-12'>
				<div className='mx-auto max-w-[1140px] px-3'>
					<div className='mb-4 text-center'>
						<h2 className='mb-1 text-[1.75rem] font-bold text-slate-900'>로그인 / 회원가입</h2>
						<p className='mb-0 text-[#6c757d]'>튜터링고에서 학습을 시작하세요</p>
					</div>

					<div className='mb-4 flex justify-center gap-2'>
						<button
							type='button'
							onClick={() => setSignupForm((prev) => ({ ...prev, role: 'ROLE_USER' }))}
							className={`inline-flex h-[38px] items-center justify-center rounded-md border px-4 text-sm font-normal transition ${!isTutorMode ? 'border-[#4f46e5] bg-[#4f46e5] text-white' : 'border-[#4f46e5] bg-white text-[#4f46e5] hover:bg-indigo-50'}`}
						>
							학생으로 시작
						</button>
						<button
							type='button'
							onClick={() => setSignupForm((prev) => ({ ...prev, role: 'ROLE_TUTOR' }))}
							className={`inline-flex h-[38px] items-center justify-center rounded-md border px-4 text-sm font-normal transition ${isTutorMode ? 'border-[#4f46e5] bg-[#4f46e5] text-white' : 'border-[#4f46e5] bg-white text-[#4f46e5] hover:bg-indigo-50'}`}
						>
							튜터로 시작
						</button>
					</div>

					<div className='mx-auto max-w-[520px] rounded-md border border-black/15 bg-white p-4 shadow-[0_.125rem_.25rem_rgba(0,0,0,0.075)]'>
						<div className='flex border-b border-slate-200'>
							<button
								type='button'
								onClick={() => setActiveTab('login')}
								className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === 'login' ? 'border-[#4f46e5] text-[#4f46e5]' : 'border-transparent text-slate-500'}`}
							>
								로그인
							</button>
							<button
								type='button'
								onClick={() => setActiveTab('signup')}
								className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === 'signup' ? 'border-[#4f46e5] text-[#4f46e5]' : 'border-transparent text-slate-500'}`}
							>
								회원가입
							</button>
						</div>

						{activeTab === 'login' ? (
							<form className='space-y-4 pt-6' onSubmit={handleLogin}>
								<div>
									<label className='mb-2 block text-base text-[#212529]'>이메일</label>
									<input
										name='username'
										type='email'
										value={loginForm.username}
										onChange={updateLoginField}
										className='block w-full rounded-md border border-[#ced4da] bg-white px-3 py-[0.375rem] text-base font-normal leading-6 text-[#212529] outline-none transition placeholder:text-[#6c757d] focus:border-[#86b7fe] focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]'
										required
									/>
								</div>
								<div>
									<label className='mb-2 block text-base text-[#212529]'>비밀번호</label>
									<input
										name='password'
										type='password'
										value={loginForm.password}
										onChange={updateLoginField}
										className='block w-full rounded-md border border-[#ced4da] bg-white px-3 py-[0.375rem] text-base font-normal leading-6 text-[#212529] outline-none transition placeholder:text-[#6c757d] focus:border-[#86b7fe] focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]'
										required
									/>
								</div>
								<div className='flex flex-wrap items-center justify-between gap-3 text-sm'>
									<div className='flex flex-wrap gap-3 text-[#212529]'>
										<label className='flex items-center gap-2'>
											<input name='rememberMe' type='checkbox' checked={loginForm.rememberMe} onChange={updateLoginField} className='h-4 w-4 rounded border-[#adb5bd]' />자동 로그인
										</label>
										<label className='flex items-center gap-2'>
											<input name='rememberId' type='checkbox' checked={loginForm.rememberId} onChange={updateLoginField} className='h-4 w-4 rounded border-[#adb5bd]' />아이디 저장
										</label>
									</div>
									<button type='button' className='text-sm text-[#6c757d] hover:text-[#495057]'>비밀번호 찾기</button>
								</div>
								{authError && <p className='text-sm text-red-500'>{authError}</p>}
								<button type='submit' disabled={isSubmitting || isLoading} className='inline-flex h-[38px] w-full items-center justify-center rounded-md border border-[#4f46e5] bg-[#4f46e5] px-4 text-base font-normal text-white transition hover:border-[#4338ca] hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'>로그인</button>

								<div className='relative my-3 text-center'>
									<hr className='border-t border-slate-200' />
									<span className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-[#6c757d]'>또는</span>
								</div>

								<button type='button' onClick={loginWithGoogle} className='mb-2 inline-flex h-[38px] w-full items-center justify-center gap-2 rounded-md border border-[#212529] bg-white px-4 text-sm text-[#212529] transition hover:bg-slate-50'>
									<svg width='18' height='18' viewBox='0 0 18 18' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
										<path fill='#4285F4' d='M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z' />
										<path fill='#34A853' d='M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z' />
										<path fill='#FBBC05' d='M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.001c0 1.452.348 2.827.957 4.041l3.007-2.332z' />
										<path fill='#EA4335' d='M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z' />
									</svg>
									구글로 로그인
								</button>

								<button type='button' onClick={loginWithNaver} className='mb-2 inline-flex h-[38px] w-full items-center justify-center gap-2 rounded-md border border-transparent bg-[#03C75A] px-4 text-sm text-white transition hover:brightness-95'>
									<img src={naverLogo} alt='Naver' width='20' height='20' />
									네이버로 로그인
								</button>

								<button type='button' onClick={loginWithKakao} className='inline-flex h-[38px] w-full items-center justify-center gap-2 rounded-md border border-transparent bg-[#FEE500] px-4 text-sm text-black transition hover:brightness-95'>
									<svg width='18' height='18' viewBox='0 0 18 18' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
										<path fill='#000000' d='M9 1.5C4.86 1.5 1.5 4.08 1.5 7.31c0 2.03 1.34 3.82 3.38 4.88-.13.47-.87 3.13-.99 3.63-.15.63.23.62.49.45.19-.13 3.08-2.05 3.57-2.38.35.05.71.08 1.08.08 4.14 0 7.5-2.58 7.5-5.81S13.14 1.5 9 1.5z' />
									</svg>
									카카오로 로그인
								</button>
							</form>
						) : (
							<form className='space-y-4 pt-6' onSubmit={handleSignup}>
								<div>
									<label className='mb-2 block text-base text-[#212529]'>아이디(이메일)</label>
									<div className='flex gap-2'>
										<input
											name='username'
											type='email'
											value={signupForm.username}
											onChange={updateSignupField}
											placeholder='example@email.com'
											className='min-w-0 flex-1 rounded-md border border-[#ced4da] bg-white px-3 py-[0.375rem] text-base font-normal leading-6 text-[#212529] outline-none transition placeholder:text-[#6c757d] focus:border-[#86b7fe] focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]'
										/>
										<button type='button' onClick={() => checkDuplicate('username')} className='inline-flex h-[38px] items-center rounded-md border border-[#6c757d] bg-white px-3 text-sm font-normal text-[#6c757d] transition hover:bg-slate-50'>중복확인</button>
									</div>
									{fieldErrors.username && <p className={`mt-1 text-sm ${checkedState.username ? 'text-emerald-600' : 'text-red-500'}`}>{fieldErrors.username}</p>}
								</div>

								<div>
									<label className='mb-2 block text-base text-[#212529]'>닉네임</label>
									<div className='flex gap-2'>
										<input
											name='nickname'
											type='text'
											value={signupForm.nickname}
											onChange={updateSignupField}
											placeholder='닉네임'
											className='min-w-0 flex-1 rounded-md border border-[#ced4da] bg-white px-3 py-[0.375rem] text-base font-normal leading-6 text-[#212529] outline-none transition placeholder:text-[#6c757d] focus:border-[#86b7fe] focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]'
										/>
										<button type='button' onClick={() => checkDuplicate('nickname')} className='inline-flex h-[38px] items-center rounded-md border border-[#6c757d] bg-white px-3 text-sm font-normal text-[#6c757d] transition hover:bg-slate-50'>중복확인</button>
									</div>
									{fieldErrors.nickname && <p className={`mt-1 text-sm ${checkedState.nickname ? 'text-emerald-600' : 'text-red-500'}`}>{fieldErrors.nickname}</p>}
								</div>

								<div>
									<label className='mb-2 block text-base text-[#212529]'>이름</label>
									<input name='name' type='text' value={signupForm.name} onChange={updateSignupField} placeholder='이름' className='block w-full rounded-md border border-[#ced4da] bg-white px-3 py-[0.375rem] text-base font-normal leading-6 text-[#212529] outline-none transition placeholder:text-[#6c757d] focus:border-[#86b7fe] focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]' />
									{fieldErrors.name && <p className='mt-1 text-sm text-red-500'>{fieldErrors.name}</p>}
								</div>

								<div>
									<label className='mb-2 block text-base text-[#212529]'>비밀번호</label>
									<input name='password' type='password' value={signupForm.password} onChange={updateSignupField} placeholder='비밀번호' className='block w-full rounded-md border border-[#ced4da] bg-white px-3 py-[0.375rem] text-base font-normal leading-6 text-[#212529] outline-none transition placeholder:text-[#6c757d] focus:border-[#86b7fe] focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]' />
									{fieldErrors.password && <p className='mt-1 text-sm text-red-500'>{fieldErrors.password}</p>}
								</div>

								<div>
									<label className='mb-2 block text-base text-[#212529]'>비밀번호 확인</label>
									<input name='passwordCheck' type='password' value={signupForm.passwordCheck} onChange={updateSignupField} placeholder='비밀번호 확인' className='block w-full rounded-md border border-[#ced4da] bg-white px-3 py-[0.375rem] text-base font-normal leading-6 text-[#212529] outline-none transition placeholder:text-[#6c757d] focus:border-[#86b7fe] focus:shadow-[0_0_0_0.25rem_rgba(13,110,253,0.25)]' />
									{fieldErrors.passwordCheck && <p className='mt-1 text-sm text-red-500'>{fieldErrors.passwordCheck}</p>}
								</div>

								{authError && <p className='text-sm text-red-500'>{authError}</p>}
								<button type='submit' disabled={isSubmitting || isLoading} className='inline-flex h-[38px] w-full items-center justify-center rounded-md border border-[#4f46e5] bg-[#4f46e5] px-4 text-base font-normal text-white transition hover:border-[#4338ca] hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60'>회원가입</button>
							</form>
						)}

						<p className='mt-3 text-sm text-[#6c757d]'>로그인/회원가입은 서버 사용자 정보를 기준으로 처리됩니다.</p>
					</div>
				</div>
			</section>
		</Layout>
	)
}

export default Auth

