package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.aloha.teamproject.dto.Subject;
import com.aloha.teamproject.dto.SubjectGroup;

@Mapper
public interface SubjectMapper {

    public List<Subject> selectAll() throws Exception;

    public Subject selectById(String id) throws Exception;

    public Subject selectByName(String name) throws Exception;

    public List<Subject> selectByGroupId(String groupId) throws Exception;

    public int insert(Subject subject) throws Exception;

    public int update(Subject subject) throws Exception;

    public int delete(String id) throws Exception;

    public List<SubjectGroup> selectAllGroups() throws Exception;

    public SubjectGroup selectGroupById(String id) throws Exception;

    public int insertGroup(SubjectGroup group) throws Exception;

    public int updateGroup(SubjectGroup group) throws Exception;

    public int deleteGroup(String id) throws Exception;

}
