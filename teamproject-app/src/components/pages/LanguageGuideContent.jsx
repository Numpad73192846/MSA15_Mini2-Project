import { Info, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../common/Layout'
import usFlag from '../../assets/image/introflag/us.jpg'
import cnFlag from '../../assets/image/introflag/cn.jpg'
import idFlag from '../../assets/image/introflag/id.jpg'
import spFlag from '../../assets/image/introflag/sp.jpg'
import frFlag from '../../assets/image/introflag/fr.jpg'
import krFlag from '../../assets/image/introflag/kr.jpg'

const topLanguages = [
	{
		rank: '1',
		name: '영어 (English)',
		subtitle: '세계 공용어의 절대 강자, 국제 비즈니스의 필수 언어',
		description:
			'전 세계 약 15억 명 이상이 사용하며, 약 100개국 이상에서 공용어로 지정된 영어는 국제 비즈니스, 학술 연구, 여행의 핵심 언어입니다. 원어민 튜터와 함께 회화, 비즈니스 영어, TOEIC 등 다양한 학습 목표를 달성하세요.',
		count: '15억+',
		countLabel: '전체 사용자 수',
		tags: ['Hollywood', 'Netflix', 'Silicon Valley', 'Harry Potter', 'Marvel'],
		image: usFlag,
		overlayClassName: 'from-amber-200/70 to-sky-900/70',
		rankClassName: 'from-amber-400 to-orange-500',
		featured: true,
	},
	{
		rank: '2',
		name: '중국어 (Mandarin)',
		subtitle: '세계 최대 시장과 소통하는 열쇠',
		description:
			'약 11~12억 명이 사용하는 중국어는 모국어 사용자 수 1위 언어입니다. 거대한 중국 시장 진출을 위한 비즈니스 필수 언어로, HSK 시험부터 실용 회화까지 체계적으로 학습하세요.',
		tags: ['만리장성', '중국요리', '무협소설', 'TikTok'],
		image: cnFlag,
		overlayClassName: 'from-red-600/60 to-red-900/60',
		rankClassName: 'from-red-500 to-red-700',
	},
	{
		rank: '3',
		name: '힌디어 (Hindi)',
		subtitle: '떠오르는 IT 강국, 인도의 주요 언어',
		description:
			'약 6억 명 이상이 사용하는 힌디어는 인도의 공용어입니다. 세계 IT 산업의 중심지이자 거대 소비 시장으로 성장 중인 인도와 소통하기 위한 필수 언어입니다.',
		tags: ['볼리우드', '요가', '카레', '크리켓'],
		image: idFlag,
		overlayClassName: 'from-amber-500/60 to-amber-800/60',
		rankClassName: 'from-amber-500 to-orange-600',
	},
	{
		rank: '4',
		name: '스페인어 (Spanish)',
		subtitle: '정열의 언어, 남미 전역을 아우르는 언어',
		description:
			'약 5억 4천만 명 이상이 사용하며, 스페인과 남미 20개국에서 공용어로 사용됩니다. 로망스 언어의 대표로 비즈니스와 여행 모두에서 유용한 언어입니다.',
		tags: ['플라멩코', '축구', '라틴음악', '타파스'],
		image: spFlag,
		overlayClassName: 'from-red-500/60 to-red-700/60',
		rankClassName: 'from-emerald-500 to-emerald-700',
	},
	{
		rank: '5',
		name: '프랑스어 (French)',
		subtitle: '우아함의 상징, 국제기구의 공식 언어',
		description:
			'약 2억 7천만 명 이상이 사용하며, 프랑스를 비롯한 29개국에서 공용어로 사용됩니다. 유엔, EU 등 국제기구의 공식 언어로 외교와 문화 분야에서 중요한 역할을 합니다.',
		tags: ['패션', '에펠탑', '향수', '미식'],
		image: frFlag,
		overlayClassName: 'from-blue-500/60 to-blue-700/60',
		rankClassName: 'from-blue-500 to-blue-700',
	},
]

const koreanLanguage = {
	name: '한국어 (Korean)',
	subtitle: 'K-문화와 함께 전 세계로 뻗어나가는 언어',
	description:
		'약 7,700~8,000만 명이 사용하는 한국어는 세계 언어 사용 순위 약 12~15위권에 위치합니다. 하지만 K-POP, K-드라마, K-무비 등 한류 열풍과 함께 학습 수요가 폭발적으로 증가하고 있는 주목받는 언어입니다.',
	tags: ['BTS', '블랙핑크', '오징어게임', '기생충', 'K-POP'],
	image: krFlag,
}

const LanguageGuide = () => {
	const featured = topLanguages[0]
	const others = topLanguages.slice(1)

	return (
		<Layout>
			<section className='relative overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2] px-6 py-20 text-white'>
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_45%)]' />
				<div className='relative mx-auto max-w-6xl text-center'>
					<span className='inline-flex rounded-full border border-white/40 bg-white/20 px-5 py-1.5 text-sm font-semibold'>Global Languages</span>
					<h1 className='mt-6 text-4xl font-black tracking-tight md:text-6xl'>전세계 사용언어 TOP 5</h1>
					<p className='mx-auto mt-4 max-w-3xl text-lg leading-8 text-white/90'>
						다양한 분야의 전문가를 만나보세요
						<br />
						튜터링고에서 다양한 국적의 언어를 학습하세요!
					</p>
				</div>
			</section>

			<section className='bg-slate-50 px-6 py-16'>
				<div className='mx-auto max-w-6xl space-y-6'>
					<article className='relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm'>
						<img src={featured.image} alt={featured.name} className='absolute inset-0 h-full w-full object-cover opacity-40' />
						<div className={`absolute inset-0 bg-gradient-to-br ${featured.overlayClassName}`} />
						<div className='relative grid gap-6 p-8 text-slate-900 md:grid-cols-[1fr_200px] md:p-10'>
							<div>
								<div className='mb-4 flex items-center gap-3'>
									<span className={`inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-black text-white ${featured.rankClassName}`}>
										{featured.rank}
									</span>
									<img src={featured.image} alt='영어 국기' className='h-20 w-20 rounded-full border-4 border-white/90 object-cover shadow-md' />
								</div>
								<h2 className='text-3xl font-black md:text-4xl'>{featured.name}</h2>
								<p className='mt-3 text-lg font-semibold text-slate-800'>{featured.subtitle}</p>
								<p className='mt-4 text-sm leading-8 text-slate-800'>{featured.description}</p>
								<div className='mt-5 flex flex-wrap gap-2'>
									{featured.tags.map((tag) => (
										<span key={tag} className='rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-semibold text-white'>
											{tag}
										</span>
									))}
								</div>
							</div>
							<div className='self-center text-center'>
								<p className='text-5xl font-black text-slate-900/80 md:text-6xl'>{featured.count}</p>
								<p className='mt-2 text-xs font-semibold text-slate-700'>{featured.countLabel}</p>
							</div>
						</div>
					</article>

					<div className='grid gap-4 lg:grid-cols-2'>
						{others.map((item) => (
							<article key={item.rank} className='relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm'>
								<img src={item.image} alt={item.name} className='absolute inset-0 h-full w-full object-cover opacity-40' />
								<div className={`absolute inset-0 bg-gradient-to-br ${item.overlayClassName}`} />
								<div className='relative p-7 text-slate-900'>
									<div className='mb-4 flex items-start justify-between'>
										<span className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-xl font-black text-white ${item.rankClassName}`}>
											{item.rank}
										</span>
										<img src={item.image} alt={item.name} className='h-16 w-16 rounded-full border-4 border-white/90 object-cover shadow-md' />
									</div>
									<h3 className='text-2xl font-black'>{item.name}</h3>
									<p className='mt-2 text-sm font-semibold text-slate-800'>{item.subtitle}</p>
									<p className='mt-3 text-sm leading-7 text-slate-800'>{item.description}</p>
									<div className='mt-4 flex flex-wrap gap-2'>
										{item.tags.map((tag) => (
											<span key={tag} className='rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-semibold text-white'>
												{tag}
											</span>
										))}
									</div>
								</div>
							</article>
						))}
					</div>

					<article className='relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm'>
						<img src={koreanLanguage.image} alt={koreanLanguage.name} className='absolute inset-0 h-full w-full object-cover opacity-40' />
						<div className='absolute inset-0 bg-gradient-to-br from-rose-400/65 to-indigo-700/65' />
						<div className='relative grid gap-6 p-8 text-slate-900 md:grid-cols-[1fr_200px] md:p-10'>
							<div>
								<div className='mb-4 flex items-center gap-3'>
									<span className='inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-600 text-2xl font-black text-white'>
										🔥
									</span>
									<img src={koreanLanguage.image} alt='한국어 국기' className='h-20 w-20 rounded-full border-4 border-white/90 object-cover shadow-md' />
								</div>
								<h2 className='text-3xl font-black md:text-4xl'>{koreanLanguage.name}</h2>
								<p className='mt-3 text-lg font-semibold text-slate-800'>{koreanLanguage.subtitle}</p>
								<p className='mt-4 text-sm leading-8 text-slate-800'>{koreanLanguage.description}</p>
								<div className='mt-5 flex flex-wrap gap-2'>
									{koreanLanguage.tags.map((tag) => (
										<span key={tag} className='rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-semibold text-white'>
											{tag}
										</span>
									))}
								</div>
							</div>
							<div className='self-center text-center'>
								<p className='text-4xl font-black text-slate-900/80 md:text-5xl'>급상승</p>
								<p className='mt-2 text-xs font-semibold text-slate-700'>학습 수요 증가율</p>
							</div>
						</div>
					</article>

					<div className='rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-center'>
						<p className='inline-flex items-start justify-center gap-2 text-sm leading-7 text-slate-600'>
							<Info size={18} className='mt-1 shrink-0 text-indigo-500' />
							위 순위는 2025-2026년 기준 에스놀로그(Ethnologue) 자료를 참고하여 모국어 및 제2외국어 사용자를 모두 포함한
							전체 사용자 수를 기준으로 작성되었습니다.
						</p>
					</div>
				</div>
			</section>

			<section className='relative overflow-hidden bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-6 py-20 text-center text-white'>
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(255,255,255,0.15),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_40%)]' />
				<div className='relative'>
					<h2 className='text-4xl font-black'>지금 바로 시작하세요!</h2>
					<p className='mt-3 text-lg text-indigo-100'>전문 튜터와 함께 원하는 언어를 마스터하세요</p>
					<Link to='/tutors' className='mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold !text-[#6366f1] transition hover:-translate-y-0.5 hover:bg-slate-100'>
						<Search size={16} /> 튜터 찾기
					</Link>
				</div>
			</section>
		</Layout>
	)
}

export default LanguageGuide
