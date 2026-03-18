package com.aloha.teamproject.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.dto.LanguageField;
import com.aloha.teamproject.service.LanguageFieldService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/language-fields")
public class LanguageFieldController {

    private final LanguageFieldService languageFieldService;

    @GetMapping
    public ApiResponse<List<LanguageField>> list() {
        try {
            return ApiResponse.ok(languageFieldService.list(), SuccessCode.OK);
        } catch (Exception e) {
            log.error("/api/language-fields 조회 실패", e);
            return ApiResponse.error("분야 목록을 불러오지 못했습니다.");
        }
    }
}
