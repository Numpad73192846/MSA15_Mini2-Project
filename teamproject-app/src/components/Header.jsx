import React, { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/image/logo.png'
import useAuth from '../utils/hooks/useAuth'

const Header = () => {

	const { isLogin, isLoading, hasRole, logout } = useAuth()
	const location = useLocation()
	const navigate = useNavigate()

	const isTutor = hasRole('ROLE_TUTOR')
	const isTutorPending = hasRole('ROLE_TUTOR_PENDING')
	const isAdmin = hasRole('ROLE_ADMIN')
	const buttonBaseClass = 'inline-flex h-[43px] min-w-[96px] items-center justify-center whitespace-nowrap rounded-full border px-[14px] text-center text-[0.875rem] leading-[1.2] font-normal transition-colors'
	const guestLoginClass = `${buttonBaseClass} border-[#6c757d] bg-transparent text-[#6c757d] hover:border-[#6c757d] hover:bg-[#6c757d] hover:text-white`
	const guestSignupClass = `${buttonBaseClass} border-[#4f46e5] bg-[#4f46e5] !text-white hover:border-[#4338ca] hover:bg-[#4338ca] hover:text-white`
	const userOutlineClass = `${buttonBaseClass} border-[#4f46e5] bg-white font-normal text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white`
	const logoutClass = `${buttonBaseClass} border-[#212529] bg-white text-[#212529] hover:bg-[#212529] hover:text-white`

	useEffect(() => {
		if (isLoading || !isLogin) {
			return
		}
		if (isTutorPending && !location.pathname.startsWith('/tutor/register')) {
			navigate('/tutor/register', { replace: true })
			return
		}
		if (isAdmin && !location.pathname.startsWith('/admin')) {
			navigate('/admin', { replace: true })
		}
	}, [isAdmin, isLoading, isLogin, isTutorPending, location.pathname, navigate])

	return (
		<header className='fixed inset-x-0 top-0 z-40 h-[70px] border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-[8px]'>
			<div className='mx-auto flex h-full w-full max-w-[1320px] items-center justify-between px-[8px]'>
				<Link to={'/'} className='flex items-center'>
					<img src={ logo } alt='투코스 로고' className='h-9' />
				</Link>

				{/* 중앙 네비게이션 (데스크탑) */}
				<nav className='hidden items-center gap-5 md:flex'>
					<Link to={'/'} className='text-[1.125rem] font-semibold text-[#212529] transition hover:text-[#111827]'>홈</Link>
					<Link to={'/tutors'} className='text-[1.125rem] font-semibold text-[#212529] transition hover:text-[#111827]'>튜터 찾기</Link>
					<Link to={'/game/korean'} className='text-[1.125rem] font-semibold text-[#212529] transition hover:text-[#111827]'>한국어게임</Link>
					<Link to={'/guide/language'} className='text-[1.125rem] font-semibold text-[#212529] transition hover:text-[#111827]'>세계인들의 언어</Link>
				</nav>

				{/* 오른쪽 버튼 영역 */}
				<div className='flex shrink-0 gap-2'>
					{
						!isLogin || isLoading ? (
							/* 로그인 전 */
							<div id='navGuestArea' className='flex items-center gap-2'>
								<Link to={'/login'} className={guestLoginClass} >로그인</Link>
								<Link to={'/join'} className={guestSignupClass} >회원가입</Link>
							</div>
						) : (
							/* 로그인 후 */
							<div id='navUserArea' className='flex items-center gap-2'>
								{isTutorPending ? (
									<Link to='/tutor/register' className={userOutlineClass}>
										추가 정보 작성
									</Link>
								) : isAdmin ? (
									<Link to='/admin' className={userOutlineClass}>
										관리자 페이지
									</Link>
								) : isTutor ? (
									<>
										<Link to='/tutor/dashboard' className={userOutlineClass}>
											대시보드
										</Link>
										<Link to='/tutor/mypage' className={userOutlineClass}>
											마이페이지
										</Link>
									</>
								) : (
									<Link to='/member/mypage' className={userOutlineClass}>
										마이페이지
									</Link>
								)}
								<button type='button' className={logoutClass} onClick={logout}>
									로그아웃
								</button>
							</div>
						)
					}
				</div>
			</div>
		</header>
	)
}

export default Header
