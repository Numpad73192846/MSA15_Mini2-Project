package com.aloha.teamproject.api;

import java.util.List;

import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.exception.AppException;
import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.dto.Auth;
import com.aloha.teamproject.dto.Users;
import com.aloha.teamproject.model.CustomOAuth2User;
import com.aloha.teamproject.service.LoginService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthApiController {

	private static final long REMEMBER_ME_COOKIE_AGE_SECONDS = 60L * 60L * 24L * 30L;
	
	private final LoginService loginService;

	@PostMapping("/login")
	
	public ApiResponse<Auth.TokenResponse> login(@RequestBody Users user, HttpServletRequest httpRequest, HttpServletResponse response) {
		
		Auth.TokenResponse result;

		try {
			result = loginService.login(user);
		} catch (AppException e) {
			log.error("로그인 실패: {}", e.getMessage());
			return ApiResponse.error(e.getErrorCode().getMessage());
		} catch (Exception e) {
			log.error("로그인 중 오류가 발생했습니다.", e);
			return ApiResponse.error("로그인에 실패했습니다.");
		}
		
		boolean rememberMe = Boolean.TRUE.equals(user.getRememberMe());
		setTokenCookies(response, result.getAccessToken(), result.getRefreshToken(), rememberMe);
		setSessionAuthentication(httpRequest, result);
		return ApiResponse.ok(result, SuccessCode.OK);

	}

	@PostMapping("/refresh")
	public ApiResponse<Auth.TokenResponse> tokenRefresh(@RequestBody(required = false) Auth.RefreshTokenRequest request,
			HttpServletRequest httpRequest,
			HttpServletResponse response) {

		Auth.TokenResponse result;

		try {
			String refreshToken = (request != null) ? request.getRefreshToken() : null;
			if (refreshToken == null || refreshToken.isBlank()) {
				refreshToken = getCookieValue(httpRequest, "refreshToken");
			}
			result = loginService.tokenRefresh(refreshToken);
			Boolean rememberMeRequest = (request != null) ? request.getRememberMe() : null;
			boolean rememberMe = (rememberMeRequest != null)
					? rememberMeRequest.booleanValue()
					: Boolean.parseBoolean(getCookieValue(httpRequest, "rememberMe"));
			setTokenCookies(response, result.getAccessToken(), result.getRefreshToken(), rememberMe);
			return ApiResponse.ok(result, SuccessCode.OK);
		} catch (AppException e) {
			log.error("토큰 갱신 실패: {}", e.getMessage());
			return ApiResponse.error(e.getErrorCode().getMessage());
		} catch (Exception e) {
			log.error("토큰 갱신 중 오류가 발생했습니다.", e);
			return ApiResponse.error("토큰 갱신에 실패했습니다.");
		}
		
	}

	@PostMapping("/logout")
	public ApiResponse<Void> logout(@RequestBody(required = false) Auth.RefreshTokenRequest request,
			HttpServletRequest httpRequest,
			HttpServletResponse response) {

		try {
			String refreshToken = (request != null) ? request.getRefreshToken() : null;
			if (refreshToken == null || refreshToken.isBlank()) {
				refreshToken = getCookieValue(httpRequest, "refreshToken");
			}
			loginService.logout(refreshToken);
			clearTokenCookies(response);
			clearSessionAuthentication(httpRequest);
			return ApiResponse.ok(SuccessCode.LOGOUT_SUCCESS);
		} catch (AppException e) {
			log.error("로그아웃 실패: {}", e.getMessage());
			return ApiResponse.error(e.getErrorCode().getMessage());
		} catch (Exception e) {
			log.error("로그아웃 중 오류가 발생했습니다.", e);
			return ApiResponse.error("로그아웃에 실패했습니다.");
		}
	}

	@PostMapping("/social-login")
	public ApiResponse<Auth.TokenResponse> socialLogin(@RequestBody java.util.Map<String, String> request,
			HttpServletRequest httpRequest,
			HttpServletResponse response) {
		
		Auth.TokenResponse result;

		try {
			String provider = request.get("provider");
			String role = request.get("role");
			log.info("소셜 로그인 요청: provider={}, role={}", provider, role);
			
			result = loginService.socialLogin(provider, role);
			setTokenCookies(response, result.getAccessToken(), result.getRefreshToken(), false);
			setSessionAuthentication(httpRequest, result);
			
			return ApiResponse.ok(result, SuccessCode.OK);
		} catch (AppException e) {
			log.error("소셜 로그인 실패: {}", e.getMessage());
			return ApiResponse.error(e.getErrorCode().getMessage());
		} catch (Exception e) {
			log.error("소셜 로그인 중 오류가 발생했습니다.", e);
			return ApiResponse.error("소셜 로그인에 실패했습니다.");
		}
	}

	@PostMapping("/oauth/role")
	public ApiResponse<Auth.TokenResponse> selectOAuthRole(@RequestBody java.util.Map<String, String> request,
			Authentication authentication,
			HttpServletRequest httpRequest,
			HttpServletResponse response) {
		try {
			String role = request.get("role");
			if (authentication == null || !(authentication.getPrincipal() instanceof CustomOAuth2User)) {
				return ApiResponse.error("OAuth2 authentication not found.");
			}
			CustomOAuth2User oauth2User = (CustomOAuth2User) authentication.getPrincipal();
			Auth.TokenResponse result = loginService.assignOAuthRole(oauth2User.getUserId(), role);
			setTokenCookies(response, result.getAccessToken(), result.getRefreshToken(), false);
			setSessionAuthentication(httpRequest, result);
			return ApiResponse.ok(result, SuccessCode.OK);
		} catch (AppException e) {
			log.error("OAuth role selection failed: {}", e.getMessage());
			return ApiResponse.error(e.getErrorCode().getMessage());
		} catch (Exception e) {
			log.error("OAuth role selection error", e);
			return ApiResponse.error("OAuth role selection failed.");
		}
	}

	@PostMapping("/oauth2/token")
	public ApiResponse<Auth.TokenResponse> oauth2Token(Authentication authentication,
			HttpServletRequest httpRequest,
			HttpServletResponse response) {
		try {
			if (authentication == null || !(authentication.getPrincipal() instanceof CustomOAuth2User)) {
				return ApiResponse.error("OAuth2 authentication not found.");
			}
			CustomOAuth2User oauth2User = (CustomOAuth2User) authentication.getPrincipal();
			Auth.TokenResponse result = loginService.issueTokensForUserId(oauth2User.getUserId());
			setTokenCookies(response, result.getAccessToken(), result.getRefreshToken(), false);
			setSessionAuthentication(httpRequest, result);
			return ApiResponse.ok(result, SuccessCode.OK);
		} catch (AppException e) {
			log.error("OAuth2 token issue failed: {}", e.getMessage());
			return ApiResponse.error(e.getErrorCode().getMessage());
		} catch (Exception e) {
			log.error("OAuth2 token issue error", e);
			return ApiResponse.error("OAuth2 token issue failed.");
		}
	}

	// OAuth 역할 선택 API (OAuth2 설정 완료 후 활성화)
	// @PostMapping("/oauth/role")
	// public ApiResponse<Auth.TokenResponse> selectOAuthRole(@RequestBody Auth.OAuthRoleRequest request,
	// 		HttpServletRequest httpRequest,
	// 		HttpServletResponse response) {
	// 	try {
	// 		log.info("OAuth 역할 선택 요청: {}", request.getRole());
			
	// 		Auth.TokenResponse result = loginService.completeOAuthSignup(request.getToken(), request.getRole());
			
	// 		setTokenCookies(response, result.getAccessToken(), result.getRefreshToken());
	// 		setSessionAuthentication(httpRequest, result);
			
	// 		return ApiResponse.ok(result, SuccessCode.OK);
	// 	} catch (AppException e) {
	// 		log.error("OAuth 역할 선택 실패: {}", e.getMessage());
	// 		return ApiResponse.error(e.getErrorCode().getMessage());
	// 	} catch (Exception e) {
	// 		log.error("OAuth 역할 선택 중 오류가 발생했습니다.", e);
	// 		return ApiResponse.error("역할 선택에 실패했습니다.");
	// 	}
	// }

	private void setTokenCookies(HttpServletResponse response, String accessToken, String refreshToken, boolean rememberMe) {
		ResponseCookie.ResponseCookieBuilder accessBuilder = ResponseCookie.from("accessToken", accessToken)
				.httpOnly(true)
				.path("/")
				.sameSite("Lax");
		ResponseCookie.ResponseCookieBuilder refreshBuilder = ResponseCookie.from("refreshToken", refreshToken)
				.httpOnly(true)
				.path("/")
				.sameSite("Lax");
		ResponseCookie.ResponseCookieBuilder rememberMeBuilder = ResponseCookie.from("rememberMe", String.valueOf(rememberMe))
				.httpOnly(true)
				.path("/")
				.sameSite("Lax");

		if (rememberMe) {
			accessBuilder.maxAge(REMEMBER_ME_COOKIE_AGE_SECONDS);
			refreshBuilder.maxAge(REMEMBER_ME_COOKIE_AGE_SECONDS);
			rememberMeBuilder.maxAge(REMEMBER_ME_COOKIE_AGE_SECONDS);
		}

		ResponseCookie accessCookie = accessBuilder.build();
		ResponseCookie refreshCookie = refreshBuilder.build();
		ResponseCookie rememberMeCookie = rememberMeBuilder.build();
		response.addHeader("Set-Cookie", accessCookie.toString());
		response.addHeader("Set-Cookie", refreshCookie.toString());
		response.addHeader("Set-Cookie", rememberMeCookie.toString());
	}

	private void clearTokenCookies(HttpServletResponse response) {
		ResponseCookie accessCookie = ResponseCookie.from("accessToken", "")
				.httpOnly(true)
				.path("/")
				.sameSite("Lax")
				.maxAge(0)
				.build();
		ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
				.httpOnly(true)
				.path("/")
				.sameSite("Lax")
				.maxAge(0)
				.build();
		ResponseCookie rememberMeCookie = ResponseCookie.from("rememberMe", "")
				.httpOnly(true)
				.path("/")
				.sameSite("Lax")
				.maxAge(0)
				.build();
		response.addHeader("Set-Cookie", accessCookie.toString());
		response.addHeader("Set-Cookie", refreshCookie.toString());
		response.addHeader("Set-Cookie", rememberMeCookie.toString());
	}

	private String getCookieValue(HttpServletRequest request, String name) {
		if (request.getCookies() == null) {
			return null;
		}
		return java.util.Arrays.stream(request.getCookies())
				.filter(cookie -> name.equals(cookie.getName()))
				.map(cookie -> cookie.getValue())
				.findFirst()
				.orElse(null);
	}

	private void setSessionAuthentication(HttpServletRequest request, Auth.TokenResponse result) {
		if (request == null || result == null) {
			return;
		}
		List<String> authList = (result.getAuthList() == null) ? List.of() : result.getAuthList();
		List<SimpleGrantedAuthority> authorities = authList.stream()
				.map(SimpleGrantedAuthority::new)
				.toList();
		UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
				result.getUserId(), null, authorities);
		SecurityContextHolder.getContext().setAuthentication(authentication);
		request.getSession(true);
	}

	private void clearSessionAuthentication(HttpServletRequest request) {
		SecurityContextHolder.clearContext();
		if (request != null) {
			var session = request.getSession(false);
			if (session != null) {
				session.invalidate();
			}
		}
	}
	


}
