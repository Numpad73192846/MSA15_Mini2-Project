import { Link } from 'react-router-dom'
import Layout from '../common/Layout'
import heroGuideImage from '../../assets/image/guide.png'
import guideTutorSearch from '../../assets/image/guide/guide-ts.png'
import guideCalendar from '../../assets/image/guide/cal.svg'
import guidePromise from '../../assets/image/guide/promise.svg'

const serviceFeatures = [
	{
		title: '다양한 튜터 탐색',
		description: '언어, 학문 등 다양한 분야의 전문 튜터를 검색하고 비교할 수 있습니다.',
		image: guideTutorSearch,
		imageClassName: 'h-20 w-20',
	},
	{
		title: '간편한 예약',
		description: '원하는 시간에 튜터의 수업을 쉽게 예약할 수 있습니다.',
		image: guideCalendar,
		imageClassName: 'h-16 w-16',
	},
	{
		title: '믿을 수 있는 리뷰',
		description: '실제 수강생들의 솔직한 리뷰로 나에게 맞는 튜터를 선택하세요.',
		image: guidePromise,
		imageClassName: 'h-20 w-20',
	},
]

const learnerSteps = [
	{ title: '회원가입', description: '간단한 정보 입력으로 빠르게 가입하세요' },
	{ title: '튜터 검색', description: '과목, 가격, 리뷰를 보고 원하는 튜터를 찾으세요' },
	{ title: '수업 예약', description: '튜터의 가능한 시간 중 원하는 시간을 선택하세요' },
	{ title: '학습 시작', description: '예약된 시간에 튜터와 1:1 학습을 진행하세요' },
]

const tutorSteps = [
	{ title: '튜터 신청', description: '튜터 등록 버튼을 클릭하여 신청 절차를 시작하세요' },
	{ title: '프로필 작성', description: '경력, 전문 분야, 소개 등 상세 정보를 입력하세요' },
	{ title: '일정 설정', description: '수업 가능한 시간대와 요금을 자유롭게 설정하세요' },
	{ title: '수업 진행', description: '학습자의 예약을 확인하고 수업을 진행하세요' },
]

const faqs = [
	{
		question: '수업은 어떤 방식으로 진행되나요?',
		answer:
			'수업은 온라인 화상 수업 또는 오프라인 대면 수업으로 진행됩니다. 튜터마다 제공하는 수업 방식이 다르니 튜터 프로필에서 확인해 주세요. 화상 수업의 경우 Zoom, Google Meet 등의 도구를 활용합니다.',
	},
	{
		question: '예약 취소는 어떻게 하나요?',
		answer:
			'마이페이지 > 예약 내역에서 예약을 취소할 수 있습니다. 수업 시작 24시간 전까지 취소 시 전액 환불되며, 24시간 이내 취소 시에는 환불 규정에 따라 일부 차감될 수 있습니다.',
	},
	{
		question: '결제는 어떻게 이루어지나요?',
		answer:
			'수업 예약 시 신용카드, 체크카드, 간편결제(카카오페이, 네이버페이 등)로 결제할 수 있습니다. 수업료는 수업 완료 후 튜터에게 정산됩니다.',
	},
	{
		question: '튜터가 되려면 어떤 조건이 필요한가요?',
		answer:
			'특별한 자격 제한은 없습니다. 본인의 전문 분야에 대한 지식과 열정이 있다면 누구나 튜터로 등록할 수 있습니다. 다만, 학력/경력 증명서를 첨부하면 학습자에게 더 많은 신뢰를 줄 수 있습니다.',
	},
	{
		question: '수업료는 튜터가 직접 정하나요?',
		answer:
			'네, 튜터가 직접 시간당 수업료를 설정합니다. 경력, 전문성, 시장 상황 등을 고려하여 자유롭게 가격을 책정할 수 있습니다.',
	},
]

