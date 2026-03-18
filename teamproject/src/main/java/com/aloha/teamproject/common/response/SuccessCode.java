package com.aloha.teamproject.common.response;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SuccessCode {

    OK("요청이 성공했습니다."),
    CREATED("등록이 완료되었습니다."),
    UPDATED("수정이 완료되었습니다."),
    LOGOUT_SUCCESS("로그아웃이 완료되었습니다."),
    DELETED("삭제가 완료되었습니다.");

    private final String message;
}
