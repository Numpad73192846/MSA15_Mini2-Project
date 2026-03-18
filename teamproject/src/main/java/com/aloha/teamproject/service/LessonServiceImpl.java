package com.aloha.teamproject.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.Lesson;
import com.aloha.teamproject.mapper.LessonMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl extends BaseServiceImpl implements LessonService {

    private final LessonMapper lessonMapper;

    @Override
    public List<Lesson> selectAll() throws Exception {
        return lessonMapper.selectAll();
    }

    @Override
    public Lesson selectById(String id) throws Exception {
        return lessonMapper.selectById(id);
    }

    @Override
    public List<Lesson> selectByUserId(String userId) throws Exception {
        return lessonMapper.selectByUserId(userId);
    }

    @Override
    public List<Lesson> selectBySubjectId(String subjectId) throws Exception {
        return lessonMapper.selectBySubjectId(subjectId);
    }

    @Override
    @Transactional
    public int insert(Lesson lesson) throws Exception {
        return lessonMapper.insert(lesson);
    }

    @Override
    @Transactional
    public int update(Lesson lesson) throws Exception {
        return lessonMapper.update(lesson);
    }

    @Override
    @Transactional
    public int delete(String id) throws Exception {
        return lessonMapper.delete(id);
    }

    @Override
    @Transactional
    public int updateStatus(String id, String status) throws Exception {
        return lessonMapper.updateStatus(id, status);
    }

}