const TutorGuide = () => (
	<Layout>
		<section className='relative overflow-hidden bg-[#0f4c81] px-6 py-12 text-white md:py-16'>
			<div className='mx-auto grid max-w-6xl items-center gap-6 md:grid-cols-[1fr_360px]'>
				<div className='text-center md:text-left'>
					<h1 className='text-4xl font-extrabold md:text-5xl'>이용 안내</h1>
					<p className='mt-3 text-cyan-100'>튜터링고에서 함께 쉽고 편리하게 학습을 시작하세요</p>
				</div>
				<div className='hidden justify-end md:flex'>
					<img src={heroGuideImage} alt='이용안내 가이드' className='h-48 w-auto object-contain opacity-95 lg:h-56' />
				</div>
			</div>
		</section>

		<section className='bg-white px-6 py-14'>
			<div className='mx-auto max-w-6xl'>
				<div className='text-center'>
					<h2 className='text-3xl font-bold text-slate-900'>튜터링고는 어떤 서비스인가요?</h2>
					<p className='mt-2 text-lg text-slate-500'>검증된 전문 튜터와 학습자를 연결하는 1:1 맞춤 학습 플랫폼입니다</p>
				</div>
				<div className='mt-8 grid gap-4 md:grid-cols-3'>
					{serviceFeatures.map((feature) => (
						<article key={feature.title} className='rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm'>
							<div className='mb-3 flex justify-center'>
								<img src={feature.image} alt={feature.title} className={`${feature.imageClassName} object-contain`} />
							</div>
							<h3 className='text-lg font-bold text-slate-900'>{feature.title}</h3>
							<p className='mt-2 text-sm leading-7 text-slate-600'>{feature.description}</p>
						</article>
					))}
				</div>
			</div>
		</section>

		<section className='bg-slate-50 px-6 py-14'>
			<div className='mx-auto max-w-6xl'>
				<div className='text-center'>
					<span className='inline-flex rounded-full bg-[#0d6efd] px-4 py-1.5 text-xs font-semibold text-white'>For Learners</span>
					<h2 className='mt-4 text-3xl font-bold text-slate-900'>학습자 이용 방법</h2>
					<p className='mt-2 text-slate-500'>4단계로 간편하게 학습을 시작하세요</p>
				</div>
				<div className='mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					{learnerSteps.map((step, index) => (
						<article key={step.title} className='rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm'>
							<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0d6efd] text-lg font-bold text-white'>
								{index + 1}
							</div>
							<h3 className='mt-4 text-lg font-bold text-slate-900'>{step.title}</h3>
							<p className='mt-2 text-sm leading-6 text-slate-600'>{step.description}</p>
						</article>
					))}
				</div>
				<div className='mt-8 text-center'>
					<Link to='/tutors' className='inline-flex rounded-full bg-[#0d6efd] px-8 py-3 text-sm font-semibold text-white hover:bg-[#0b5ed7]'>
						튜터 찾아보기
					</Link>
				</div>
			</div>
		</section>

		<section className='bg-white px-6 py-14'>
			<div className='mx-auto max-w-6xl'>
				<div className='text-center'>
					<span className='inline-flex rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white'>For Tutors</span>
					<h2 className='mt-4 text-3xl font-bold text-slate-900'>튜터 등록 방법</h2>
					<p className='mt-2 text-slate-500'>전문성을 공유하고 수익을 창출하세요</p>
				</div>
				<div className='mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					{tutorSteps.map((step, index) => (
						<article key={step.title} className='rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm'>
							<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white'>
								{index + 1}
							</div>
							<h3 className='mt-4 text-lg font-bold text-slate-900'>{step.title}</h3>
							<p className='mt-2 text-sm leading-6 text-slate-600'>{step.description}</p>
						</article>
					))}
				</div>
				<div className='mt-8 text-center'>
					<Link to='/tutor/register' className='inline-flex rounded-full bg-emerald-600 px-8 py-3 text-sm font-semibold text-white hover:bg-emerald-700'>
						튜터로 등록하기
					</Link>
				</div>
			</div>
		</section>

		<section className='bg-slate-50 px-6 py-14'>
			<div className='mx-auto max-w-4xl'>
				<div className='text-center'>
					<h2 className='text-3xl font-bold text-slate-900'>자주 묻는 질문</h2>
					<p className='mt-2 text-slate-500'>궁금한 점이 있으신가요?</p>
				</div>
				<div className='mt-8 space-y-3'>
					{faqs.map((faq, index) => (
						<details key={faq.question} open={index === 0} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
							<summary className='cursor-pointer list-none font-semibold text-slate-900'>{faq.question}</summary>
							<p className='mt-3 text-sm leading-7 text-slate-600'>{faq.answer}</p>
						</details>
					))}
				</div>
			</div>
		</section>

		<section className='bg-white px-6 py-14'>
			<div className='mx-auto max-w-6xl'>
				<div className='rounded-3xl bg-[#51b9c7] px-6 py-10 text-center text-white md:px-10'>
					<h2 className='text-3xl font-extrabold'>지금 바로 시작하세요!</h2>
					<p className='mt-3 text-white/80'>검증된 전문 튜터와 함께 새로운 학습 경험을 시작해 보세요</p>
					<div className='mt-6 flex flex-wrap justify-center gap-3'>
						<Link to='/join' className='rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#0f4c81]'>
							회원가입
						</Link>
						<Link to='/tutors' className='rounded-full border border-white/80 px-7 py-3 text-sm font-semibold text-white'>
							튜터 둘러보기
						</Link>
					</div>
				</div>
			</div>
		</section>
	</Layout>
)

export default TutorGuide
