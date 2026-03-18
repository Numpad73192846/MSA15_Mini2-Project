package com.aloha.teamproject.dto;

import java.util.List;

import lombok.Data;

@Data
public class TutorMyPage {
	
	private TutorProfile tutorProfile;
	private List<LanguageField> languageFields;
	private TutorStats tutorStats;
	private List<UpcomingLesson> upcomingLessons;
	private List<UpcomingLesson> pastLessons;
	private List<TutorReview> tutorReviews;
	private List<MonthlyEarning> monthlyEarnings;

}
