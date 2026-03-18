import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AdminLayout from '../common/AdminLayout'
import api from '../../services/api'
import useAuth from '../../utils/hooks/useAuth'

const tabs = [
	{ key: 'dashboard', label: '대시보드' },
	{ key: 'doc', label: '서류 검토' },
	{ key: 'settlement', label: '수입 정산' },
	{ key: 'users', label: '회원 관리' },
	{ key: 'tickets', label: '문의/신고' },
]

const toArray = (value) => (Array.isArray(value) ? value : [])

const AdminContent = () => {
	const { isLoading: authLoading, isLogin, hasRole } = useAuth()
	const [searchParams, setSearchParams] = useSearchParams()
	const activeTab = searchParams.get('tab') || 'dashboard'

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [documents, setDocuments] = useState([])
	const [settlements, setSettlements] = useState([])
	const [users, setUsers] = useState([])
	const [inquiries, setInquiries] = useState([])
	const [inquirySummary, setInquirySummary] = useState(null)

	const loadAdminData = async () => {
		setLoading(true)
		setError('')
		try {
			const [docRes, settlementRes, userRes, inquiryRes, summaryRes] = await Promise.all([
				api.get('/admin/documents'),
				api.get('/admin/settlements'),
				api.get('/admin/users'),
				api.get('/admin/inquiries'),
				api.get('/admin/inquiries/summary'),
			])
			setDocuments(toArray(docRes.data?.data))
			setSettlements(toArray(settlementRes.data?.data))
			setUsers(toArray(userRes.data?.data))
			setInquiries(toArray(inquiryRes.data?.data))
			setInquirySummary(summaryRes.data?.data || null)
		} catch (err) {
			setError(err?.response?.data?.message || '관리자 데이터를 불러오지 못했습니다.')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (authLoading) return
		if (!isLogin || !hasRole('ROLE_ADMIN')) {
			setLoading(false)
			return
		}
		loadAdminData()
	}, [authLoading, hasRole, isLogin])

	const kpis = useMemo(() => {
		const totalSettlement = settlements.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)
		const waitingSettlements = settlements.filter((item) => Number(item.balance || 0) > 0).length
		const waitingDocs = documents.filter((item) => !item.reviewedAt).length
		const activeUsers = users.filter((item) => item.enabled !== false && item.status !== 'INACTIVE').length
		return { totalSettlement, waitingSettlements, waitingDocs, activeUsers }
	}, [documents, settlements, users])

	const changeTab = (key) => {
		setSearchParams({ tab: key })
	}

	const handleApproveDoc = async (id) => {
		await api.post('/admin/documents/approve', { id })
		await loadAdminData()
	}

	const handleRejectDoc = async (id) => {
		const reason = window.prompt('반려 사유를 입력하세요.', '보완이 필요합니다.')
		if (reason === null) return
		await api.post('/admin/documents/reject', { id, reason })
		await loadAdminData()
	}

	const handleRemit = async (tutorId) => {
		await api.post('/admin/settlements/remit', { tutorId })
		await loadAdminData()
	}

	const handleRoleChange = async (id, role) => {
		await api.patch(`/admin/users/${id}/role`, { role })
		await loadAdminData()
	}

	const handleStatusChange = async (id, status) => {
		await api.patch(`/admin/users/${id}/status`, { status })
		await loadAdminData()
	}

	if (authLoading || loading) {
		return (
			<AdminLayout>
				<div className='flex min-h-[60vh] items-center justify-center'>
					<div className='h-10 w-10 animate-spin rounded-full border-4 border-[#4f46e5] border-t-transparent' />
				</div>
			</AdminLayout>
		)
	}

	if (!isLogin) {
		return (
			<AdminLayout>
				<div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
					<h2 className='text-2xl font-bold text-slate-900'>로그인이 필요합니다</h2>
					<Link to='/login' className='rounded-xl bg-[#4f46e5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338ca]'>로그인하기</Link>
				</div>
			</AdminLayout>
		)
	}

	if (!hasRole('ROLE_ADMIN')) {
		return (
			<AdminLayout>
				<div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
					<h2 className='text-2xl font-bold text-slate-900'>관리자 권한이 필요합니다</h2>
					<Link to='/' className='rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50'>홈으로 이동</Link>
				</div>
			</AdminLayout>
		)
	}

	return (
		<AdminLayout>
			<section className='bg-[#f8fafc] px-4 py-10'>
				<div className='mx-auto max-w-7xl'>
					<div className='mb-6 flex items-center justify-between gap-3'>
						<div>
							<h1 className='text-3xl font-extrabold text-slate-900'>관리자 대시보드</h1>
							<p className='mt-1 text-sm text-slate-500'>운영 데이터와 승인 작업을 한 곳에서 관리합니다.</p>
						</div>
						<button type='button' onClick={loadAdminData} className='rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'>새로고침</button>
					</div>

					<div className='mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
						<KpiCard label='총 정산 금액' value={`${kpis.totalSettlement.toLocaleString('ko-KR')}원`} />
						<KpiCard label='정산 대기' value={`${kpis.waitingSettlements}건`} />
						<KpiCard label='서류 대기' value={`${kpis.waitingDocs}건`} />
						<KpiCard label='활성 사용자' value={`${kpis.activeUsers}명`} />
					</div>

					<div className='mb-4 flex flex-wrap gap-2'>
						{tabs.map((tab) => (
							<button
								key={tab.key}
								type='button'
								onClick={() => changeTab(tab.key)}
								className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === tab.key ? 'bg-[#4f46e5] text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
							>
								{tab.label}
							</button>
						))}
					</div>

					{error && <p className='mb-4 text-sm font-semibold text-red-500'>{error}</p>}

					<div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
						{activeTab === 'dashboard' && (
							<div className='grid gap-4 md:grid-cols-2'>
								<SimpleList title='최근 문의' items={inquiries.slice(0, 5).map((item) => `${item.title || '문의'} · ${item.status || '-'}`)} empty='문의가 없습니다.' />
								<SimpleList title='문의 요약' items={inquirySummary ? Object.entries(inquirySummary).map(([key, value]) => `${key}: ${value ?? '-'}`) : []} empty='요약 데이터가 없습니다.' />
							</div>
						)}

						{activeTab === 'doc' && (
							<Table
								headers={['ID', '유형', '회원', '상태', '액션']}
								rows={documents.map((item) => ([
									item.id || '-',
									item.docType || '-',
									item.userId || '-',
									item.reviewedAt ? '검토완료' : '대기',
									<div key={`doc-act-${item.id}`} className='flex gap-2'>
										<button type='button' onClick={() => handleApproveDoc(item.id)} className='rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white'>승인</button>
										<button type='button' onClick={() => handleRejectDoc(item.id)} className='rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white'>반려</button>
									</div>,
								]))}
								empty='서류 데이터가 없습니다.'
							/>
						)}

						{activeTab === 'settlement' && (
							<Table
								headers={['튜터 ID', '총액', '정산완료', '잔액', '액션']}
								rows={settlements.map((item) => ([
									item.tutorId || '-',
									`${Number(item.totalAmount || 0).toLocaleString('ko-KR')}원`,
									`${Number(item.remittedAmount || 0).toLocaleString('ko-KR')}원`,
									`${Number(item.balance || 0).toLocaleString('ko-KR')}원`,
									<button key={`remit-${item.tutorId}`} type='button' onClick={() => handleRemit(item.tutorId)} className='rounded-lg bg-[#4f46e5] px-2 py-1 text-xs font-semibold text-white'>송금 처리</button>,
								]))}
								empty='정산 데이터가 없습니다.'
							/>
						)}

						{activeTab === 'users' && (
							<Table
								headers={['ID', '이름', '이메일', '상태', '권한']}
								rows={users.map((item) => ([
									item.id || item.userId || '-',
									item.name || '-',
									item.email || '-',
									<select
										key={`status-${item.id || item.userId}`}
										defaultValue={item.status || 'ACTIVE'}
										onChange={(event) => handleStatusChange(item.id || item.userId, event.target.value)}
										className='rounded-md border border-slate-300 px-2 py-1 text-xs'
									>
										<option value='ACTIVE'>ACTIVE</option>
										<option value='INACTIVE'>INACTIVE</option>
									</select>,
									<select
										key={`role-${item.id || item.userId}`}
										defaultValue={item.role || item.auth || 'ROLE_USER'}
										onChange={(event) => handleRoleChange(item.id || item.userId, event.target.value)}
										className='rounded-md border border-slate-300 px-2 py-1 text-xs'
									>
										<option value='ROLE_USER'>ROLE_USER</option>
										<option value='ROLE_TUTOR'>ROLE_TUTOR</option>
										<option value='ROLE_ADMIN'>ROLE_ADMIN</option>
									</select>,
								]))}
								empty='회원 데이터가 없습니다.'
							/>
						)}

						{activeTab === 'tickets' && (
							<Table
								headers={['문의 ID', '카테고리', '제목', '상태', '작성자']}
								rows={inquiries.map((item) => ([
									item.id || item.inquiryId || '-',
									item.category || '-',
									item.title || '-',
									item.status || '-',
									item.userId || item.username || '-',
								]))}
								empty='문의 데이터가 없습니다.'
							/>
						)}
					</div>
				</div>
			</section>
		</AdminLayout>
	)
}

