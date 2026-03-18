package com.aloha.teamproject.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.TutorList;
import com.aloha.teamproject.mapper.TutorListMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TutorListServiceImpl extends BaseServiceImpl implements TutorListService {
    
    private final TutorListMapper tutorListMapper;

    @Override
    public List<TutorList> selectAllTutors() throws Exception {
        return tutorListMapper.selectAllTutors();
    }

    @Override
    public TutorList selectTutorById(String userId) throws Exception {
        return tutorListMapper.selectTutorById(userId);
    }

    @Override
    public List<TutorList> selectTutorsBySubject(String subject) throws Exception {
        return tutorListMapper.selectTutorsBySubject(subject);
    }

    @Override
    public List<TutorList> selectTutorsByPrice(BigDecimal minPrice, BigDecimal maxPrice) throws Exception {
        return tutorListMapper.selectTutorsByPrice(minPrice, maxPrice);
    }

    @Override
    public List<TutorList> selectTutorsBySearchTerm(String searchTerm) throws Exception {
        return tutorListMapper.selectTutorsBySearchTerm(searchTerm);
    }

}
