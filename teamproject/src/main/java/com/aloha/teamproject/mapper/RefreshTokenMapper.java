package com.aloha.teamproject.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.RefreshToken;

@Mapper
public interface RefreshTokenMapper {
    
    public int insert(RefreshToken refreshToken);

    public RefreshToken findByUserIdAndTokenHash(@Param("userId") String userId, @Param("tokenHash") String tokenHash);

    public int revoke(@Param("userId") String userId,  @Param("tokenHash") String tokenHash);

    public int deleteExpired();

}
