package com.aloha.teamproject.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {
    
    private final boolean success;
    private final T data;
    private final String message;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, "OK");
    }

    public static <T> ApiResponse<T> ok(T data, SuccessCode code) {
        return new ApiResponse<>(true, data, code.getMessage());
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }

    public static ApiResponse<Void> ok(SuccessCode code) {
        return new ApiResponse<>(true, null, code.getMessage());
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(true, null, "OK");
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message);
    }

    public static ApiResponse<Void> error() {
        return new ApiResponse<>(false, null, "ERROR");
    }

}
