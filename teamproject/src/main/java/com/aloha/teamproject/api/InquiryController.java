package com.aloha.teamproject.api;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.exception.AppException;
import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.dto.AdminInquiry;
import com.aloha.teamproject.dto.AdminInquiryMessage;
import com.aloha.teamproject.service.AdminInquiryService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final AdminInquiryService adminInquiryService;

    @PostMapping
    public ApiResponse<AdminInquiry> createInquiry(
        @RequestBody CreateInquiryRequest request,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            String userId = authentication.getName();
            AdminInquiry inquiry = adminInquiryService.createInquiry(
                userId,
                request.getTitle(),
                request.getCategory(),
                request.getContent(),
                request.getContactName(),
                request.getContactEmail(),
                request.getContactPhone()
            );
            return ApiResponse.ok(inquiry, SuccessCode.CREATED);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("문의 등록 실패", e);
            return ApiResponse.error("문의 등록에 실패했습니다.");
        }
    }

    @GetMapping("/my")
    public ApiResponse<List<AdminInquiry>> getMyInquiries(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            List<AdminInquiry> inquiries = adminInquiryService.selectMyInquiries(authentication.getName());
            return ApiResponse.ok(inquiries, SuccessCode.OK);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("내 문의 조회 실패", e);
            return ApiResponse.error("문의 내역을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/{inquiryId}/messages")
    public ApiResponse<List<AdminInquiryMessage>> getMyInquiryMessages(
        @PathVariable("inquiryId") String inquiryId,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            List<AdminInquiryMessage> messages =
                adminInquiryService.selectMyInquiryMessages(authentication.getName(), inquiryId);
            return ApiResponse.ok(messages, SuccessCode.OK);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("문의 메시지 조회 실패", e);
            return ApiResponse.error("문의 메시지를 조회하지 못했습니다.");
        }
    }

    @PostMapping("/{inquiryId}/messages")
    public ApiResponse<Void> sendMyInquiryMessage(
        @PathVariable("inquiryId") String inquiryId,
        @RequestBody SendInquiryMessageRequest request,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            adminInquiryService.sendMyInquiryMessage(authentication.getName(), inquiryId, request.getContent());
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (AppException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("문의 메시지 전송 실패", e);
            return ApiResponse.error("메시지 전송에 실패했습니다.");
        }
    }

    @Data
    public static class CreateInquiryRequest {
        private String category;
        private String title;
        private String content;
        private String contactName;
        private String contactEmail;
        private String contactPhone;
    }

    @Data
    public static class SendInquiryMessageRequest {
        private String content;
    }
}
