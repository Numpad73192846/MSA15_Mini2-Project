const AdminLayout = ({ children }) => {
	return (
		<div className='min-h-screen bg-[#f8fafc] text-slate-800'>
			<main className='min-h-screen'>
				{children}
			</main>
		</div>
	)
}

export default AdminLayout
