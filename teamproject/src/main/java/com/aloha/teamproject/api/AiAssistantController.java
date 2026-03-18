package com.aloha.teamproject.api;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.service.AiAssistantService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    @PostMapping("/lesson-summary")
    public ApiResponse<Map<String, String>> generateLessonSummary(
            @RequestBody AiGenerateRequest request,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }
        if (request == null) {
            return ApiResponse.error("요청 정보가 올바르지 않습니다.");
        }

        try {
            String result = aiAssistantService.generateLessonSummary(
                    request.getTutorName(),
                    request.getStudentName(),
                    request.getSubject(),
                    request.getLessonContext());

            Map<String, String> data = new HashMap<>();
            data.put("text", result);
            return ApiResponse.ok(data, SuccessCode.OK);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("[AI Lesson Summary] 생성 실패", e);
            return ApiResponse.error("수업 요약 생성에 실패했습니다.");
        }
    }

    @PostMapping("/homework")
    public ApiResponse<Map<String, String>> generateHomework(
            @RequestBody AiGenerateRequest request,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }
        if (request == null) {
            return ApiResponse.error("요청 정보가 올바르지 않습니다.");
        }

        try {
            String result = aiAssistantService.generateHomework(
                    request.getTutorName(),
                    request.getStudentName(),
                    request.getSubject(),
                    request.getLessonContext());

            Map<String, String> data = new HashMap<>();
            data.put("text", result);
            return ApiResponse.ok(data, SuccessCode.OK);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("[AI Homework] 생성 실패", e);
            return ApiResponse.error("과제 생성에 실패했습니다.");
        }
    }

    @Data
    public static class AiGenerateRequest {
        private String tutorName;
        private String studentName;
        private String subject;
        private String lessonContext;
    }
}

