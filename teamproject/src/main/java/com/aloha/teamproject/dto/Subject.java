package com.aloha.teamproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subject {
    
    private String id;
    private String groupId;
    private String name;
    private Integer seqInGroup;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String groupId;
        private String name;
        private Integer seqInGroup;
    }
}
