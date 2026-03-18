package com.aloha.teamproject.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

	@GetMapping("/")
	public String home() {
		return "index";
	}

	@GetMapping("/login")
	public String login() {
		return "auth/login";
	}

	@GetMapping("/join")
	public String join() {
		return "redirect:/login?tab=signup";
	}

	@GetMapping("/tutor/schedule-edit")
	public String tutorScheduleEdit() {
		return "tutor/schedule-edit";
	}

	@GetMapping("/guide")
	public String guide() {
		return "guide/tutor-guide";
	}

	@GetMapping("/guide/policies")
	public String policies() {
		return "guide/policies";
	}

	// ============================== 추가 (세계인들의 언어 페이지 매핑)
	// ==============================
	// 작성일: 2026-02-03
	// 수정 내용: /guide/language 경로 매핑 추가 - 인기 과목 TOP 10 페이지
	@GetMapping("/guide/language")
	public String language() {
		return "guide/language";
	}
	// ============================== 수정 종료 ==============================

	// ============================== 추가 (한국어 게임 페이지 매핑)
	// ==============================
	// 작성일: 2026-02-04
	// 수정 내용: /game/korean 경로 매핑 추가 - 한국어 속담 게임 페이지
	@GetMapping("/game/korean")
	public String koreanGame() {
		return "game/korean-game";
	}
	// ============================== 수정 종료 ==============================

	@GetMapping("/faq")
	public String faq() {
		return "guide/faq";
	}

	@GetMapping("/contact")
	public String contact() {
		return "guide/contact";
	}

	@GetMapping("/about")
	public String about() {
		return "guide/aboutus";
	}

	@GetMapping("/partnership")
	public String partnership() {
		return "guide/partner";
	}

	@GetMapping("/jobs")
	public String jobs() {
		return "guide/jobs";
	}

}