const KpiCard = ({ label, value }) => (
	<div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
		<p className='text-xs font-semibold text-slate-500'>{label}</p>
		<p className='mt-2 text-2xl font-extrabold text-slate-900'>{value}</p>
	</div>
)

const SimpleList = ({ title, items, empty }) => (
	<div className='rounded-xl border border-slate-200 p-4'>
		<h3 className='mb-3 text-sm font-bold text-slate-900'>{title}</h3>
		{items.length === 0 ? (
			<p className='text-sm text-slate-500'>{empty}</p>
		) : (
			<ul className='space-y-2 text-sm text-slate-700'>
				{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
			</ul>
		)}
	</div>
)

const Table = ({ headers, rows, empty }) => (
	<div className='overflow-x-auto'>
		<table className='min-w-full border-collapse text-left text-sm'>
			<thead>
				<tr className='border-b border-slate-200 text-slate-500'>
					{headers.map((header) => (
						<th key={header} className='px-3 py-2 font-semibold'>{header}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.length === 0 ? (
					<tr>
						<td colSpan={headers.length} className='px-3 py-6 text-center text-slate-500'>{empty}</td>
					</tr>
				) : rows.map((row, index) => (
					<tr key={index} className='border-b border-slate-100'>
						{row.map((cell, cellIndex) => (
							<td key={`${index}-${cellIndex}`} className='px-3 py-2 text-slate-700'>{cell}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	</div>
)

export default AdminContent
