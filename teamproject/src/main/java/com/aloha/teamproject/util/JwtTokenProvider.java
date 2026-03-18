package com.aloha.teamproject.util;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider {
    
    private SecretKey secretKey;
    private Long accessExpMs;
    private Long refreshExpMs;

    @Value("${jwt.secret}")
    public void setSecretKey(String secret) {
        if ( secret.getBytes(StandardCharsets.UTF_8).length < 32 ) throw new IllegalArgumentException ("32byte 이상 키가 필요합니다." );
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Value("${jwt.access-exp}")
    public void setAccessExpMs(Long accessExpMs) {
        this.accessExpMs = accessExpMs;
    }

    @Value("${jwt.refresh-exp}")
    public void setRefreshExpMs(Long refreshExpMs) {
        this.refreshExpMs = refreshExpMs;
    }

    public String createAccessToken(String userId, List<String> authList) {

        String token = createToken(userId, authList, accessExpMs);
        return token;

    }

    public String createRefreshToken(String userId) {

        String token = createToken(userId, Collections.emptyList(), refreshExpMs);
        return token;

    }

    public boolean validateToken(String token) {

        try {
            return parse(token) != null;
        } catch (Exception e) {
            return false;
        } 

    }

    public String getUserIdFromToken(String token) {
        String userId = parse(token).getPayload().getSubject();
        return userId;
    }

    @SuppressWarnings("unchecked")
    public List<String> getAuthListFromToken(String token) {

        List<String> authList = (List<String>) parse(token).getPayload().get("auth");
        if ( authList == null ) {
            return Collections.emptyList();
        }

        return authList;

    }

    private String createToken(String userId, List<String> authList, Long expMs) {

        Date now = new Date();
        Date exp = new Date(now.getTime() + expMs);

        String token = Jwts.builder()
                           .subject(userId)
                           .claim("auth", authList)
                           .issuedAt(now)
                           .expiration(exp)
                           .signWith(secretKey)
                           .compact();
        return token;
    }

    private Jws<Claims> parse(String token) {
        Jws<Claims> jws = Jwts.parser()
                              .verifyWith(secretKey)
                              .build()
                              .parseSignedClaims(token);
        return jws;
    }

}
