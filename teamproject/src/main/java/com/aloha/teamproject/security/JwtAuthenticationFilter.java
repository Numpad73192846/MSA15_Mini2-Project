package com.aloha.teamproject.security;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.aloha.teamproject.util.JwtTokenProvider;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String token = null;

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }

        if (token == null && request.getCookies() != null) {
            token = Arrays.stream(request.getCookies())
                          .filter(cookie -> "accessToken".equals(cookie.getName()))
                          .map(cookie -> cookie.getValue())
                          .findFirst()
                          .orElse(null);
        }

        if (token != null && jwtTokenProvider.validateToken(token)) {

            String userId = jwtTokenProvider.getUserIdFromToken(token);
            List<String> authList = jwtTokenProvider.getAuthListFromToken(token);
            
            log.debug("JWT Auth - userId: {}, authList: {}", userId, authList);

            SimpleGrantedAuthority[] authorities = authList.stream()
                                                           .map(SimpleGrantedAuthority::new)
                                                           .toArray(SimpleGrantedAuthority[]::new);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userId, null, Arrays.asList(authorities));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } else if (token != null) {
            log.warn("JWT token validation failed for request: {}", request.getRequestURI());
        }
        
        filterChain.doFilter(request, response);
    }

}
