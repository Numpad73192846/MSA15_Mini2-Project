package com.aloha.teamproject.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.TutorDocument;
import com.aloha.teamproject.mapper.TutorDocumentMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TutorDocumentServiceImpl extends BaseServiceImpl implements TutorDocumentService {

    private final TutorDocumentMapper tutorDocumentMapper;

    @Override
    public List<TutorDocument> selectAll() throws Exception {
        return tutorDocumentMapper.selectAll();
    }

    @Override
    public TutorDocument selectById(String id) throws Exception {
        return tutorDocumentMapper.selectById(id);
    }

    @Override
    public List<TutorDocument> selectByUserId(String userId) throws Exception {
        return tutorDocumentMapper.selectByUserId(userId);
    }

    @Override
    @Transactional
    public int insert(TutorDocument document) throws Exception {
        return tutorDocumentMapper.insert(document);
    }

    @Override
    @Transactional
    public int update(TutorDocument document) throws Exception {
        return tutorDocumentMapper.update(document);
    }

    @Override
    @Transactional
    public int delete(String id) throws Exception {
        return tutorDocumentMapper.delete(id);
    }

    @Override
    @Transactional
    public int deleteByUserIdAndDocType(String userId, String docType) throws Exception {
        return tutorDocumentMapper.deleteByUserIdAndDocType(userId, docType);
    }

    @Override
    @Transactional
    public int approve(String id, String reviewedBy) throws Exception {
        return tutorDocumentMapper.approve(id, reviewedBy);
    }

    @Override
    @Transactional
    public int reject(String id, String reviewedBy, String rejectReason) throws Exception {
        return tutorDocumentMapper.reject(id, reviewedBy, rejectReason);
    }

}
