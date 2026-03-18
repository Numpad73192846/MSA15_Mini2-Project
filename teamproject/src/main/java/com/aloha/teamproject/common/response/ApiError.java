package com.aloha.teamproject.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiError {
    
    private final boolean success;
    private final ErrorBody error;

    @Getter
    @AllArgsConstructor
    public static class ErrorBody {
        private final String code;
        private final String message;
    }

    public static ApiError of(String code, String message) {
        return new ApiError(false, new ErrorBody(code, message));
    }

}
