package com.aloha.teamproject.model;

import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import lombok.Getter;

@Getter
public class CustomOAuth2User extends DefaultOAuth2User {

    private Long no;
    private String userId;
    private String role;

    public CustomOAuth2User(Collection<? extends GrantedAuthority> authorities,
                            Map<String, Object> attributes, String nameAttributeKey,
                            Long no, String userId, String role) {
        super(authorities, attributes, nameAttributeKey);
        this.no = no;
        this.userId = userId;
        this.role = role;
    }

    @Override
    public String getName() {
        if (this.userId != null && !this.userId.isEmpty()) {
            return this.userId;
        }
        return super.getName();
    }
}
