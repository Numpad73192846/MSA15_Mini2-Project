package com.aloha.teamproject.service;

import org.springframework.stereotype.Service;

import com.aloha.teamproject.dto.RefreshToken;
import com.aloha.teamproject.mapper.RefreshTokenMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenMapper refreshTokenMapper;

    @Override
    public int insert(RefreshToken refreshToken) {
        return refreshTokenMapper.insert(refreshToken);
    }

    @Override
    public RefreshToken findByUserIdAndTokenHash(String userId, String tokenHash) {
        return refreshTokenMapper.findByUserIdAndTokenHash(userId, tokenHash);
    }

    @Override
    public int revoke(String userId, String tokenHash) {
        return refreshTokenMapper.revoke(userId, tokenHash);
    }

    @Override
    public int deleteExpired() {
        return refreshTokenMapper.deleteExpired();
    }
    
}
