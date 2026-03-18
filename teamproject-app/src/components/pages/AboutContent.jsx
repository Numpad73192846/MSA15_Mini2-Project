import { ShieldCheck, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../common/Layout'
import successImg from '../../assets/image/guide/success.svg'
import visionImg from '../../assets/image/guide/vision.svg'
import missionImg from '../../assets/image/guide/mission.svg'
import goodImg from '../../assets/image/guide/good.svg'
import teaImg from '../../assets/image/guide/tea.svg'
import tutorImg from '../../assets/image/guide/tutor.svg'
import safeImg from '../../assets/image/guide/safe.svg'

const valueCards = [
	{
		title: '신뢰',
		description: '엄격한 검증 시스템을 통해 신뢰할 수 있는 튜터만을 제공합니다.',
		icon: ShieldCheck,
		iconClassName: 'text-emerald-500',
	},
	{
		title: '소통',
		description: '튜터와 학생 간의 원활한 소통으로 최적의 학습 환경을 조성합니다.',
		icon: Users,
		iconClassName: 'text-sky-500',
	},
	{
		title: '성장',
		description: '개인 맞춤형 교육을 통해 학생과 튜터 모두의 지속적인 성장을 추구합니다.',
		icon: TrendingUp,
		iconClassName: 'text-rose-500',
	},
]

const featureCards = [
	{
		title: '쉬운 튜터 검색',
		description: '과목, 지역, 가격대, 수업 방식 등 다양한 조건으로 나에게 딱 맞는 튜터를 빠르게 찾을 수 있습니다.',
		image: goodImg,
	},
	{
		title: '검증된 튜터',
		description: '학력, 경력, 자격증 등을 철저히 검증하여 신뢰할 수 있는 튜터만을 선별합니다.',
		image: teaImg,
	},
	{
		title: '유연한 스케줄',
		description: '원하는 시간과 장소를 자유롭게 선택하여 나만의 학습 일정을 만들 수 있습니다.',
		image: tutorImg,
	},
	{
		title: '안전한 결제',
		description: '다양한 결제 수단과 보안 시스템으로 안전하고 편리한 거래를 지원합니다.',
		image: safeImg,
	},
]

const stats = [
	{ value: '1,500+', label: '검증된 튜터' },
	{ value: '5,000+', label: '활동 회원' },
	{ value: '20,000+', label: '완료된 수업' },
	{ value: '4.8', label: '평균 만족도' },
]

const About = () => (
	<Layout>
		<section className='bg-slate-50 px-6 py-16'>
			<div className='mx-auto max-w-6xl space-y-10'>
				<div className='text-center'>
					<h1 className='text-4xl font-extrabold text-slate-900 md:text-5xl'>튜터링고 소개</h1>
					<p className='mt-3 text-slate-500'>최고의 튜터와 함께하는 1:1 맞춤 학습 플랫폼</p>
				</div>

				<div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
					<div className='grid items-center gap-6 md:grid-cols-[220px_1fr]'>
						<div className='flex justify-center'>
							<img src={successImg} alt='교육의 미래' className='h-36 w-36 object-contain md:h-44 md:w-44' />
						</div>
						<div className='text-center md:text-left'>
							<h2 className='text-2xl font-bold text-slate-900'>우리는 교육의 미래를 만들어갑니다</h2>
							<p className='mt-4 leading-8 text-slate-600'>
								튜터링고는 누구나 원하는 분야의 전문가로부터 1:1 맞춤 교육을 받을 수 있는 온·오프라인 튜터링 매칭 플랫폼입니다.
								검증된 튜터와 학생을 연결하여 최고의 학습 경험을 제공합니다.
							</p>
						</div>
					</div>
				</div>

				<div className='grid gap-4 md:grid-cols-2'>
					<article className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
						<div className='grid items-center gap-4 sm:grid-cols-[80px_1fr]'>
							<div className='mx-auto'>
								<img src={visionImg} alt='비전' className='h-16 w-16 object-contain' />
							</div>
							<div>
								<h3 className='text-xl font-bold text-slate-900'>비전</h3>
								<p className='mt-2 text-sm leading-7 text-slate-600'>
									모든 사람이 자신의 목표를 달성하기 위해 필요한 지식과 기술을 최적의 방법으로 배울 수 있는 세상을 만듭니다.
								</p>
							</div>
						</div>
					</article>
					<article className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
						<div className='grid items-center gap-4 sm:grid-cols-[80px_1fr]'>
							<div className='mx-auto'>
								<img src={missionImg} alt='미션' className='h-16 w-16 object-contain' />
							</div>
							<div>
								<h3 className='text-xl font-bold text-slate-900'>미션</h3>
								<p className='mt-2 text-sm leading-7 text-slate-600'>
									검증된 튜터와 학생을 효과적으로 연결하여 맞춤형 교육을 통한 성장의 기회를 제공하고, 교육의 질을 높입니다.
								</p>
							</div>
						</div>
					</article>
				</div>

				<div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
					<h3 className='text-center text-2xl font-bold text-slate-900'>핵심 가치</h3>
					<div className='mt-8 grid gap-5 md:grid-cols-3'>
						{valueCards.map((item) => {
							const Icon = item.icon
							return (
								<div key={item.title} className='text-center'>
									<div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100'>
										<Icon className={item.iconClassName} size={30} strokeWidth={2.2} />
									</div>
									<h4 className='mt-3 text-lg font-bold text-slate-900'>{item.title}</h4>
									<p className='mt-2 text-sm leading-7 text-slate-600'>{item.description}</p>
								</div>
							)
						})}
					</div>
				</div>

				<div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
					<h3 className='text-center text-2xl font-bold text-slate-900'>서비스 특징</h3>
					<div className='mt-8 grid gap-6 md:grid-cols-2'>
						{featureCards.map((item) => (
							<article key={item.title} className='flex gap-4'>
								<div className='shrink-0 rounded-2xl bg-slate-100 p-3'>
									<img src={item.image} alt={item.title} className='h-12 w-12 object-contain' />
								</div>
								<div>
									<h4 className='text-lg font-bold text-slate-900'>{item.title}</h4>
									<p className='mt-2 text-sm leading-7 text-slate-600'>{item.description}</p>
								</div>
							</article>
						))}
					</div>
				</div>

				<div className='rounded-3xl bg-[#0d6efd] p-8 text-white shadow-sm'>
					<h3 className='text-center text-2xl font-bold'>튜터링고와 함께한 성장</h3>
					<div className='mt-6 grid gap-4 text-center md:grid-cols-4'>
						{stats.map((item) => (
							<div key={item.label}>
								<div className='text-4xl font-extrabold'>{item.value}</div>
								<div className='mt-1 text-sm text-white/80'>{item.label}</div>
							</div>
						))}
					</div>
				</div>

				<div className='text-center'>
					<h3 className='text-2xl font-bold text-slate-900'>지금 바로 시작하세요</h3>
					<p className='mt-2 text-slate-500'>튜터링고와 함께 당신의 목표를 이루어보세요</p>
					<div className='mt-5 flex flex-wrap justify-center gap-3'>
						<Link to='/tutors' className='inline-flex min-w-36 items-center justify-center rounded-xl bg-[#0d6efd] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0b5ed7]'>
							튜터 찾기
						</Link>
						<Link to='/guide' className='inline-flex min-w-36 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
							돌아가기
						</Link>
					</div>
				</div>
			</div>
		</section>
	</Layout>
)

export default About
