import { Link } from 'react-router-dom'
import Layout from '../common/Layout'

const faqs = [
	{
		question: '튜터링고 서비스는 어떻게 이용하나요?',
		answer:
			'회원가입 후 원하는 과목과 조건에 맞는 튜터를 검색하여 예약할 수 있습니다. 튜터 프로필에서 학력, 경력, 수업 스타일 등을 확인하고 결제를 진행하면 튜터와 직접 연락하여 수업 일정을 조율할 수 있습니다.',
	},
	{
		question: '회원가입은 필수인가요?',
		answer:
			'네, 튜터 검색은 비회원도 가능하지만 예약 및 결제를 위해서는 회원가입이 필요합니다. 회원가입은 이메일 또는 소셜 로그인을 통해 간편하게 진행하실 수 있습니다.',
	},
	{
		question: '튜터는 어떻게 선택하나요?',
		answer:
			'과목, 지역, 가격대, 수업 방식 등의 필터를 활용하여 원하는 조건의 튜터를 검색할 수 있습니다. 각 튜터의 프로필, 리뷰, 평점을 꼼꼼히 확인하고 나에게 맞는 튜터를 선택하세요.',
	},
	{
		question: '결제는 어떤 방법으로 하나요?',
		answer:
			'신용카드, 체크카드, 계좌이체, 간편결제(카카오페이, 네이버페이 등) 등 다양한 결제 수단을 지원합니다. 결제는 안전한 PG사를 통해 처리되며, 모든 결제 정보는 암호화되어 보호됩니다.',
	},
	{
		question: '환불은 가능한가요?',
		answer:
			'수업 시작 24시간 전까지는 전액 환불이 가능합니다. 수업 시작 24시간 이내 취소 시에는 50% 환불, 수업 시작 후에는 환불이 불가합니다. 단, 튜터의 귀책사유로 수업이 진행되지 못한 경우 전액 환불됩니다.',
	},
	{
		question: '온라인 수업과 오프라인 수업 모두 가능한가요?',
		answer:
			'네, 튜터마다 제공하는 수업 방식이 다릅니다. 온라인 수업만 진행하는 튜터, 오프라인만 진행하는 튜터, 두 가지 모두 가능한 튜터가 있으니 검색 필터를 활용하여 원하는 방식의 튜터를 찾으실 수 있습니다.',
	},
	{
		question: '튜터로 등록하려면 어떻게 하나요?',
		answer:
			"회원가입 후 '튜터 등록' 메뉴에서 학력 및 경력 정보, 자격증, 수업 가능한 과목과 시간, 수업료 등을 입력하여 신청하실 수 있습니다. 심사 후 승인되면 튜터로 활동하실 수 있습니다.",
	},
	{
		question: '튜터의 수업료 정산은 언제 이루어지나요?',
		answer:
			'수업 완료 후 학생이 수업 완료를 확인하면 정산이 진행됩니다. 정산 금액은 매월 1일과 15일에 등록된 계좌로 입금되며, 플랫폼 수수료(10%)를 제외한 금액이 지급됩니다.',
	},
	{
		question: '추가 문의는 어디로 하나요?',
		answer:
			"고객센터(1588-0000) 또는 이메일(support@tutoringo.com)로 문의하실 수 있습니다. 평일 오전 9시부터 오후 6시까지 운영되며, 웹사이트 내 '문의하기' 메뉴를 통해서도 문의 가능합니다.",
	},
	{
		question: '튜터의 신원은 어떻게 확인하나요?',
		answer:
			'모든 튜터는 등록 시 신분증, 학력 증명서, 경력 증명서 등의 서류를 제출하여 엄격한 심사를 거칩니다. 또한 학생들의 리뷰와 평점 시스템을 통해 튜터의 수업 품질을 지속적으로 관리하고 있습니다.',
	},
]

const Faq = () => (
	<Layout>
		<section className='bg-slate-50 px-6 py-16'>
			<div className='mx-auto max-w-5xl'>
				<div className='mb-10 text-center'>
					<h1 className='text-4xl font-extrabold text-slate-900 md:text-5xl'>자주 묻는 질문</h1>
					<p className='mt-3 text-slate-500'>튜터링고 서비스 이용 시 자주 묻는 질문을 확인하세요.</p>
				</div>

				<div className='space-y-4'>
					{faqs.map((item, index) => (
						<details key={item.question} open={index === 0} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
							<summary className='cursor-pointer list-none text-base font-semibold text-slate-900 md:text-lg'>
								<span className='mr-2 text-[#4f46e5]'>Q.</span>
								{item.question}
							</summary>
							<p className='mt-3 text-sm leading-7 text-slate-600 md:text-base'>
								<span className='mr-2 font-semibold text-[#4f46e5]'>A.</span>
								{item.answer}
							</p>
						</details>
					))}
				</div>

				<div className='mt-10 rounded-2xl border border-slate-200 bg-slate-100 p-8 text-center'>
					<h3 className='text-2xl font-bold text-slate-900'>원하는 답변을 찾지 못하셨나요?</h3>
					<p className='mt-2 text-slate-500'>추가 문의사항이 있으시면 언제든지 고객센터로 연락해 주세요.</p>
					<div className='mt-5 flex flex-wrap justify-center gap-3'>
						<Link to='/contact' className='inline-flex min-w-36 items-center justify-center rounded-xl bg-[#0d6efd] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0b5ed7]'>
							문의하기
						</Link>
						<Link to='/guide' className='inline-flex min-w-36 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
							돌아가기
						</Link>
					</div>
				</div>
			</div>
		</section>
	</Layout>
)

export default Faq
