package com.aloha.teamproject.common.service;

import com.aloha.teamproject.common.exception.AppException;
import com.aloha.teamproject.common.exception.ErrorCode;

public class BaseServiceImpl implements BaseService {

	@Override
	public void require(boolean condition, ErrorCode errorCode) {
		if (!condition) {
			throw new AppException(errorCode);
		}
	}

	@Override
	public <T> T requireNotNull(T value, ErrorCode errorCode) {
		if (value == null) {
			throw new AppException(errorCode);
		}
		return value;
	}

	@Override
	public void requiredNotBlank(String value, ErrorCode errorCode) {
		if (value == null || value.trim().isEmpty()) {
			throw new AppException(errorCode);
		}
	}
}
