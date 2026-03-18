import Layout from '../common/Layout'

const PlaceholderPage = ({ title, description }) => {
	return (
		<Layout>
			<section className='bg-[#f8fafc] px-4 py-20'>
				<div className='mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200'>
					<p className='mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#4f46e5]'>In Progress</p>
					<h1 className='mb-4 text-4xl font-bold text-slate-900'>{title}</h1>
					<p className='text-lg leading-8 text-slate-500'>{description}</p>
				</div>
			</section>
		</Layout>
	)
}

export default PlaceholderPage

