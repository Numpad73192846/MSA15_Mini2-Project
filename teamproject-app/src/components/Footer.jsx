import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
	const [showTopButton, setShowTopButton] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			setShowTopButton(window.scrollY > 0)
		}

		handleScroll()
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	return (
		<>
			<footer className='mt-auto w-full bg-[#1a2332] px-5 py-10 text-[#b0b8c1]'>
				<div className='mx-auto mb-10 grid max-w-[1200px] grid-cols-1 gap-[25px] min-[481px]:grid-cols-2 min-[481px]:gap-[30px] md:grid-cols-4 md:gap-10'>
					<div className='footer-section'>
						<h4 className='mb-[15px] text-[16px] font-semibold text-white'>튜터링고</h4>
						<p className='text-sm leading-[1.6] text-[#8a9199]'>최고의 튜터와 함께하는<br />1:1 맞춤 당금 플롯</p>
					</div>

					<div className='footer-section'>
						<h4 className='mb-[15px] text-[16px] font-semibold text-white'>서비스</h4>
						<ul className='space-y-[10px]'>
							<li><Link to='/tutors' className='text-sm text-[#8a9199] transition-colors duration-300 hover:text-white'>튜터 찾기</Link></li>
							<li><Link to='/tutor/register' className='text-sm text-[#8a9199] transition-colors duration-300 hover:text-white'>튜터 등록</Link></li>
						</ul>
					</div>

					<div className='footer-section'>
						<h4 className='mb-[15px] text-[16px] font-semibold text-white'>회사 소개</h4>
						<ul className='space-y-[10px]'>
							<li><Link to='/about' className='text-sm text-[#8a9199] transition-colors duration-300 hover:text-white'>소개</Link></li>
							<li><Link to='/jobs' className='text-sm text-[#8a9199] transition-colors duration-300 hover:text-white'>채용</Link></li>
							<li><Link to='/partnership' className='text-sm text-[#8a9199] transition-colors duration-300 hover:text-white'>파트너십</Link></li>
						</ul>
					</div>

					<div className='footer-section'>
						<h4 className='mb-[15px] text-[16px] font-semibold text-white'>고객 지원</h4>
						<ul className='space-y-[10px]'>
							<li><Link to='/contact' className='text-sm text-[#8a9199] transition-colors duration-300 hover:text-white'>문의하기</Link></li>
							<li><Link to='/faq' className='text-sm text-[#8a9199] transition-colors duration-300 hover:text-white'>FAQ</Link></li>
							<li><Link to='/guide/policies' className='text-sm text-[#8a9199] transition-colors duration-300 hover:text-white'>이용약관</Link></li>
						</ul>
					</div>
				</div>

				<div className='mx-auto flex max-w-[1200px] items-center justify-between border-t border-[#2a3447] pt-5 text-[13px] text-[#6b7280]'>
					<p>&copy; 2026 튜터링고. All rights reserved.</p>
				</div>
			</footer>

			<button
				id='topBtn'
				type='button'
				title='맨 위로'
				aria-label='맨 위로'
				onClick={scrollToTop}
				className={`fixed bottom-6 right-6 z-[1000] flex h-16 w-16 items-center justify-center rounded-full border-none bg-[#4f46e5] text-white shadow-[0_4px_12px_rgba(79,70,229,0.4)] transition-all duration-300 hover:-translate-y-[3px] hover:bg-[#4338ca] hover:shadow-[0_8px_20px_rgba(79,70,229,0.6)] active:-translate-y-[1px] ${showTopButton ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'}`}
			>
				<span className='text-[1.25rem] leading-none' aria-hidden='true'>↑</span>
			</button>
		</>
	)
}

export default Footer
