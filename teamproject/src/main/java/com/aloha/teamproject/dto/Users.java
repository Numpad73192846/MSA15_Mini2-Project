package com.aloha.teamproject.dto;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class Users {

	private Long no;
	@Builder.Default
	private String id = UUID.randomUUID().toString();
	private String username;
	private String password;
	private Boolean rememberMe;
	private String name;
	private String nickname;
	private String profileImg;
	@Builder.Default
	private String role = "ROLE_USER";
	@Builder.Default
	private String status = "ACTIVE";
	private Date createdAt;
	private Date updatedAt;

	private List<UserAuth> authList;

	public Users() {
		this.id = UUID.randomUUID().toString();
		this.status = "ACTIVE";
	}
	
}
