package com.aloha.teamproject.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.Subject;
import com.aloha.teamproject.dto.SubjectGroup;
import com.aloha.teamproject.mapper.SubjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl extends BaseServiceImpl implements SubjectService {

    private final SubjectMapper subjectMapper;

    @Override
    public List<Subject> selectAll() throws Exception {
        return subjectMapper.selectAll();
    }

    @Override
    public Subject selectById(String id) throws Exception {
        return subjectMapper.selectById(id);
    }

    @Override
    public Subject selectByName(String name) throws Exception {
        return subjectMapper.selectByName(name);
    }

    @Override
    public List<Subject> selectByGroupId(String groupId) throws Exception {
        return subjectMapper.selectByGroupId(groupId);
    }

    @Override
    @Transactional
    public int insert(Subject subject) throws Exception {
        return subjectMapper.insert(subject);
    }

    @Override
    @Transactional
    public int update(Subject subject) throws Exception {
        return subjectMapper.update(subject);
    }

    @Override
    @Transactional
    public int delete(String id) throws Exception {
        return subjectMapper.delete(id);
    }

    @Override
    public List<SubjectGroup> selectAllGroups() throws Exception {
        return subjectMapper.selectAllGroups();
    }

    @Override
    public SubjectGroup selectGroupById(String id) throws Exception {
        return subjectMapper.selectGroupById(id);
    }

    @Override
    @Transactional
    public int insertGroup(SubjectGroup group) throws Exception {
        return subjectMapper.insertGroup(group);
    }

    @Override
    @Transactional
    public int updateGroup(SubjectGroup group) throws Exception {
        return subjectMapper.updateGroup(group);
    }

    @Override
    @Transactional
    public int deleteGroup(String id) throws Exception {
        return subjectMapper.deleteGroup(id);
    }

}
