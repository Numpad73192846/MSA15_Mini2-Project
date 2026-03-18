package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.AdminInquiry;
import com.aloha.teamproject.dto.AdminInquiryDashboard;
import com.aloha.teamproject.dto.AdminInquiryMessage;

@Mapper
public interface AdminInquiryMapper {

    int insertInquiry(AdminInquiry inquiry) throws Exception;

    int insertInquiryMessage(AdminInquiryMessage message) throws Exception;

    AdminInquiry selectInquiryById(@Param("inquiryId") String inquiryId) throws Exception;

    int countInquiryOwner(
        @Param("inquiryId") String inquiryId,
        @Param("userId") String userId
    ) throws Exception;

    List<AdminInquiry> selectMyInquiries(@Param("userId") String userId) throws Exception;

    List<AdminInquiry> selectAdminInquiries(
        @Param("status") String status,
        @Param("category") String category,
        @Param("keyword") String keyword
    ) throws Exception;

    List<AdminInquiryMessage> selectInquiryMessages(@Param("inquiryId") String inquiryId) throws Exception;

    int updateInquiryStatus(
        @Param("inquiryId") String inquiryId,
        @Param("status") String status
    ) throws Exception;

    int touchInquiryOnUserMessage(@Param("inquiryId") String inquiryId) throws Exception;

    int touchInquiryOnAdminMessage(@Param("inquiryId") String inquiryId) throws Exception;

    AdminInquiryDashboard selectAdminDashboardSummary() throws Exception;

    List<AdminInquiry> selectRecentInquiries(@Param("limit") int limit) throws Exception;
}
