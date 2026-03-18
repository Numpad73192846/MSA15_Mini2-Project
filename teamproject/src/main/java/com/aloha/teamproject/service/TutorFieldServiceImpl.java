package com.aloha.teamproject.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.teamproject.common.exception.AppException;
import com.aloha.teamproject.common.exception.ErrorCode;
import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.mapper.TutorFieldMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TutorFieldServiceImpl extends BaseServiceImpl implements TutorFieldService {

    private final TutorFieldMapper tutorFieldMapper;

    @Override
    @Transactional
    public boolean replaceFields(String userId, List<String> fieldIds) throws Exception {
        requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);

        tutorFieldMapper.deleteByUserId(userId);

        if (fieldIds == null || fieldIds.isEmpty()) {
            return true;
        }

        int result = tutorFieldMapper.insertBatch(userId, fieldIds);
        if (result <= 0) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
        return true;
    }
}
