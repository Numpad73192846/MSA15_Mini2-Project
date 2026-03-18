package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.MemberMyPage;
import com.aloha.teamproject.dto.MemberStats;
import com.aloha.teamproject.dto.StudentBooking;
import com.aloha.teamproject.dto.StudentReview;
import com.aloha.teamproject.dto.TutorMessage;

@Mapper
public interface MemberMyPageMapper {
	
	public MemberMyPage selectMemberByUserId(@Param("userId") String userId) throws Exception;

	public MemberStats selectMemberStats(@Param("userId") String userId) throws Exception;

	public List<StudentBooking> selectUpcomingBookings(@Param("userId") String userId) throws Exception;

	public List<StudentBooking> selectPastBookings(@Param("userId") String userId) throws Exception;

	public List<StudentReview> selectStudentReviews(@Param("userId") String userId) throws Exception;

	public List<TutorMessage> selectTutorMessages(@Param("userId") String userId) throws Exception;
	
}
