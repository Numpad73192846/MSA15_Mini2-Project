package com.aloha.teamproject.service;

import com.aloha.teamproject.dto.Auth;
import com.aloha.teamproject.dto.Users;

public interface LoginService {
	
	public Auth.TokenResponse login(Users user) throws Exception;

	public Auth.TokenResponse tokenRefresh(String refreshToken)  throws Exception;

	public void logout(String refreshToken)  throws Exception;

	// 소셜 로그인 (간편 로그인)
	public Auth.TokenResponse socialLogin(String provider, String role) throws Exception;

	public Auth.TokenResponse issueTokensForUserId(String userId) throws Exception;

	public Auth.TokenResponse assignOAuthRole(String userId, String role) throws Exception;
	
}
