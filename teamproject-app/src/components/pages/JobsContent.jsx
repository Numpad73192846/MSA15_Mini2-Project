import { useMemo, useState } from 'react'
import {
	ArrowRight,
	BookOpen,
	Briefcase,
	GraduationCap,
	Heart,
	Home,
	Laptop,
	MapPin,
	MessageSquare,
	Plane,
	PartyPopper,
	Rocket,
	Stethoscope,
	Target,
	TrendingUp,
	Users,
	Utensils,
} from 'lucide-react'
import Layout from '../common/Layout'

const categories = [
	{ key: 'all', label: '전체' },
	{ key: 'dev', label: '개발' },
	{ key: 'design', label: '디자인' },
	{ key: 'pm', label: '기획' },
	{ key: 'marketing', label: '마케팅' },
	{ key: 'operation', label: '운영' },
	{ key: 'education', label: '교육' },
]

const jobs = [
	{
		category: 'dev',
		categoryLabel: '개발',
		title: '백엔드 개발자 (Spring Boot)',
		description: '튜터링고의 핵심 서비스를 설계하고 개발합니다. 대규모 트래픽을 효율적으로 처리하는 안정적인 시스템을 구축합니다.',
		location: '서울 강남',
		type: '정규직',
		experience: '경력 3년 이상',
	},
	{
		category: 'dev',
		categoryLabel: '개발',
		title: '프론트엔드 개발자 (React / Next.js)',
		description: '사용자 경험을 최우선으로 생각하며, 직관적이고 빠른 웹 인터페이스를 만듭니다.',
		location: '서울 강남',
		type: '정규직',
		experience: '경력 2년 이상',
	},
	{
		category: 'dev',
		categoryLabel: '개발',
		title: 'iOS / Android 앱 개발자',
		description: '튜터링고 모바일 앱의 전체 라이프사이클을 담당합니다. 네이티브 성능과 사용성을 모두 갖춘 앱을 만듭니다.',
		location: '서울 강남',
		type: '정규직',
		experience: '경력 2년 이상',
	},
	{
		category: 'dev',
		categoryLabel: '개발',
		title: 'DevOps / 인프라 엔지니어',
		description: '서비스의 안정성과 확장성을 책임집니다. CI/CD 파이프라인 구축, 모니터링, 클라우드 인프라를 관리합니다.',
		location: '서울 강남',
		type: '정규직',
		experience: '경력 3년 이상',
	},
	{
		category: 'design',
		categoryLabel: '디자인',
		title: '프로덕트 디자이너 (UX/UI)',
		description: '사용자 리서치 기반의 UX 설계와 직관적인 UI 디자인을 통해 학습 경험을 혁신합니다.',
		location: '서울 강남',
		type: '정규직',
		experience: '경력 2년 이상',
	},
	{
		category: 'design',
		categoryLabel: '디자인',
		title: '브랜드 디자이너',
		description: '튜터링고의 브랜드 아이덴티티를 수립하고, 다양한 채널의 시각 자산을 제작합니다.',
		location: '서울 강남',
		type: '정규직',
		experience: '경력 1년 이상',
	},
	{
		category: 'pm',
		categoryLabel: '기획',
		title: '프로덕트 매니저 (PM)',
		description: '튜터-학생 매칭 경험을 개선하기 위한 프로덕트 전략을 수립하고, 데이터 기반 의사결정을 주도합니다.',
		location: '서울 강남',
		type: '정규직',
		experience: '경력 3년 이상',
	},
	{
		category: 'marketing',
		categoryLabel: '마케팅',
		title: '그로스 마케터',
		description: '데이터 분석 기반 사용자 확보 및 전환율 최적화를 담당합니다. 성과 중심의 마케팅 전략을 실행합니다.',
		location: '서울 강남',
		type: '정규직',
		experience: '경력 2년 이상',
	},
	{
		category: 'marketing',
		categoryLabel: '마케팅',
		title: '콘텐츠 마케터',
		description: 'SNS, 블로그, 뉴스레터 등 다양한 채널을 통해 튜터링고의 이야기를 전달합니다.',
		location: '서울 강남 / 재택 가능',
		type: '정규직',
		experience: '신입 / 경력',
	},
	{
		category: 'operation',
		categoryLabel: '운영',
		title: '고객 경험(CX) 매니저',
		description: '튜터와 학생 모두의 만족을 위한 고객 지원 시스템을 구축하고 운영합니다.',
		location: '서울 강남',
		type: '정규직',
		experience: '신입 / 경력',
	},
	{
		category: 'education',
		categoryLabel: '교육',
		title: '튜터 온보딩 매니저',
		description: '신규 튜터의 원활한 합류를 지원하고, 튜터 교육 프로그램을 기획·운영합니다.',
		location: '서울 강남',
		type: '정규직',
		experience: '경력 1년 이상',
	},
	{
		category: 'education',
		categoryLabel: '교육',
		title: '교육 콘텐츠 기획자',
		description: '학습 효과를 극대화하는 교육 커리큘럼과 학습 콘텐츠를 기획합니다. 교육학적 전문성을 바탕으로 서비스를 개선합니다.',
		location: '서울 강남',
		type: '정규직',
		experience: '경력 2년 이상',
	},
]

