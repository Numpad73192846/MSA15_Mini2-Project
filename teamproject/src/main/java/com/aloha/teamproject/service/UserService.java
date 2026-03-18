package com.aloha.teamproject.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.aloha.teamproject.common.service.BaseCrudService;
import com.aloha.teamproject.dto.UserAuth;
import com.aloha.teamproject.dto.Users;


public interface UserService extends BaseCrudService<Users> {

	// 회원 가입
	default boolean join(Users user) throws Exception {
		return insert(user);
	}

	// 회원 권한 등록
	boolean insertAuth(UserAuth userAuth) throws Exception;

	// 회원 권한 삭제
	boolean deleteAuth(String userId, String auth) throws Exception;

	// 중복 체크
	boolean isUsernameAvailable(String username) throws Exception;
	boolean isNicknameAvailable(String nickname) throws Exception;

	// 회원 정보 수정 (이름, 비밀번호)
	boolean updateMyInfo(String userId, String name, String password, String passwordConfirm) throws Exception;
	boolean updateProfileImg(String userId, String profileImg) throws Exception;

	// 프로필 이미지
    String saveProfileImg(MultipartFile file) throws IOException;

}
