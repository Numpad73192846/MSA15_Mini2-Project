package com.aloha.teamproject.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.TutorEducation;
import com.aloha.teamproject.mapper.TutorEducationMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TutorEducationServiceImpl extends BaseServiceImpl implements TutorEducationService {

    private final TutorEducationMapper tutorEducationMapper;

    @Override
    public List<TutorEducation> selectByUserId(String userId) throws Exception {
        return tutorEducationMapper.selectByUserId(userId);
    }

    @Override
    @Transactional
    public void replaceEducations(String userId, List<TutorEducation.Request.EducationItem> educations) throws Exception {
        tutorEducationMapper.deleteByUserId(userId);
        
        if (educations != null && !educations.isEmpty()) {
            List<TutorEducation> tutorEducations = educations.stream()
                .map(item -> TutorEducation.builder()
                    .userId(userId)
                    .schoolName(item.getSchoolName())
                    .degree(item.getDegree())
                    .startYear(item.getStartYear())
                    .graduatedYear(item.getGraduatedYear())
                    .build())
                .collect(Collectors.toList());
            
            tutorEducationMapper.insertBatch(tutorEducations);
        }
    }

}
