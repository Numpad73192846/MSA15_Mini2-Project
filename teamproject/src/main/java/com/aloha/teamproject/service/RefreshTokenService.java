package com.aloha.teamproject.service;

import com.aloha.teamproject.dto.RefreshToken;

public interface RefreshTokenService {
    
    public int insert(RefreshToken refreshToken);

    public RefreshToken findByUserIdAndTokenHash(String userId, String tokenHash);

    public int revoke(String userId, String tokenHash);

    public int deleteExpired();

}
