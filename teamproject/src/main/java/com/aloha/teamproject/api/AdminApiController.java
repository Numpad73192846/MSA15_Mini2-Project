package com.aloha.teamproject.api;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.aloha.teamproject.common.response.ApiResponse;
import com.aloha.teamproject.service.AdminService;
import java.util.Map;


@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminApiController {

    private final AdminService adminService;

    @PostMapping("/documents/approve")
    public ApiResponse<Void> approveDocument(@RequestBody Map<String, String> body, Authentication auth) {

        if ( auth == null || auth.getName() == null ) {
            return ApiResponse.error("Authentication required");
        }

        String id = body.get("id");
        adminService.approveDocument(id, auth.getName());
        return ApiResponse.ok();
    }

    @PostMapping("/documents/reject")
    public ApiResponse<Void> rejectDocument(@RequestBody Map<String, String> body, Authentication auth) {

        if ( auth == null || auth.getName() == null ) {
            return ApiResponse.error("Authentication required");
        }

        String id = body.get("id");
        String reason = body.get("reason");

        adminService.rejectDocument(id, auth.getName(), reason);
        return ApiResponse.ok();
    }

    @PostMapping("/settlements/remit")
    public ApiResponse<?> remit(
        @RequestBody Map<String, String> body
    ) {
        String tutorId = body.get("tutorId");
        int updated = adminService.remitTutorSettlement(tutorId);
        return ApiResponse.ok(Map.of("updated", updated));
    }

    @GetMapping("/documents")
    public ApiResponse<?> documents() {
        return ApiResponse.ok(adminService.getDocuments());
    }

    @GetMapping("/settlements")
    public ApiResponse<?> settlements() {
        return ApiResponse.ok(adminService.getTutorSettlements());
    }

    @GetMapping("/users")
    public ApiResponse<?> users() {
        return ApiResponse.ok(adminService.getUsers());
    }
    
    @PatchMapping("/users/{id}/status")
    public ApiResponse<?> updateUserStatus(
        @PathVariable String id,
        @RequestBody Map<String, String> map
    ) {
        String status = map.get("status");
        int updated = adminService.updateUserStatus(id, status);
        return ApiResponse.ok(Map.of("updated", updated));
    }

    @PatchMapping("/users/{id}/role")
    public ApiResponse<?> updateUserRole(
        @PathVariable String id,
        @RequestBody Map<String, String> map
    ) {
        String role = map.get("role");
        int updated = adminService.updateUserRole(id, role);
        return ApiResponse.ok(Map.of("updated", updated));
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<?> deleteUser(
        @PathVariable String id
    ) {
        int deleted = adminService.deleteUser(id);
        return ApiResponse.ok(Map.of("deleted", deleted));
    }

}
