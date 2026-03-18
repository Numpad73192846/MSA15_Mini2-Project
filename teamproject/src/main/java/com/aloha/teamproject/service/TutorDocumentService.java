package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.TutorDocument;

public interface TutorDocumentService {

    public List<TutorDocument> selectAll() throws Exception;

    public TutorDocument selectById(String id) throws Exception;

    public List<TutorDocument> selectByUserId(String userId) throws Exception;

    public int insert(TutorDocument document) throws Exception;

    public int update(TutorDocument document) throws Exception;

    public int delete(String id) throws Exception;

    public int deleteByUserIdAndDocType(String userId, String docType) throws Exception;

    public int approve(String id, String reviewedBy) throws Exception;

    public int reject(String id, String reviewedBy, String rejectReason) throws Exception;

}
