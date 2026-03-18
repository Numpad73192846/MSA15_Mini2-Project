package com.aloha.teamproject.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.LanguageField;
import com.aloha.teamproject.dto.MonthlyEarning;
import com.aloha.teamproject.dto.TutorProfile;
import com.aloha.teamproject.dto.TutorReview;
import com.aloha.teamproject.dto.TutorStats;
import com.aloha.teamproject.dto.UpcomingLesson;
import com.aloha.teamproject.mapper.TutorMyPageMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TutorMyPageServiceImpl extends BaseServiceImpl implements TutorMyPageService {

	private final TutorMyPageMapper tutorMyPageMapper;

	@Override
	public TutorProfile selectTutorProfileByUserId(String userId) throws Exception {
		log.debug("[TutorMyPage] 튜터 프로필 조회 - userId: {}", userId);
		TutorProfile profile = tutorMyPageMapper.selectTutorProfileByUserId(userId);
		log.debug("[TutorMyPage] 튜터 프로필 조회 완료 - {}", profile != null ? profile.getName() : "NULL");
		return profile;
	}

	@Override
	public List<LanguageField> selectTutorFieldsByUserId(String userId) throws Exception {
		log.debug("[TutorMyPage] 튜터 과목 조회 - userId: {}", userId);
		List<LanguageField> fields = tutorMyPageMapper.selectTutorFieldsByUserId(userId);
		log.debug("[TutorMyPage] 튜터 과목 조회 완료 - 총 {}개", fields.size());
		return fields;
	}

	@Override
	public List<UpcomingLesson> selectUpcomingBookingsByUserId(String userId) throws Exception {
		log.debug("[TutorMyPage] 예정된 수업 조회 - userId: {}", userId);
		List<UpcomingLesson> lessons = tutorMyPageMapper.selectUpcomingBookingsByUserId(userId);
		log.debug("[TutorMyPage] 예정된 수업 조회 완료 - 총 {}개", lessons.size());
		return lessons;
	}

	@Override
	public List<UpcomingLesson> selectPastBookingsByUserId(String userId) throws Exception {
		log.debug("[TutorMyPage] 지난 수업 조회 - userId: {}", userId);
		List<UpcomingLesson> lessons = tutorMyPageMapper.selectPastBookingsByUserId(userId);
		log.debug("[TutorMyPage] 지난 수업 조회 완료 - 총 {}개", lessons.size());
		return lessons;
	}

	@Override
	public List<TutorReview> selectTutorReviewsByUserId(String userId) throws Exception {
		log.debug("[TutorMyPage] 튜터 리뷰 조회 - userId: {}", userId);
		List<TutorReview> reviews = tutorMyPageMapper.selectTutorReviewsByUserId(userId);
		log.debug("[TutorMyPage] 튜터 리뷰 조회 완료 - 총 {}개", reviews.size());
		return reviews;
	}

	@Override
	public TutorStats selectTutorStatsByUserId(String userId) throws Exception {
		log.debug("[TutorMyPage] 튜터 통계 조회 - userId: {}", userId);
		TutorStats stats = tutorMyPageMapper.selectTutorStatsByUserId(userId);
		if (stats == null) {
			stats = new TutorStats();
		}
		log.debug("[TutorMyPage] 튜터 통계 조회 완료 - 총 수업: {}, 총 수익: {}", 
			stats.getTotalLessons(), stats.getTotalEarnings());
		return stats;
	}

	@Override
	public List<MonthlyEarning> selectMonthlyEarningsByUserId(String userId) throws Exception {
		log.debug("[TutorMyPage] 월별 수익 조회 - userId: {}", userId);
		List<MonthlyEarning> earnings = tutorMyPageMapper.selectMonthlyEarningsByUserId(userId);
		log.debug("[TutorMyPage] 월별 수익 조회 완료 - 총 {}개월", earnings.size());
		return earnings;
	}
	
}
