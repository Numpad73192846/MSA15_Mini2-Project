package com.aloha.teamproject.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.TutorCareer;
import com.aloha.teamproject.mapper.TutorCareerMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TutorCareerServiceImpl extends BaseServiceImpl implements TutorCareerService {

    private final TutorCareerMapper tutorCareerMapper;

    @Override
    public List<TutorCareer> selectByUserId(String userId) throws Exception {
        return tutorCareerMapper.selectByUserId(userId);
    }

    @Override
    public int insertBatch(List<TutorCareer> careers) throws Exception {
        return tutorCareerMapper.insertBatch(careers);
    }

    @Override
    @Transactional
    public void replaceCareers(String userId, List<TutorCareer.Request.CareerItem> careers) throws Exception {
        tutorCareerMapper.deleteByUserId(userId);
        
        if (careers != null && !careers.isEmpty()) {
            List<TutorCareer> tutorCareers = careers.stream()
                .map(item -> TutorCareer.builder()
                    .userId(userId)
                    .companyName(item.getCompanyName())
                    .jobCategory(item.getJobCategory())
                    .jobRole(item.getJobRole())
                    .startYear(item.getStartYear())
                    .endYear(item.getEndYear())
                    .build())
                .collect(Collectors.toList());
            
            tutorCareerMapper.insertBatch(tutorCareers);
        }
    }

}
