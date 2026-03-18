package com.aloha.teamproject.service;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.aloha.teamproject.common.exception.AppException;
import com.aloha.teamproject.common.exception.ErrorCode;
import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.AdminInquiry;
import com.aloha.teamproject.dto.AdminInquiryDashboard;
import com.aloha.teamproject.dto.AdminInquiryMessage;
import com.aloha.teamproject.mapper.AdminInquiryMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminInquiryServiceImpl extends BaseServiceImpl implements AdminInquiryService {

    private static final Set<String> VALID_CATEGORIES = Set.of("INQUIRY", "REPORT", "PAYMENT", "ACCOUNT");
    private static final Set<String> VALID_STATUSES = Set.of("OPEN", "IN_PROGRESS", "DONE");

    private final AdminInquiryMapper adminInquiryMapper;

    @Override
    public AdminInquiry createInquiry(
        String userId,
        String title,
        String category,
        String content,
        String contactName,
        String contactEmail,
        String contactPhone
    ) throws Exception {
        requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(title, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(content, ErrorCode.INVALID_REQUEST);

        String normalizedCategory = normalizeCategory(category);
        String trimmedTitle = title.trim();
        String trimmedContent = content.trim();

        require(trimmedTitle.length() <= 200, ErrorCode.INVALID_REQUEST);
        require(trimmedContent.length() <= 1000, ErrorCode.INVALID_REQUEST);

        AdminInquiry inquiry = new AdminInquiry();
        inquiry.setId(UUID.randomUUID().toString());
        inquiry.setUserId(userId);
        inquiry.setCategory(normalizedCategory);
        inquiry.setTitle(trimmedTitle);
        inquiry.setContactName(trimToNull(contactName));
        inquiry.setContactEmail(trimToNull(contactEmail));
        inquiry.setContactPhone(trimToNull(contactPhone));
        inquiry.setStatus("OPEN");

        adminInquiryMapper.insertInquiry(inquiry);

        AdminInquiryMessage message = new AdminInquiryMessage();
        message.setId(UUID.randomUUID().toString());
        message.setInquiryId(inquiry.getId());
        message.setSenderId(userId);
        message.setSenderRole("USER");
        message.setContent(trimmedContent);
        adminInquiryMapper.insertInquiryMessage(message);

        return requireNotNull(adminInquiryMapper.selectInquiryById(inquiry.getId()), ErrorCode.NOT_FOUND);
    }

    @Override
    public List<AdminInquiry> selectMyInquiries(String userId) throws Exception {
        requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
        return adminInquiryMapper.selectMyInquiries(userId);
    }

    @Override
    public List<AdminInquiryMessage> selectMyInquiryMessages(String userId, String inquiryId) throws Exception {
        requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(inquiryId, ErrorCode.INVALID_REQUEST);

        int ownerCount = adminInquiryMapper.countInquiryOwner(inquiryId, userId);
        require(ownerCount > 0, ErrorCode.FORBIDDEN);

        return adminInquiryMapper.selectInquiryMessages(inquiryId);
    }

    @Override
    public void sendMyInquiryMessage(String userId, String inquiryId, String content) throws Exception {
        requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(inquiryId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(content, ErrorCode.INVALID_REQUEST);

        int ownerCount = adminInquiryMapper.countInquiryOwner(inquiryId, userId);
        require(ownerCount > 0, ErrorCode.FORBIDDEN);

        String trimmedContent = content.trim();
        require(trimmedContent.length() <= 1000, ErrorCode.INVALID_REQUEST);

        AdminInquiryMessage message = new AdminInquiryMessage();
        message.setId(UUID.randomUUID().toString());
        message.setInquiryId(inquiryId);
        message.setSenderId(userId);
        message.setSenderRole("USER");
        message.setContent(trimmedContent);
        adminInquiryMapper.insertInquiryMessage(message);

        adminInquiryMapper.touchInquiryOnUserMessage(inquiryId);
    }

    @Override
    public List<AdminInquiry> selectAdminInquiries(String status, String category, String keyword) throws Exception {
        String normalizedStatus = normalizeStatusForFilter(status);
        String normalizedCategory = normalizeCategoryForFilter(category);
        String normalizedKeyword = trimToNull(keyword);
        return adminInquiryMapper.selectAdminInquiries(normalizedStatus, normalizedCategory, normalizedKeyword);
    }

    @Override
    public List<AdminInquiryMessage> selectAdminInquiryMessages(String inquiryId) throws Exception {
        requiredNotBlank(inquiryId, ErrorCode.INVALID_REQUEST);
        AdminInquiry inquiry = adminInquiryMapper.selectInquiryById(inquiryId);
        requireNotNull(inquiry, ErrorCode.NOT_FOUND);
        return adminInquiryMapper.selectInquiryMessages(inquiryId);
    }

    @Override
    public void sendAdminInquiryMessage(String adminId, String inquiryId, String content) throws Exception {
        requiredNotBlank(adminId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(inquiryId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(content, ErrorCode.INVALID_REQUEST);

        AdminInquiry inquiry = adminInquiryMapper.selectInquiryById(inquiryId);
        requireNotNull(inquiry, ErrorCode.NOT_FOUND);

        String trimmedContent = content.trim();
        require(trimmedContent.length() <= 1000, ErrorCode.INVALID_REQUEST);

        AdminInquiryMessage message = new AdminInquiryMessage();
        message.setId(UUID.randomUUID().toString());
        message.setInquiryId(inquiryId);
        message.setSenderId(adminId);
        message.setSenderRole("ADMIN");
        message.setContent(trimmedContent);
        adminInquiryMapper.insertInquiryMessage(message);

        adminInquiryMapper.touchInquiryOnAdminMessage(inquiryId);
    }

    @Override
    public void updateInquiryStatus(String inquiryId, String status) throws Exception {
        requiredNotBlank(inquiryId, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(status, ErrorCode.INVALID_REQUEST);

        String normalizedStatus = normalizeStatus(status);
        int updated = adminInquiryMapper.updateInquiryStatus(inquiryId, normalizedStatus);
        require(updated > 0, ErrorCode.NOT_FOUND);
    }

    @Override
    public AdminInquiryDashboard selectAdminDashboard() throws Exception {
        AdminInquiryDashboard dashboard = adminInquiryMapper.selectAdminDashboardSummary();
        if (dashboard == null) {
            dashboard = new AdminInquiryDashboard();
        }
        dashboard.setRecentInquiries(adminInquiryMapper.selectRecentInquiries(5));
        return dashboard;
    }

    private String normalizeCategory(String category) {
        String normalized = normalizeUpper(category);
        if (normalized == null) {
            return "INQUIRY";
        }
        require(VALID_CATEGORIES.contains(normalized), ErrorCode.INVALID_REQUEST);
        return normalized;
    }

    private String normalizeStatus(String status) {
        String normalized = normalizeUpper(status);
        require(normalized != null && VALID_STATUSES.contains(normalized), ErrorCode.INVALID_REQUEST);
        return normalized;
    }

    private String normalizeStatusForFilter(String status) {
        String normalized = normalizeUpper(status);
        if (normalized == null || "ALL".equals(normalized)) {
            return null;
        }
        require(VALID_STATUSES.contains(normalized), ErrorCode.INVALID_REQUEST);
        return normalized;
    }

    private String normalizeCategoryForFilter(String category) {
        String normalized = normalizeUpper(category);
        if (normalized == null || "ALL".equals(normalized)) {
            return null;
        }
        require(VALID_CATEGORIES.contains(normalized), ErrorCode.INVALID_REQUEST);
        return normalized;
    }

    private String normalizeUpper(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed.toUpperCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
