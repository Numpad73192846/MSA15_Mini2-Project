package com.aloha.teamproject.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.teamproject.common.exception.ErrorCode;
import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.TutorTimeRange;
import com.aloha.teamproject.mapper.TutorTimeRangeMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TutorTimeRangeServiceImpl extends BaseServiceImpl implements TutorTimeRangeService {

    private final TutorTimeRangeMapper tutorTimeRangeMapper;

    @Override
    public List<TutorTimeRange> selectByUserId(String userId) throws Exception {
        requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
        return tutorTimeRangeMapper.selectByUserId(userId);
    }

    @Override
    @Transactional
    public boolean replaceTimeRanges(String userId, List<TutorTimeRange> timeRanges) throws Exception {
        requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
        requireNotNull(timeRanges, ErrorCode.INVALID_REQUEST);

        // 기존 시간대 삭제
        tutorTimeRangeMapper.deleteByUserId(userId);

        // 새 시간대가 있으면 추가
        if (!timeRanges.isEmpty()) {
            timeRanges.forEach(tr -> tr.setUserId(userId));
            tutorTimeRangeMapper.insertBatch(timeRanges);
        }

        return true;
    }

    @Override
    public boolean insert(TutorTimeRange timeRange) throws Exception {
        requireNotNull(timeRange, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(timeRange.getUserId(), ErrorCode.INVALID_REQUEST);

        int result = tutorTimeRangeMapper.insert(timeRange);
        return result > 0;
    }

    @Override
    public boolean deleteById(String id) throws Exception {
        requiredNotBlank(id, ErrorCode.INVALID_REQUEST);

        int result = tutorTimeRangeMapper.deleteById(id);
        return result > 0;
    }

    @Override
    public boolean update(TutorTimeRange timeRange) throws Exception {
        requireNotNull(timeRange, ErrorCode.INVALID_REQUEST);
        requiredNotBlank(timeRange.getId(), ErrorCode.INVALID_REQUEST);

        int result = tutorTimeRangeMapper.update(timeRange);
        return result > 0;
    }
}
