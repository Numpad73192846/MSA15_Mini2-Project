package com.aloha.teamproject.api;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.common.response.SuccessCode;
import com.aloha.teamproject.dto.Subject;
import com.aloha.teamproject.dto.SubjectGroup;
import com.aloha.teamproject.service.SubjectService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public ApiResponse<List<Subject>> getAllSubjects() {
        try {
            List<Subject> subjects = subjectService.selectAll();
            return ApiResponse.ok(subjects);
        } catch (Exception e) {
            log.error("과목 목록 조회 실패", e);
            return ApiResponse.error("과목 목록을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Subject> getSubject(@PathVariable String id) {
        try {
            Subject subject = subjectService.selectById(id);
            return ApiResponse.ok(subject);
        } catch (Exception e) {
            log.error("과목 조회 실패", e);
            return ApiResponse.error("과목을 조회하지 못했습니다.");
        }
    }

    @GetMapping("/groups")
    public ApiResponse<List<SubjectGroup>> getAllGroups() {
        try {
            List<SubjectGroup> groups = subjectService.selectAllGroups();
            return ApiResponse.ok(groups);
        } catch (Exception e) {
            log.error("과목 그룹 목록 조회 실패", e);
            return ApiResponse.error("과목 그룹 목록을 조회하지 못했습니다.");
        }
    }

    @PostMapping
    public ApiResponse<Void> createSubject(@RequestBody Subject.Request request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            Subject subject = Subject.builder()
                .groupId(request.getGroupId())
                .name(request.getName())
                .seqInGroup(request.getSeqInGroup())
                .build();

            subjectService.insert(subject);
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (Exception e) {
            log.error("과목 생성 실패", e);
            return ApiResponse.error("과목을 생성하지 못했습니다.");
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateSubject(@PathVariable String id, @RequestBody Subject.Request request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            Subject subject = Subject.builder()
                .id(id)
                .name(request.getName())
                .seqInGroup(request.getSeqInGroup())
                .build();

            subjectService.update(subject);
            return ApiResponse.ok(SuccessCode.UPDATED);
        } catch (Exception e) {
            log.error("과목 수정 실패", e);
            return ApiResponse.error("과목을 수정하지 못했습니다.");
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSubject(@PathVariable String id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            subjectService.delete(id);
            return ApiResponse.ok(SuccessCode.DELETED);
        } catch (Exception e) {
            log.error("과목 삭제 실패", e);
            return ApiResponse.error("과목을 삭제하지 못했습니다.");
        }
    }

    @PostMapping("/groups")
    public ApiResponse<Void> createGroup(@RequestBody SubjectGroup.Request request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ApiResponse.error("로그인이 필요합니다.");
        }

        try {
            SubjectGroup group = SubjectGroup.builder()
                .name(request.getName())
                .seq(request.getSeq())
                .build();

            subjectService.insertGroup(group);
            return ApiResponse.ok(SuccessCode.CREATED);
        } catch (Exception e) {
            log.error("과목 그룹 생성 실패", e);
            return ApiResponse.error("과목 그룹을 생성하지 못했습니다.");
        }
    }

}
