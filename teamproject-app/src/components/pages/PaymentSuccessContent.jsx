import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../common/Layout'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'

const formatAmount = (value) => {
	const amount = Number(value)
	if (Number.isNaN(amount)) return '-'
	return `${amount.toLocaleString('ko-KR')}원`
}

const PaymentSuccessContent = () => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { isLoading: authLoading, isLogin } = useAuth()
	const [confirming, setConfirming] = useState(false)
	const [status, setStatus] = useState('')

	const paymentKey = searchParams.get('paymentKey') || ''
	const orderId = searchParams.get('orderId') || ''
	const amount = searchParams.get('amount') || ''

	const amountLabel = useMemo(() => formatAmount(amount), [amount])

	useEffect(() => {
		if (authLoading) return
		if (!isLogin) {
			setStatus('로그인이 필요합니다.')
			return
		}
		if (!paymentKey || !orderId || !amount) {
			setStatus('결제 파라미터가 올바르지 않습니다.')
			return
		}

		const confirmPayment = async () => {
			setConfirming(true)
			setStatus('결제 승인 확인 중입니다...')
			try {
				await api.post('/payments/toss/confirm', {
					paymentKey,
					orderId,
					amount: Number(amount),
				})
				setStatus('결제가 완료되었습니다. 마이페이지로 이동합니다.')
				setTimeout(() => navigate('/member/mypage'), 1200)
			} catch (err) {
				setStatus(err?.response?.data?.message || '결제 확인에 실패했습니다.')
			} finally {
				setConfirming(false)
			}
		}

		confirmPayment()
	}, [amount, authLoading, isLogin, navigate, orderId, paymentKey])

	return (
		<Layout>
			<section className='bg-[#f8fafc] px-4 py-10'>
				<div className='mx-auto max-w-2xl'>
					<div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
						<div className='text-center'>
							<h1 className='text-2xl font-extrabold text-slate-900'>결제 성공</h1>
							<p className='mt-2 text-sm text-slate-500'>결제가 정상 처리되었습니다.</p>
						</div>

						<div className='mt-6 space-y-2 rounded-xl bg-slate-50 p-4 text-sm'>
							<div><span className='font-semibold text-slate-700'>결제 키:</span> <span className='text-slate-600'>{paymentKey || '-'}</span></div>
							<div><span className='font-semibold text-slate-700'>주문 ID:</span> <span className='text-slate-600'>{orderId || '-'}</span></div>
							<div><span className='font-semibold text-slate-700'>금액:</span> <span className='text-slate-600'>{amountLabel}</span></div>
						</div>

						<p className={`mt-4 text-sm font-semibold ${status.includes('실패') || status.includes('올바르지') || status.includes('필요') ? 'text-red-500' : 'text-emerald-600'}`}>
							{status || (confirming ? '확인 중...' : '')}
						</p>

						<div className='mt-6 flex justify-center'>
							<Link to='/' className='rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>홈으로</Link>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}

export default PaymentSuccessContent
