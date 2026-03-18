package com.aloha.teamproject.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.aloha.teamproject.service.AdminService;

@Slf4j
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping
    public String adminIndex(Model model) {
        log.info("Entering adminIndex");
        model.addAttribute("pendingDocs", adminService.getPendingDocuments());
        model.addAttribute("settlements", adminService.getTutorSettlements());
        return "admin/admin";
    }

    @GetMapping("/partial/{tab}")
    public String adminPartial(@PathVariable("tab") String tab) {
        Set<String> allowed = Set.of("dashboard", "doc", "settlement", "users", "tickets", "settings");
        String safeTab = allowed.contains(tab) ? tab : "dashboard";
        return "admin/partials/" + safeTab;
    }
}
