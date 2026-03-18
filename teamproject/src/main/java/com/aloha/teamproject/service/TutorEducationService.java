package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.TutorEducation;

public interface TutorEducationService {

    public List<TutorEducation> selectByUserId(String userId) throws Exception;

    public void replaceEducations(String userId, List<TutorEducation.Request.EducationItem> educations) throws Exception;

}
