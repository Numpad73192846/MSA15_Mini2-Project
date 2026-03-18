package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.AdminUser;
import com.aloha.teamproject.dto.TutorDocument;
import com.aloha.teamproject.dto.TutorSettlement;

@Mapper
public interface AdminMapper {

    List<TutorDocument> selectPendingDocuments();

    void updateDocumentStatus(@Param("id") String id, @Param("status") String status, @Param("adminId") String adminId, @Param("rejectReason") String rejectReason);

    List<TutorSettlement> selectTutorSettlements();

    List<TutorDocument> selectDocuments();

    List<AdminUser> selectUsers();
    
    int updateUserStatus(@Param("id") String id, @Param("status") String status);

    int updateUserRole(@Param("id") String id, @Param("role") String role);

    int deleteUser(@Param("id") String id);

    int remitTutorSettlement(@Param("tutorId") String tutorId);

}
