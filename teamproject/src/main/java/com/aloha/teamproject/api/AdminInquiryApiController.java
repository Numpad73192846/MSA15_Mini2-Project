package com.aloha.teamproject.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.exception.AppException;
import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.dto.AdminInquiry;
import com.aloha.teamproject.dto.AdminInquiryDashboard;
import com.aloha.teamproject.dto.AdminInquiryMessage;
import com.aloha.teamproject.service.AdminInquiryService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/inquiries")
public class AdminInquiryApiController {

    private final AdminInquiryService adminInquiryService;

    @GetMapping
    public ApiResponse<List<AdminInquiry>> getInquiries(
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "category", required = false) String category,
        @RequestParam(value = "q", required = false) String keyword
    ) {
        try {
            List<AdminInquiry> inquiries = adminInquiryService.selectAdminInquiries(status, category, keyword);
            return ApiResponse.ok(inquiries, SuccessCode.OK);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("관리자 문의 목록 조회 실패", e);
            return ApiResponse.error("문의 목록을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/{inquiryId}/messages")
    public ApiResponse<List<AdminInquiryMessage>> getInquiryMessages(@PathVariable("inquiryId") String inquiryId) {
        try {
            List<AdminInquiryMessage> messages = adminInquiryService.selectAdminInquiryMessages(inquiryId);
            return ApiResponse.ok(messages, SuccessCode.OK);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("관리자 문의 메시지 조회 실패", e);
            return ApiResponse.error("문의 메시지를 조회하지 못했습니다.");
        }
    }

    @PostMapping("/{inquiryId}/messages")
    public ApiResponse<Void> sendInquiryMessage(
        @PathVariable("inquiryId") String inquiryId,
        @RequestBody SendInquiryMessageRequest request,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            adminInquiryService.sendAdminInquiryMessage(authentication.getName(), inquiryId, request.getContent());
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("관리자 문의 메시지 전송 실패", e);
            return ApiResponse.error("메시지 전송에 실패했습니다.");
        }
    }

    @PatchMapping("/{inquiryId}/status")
    public ApiResponse<Void> updateInquiryStatus(
        @PathVariable("inquiryId") String inquiryId,
        @RequestBody UpdateInquiryStatusRequest request
    ) {
        try {
            adminInquiryService.updateInquiryStatus(inquiryId, request.getStatus());
            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("관리자 문의 상태 변경 실패", e);
            return ApiResponse.error("문의 상태 변경에 실패했습니다.");
        }
    }

    @GetMapping("/summary")
    public ApiResponse<AdminInquiryDashboard> getDashboardSummary() {
        try {
            AdminInquiryDashboard dashboard = adminInquiryService.selectAdminDashboard();
            return ApiResponse.ok(dashboard, SuccessCode.OK);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("관리자 대시보드 요약 조회 실패", e);
            return ApiResponse.error("대시보드 정보를 조회하지 못했습니다.");
        }
    }

    @Data
    public static class SendInquiryMessageRequest {
        private String content;
    }

    @Data
    public static class UpdateInquiryStatusRequest {
        private String status;
    }
}