const cultures = [
	{
		title: '임팩트 중심',
		description: '일의 양이 아닌 결과로 평가합니다. 본질적인 문제 해결에 집중하는 문화를 지향합니다.',
		icon: Target,
		iconBgClassName: 'bg-indigo-100 text-indigo-600',
	},
	{
		title: '투명한 소통',
		description: '모든 정보는 투명하게 공유됩니다. 직급에 관계없이 자유롭게 의견을 나누고 토론합니다.',
		icon: MessageSquare,
		iconBgClassName: 'bg-amber-100 text-amber-600',
	},
	{
		title: '빠른 실행',
		description: '완벽한 계획보다 빠른 실행을 중시합니다. 실험하고, 측정하고, 개선하는 사이클을 반복합니다.',
		icon: Rocket,
		iconBgClassName: 'bg-emerald-100 text-emerald-600',
	},
]

const benefits = [
	{
		title: '생활 지원',
		icon: Heart,
		titleClassName: 'text-indigo-600',
		items: [
			{ icon: Home, label: '유연 근무제', detail: '자율 출퇴근 + 주 2회 재택근무' },
			{ icon: Utensils, label: '식비 지원', detail: '점심·저녁 식비 및 간식 바 운영' },
			{ icon: Stethoscope, label: '건강 검진', detail: '연 1회 종합 건강검진 지원' },
			{ icon: PartyPopper, label: '경조사 지원', detail: '경조금 및 경조 휴가 지원' },
		],
		itemIconClassName: 'bg-indigo-100 text-indigo-600',
	},
	{
		title: '성장 지원',
		icon: TrendingUp,
		titleClassName: 'text-emerald-600',
		items: [
			{ icon: BookOpen, label: '교육비 지원', detail: '컨퍼런스, 도서, 강의 등 자기계발 비용 무제한 지원' },
			{ icon: Laptop, label: '최신 장비', detail: 'MacBook Pro / 4K 모니터 등 원하는 장비 지급' },
			{ icon: GraduationCap, label: '튜터링고 수업 무료', detail: '모든 구성원 튜터링고 서비스 무료 이용' },
			{ icon: Plane, label: '리프레시 휴가', detail: '3년 근속 시 2주 유급 리프레시 휴가' },
		],
		itemIconClassName: 'bg-emerald-100 text-emerald-600',
	},
]

const processSteps = [
	{ title: '서류 접수', description: '이력서와 포트폴리오를 제출해 주세요' },
	{ title: '직무 면접', description: '실무자와의 기술 면접을 진행합니다' },
	{ title: '컬쳐 면접', description: '팀 문화와의 적합성을 함께 확인합니다' },
	{ title: '최종 합류', description: '처우 협의 후 공식 합류합니다' },
]

