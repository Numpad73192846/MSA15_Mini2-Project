import { Link } from 'react-router-dom'
import {
	ArrowRight,
	BookOpenText,
	BriefcaseBusiness,
	ClipboardList,
	Globe,
	MessageCircleMore,
	Music2,
	Search,
	Tv,
} from 'lucide-react'
import Layout from '../common/Layout'
import logo from '../../assets/image/logo.png'
import teacherImage from '../../assets/image/teacher.png'
import starImage from '../../assets/image/star.png'
import timeImage from '../../assets/image/time.png'
import usaFlag from '../../assets/image/flag/usa.svg'
import koreaFlag from '../../assets/image/flag/korea.svg'
import japanFlag from '../../assets/image/flag/japan.svg'
import chinaFlag from '../../assets/image/flag/china.svg'
import spainFlag from '../../assets/image/flag/spain.svg'
import franceFlag from '../../assets/image/flag/france.svg'

const languages = [
	{ name: '영어', icon: usaFlag },
	{ name: '한국어', icon: koreaFlag },
	{ name: '일본어', icon: japanFlag },
	{ name: '중국어', icon: chinaFlag },
	{ name: '스페인어', icon: spainFlag },
	{ name: '프랑스어', icon: franceFlag },
]

const categories = [
	{ name: '회화', Icon: MessageCircleMore },
	{ name: '문법', Icon: BookOpenText },
	{ name: '비즈니스', Icon: BriefcaseBusiness },
	{ name: '노래', Icon: Music2 },
	{ name: '드라마', Icon: Tv },
	{ name: '문화', Icon: Globe },
]

const stats = [
	{ value: '100+', label: '검증된 전문 튜터', image: teacherImage, bgClass: 'bg-c1' },
	{ value: '4.8', label: '평균 수강 만족도', image: starImage, bgClass: 'bg-c2' },
	{ value: '24h', label: '언제든지 자유 예약', image: timeImage, bgClass: 'bg-c3' },
]

const Home = () => {
	return (
		<Layout>
			<div className='main-content overflow-hidden'>
				<section className='main-visual main-background shape-wrap flex items-center justify-center'>
					<div className='shape shape1' />
					<div className='shape shape2' />

					<div className='main-container relative'>
						<div className='flex flex-col items-center gap-4 text-center text-white'>
							<p className='visual-logo'>
								<img src={logo} alt='투코스 로고' />
							</p>

							<h1 className='visual-tit'>
								<span className='mb-0 block font-light'>언어 학습이 필요한 순간,</span>
								나에게 <span className='txt-gradient'>딱 맞는 튜터</span>를 찾아보세요!!
							</h1>

							<p className='visual-txt'>
								검증된 전문 튜터와 함께 1:1 맞춤 학습을 시작하세요! 내일이면 나도 언어박사!!
							</p>

							<div className='mt-5 flex flex-wrap justify-center gap-3'>
								<Link to='/tutors' className='main-btn main-btn-point main-btn-hero'>
									<Search className='h-[1.1rem] w-[1.1rem]' strokeWidth={2.2} />
									튜터 찾기
								</Link>
								<Link to='/guide' className='main-btn main-btn-light main-btn-hero text-slate-900'>
									<ClipboardList className='h-[1.1rem] w-[1.1rem]' strokeWidth={2.2} />
									이용 안내
								</Link>
							</div>
						</div>
					</div>
				</section>

				<section className='main-section main-stats bg-white'>
					<div className='main-container'>
						<div className='mb-5 text-center'>
							<h2 className='mb-3 text-[2rem] font-bold leading-tight text-slate-900 md:text-[2.5rem]'>믿을 수 있는 튜터 매칭 플랫폼</h2>
							<p className='text-[#6c757d]'>수천 명의 학습자들이 선택한 이유</p>
						</div>

						<div className='inner grid gap-12 md:grid-cols-3'>
							{stats.map((item) => (
								<div key={item.label}>
									<div className={`wrap-img ${item.bgClass}`}>
										<img src={item.image} alt={item.label} />
									</div>
									<div className='wrap-txt'>
										<h3 className='t1 mb-2'>{item.value}</h3>
										<p className='t2 mb-0 text-[#6c757d]'>{item.label}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className='main-section main-languages bg-[#f8f9fa]'>
					<div className='main-container'>
						<div className='mb-5 text-center'>
							<h2 className='mb-3 text-[2rem] font-bold leading-tight text-slate-900 md:text-[2.5rem]'>인기 언어에서 시작하세요</h2>
							<p className='text-[#6c757d]'>다양한 언어의 전문 튜터를 만나보세요</p>
						</div>

						<div className='inner grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6'>
							{languages.map((item) => (
								<div key={item.name} className='language-item'>
									<Link to='/tutors' className='wrap-in text-center'>
										<div className='wrap-img mb-3'>
											<img src={item.icon} alt={item.name} />
										</div>
										<h5 className='wrap-txt mb-0 text-[1.25rem] font-bold'>{item.name}</h5>
									</Link>
								</div>
							))}
						</div>

						<div className='text-center'>
							<h3 className='mb-4 text-[1.75rem] font-bold text-slate-900'>카테고리별로 찾기</h3>
							<div className='flex flex-wrap justify-center gap-2'>
								{categories.map((category) => (
									<Link key={category.name} to='/tutors' className='category-badge inline-flex items-center'>
										<category.Icon className='mr-2 h-4 w-4' strokeWidth={2.1} />
										{category.name}
									</Link>
								))}
							</div>
						</div>
					</div>
				</section>

				<section className='main-section main-cta shape-wrap'>
					<div className='shape shape1' />
					<div className='shape shape2' />

					<div className='main-container text-center text-white'>
						<h2 className='mb-4 text-4xl font-light md:text-5xl'>
							<span className='txt-point'>지금 바로 시작</span> 하세요!!
						</h2>
						<p className='mb-5 text-xl font-light opacity-90'>완벽한 튜터를 찾아 언어 학습 목표를 달성하세요</p>

						<div className='flex flex-wrap justify-center gap-3'>
							<Link to='/tutors' className='main-btn main-btn-point main-btn-cta'>
								튜터 둘러보기 <ArrowRight className='arrow h-[1.1rem] w-[1.1rem]' strokeWidth={2.2} />
							</Link>
							<Link to='/about' className='main-btn main-btn-light main-btn-cta text-slate-900'>
								튜터링고 알아보기 <ArrowRight className='arrow h-[1.1rem] w-[1.1rem]' strokeWidth={2.2} />
							</Link>
						</div>
					</div>
				</section>
			</div>
		</Layout>
	)
}

export default Home
