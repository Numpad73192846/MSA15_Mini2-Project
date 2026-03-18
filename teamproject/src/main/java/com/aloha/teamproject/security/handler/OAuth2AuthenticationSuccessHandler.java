package com.aloha.teamproject.security.handler;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.aloha.teamproject.dto.Users;
import com.aloha.teamproject.mapper.UserMapper;
import com.aloha.teamproject.model.CustomOAuth2User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserMapper userMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        log.info("OAuth2 로그인 성공!");

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomOAuth2User) {
            handleCustomOAuth2Principal(request, response, (CustomOAuth2User) principal);
            return;
        } else if (principal instanceof OAuth2User && authentication instanceof OAuth2AuthenticationToken) {
            OAuth2User oUser = (OAuth2User) principal;
            OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
            String registrationId = token.getAuthorizedClientRegistrationId();
            String email = normalizeUserIdentifier(extractEmail(registrationId, oUser.getAttributes()), registrationId, oUser.getName());

            Users user = null;
            try {
                user = userMapper.selectByUsername(email);
            } catch (Exception e) {
                log.error("사용자 조회 실패", e);
            }

            if (user == null) {
                // 신규 사용자로 간주 - 역할선택으로 이동
                log.info("신규 사용자입니다. 역할 선택 페이지로 이동합니다.");
                HttpSession session = request.getSession(true);
                session.setAttribute("oauth2UserId", email);
                session.setAttribute("oauth2UserNo", null);
                setTemporaryAuthentication(oUser, email, null, "ROLE_GUEST");
                getRedirectStrategy().sendRedirect(request, response, "/login?needsRoleSelection=true");
                return;
            }

            String resolvedRole = resolveRole(user);

            if ("ROLE_GUEST".equals(resolvedRole)) {
                log.info("신규 사용자(ROLE_GUEST)로 간주, 역할 선택 페이지로 이동합니다.");
                HttpSession session = request.getSession(true);
                session.setAttribute("oauth2UserId", user.getId());
                session.setAttribute("oauth2UserNo", user.getNo());
                setTemporaryAuthentication(oUser, user.getId(), user.getNo(), resolvedRole);
                getRedirectStrategy().sendRedirect(request, response, "/login?needsRoleSelection=true");
                return;
            }

            log.info("기존 사용자입니다. 홈으로 이동합니다.");
            setTemporaryAuthentication(oUser, user.getId(), user.getNo(), resolvedRole);
            request.getSession(true);
            getRedirectStrategy().sendRedirect(request, response, "/login?oauth2=success");
            return;
        } else {
            log.warn("알 수 없는 principal 타입: {}", principal != null ? principal.getClass() : null);
            getRedirectStrategy().sendRedirect(request, response, "/login?oauth2=success");
            return;
        }
    }

    private void handleCustomOAuth2Principal(HttpServletRequest request, HttpServletResponse response, CustomOAuth2User oauth2User) throws IOException {
        String role = oauth2User.getRole();
        if (role == null || role.isBlank()) {
            role = oauth2User.getAuthorities().stream()
                    .map(authority -> authority.getAuthority())
                    .findFirst()
                    .orElse("ROLE_GUEST");
        }

        HttpSession session = request.getSession(true);
        session.setAttribute("oauth2UserId", oauth2User.getUserId());
        session.setAttribute("oauth2UserNo", oauth2User.getNo());

        if ("ROLE_GUEST".equals(role)) {
            log.info("신규 사용자입니다. 역할 선택 페이지로 이동합니다.");
            getRedirectStrategy().sendRedirect(request, response, "/login?needsRoleSelection=true");
            return;
        }

        log.info("기존 사용자입니다. 홈으로 이동합니다.");
        getRedirectStrategy().sendRedirect(request, response, "/login?oauth2=success");
    }

    private void setTemporaryAuthentication(OAuth2User sourceUser, String userId, Long userNo, String role) {
        String resolvedRole = (role == null || role.isBlank()) ? "ROLE_GUEST" : role;
        CustomOAuth2User principalUser = new CustomOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(resolvedRole)),
                sourceUser.getAttributes(),
                "email",
                userNo,
                userId,
                resolvedRole
        );
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principalUser, null, principalUser.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private String resolveRole(Users user) {
        if (user == null || user.getAuthList() == null || user.getAuthList().isEmpty()) {
            return "ROLE_GUEST";
        }

        boolean hasAdmin = user.getAuthList().stream().anyMatch(auth -> "ROLE_ADMIN".equals(auth.getAuth()));
        if (hasAdmin) {
            return "ROLE_ADMIN";
        }

        boolean hasTutor = user.getAuthList().stream().anyMatch(auth -> "ROLE_TUTOR".equals(auth.getAuth()));
        if (hasTutor) {
            return "ROLE_TUTOR";
        }

        boolean hasTutorPending = user.getAuthList().stream().anyMatch(auth -> "ROLE_TUTOR_PENDING".equals(auth.getAuth()));
        if (hasTutorPending) {
            return "ROLE_TUTOR_PENDING";
        }

        boolean hasUser = user.getAuthList().stream().anyMatch(auth -> "ROLE_USER".equals(auth.getAuth()));
        if (hasUser) {
            return "ROLE_USER";
        }

        boolean hasGuest = user.getAuthList().stream().anyMatch(auth -> "ROLE_GUEST".equals(auth.getAuth()));
        if (hasGuest) {
            return "ROLE_GUEST";
        }

        String fallback = user.getAuthList().get(0).getAuth();
        return fallback != null ? fallback : "ROLE_GUEST";
    }

    private String normalizeUserIdentifier(String email, String registrationId, String providerUserKey) {
        if (email != null && !email.isBlank()) {
            return email.trim().toLowerCase();
        }
        return registrationId + "_" + providerUserKey + "@oauth.local";
    }

    @SuppressWarnings("unchecked")
    private String extractEmail(String registrationId, Map<String, Object> attributes) {
        if ("google".equals(registrationId)) {
            return (String) attributes.get("email");
        } else if ("naver".equals(registrationId)) {
            Map<String, Object> response = (Map<String, Object>) attributes.get("response");
            return response != null ? (String) response.get("email") : null;
        } else if ("kakao".equals(registrationId)) {
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            return kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
        }
        return (String) attributes.get("email");
    }
}
