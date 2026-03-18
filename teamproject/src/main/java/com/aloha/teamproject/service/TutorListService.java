package com.aloha.teamproject.service;

import java.math.BigDecimal;
import java.util.List;

import com.aloha.teamproject.dto.TutorList;

public interface TutorListService {

	public List<TutorList> selectAllTutors() throws Exception;

	public TutorList selectTutorById(String userId) throws Exception;

	public List<TutorList> selectTutorsBySubject(String subject) throws Exception;

	public List<TutorList> selectTutorsByPrice(BigDecimal minPrice, BigDecimal maxPrice) throws Exception;

	public List<TutorList> selectTutorsBySearchTerm(String searchTerm) throws Exception;

}
