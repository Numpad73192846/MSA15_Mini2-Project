package com.aloha.teamproject.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.apache.commons.io.FilenameUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.aloha.teamproject.common.exception.AppException;
import com.aloha.teamproject.common.exception.ErrorCode;
import com.aloha.teamproject.common.service.BaseServiceImpl;
import com.aloha.teamproject.dto.UserAuth;
import com.aloha.teamproject.dto.Users;
import com.aloha.teamproject.mapper.UserMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends BaseServiceImpl implements UserService {

	private final UserMapper userMapper;
	private final PasswordEncoder passwordEncoder;

	private static final String UPLOAD_DIR = "uploads/users/";

	@Override
	public List<Users> list() throws Exception {
		List<Users> userList = userMapper.list();
		return userList;
	}

	@Override
	public Users selectById(String id) throws Exception {
		requiredNotBlank(id, ErrorCode.INVALID_REQUEST);
		Users user = userMapper.selectById(id);
		requireNotNull(user, ErrorCode.USER_NOT_FOUND);
		return user;
	}

	@Override
	public Users selectByUsername(String username) throws Exception {
		requiredNotBlank(username, ErrorCode.INVALID_REQUEST);
		Users user = userMapper.selectByUsername(username);
		requireNotNull(user, ErrorCode.USER_NOT_FOUND);
		return user;
	}

	@Override
	@Transactional
	public boolean insert(Users user) throws Exception {
		requireNotNull(user, ErrorCode.INVALID_REQUEST);
		String username = user.getUsername();
		String password = user.getPassword();

		requiredNotBlank(username, ErrorCode.INVALID_REQUEST);
		requiredNotBlank(password, ErrorCode.INVALID_REQUEST);

		Users existing = userMapper.selectByUsername(username);
		require(existing == null, ErrorCode.USERNAME_DUPLICATED);


		String role = user.getRole();
		if (role == null || role.isBlank()) {
			role = "ROLE_USER";
		}
		if ("ROLE_TUTOR".equals(role)) {
			role = "ROLE_TUTOR_PENDING";
		}

		String encodedPassword = passwordEncoder.encode(password);
		user.setPassword(encodedPassword);

		int result = userMapper.join(user);

		if ( result > 0 ) {
			UserAuth userAuth = new UserAuth();
			userAuth.setUserId(user.getId());
			userAuth.setAuth(role);
			result = userMapper.insertAuth(userAuth);
		}

		if (result <= 0) {
			throw new AppException(ErrorCode.INTERNAL_ERROR);
		}
		return true;
	}

	@Override
	public boolean update(Users user) throws Exception {
		requireNotNull(user, ErrorCode.INVALID_REQUEST);
		requireNotNull(user.getNo(), ErrorCode.INVALID_REQUEST);
		String password = user.getPassword();
		
		if ( password != null && !password.isEmpty() ) {
			String encodedPassword = passwordEncoder.encode(password);
			user.setPassword(encodedPassword);
		}
		
		int result = userMapper.update(user);
		if (result <= 0) {
			throw new AppException(ErrorCode.NOT_FOUND);
		}
		return true;
		
	}

	@Override
	public boolean insertAuth(UserAuth userAuth) throws Exception {
		requireNotNull(userAuth, ErrorCode.INVALID_REQUEST);
		int result = userMapper.insertAuth(userAuth);
		if (result <= 0) {
			throw new AppException(ErrorCode.INTERNAL_ERROR);
		}
		return true;
	}

	@Override
	public boolean deleteAuth(String userId, String auth) throws Exception {
		requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
		requiredNotBlank(auth, ErrorCode.INVALID_REQUEST);
		userMapper.deleteAuth(userId, auth);
		return true;
	}

	@Override
	public boolean delete(Long no) throws Exception {
		requireNotNull(no, ErrorCode.INVALID_REQUEST);
		int result = userMapper.delete(no);
		if (result <= 0) {
			throw new AppException(ErrorCode.NOT_FOUND);
		}
		return true;
	}

	@Override
	public boolean isUsernameAvailable(String username) throws Exception {
		requiredNotBlank(username, ErrorCode.INVALID_REQUEST);
		Users existing = userMapper.selectByUsername(username);
		return existing == null;
	}

	@Override
	public boolean isNicknameAvailable(String nickname) throws Exception {
		requiredNotBlank(nickname, ErrorCode.INVALID_REQUEST);
		Users existing = userMapper.selectByNickname(nickname);
		return existing == null;
	}

	@Override
	@Transactional
	public boolean updateMyInfo(String userId, String name, String password, String passwordConfirm) throws Exception {
		requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
		
		// 비밀번호 변경 시 확인
		if (password != null && !password.isEmpty()) {
			requiredNotBlank(passwordConfirm, ErrorCode.INVALID_REQUEST);
			require(password.equals(passwordConfirm), ErrorCode.INVALID_PASSWORD);
		}
		
		Users user = userMapper.selectById(userId);
		requireNotNull(user, ErrorCode.USER_NOT_FOUND);
		
		// 수정할 정보 설정
		if (name != null && !name.isEmpty()) {
			user.setName(name);
		}
		if (password != null && !password.isEmpty()) {
			String encodedPassword = passwordEncoder.encode(password);
			user.setPassword(encodedPassword);
		}
		
		int result = userMapper.update(user);
		return result > 0;
	}

	@Override
    public String saveProfileImg(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }
        
        String originalName = file.getOriginalFilename();
        String ext = FilenameUtils.getExtension(originalName);
        String fileName = UUID.randomUUID() + "." + ext;
        
        Path path = Paths.get(UPLOAD_DIR + fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());
        
        log.debug("프로필 이미지 저장 완료: {}", path);

        return "/uploads/users/" + fileName;
    }

	@Override
	@Transactional
	public boolean updateProfileImg(String userId, String profileImg) throws Exception {
		requiredNotBlank(userId, ErrorCode.INVALID_REQUEST);
		int result = userMapper.updateProfileImg(userId, profileImg);
		return result > 0;
	}

}
