package com.aloha.teamproject.service;

import java.util.List;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.aloha.teamproject.dto.AdminUser;
import com.aloha.teamproject.dto.TutorDocument;
import com.aloha.teamproject.dto.TutorSettlement;
import com.aloha.teamproject.mapper.AdminMapper;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminMapper adminMapper;

    @Override
    public List<TutorDocument> getPendingDocuments() {
        return adminMapper.selectPendingDocuments();
    }

    @Override
    public void approveDocument(String id, String adminId) {
        adminMapper.updateDocumentStatus(id, "APPROVED", adminId, null);
    }

    @Override
    public void rejectDocument(String id, String adminId, String reason) {
        adminMapper.updateDocumentStatus(id, "REJECTED", adminId, reason);
    }

    @Override
    public List<TutorSettlement> getTutorSettlements() {
        return adminMapper.selectTutorSettlements();
    }

    @Override
    public List<TutorDocument> getDocuments() {
        return adminMapper.selectDocuments();
    }

    @Override
    public List<AdminUser> getUsers() {
        return adminMapper.selectUsers();
    }

    @Override
    public int updateUserStatus(String id, String status) {
        return adminMapper.updateUserStatus(id, status);
    }

    @Override
    public int updateUserRole(String id, String role) {
        return adminMapper.updateUserRole(id, role);
    }

    @Override
    public int deleteUser(String id) {
        return adminMapper.deleteUser(id);
    }

    @Override
    public int remitTutorSettlement(String tutorId) {
        return adminMapper.remitTutorSettlement(tutorId);
    }
}
