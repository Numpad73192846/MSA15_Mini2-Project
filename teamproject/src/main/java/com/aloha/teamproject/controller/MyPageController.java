package com.aloha.teamproject.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.aloha.teamproject.dto.Users;
import com.aloha.teamproject.config.TossPaymentsProperties;
import com.aloha.teamproject.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequiredArgsConstructor
public class MyPageController {

    private final UserService userService;
    private final TossPaymentsProperties tossPaymentsProperties;

    @GetMapping("/tutor/mypage")
    public String tutorMyPage() {
        log.info("[GET] - /tutor/mypage");
        return "tutor/mypage";
    }

    @GetMapping("/tutor/profile-edit")
    public String tutorProfileEdit() {
        log.info("[GET] - /tutor/profile-edit");
        return "tutor/profile-edit";
    }

    @GetMapping("/tutor/profile-edit/partial/{section}")
    public String tutorProfileEditPartial(@PathVariable("section") String section) {
        String safe = switch (section) {
            case "basic", "profile", "employment", "account", "documents", "lessons", "schedule", "zoom", "security" -> section;
            default -> "basic";
        };
        return "tutor/partials/profile-edit-" + safe;
    }

    @GetMapping({"/member/mypage", "/mypage"})
    public String memberMyPage(Authentication authentication, Model model) {
        log.info("[GET] - /member/mypage");
        Users user = resolveUser(authentication);
        model.addAttribute("user", user);
        model.addAttribute("tossClientKey", tossPaymentsProperties.getClientKey());
        return "member/mypage";
    }

    @GetMapping("/member/profile-edit")
    public String memberProfileEdit() {
        log.info("[GET] - /member/profile-edit");
        return "member/profile-edit";
    }

    @GetMapping("/member/profile-edit/partial/{section}")
    public String memberProfileEditPartial(@PathVariable("section") String section) {
        String safe = switch (section) {
            case "basic", "security" -> section;
            default -> "basic";
        };
        return "member/partials/profile-edit-" + safe;
    }

    @PostMapping("/member/mypage/update")
    public String updateMember(Users user, 
                               @RequestParam(value = "profileImage", required = false) MultipartFile profileImage,
                               Authentication authentication) throws Exception {
        log.info("[POST] - /member/mypage/update");
        log.info("user : {}", user);
        // userService.update(user);
        return "redirect:/member/mypage";
    }

    @PostMapping("/tutor/mypage/update")
    public String updateTutor(@RequestParam(value = "name", required = false) String name,
                              @RequestParam(value = "bio", required = false) String bio,
                              Authentication authentication) {
        log.info("[POST] - /tutor/mypage/update");
        return "redirect:/tutor/mypage";
    }

    private Users resolveUser(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            try {
                Users user = userService.selectById(authentication.getName());
                if (user != null) {
                    return user;
                }
            } catch (Exception e) {
                log.error("Failed to load user for mypage", e);
            }
        }

        Users guest = new Users();
        guest.setName("Guest");
        guest.setUsername("guest");
        return guest;
    }
}
