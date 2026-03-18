import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import LoginContext from './LoginContext'


const LoginContextProvider = ({ children }) => {

	const [isLoading, setIsLoading] = useState(true)
	const [isLogin, setIsLogin] = useState(false)
	const [userInfo, setUserInfo] = useState(null)
	const [roles, setRoles] = useState(new Set())
	const didInitialRefresh = useRef(false)

	const navigate = useNavigate()

	const clearAuthState = useCallback(() => {
		setIsLogin(false)
		setUserInfo(null)
		setRoles(new Set())
	}, [])

	const normalizeAuthData = (payload) => {
		if (!payload) return null
		if (payload.success === false) return null
		if (payload.success === true) return payload.data || null
		if (payload.data && (payload.data.userId || payload.data.accessToken || payload.data.authList)) return payload.data
		if (payload.userId || payload.accessToken || payload.authList) return payload
		return null
	}

	const parseRoles = (authList) => {

		if (!Array.isArray(authList)) {
			return new Set()
		}

		return new Set(
			authList
				.map((item) => (typeof item === 'string' ? item : item?.auth))
				.filter(Boolean)
		)
	}

	// 권한 확인
	const hasRole = ( role ) => roles.has( role )
	const hasAnyRole = (...roleList ) => roleList.some( (role) => roles.has( role ) )

	const loginSetting = useCallback((payload) => {
		const userdata = normalizeAuthData(payload)
		if (!userdata) {
			clearAuthState()
			return null
		}
		setIsLogin(true)
		setUserInfo(userdata)
		setRoles(parseRoles(userdata.authList || userdata.authorities))
		return userdata
	}, [clearAuthState])

	const refreshUser = useCallback(async () => {
		const response = await api.post('/auth/refresh')
		const userData = loginSetting(response.data)
		if (!userData) {
			throw new Error(response.data?.message || '세션이 없습니다.')
		}
		return userData
	}, [loginSetting])

	useEffect( () => {
		if ( didInitialRefresh.current ) {
			setIsLoading( false )
			return
		}
		didInitialRefresh.current = true
		refreshUser()
		   .catch(() => clearAuthState())
		   .finally( () => setIsLoading( false ) )
	}, [clearAuthState, refreshUser] )

	const login = async ( username, password, rememberMe = false ) => {

		setIsLoading( true )

		try {
			
			const response = await api.post('/auth/login', { username, password, rememberMe })
			const userData = loginSetting(response.data)
			if (!userData) {
				throw new Error(response.data?.message || '로그인에 실패했습니다.')
			}
			navigate( '/' )

		} finally {
			setIsLoading( false )
		}

	}

	const logout = async () => {

		setIsLoading( true )

		try {
			
			await api.post('/auth/logout')

		} finally {
			clearAuthState()
			setIsLoading( false )
			navigate( '/' )
		}
	}

	return (
		<LoginContext.Provider value={{ isLoading, isLogin, userInfo, roles, hasRole, hasAnyRole, login, logout, refreshUser }} >
			{ children }
		</LoginContext.Provider>
	)
}

export default LoginContextProvider


