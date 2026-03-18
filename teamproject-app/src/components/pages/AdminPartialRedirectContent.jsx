import { Navigate, useParams } from 'react-router-dom'

const allowedTabs = new Set(['dashboard', 'doc', 'settlement', 'users', 'tickets', 'settings'])

const AdminPartialRedirectContent = () => {
	const { tab } = useParams()
	const safeTab = allowedTabs.has(tab) ? tab : 'dashboard'
	return <Navigate to={`/admin?tab=${safeTab}`} replace />
}

export default AdminPartialRedirectContent
