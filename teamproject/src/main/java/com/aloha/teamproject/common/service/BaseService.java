package com.aloha.teamproject.common.service;

import com.aloha.teamproject.common.exception.ErrorCode;

public interface BaseService {
    
    // 에러 검증 메서드
    public void require(boolean condition, ErrorCode errorCode);

    <T> T requireNotNull(T value, ErrorCode errorCode);

    public void requiredNotBlank(String value, ErrorCode errorCode);

}
