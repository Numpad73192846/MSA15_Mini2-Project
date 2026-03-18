import axios from 'axios'

const api = axios.create({
	baseURL: '/api',
	withCredentials: true,
})

api.interceptors.response.use(
	( response ) => response,
	async ( error ) => {

		const originalRequest = error.config
		const status = error.response?.status

		if ( status === 401 && !originalRequest?._retry && originalRequest?.url !== '/auth/refresh' ) {
			originalRequest._retry = true
			await api.post('/auth/refresh')
			return api( originalRequest )
		}

		return Promise.reject( error )
	}
)

export default api