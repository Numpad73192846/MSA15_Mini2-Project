package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.AdminInquiry;
import com.aloha.teamproject.dto.AdminInquiryDashboard;
import com.aloha.teamproject.dto.AdminInquiryMessage;

public interface AdminInquiryService {

    AdminInquiry createInquiry(
        String userId,
        String title,
        String category,
        String content,
        String contactName,
        String contactEmail,
        String contactPhone
    ) throws Exception;

    List<AdminInquiry> selectMyInquiries(String userId) throws Exception;

    List<AdminInquiryMessage> selectMyInquiryMessages(String userId, String inquiryId) throws Exception;

    void sendMyInquiryMessage(String userId, String inquiryId, String content) throws Exception;

    List<AdminInquiry> selectAdminInquiries(String status, String category, String keyword) throws Exception;

    List<AdminInquiryMessage> selectAdminInquiryMessages(String inquiryId) throws Exception;

    void sendAdminInquiryMessage(String adminId, String inquiryId, String content) throws Exception;

    void updateInquiryStatus(String inquiryId, String status) throws Exception;

    AdminInquiryDashboard selectAdminDashboard() throws Exception;
}
