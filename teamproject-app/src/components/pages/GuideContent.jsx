import { Link } from 'react-router-dom'
import Layout from '../common/Layout'

const faqs = [
	{
		q: '튜터링고 서비스는 어떻게 이용하나요?',
		a: '회원가입 후 원하는 과목과 조건으로 튜터를 검색하고 예약 및 결제를 진행하면 됩니다.',
	},
	{
		q: '회원가입은 필수인가요?',
		a: '검색은 비회원도 가능하지만 예약과 결제를 위해서는 회원가입이 필요합니다.',
	},
	{
		q: '환불은 가능한가요?',
		a: '수업 시작 24시간 전까지는 전액 환불이 가능하며, 이후에는 정책에 따라 부분 환불됩니다.',
	},
	{
		q: '온라인/오프라인 수업 모두 가능한가요?',
		a: '튜터별 제공 방식이 다르며, 검색 필터로 원하는 수업 방식을 선택할 수 있습니다.',
	},
]

const links = [
	{ title: '이용 안내(상세)', to: '/guide/tutor-guide', desc: '학습자/튜터 이용 절차를 단계별로 확인하세요.' },
	{ title: '튜터링고 소개', to: '/about', desc: '서비스 비전과 핵심 가치를 확인하세요.' },
	{ title: '세계인들의 언어', to: '/guide/language', desc: '인기 언어와 문화 포인트를 살펴보세요.' },
	{ title: '자주 묻는 질문', to: '/faq', desc: '서비스 이용 중 자주 묻는 질문을 빠르게 확인하세요.' },
	{ title: '문의하기', to: '/contact', desc: '문의 접수와 내 문의 내역 확인을 한 번에 진행할 수 있어요.' },
	{ title: '파트너십', to: '/partnership', desc: '튜터링고와 함께하는 주요 협력사를 소개합니다.' },
	{ title: '채용', to: '/jobs', desc: '현재 오픈된 포지션과 합류 절차를 확인하세요.' },
	{ title: '이용약관', to: '/guide/policies', desc: '서비스 이용약관 및 기본 정책을 안내합니다.' },
	{ title: '튜터 찾기', to: '/tutors', desc: '조건에 맞는 튜터를 검색하고 비교해 보세요.' },
]

const Guide = () => {
	return (
		<Layout>
			<section className='bg-slate-50 px-6 py-16'>
				<div className='mx-auto max-w-5xl'>
					<div className='mb-10 text-center'>
						<h1 className='text-4xl font-extrabold text-slate-900 md:text-5xl'>이용 안내</h1>
						<p className='mt-3 text-slate-500'>자주 묻는 질문과 주요 안내를 확인하세요.</p>
					</div>

					<div className='space-y-4'>
						{faqs.map((item) => (
							<details key={item.q} className='group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
								<summary className='cursor-pointer list-none text-lg font-semibold text-slate-900'>
									<span className='mr-2 text-[#4f46e5]'>Q.</span>{item.q}
								</summary>
								<p className='mt-3 leading-7 text-slate-600'><span className='mr-2 font-semibold text-[#4f46e5]'>A.</span>{item.a}</p>
							</details>
						))}
					</div>

					<div className='mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{links.map((item) => (
							<Link key={item.title} to={item.to} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#4f46e5]'>
								<h3 className='text-lg font-bold text-slate-900'>{item.title}</h3>
								<p className='mt-2 text-sm leading-6 text-slate-500'>{item.desc}</p>
							</Link>
						))}
					</div>
				</div>
			</section>
		</Layout>
	)
}

export default Guide


