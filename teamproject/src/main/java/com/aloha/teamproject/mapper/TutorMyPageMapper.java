package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.LanguageField;
import com.aloha.teamproject.dto.MonthlyEarning;
import com.aloha.teamproject.dto.TutorProfile;
import com.aloha.teamproject.dto.TutorReview;
import com.aloha.teamproject.dto.TutorStats;
import com.aloha.teamproject.dto.UpcomingLesson;

@Mapper
public interface TutorMyPageMapper {
	
	public TutorProfile selectTutorProfileByUserId(@Param("userId") String userId) throws Exception;

	public List<LanguageField> selectTutorFieldsByUserId(@Param("userId") String userId) throws Exception;

	public List<UpcomingLesson> selectUpcomingBookingsByUserId(@Param("userId") String userId) throws Exception;

	public List<UpcomingLesson> selectPastBookingsByUserId(@Param("userId") String userId) throws Exception;

	public List<TutorReview> selectTutorReviewsByUserId(@Param("userId") String userId) throws Exception;

	public TutorStats selectTutorStatsByUserId(@Param("userId") String userId) throws Exception;

	public List<MonthlyEarning> selectMonthlyEarningsByUserId(@Param("userId") String userId) throws Exception;
	
}
