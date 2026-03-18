import { Link, useSearchParams } from 'react-router-dom'
import Layout from '../common/Layout'

const PaymentFailContent = () => {
	const [searchParams] = useSearchParams()
	const orderId = searchParams.get('orderId') || '-'
	const code = searchParams.get('code') || '-'
	const message = searchParams.get('message') || '-'

	return (
		<Layout>
			<section className='bg-[#f8fafc] px-4 py-10'>
				<div className='mx-auto max-w-2xl'>
					<div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
						<div className='text-center'>
							<h1 className='text-2xl font-extrabold text-red-600'>결제 실패</h1>
							<p className='mt-2 text-sm text-slate-500'>결제가 취소되었거나 실패했습니다.</p>
						</div>

						<div className='mt-6 space-y-2 rounded-xl bg-slate-50 p-4 text-sm'>
							<div><span className='font-semibold text-slate-700'>주문 ID:</span> <span className='text-slate-600'>{orderId}</span></div>
							<div><span className='font-semibold text-slate-700'>오류 코드:</span> <span className='text-slate-600'>{code}</span></div>
							<div><span className='font-semibold text-slate-700'>메시지:</span> <span className='text-slate-600'>{message}</span></div>
						</div>

						<p className='mt-4 text-sm font-semibold text-red-500'>결제가 취소되었거나 실패했습니다.</p>

						<div className='mt-6 flex justify-center'>
							<Link to='/member/mypage' className='rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>마이페이지로 이동</Link>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}

export default PaymentFailContent
