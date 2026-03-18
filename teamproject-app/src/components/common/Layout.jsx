import Header from '../Header'
import Footer from '../Footer'

const Layout = ({ children }) => {
	return (
		<div className='flex min-h-screen flex-col bg-[#f8fafc] text-slate-800'>
			<Header />
			<main className='flex-1 pt-[70px]'>
				{ children }
			</main>
			<Footer />
		</div>
	)
}

export default Layout