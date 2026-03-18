package com.aloha.teamproject.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import org.springframework.validation.Errors;

@Data
public class JoinRequest {
    /**
     * 이메일 검증
     * - 빈 값 불가
     * - example@domain.com 형태 강제
     * - @만 있고 .com 등의 TLD가 없는 경우 허용하지 않음
     */
    @Email(message = "이메일 형식이 아닙니다")
    @Pattern(
        regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
        message = "이메일은 example@domain.com 형식이어야 합니다"
    )
    @NotBlank(message = "이메일은 필수입니다")
    private String username;
    private boolean usernameChecked;   // 이메일 중복검사 통과 여부 

    @Pattern(
        regexp = "^(?=.*[!@#$%^&*(),.?\":{}|<>]).{6,}$",
        message = "비밀번호는 6자 이상이며 특수문자를 1개 이상 포함해야 합니다."
    )
    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;

    @NotBlank(message = "비밀번호 확인은 필수입니다")
    private String passwordCheck;

    @NotBlank(message = "닉네임은 필수입니다")    
    private String nickname;
    private boolean nicknameChecked;   // 닉네임 중복검사 통과 여부
    
    @NotBlank(message = "이름은 필수입니다")
    private String name;

    private String role = "ROLE_USER";

    public void validate(Errors errors) {
        // 닉네임: 공백 먼저, 그 다음 길이 검사
        if (!errors.hasFieldErrors("nickname")) {
            String nickname = getNickname();
            if (nickname != null) {
                int len = nickname.length();
                if (len < 2 || len > 20) {
                    errors.rejectValue(
                        "nickname",
                        "nickname.size",
                        "닉네임은 2~20자 이내여야 합니다"
                    );
                }
            }
        }

        // 이미 password / passwordCheck 자체 에러가 있으면 비교 안 함
        if (errors.hasFieldErrors("password") ||
            errors.hasFieldErrors("passwordCheck")) {
            return;
        }

        if (getPassword() != null && !getPassword().equals(getPasswordCheck())) {
            errors.rejectValue(
                "passwordCheck",
                "password.mismatch",
                "비밀번호가 일치하지 않습니다"
            );
        }
    }

}
