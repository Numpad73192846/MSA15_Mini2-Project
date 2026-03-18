package com.aloha.teamproject.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/payments")
public class PaymentsController {

    @GetMapping("/toss/success")
    public String tossSuccess() {
        return "payments/success";
    }

    @GetMapping("/toss/fail")
    public String tossFail() {
        return "payments/fail";
    }
    
}
