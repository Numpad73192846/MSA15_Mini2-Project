package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.TutorCareer;

public interface TutorCareerService {

    public List<TutorCareer> selectByUserId(String userId) throws Exception;

    public int insertBatch(List<TutorCareer> careers) throws Exception;

    public void replaceCareers(String userId, List<TutorCareer.Request.CareerItem> careers) throws Exception;

}
