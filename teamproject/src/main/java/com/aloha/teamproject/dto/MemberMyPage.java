package com.aloha.teamproject.dto;

import java.util.List;

import lombok.Data;

@Data
public class MemberMyPage {
	
	private String userId;
	private String name;
	private String email;
	private String nickname;
	private String profileImg;
	private MemberStats memberStats;
	private List<StudentBooking> upcomingBookings;
	private List<StudentBooking> pastBookings;
	private List<StudentReview> studentReviews;
	private List<TutorMessage> tutorMessages;

}
