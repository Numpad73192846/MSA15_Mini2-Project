package com.aloha.teamproject.dto;

import java.util.List;

import lombok.Data;

public class Auth {

    @Data
    public static class TokenResponse {
        private String accessToken;
        private String refreshToken;
        private Long expiresIn;
        private String userId;
        private List<String> authList;
    }

    @Data
    public static class RefreshTokenRequest {
        private String refreshToken;
        private Boolean rememberMe;
    }

    // OAuth2 설정 완료 후 활성화
    // @Data
    // public static class OAuthRoleRequest {
    //     private String token;
    //     private String role;
    // }
}