const Jobs = () => {
	const [activeCategory, setActiveCategory] = useState('all')

	const filteredJobs = useMemo(() => {
		if (activeCategory === 'all') return jobs
		return jobs.filter((job) => job.category === activeCategory)
	}, [activeCategory])

	return (
		<Layout>
			<section className='relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 py-16 text-white md:py-20'>
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.2),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.18),transparent_40%)]' />
				<div className='relative mx-auto max-w-6xl text-center'>
					<span className='inline-flex rounded-full border border-indigo-300/40 bg-indigo-300/20 px-4 py-1 text-sm font-semibold text-indigo-200'>We're Hiring!</span>
					<h1 className='mt-6 text-4xl font-extrabold leading-tight md:text-5xl'>
						튜터링고와 함께
						<br className='hidden md:block' />
						교육의 미래를 만들어요
					</h1>
					<p className='mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-200 md:text-lg'>
						모든 사람이 최고의 교육을 받을 수 있는 세상을 만들기 위해, 열정 있는 동료를 찾고 있습니다.
					</p>
				</div>
			</section>

			<section className='sticky top-[70px] z-20 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur'>
				<div className='mx-auto flex max-w-6xl flex-wrap gap-2'>
					{categories.map((item) => (
						<button
							type='button'
							key={item.key}
							onClick={() => setActiveCategory(item.key)}
							className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
								activeCategory === item.key
									? 'border-[#6366f1] bg-[#6366f1] text-white'
									: 'border-slate-200 bg-white text-slate-600 hover:border-[#6366f1] hover:bg-indigo-50 hover:text-[#6366f1]'
							}`}
						>
							{item.label}
						</button>
					))}
				</div>
			</section>

			<section className='bg-slate-50 px-6 py-12'>
				<div className='mx-auto max-w-6xl'>
					<div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
						<h2 className='text-2xl font-bold text-slate-900'>채용 중인 포지션</h2>
						<span className='text-sm font-semibold text-slate-500'>
							총 <strong className='text-[#6366f1]'>{filteredJobs.length}</strong>개의 포지션
						</span>
					</div>

					{filteredJobs.length === 0 ? (
						<div className='rounded-2xl border border-slate-200 bg-white p-10 text-center'>
							<Briefcase className='mx-auto text-slate-300' size={40} />
							<p className='mt-3 text-slate-500'>해당 분야의 채용 공고가 없습니다.</p>
						</div>
					) : (
						<div className='space-y-4'>
							{filteredJobs.map((job) => (
								<article key={`${job.category}-${job.title}`} className='group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md md:p-8'>
									<span className='inline-flex rounded-md bg-indigo-50 px-3 py-1 text-xs font-bold text-[#6366f1]'>{job.categoryLabel}</span>
									<h3 className='mt-3 text-xl font-bold text-slate-900'>{job.title}</h3>
									<p className='mt-2 max-w-4xl text-sm leading-7 text-slate-600'>{job.description}</p>
									<div className='mt-4 flex flex-wrap gap-4 text-xs text-slate-500'>
										<span className='inline-flex items-center gap-1'>
											<MapPin size={14} /> {job.location}
										</span>
										<span className='inline-flex items-center gap-1'>
											<Briefcase size={14} /> {job.type}
										</span>
										<span className='inline-flex items-center gap-1'>
											<Users size={14} /> {job.experience}
										</span>
									</div>
									<ArrowRight className='absolute right-6 top-1/2 hidden -translate-y-1/2 text-indigo-200 transition group-hover:translate-x-1 group-hover:text-[#6366f1] md:block' size={22} />
								</article>
							))}
						</div>
					)}
				</div>
			</section>

			<section className='bg-white px-6 py-16'>
				<div className='mx-auto max-w-6xl'>
					<div className='text-center'>
						<h2 className='text-3xl font-bold text-slate-900'>이런 문화 속에서 일해요</h2>
						<p className='mt-2 text-slate-500'>튜터링고가 일하는 방식</p>
					</div>
					<div className='mt-8 grid gap-4 md:grid-cols-3'>
						{cultures.map((item) => {
							const Icon = item.icon
							return (
								<article key={item.title} className='rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 p-7 transition hover:-translate-y-1 hover:shadow-md'>
									<div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBgClassName}`}>
										<Icon size={28} />
									</div>
									<h3 className='mt-5 text-xl font-bold text-slate-900'>{item.title}</h3>
									<p className='mt-3 text-sm leading-7 text-slate-600'>{item.description}</p>
								</article>
							)
						})}
					</div>
				</div>
			</section>

			<section className='bg-slate-50 px-6 py-16'>
				<div className='mx-auto grid max-w-6xl gap-4 lg:grid-cols-2'>
					{benefits.map((group) => {
						const GroupIcon = group.icon
						return (
							<article key={group.title} className='h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
								<h3 className={`inline-flex items-center gap-2 text-xl font-bold ${group.titleClassName}`}>
									<GroupIcon size={20} /> {group.title}
								</h3>
								<div className='mt-4 space-y-1'>
									{group.items.map((item) => {
										const ItemIcon = item.icon
										return (
											<div key={item.label} className='flex items-start gap-3 border-b border-slate-100 py-4 last:border-b-0'>
												<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${group.itemIconClassName}`}>
													<ItemIcon size={18} />
												</div>
												<div>
													<h4 className='text-sm font-bold text-slate-900'>{item.label}</h4>
													<p className='mt-1 text-sm text-slate-600'>{item.detail}</p>
												</div>
											</div>
										)
									})}
								</div>
							</article>
						)
					})}
				</div>
			</section>

			<section className='bg-white px-6 py-16'>
				<div className='mx-auto max-w-6xl'>
					<div className='text-center'>
						<h2 className='text-3xl font-bold text-slate-900'>합류 여정</h2>
						<p className='mt-2 text-slate-500'>지원부터 합류까지의 과정을 안내해 드립니다</p>
					</div>
					<div className='mt-8 grid gap-4 md:grid-cols-4'>
						{processSteps.map((step, index) => (
							<article key={step.title} className='rounded-2xl border border-slate-200 p-5 text-center'>
								<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-indigo-400 text-lg font-extrabold text-white'>
									{index + 1}
								</div>
								<h3 className='mt-4 text-base font-bold text-slate-900'>{step.title}</h3>
								<p className='mt-2 text-sm text-slate-600'>{step.description}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className='bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-6 py-16 text-center text-white'>
				<h2 className='text-3xl font-extrabold md:text-4xl'>
					함께 교육의 미래를
					<br className='hidden md:block' />
					만들어갈 동료를 찾습니다
				</h2>
				<p className='mt-3 text-indigo-100'>당신의 가능성을 튜터링고에서 펼쳐보세요</p>
				<a href='mailto:recruit@tutoringgo.com' className='mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-[#6366f1] transition hover:-translate-y-0.5 hover:bg-slate-100'>
					<Briefcase size={16} /> 지원하기
				</a>
			</section>
		</Layout>
	)
}

export default Jobs
