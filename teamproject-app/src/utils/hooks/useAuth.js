import { useContext } from 'react'
import LoginContext from '../context/LoginContext'

const useAuth = () => {

	const context = useContext(LoginContext)

	if ( !context ) {
		throw new Error('Provider 로 지정받은 컴포넌트에서만 사용할 수 있습니다.')
	}

	return context

}

export default useAuth

