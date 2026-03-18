package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.LanguageField;
import com.aloha.teamproject.dto.MonthlyEarning;
import com.aloha.teamproject.dto.TutorProfile;
import com.aloha.teamproject.dto.TutorReview;
import com.aloha.teamproject.dto.TutorStats;
import com.aloha.teamproject.dto.UpcomingLesson;

public interface TutorMyPageService  {
	
	public TutorProfile selectTutorProfileByUserId(String userId) throws Exception;

	public List<LanguageField> selectTutorFieldsByUserId(String userId) throws Exception;

	public List<UpcomingLesson> selectUpcomingBookingsByUserId(String userId) throws Exception;

	public List<UpcomingLesson> selectPastBookingsByUserId(String userId) throws Exception;

	public List<TutorReview> selectTutorReviewsByUserId(String userId) throws Exception;

	public TutorStats selectTutorStatsByUserId(String userId) throws Exception;

	public List<MonthlyEarning> selectMonthlyEarningsByUserId(String userId) throws Exception;

}
