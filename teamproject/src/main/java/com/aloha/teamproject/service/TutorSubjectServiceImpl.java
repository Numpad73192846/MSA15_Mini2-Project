package com.aloha.teamproject.service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.TutorSubject;
import com.aloha.teamproject.mapper.TutorSubjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TutorSubjectServiceImpl extends BaseServiceImpl implements TutorSubjectService {

    private final TutorSubjectMapper tutorSubjectMapper;

    @Override
    public List<TutorSubject> selectByUserId(String userId) throws Exception {
        return tutorSubjectMapper.selectByUserId(userId);
    }

    @Override
    @Transactional
    public void replaceSubjects(String userId, List<String> subjectIds) throws Exception {
        tutorSubjectMapper.deleteByUserId(userId);
        
        if (subjectIds != null && !subjectIds.isEmpty()) {
            List<TutorSubject> tutorSubjects = IntStream.range(0, subjectIds.size())
                .mapToObj(i -> TutorSubject.builder()
                    .userId(userId)
                    .subjectId(subjectIds.get(i))
                    .seq(i)
                    .build())
                .collect(Collectors.toList());
            
            tutorSubjectMapper.insertBatch(tutorSubjects);
        }
    }

}
