package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.TutorSubject;

public interface TutorSubjectService {

    public List<TutorSubject> selectByUserId(String userId) throws Exception;

    public void replaceSubjects(String userId, List<String> subjectIds) throws Exception;

}
