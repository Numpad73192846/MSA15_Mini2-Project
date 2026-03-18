package com.aloha.teamproject.dto;

import java.util.Date;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class UserAuth {
	
  private Long no;
  @Builder.Default
  private String id = UUID.randomUUID().toString();
  private String userId;
  private String auth;
  private Date createdAt;
  private Date updatedAt;

  public UserAuth() {
    this.id = UUID.randomUUID().toString();
  }

}
