package com.aloha.teamproject.dto;

import java.util.Date;

import lombok.Data;

@Data
public class AdminUser {
	
	private String id;
	private String username;
	private String name;
	private String nickname;
	private String role;
	private String status;
	private Date createdAt;

}