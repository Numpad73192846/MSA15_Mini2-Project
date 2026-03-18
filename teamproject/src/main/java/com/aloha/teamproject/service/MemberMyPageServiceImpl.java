package com.aloha.teamproject.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aloha.teamproject.common.exception.ErrorCode;
import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.MemberMyPage;
import com.aloha.teamproject.dto.MemberStats;
import com.aloha.teamproject.dto.StudentBooking;
import com.aloha.teamproject.dto.StudentReview;
import com.aloha.teamproject.dto.TutorMessage;
import com.aloha.teamproject.mapper.MemberMyPageMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberMyPageServiceImpl extends BaseServiceImpl implements MemberMyPageService {

	private final MemberMyPageMapper memberMyPageMapper;

	@Override
	public MemberMyPage selectMemberByUserId(String userId) throws Exception {
		requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
		log.debug("[MemberMyPage] 회원 정보 조회 - userId: {}", userId);
		MemberMyPage memberMyPage = memberMyPageMapper.selectMemberByUserId(userId);
		log.debug("[MemberMyPage] 회원 정보 조회 완료 - {}", memberMyPage != null ? memberMyPage.getName() : "NULL");
		return memberMyPage;
	}

	@Override
	public MemberStats selectMemberStats(String userId) throws Exception {
		requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
		log.debug("[MemberMyPage] 회원 통계 조회 - userId: {}", userId);
		MemberStats stats = memberMyPageMapper.selectMemberStats(userId);
		log.debug("[MemberMyPage] 회원 통계 조회 완료 - 예정된 수업: {}, 완료한 수업: {}", 
			stats.getUpcomingLessons(), stats.getCompletedLessons());
		return stats;
	}

	@Override
	public List<StudentBooking> selectUpcomingBookings(String userId) throws Exception {
		requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
		log.debug("[MemberMyPage] 예정된 수업 조회 - userId: {}", userId);
		List<StudentBooking> bookings = memberMyPageMapper.selectUpcomingBookings(userId);
		log.debug("[MemberMyPage] 예정된 수업 조회 완료 - 총 {}개", bookings.size());
		return bookings;
	}

	@Override
	public List<StudentBooking> selectPastBookings(String userId) throws Exception {
		requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
		log.debug("[MemberMyPage] 지난 수업 조회 - userId: {}", userId);
		List<StudentBooking> bookings = memberMyPageMapper.selectPastBookings(userId);
		log.debug("[MemberMyPage] 지난 수업 조회 완료 - 총 {}개", bookings.size());
		return bookings;
	}

	@Override
	public List<StudentReview> selectStudentReviews(String userId) throws Exception {
		requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
		log.debug("[MemberMyPage] 학생 리뷰 조회 - userId: {}", userId);
		List<StudentReview> reviews = memberMyPageMapper.selectStudentReviews(userId);
		log.debug("[MemberMyPage] 학생 리뷰 조회 완료 - 총 {}개", reviews.size());
		return reviews;
	}

	@Override
	public List<TutorMessage> selectTutorMessages(String userId) throws Exception {
		requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
		log.debug("[MemberMyPage] 튜터 메시지 조회 - userId: {}", userId);
		List<TutorMessage> messages = memberMyPageMapper.selectTutorMessages(userId);
		log.debug("[MemberMyPage] 튜터 메시지 조회 완료 - 총 {}개", messages.size());
		return messages;
	}

}
