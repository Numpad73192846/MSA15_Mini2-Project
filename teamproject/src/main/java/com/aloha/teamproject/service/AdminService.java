package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.AdminUser;
import com.aloha.teamproject.dto.TutorDocument;
import com.aloha.teamproject.dto.TutorSettlement;

public interface AdminService {

    List<TutorDocument> getPendingDocuments();

    void approveDocument(String id, String adminId);

    void rejectDocument(String id, String adminId, String reason);

    List<TutorSettlement> getTutorSettlements();

    List<TutorDocument> getDocuments();

    List<AdminUser> getUsers();
    
    int updateUserStatus(String id, String status);

    int updateUserRole(String id, String role);

    int deleteUser(String id);

    int remitTutorSettlement(String tutorId);
}
