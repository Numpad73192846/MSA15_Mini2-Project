import { Globe } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../common/Layout'
import samsungLogo from '../../assets/image/partner/samsung.svg'
import lgLogo from '../../assets/image/partner/lg.svg'
import hyundaiLogo from '../../assets/image/partner/hyundai.svg'
import skLogo from '../../assets/image/partner/sk.png'
import naverLogo from '../../assets/image/partner/naver.svg'
import kakaoLogo from '../../assets/image/partner/daum.svg'

const partners = [
	{
		name: '삼성전자',
		summary: '글로벌 IT 리더인 삼성전자와 함께 기술 교육 및 인재 양성 프로그램을 운영하고 있습니다.',
		logo: samsungLogo,
		logoClassName: 'h-16 w-20',
	},
	{
		name: 'LG전자',
		summary: 'LG전자와 협력하여 AI 및 전자공학 분야의 전문 교육 콘텐츠를 제공하고 있습니다.',
		logo: lgLogo,
		logoClassName: 'h-16 w-16',
	},
	{
		name: '현대자동차',
		summary: '현대자동차와 함께 자동차 공학 및 미래 모빌리티 관련 교육 프로그램을 진행하고 있습니다.',
		logo: hyundaiLogo,
		logoClassName: 'h-16 w-16',
	},
	{
		name: 'SK하이닉스',
		summary: 'SK하이닉스와 반도체 기술 교육 및 전문 인력 양성을 위한 협력을 진행하고 있습니다.',
		logo: skLogo,
		logoClassName: 'h-14 w-16',
	},
	{
		name: '네이버',
		summary: '네이버와 함께 IT 개발 및 클라우드 기술 관련 교육 프로그램을 운영하고 있습니다.',
		logo: naverLogo,
		logoClassName: 'h-16 w-16',
	},
	{
		name: '카카오',
		summary: '카카오와 협력하여 모바일 서비스 및 플랫폼 개발 교육을 제공하고 있습니다.',
		logo: kakaoLogo,
		logoClassName: 'h-16 w-16',
	},
]

const Partner = () => (
	<Layout>
		<section className='bg-slate-50 px-6 py-16'>
			<div className='mx-auto max-w-6xl space-y-8'>
				<div className='text-center'>
					<h1 className='text-4xl font-extrabold text-slate-900 md:text-5xl'>파트너십</h1>
					<p className='mt-3 text-slate-500'>튜터링고와 함께하는 글로벌 파트너 기업들</p>
				</div>

				<div className='mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm'>
					<h2 className='text-2xl font-bold text-slate-900'>신뢰할 수 있는 파트너와 함께합니다</h2>
					<p className='mt-4 leading-8 text-slate-600'>
						튜터링고는 국내외 주요 기업들과 전략적 파트너십을 맺고 교육 서비스의 품질 향상과 글로벌 확장을 추진하고 있습니다.
					</p>
				</div>

				<div className='mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
					<h3 className='text-center text-2xl font-bold text-slate-900'>주요 파트너 기업</h3>
					<div className='mt-8 grid gap-4 md:grid-cols-2'>
						{partners.map((item) => (
							<article key={item.name} className='h-full rounded-2xl border border-slate-200 p-5'>
								<div className='flex items-start gap-4'>
									<div className='flex h-20 w-24 items-center justify-center rounded-xl bg-slate-100'>
										<img src={item.logo} alt={item.name} className={`${item.logoClassName} object-contain`} />
									</div>
									<div>
										<h4 className='text-lg font-bold text-slate-900'>{item.name}</h4>
										<p className='mt-2 text-sm leading-7 text-slate-600'>{item.summary}</p>
									</div>
								</div>
							</article>
						))}
					</div>
				</div>

				<div className='mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-slate-100 p-8 text-center shadow-sm'>
					<div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600'>
						<Globe size={30} strokeWidth={2.2} />
					</div>
					<h3 className='mt-4 text-xl font-bold text-slate-900'>글로벌 파트너십</h3>
					<p className='mt-2 text-sm leading-7 text-slate-600'>
						이런 기업들 외에도 수많은 해외 기업들과 함께 하고 있습니다. 튜터링고는 지속적으로 글로벌 파트너십을 확대하여
						더 나은 교육 서비스를 제공하기 위해 노력하고 있습니다.
					</p>
				</div>

				<div className='text-center'>
					<h3 className='text-2xl font-bold text-slate-900'>파트너십 문의</h3>
					<p className='mt-2 text-slate-500'>튜터링고와 함께 성장하고 싶으신가요?</p>
					<div className='mt-5 flex flex-wrap justify-center gap-3'>
						<Link to='/contact' className='inline-flex min-w-36 items-center justify-center rounded-xl bg-[#0d6efd] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0b5ed7]'>
							문의하기
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

export default Partner
