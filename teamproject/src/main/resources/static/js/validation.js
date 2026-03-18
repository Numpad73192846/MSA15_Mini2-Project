/**
 *  유효성 검사 
 */
function checkUser() {
	let form = document.joinForm
	let password = form.pw
	
	let msg = ''	

	// 비밀번호 체크
	let passwordCheck = /^(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/
	msg = '비밀번호는 6자 이상이며 특수문자를 1개 이상 포함해야 합니다.' 
	if( !check(passwordCheck, password, msg) ) return false	

	return true
}

// 정규표현식 유효성 검사 함수
function check(regExp, element, msg) {
	
	if( regExp.test(element.value) ) {
		return true
	}
	alert(msg)
	element.select()
	element.focus()
	return false
}