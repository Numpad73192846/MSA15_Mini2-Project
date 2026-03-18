package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.Lesson;

public interface LessonService {

    public List<Lesson> selectAll() throws Exception;

    public Lesson selectById(String id) throws Exception;

    public List<Lesson> selectByUserId(String userId) throws Exception;

    public List<Lesson> selectBySubjectId(String subjectId) throws Exception;

    public int insert(Lesson lesson) throws Exception;

    public int update(Lesson lesson) throws Exception;

    public int delete(String id) throws Exception;

    public int updateStatus(String id, String status) throws Exception;

}
