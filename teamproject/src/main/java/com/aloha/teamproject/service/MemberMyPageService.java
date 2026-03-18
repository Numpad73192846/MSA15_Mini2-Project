package com.aloha.teamproject.service;

import java.util.List;

import com.aloha.teamproject.dto.MemberMyPage;
import com.aloha.teamproject.dto.MemberStats;
import com.aloha.teamproject.dto.StudentBooking;
import com.aloha.teamproject.dto.StudentReview;
import com.aloha.teamproject.dto.TutorMessage;

public interface MemberMyPageService {
	
	public MemberMyPage selectMemberByUserId(String userId) throws Exception;

	public MemberStats selectMemberStats(String userId) throws Exception;

	public List<StudentBooking> selectUpcomingBookings(String userId) throws Exception;

	public List<StudentBooking> selectPastBookings(String userId) throws Exception;

	public List<StudentReview> selectStudentReviews(String userId) throws Exception;

	public List<TutorMessage> selectTutorMessages(String userId) throws Exception;

}
