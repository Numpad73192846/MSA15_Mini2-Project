package com.aloha.teamproject.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.aloha.teamproject.dto.UserAuth;
import com.aloha.teamproject.dto.Users;

@Mapper
public interface UserMapper {

	// 전체 회원 조회
	public List<Users> list() throws Exception;

	// ID로 회원 조회
	public Users selectById(String id) throws Exception;

	// Username으로 회원 조회
	public Users selectByUsername(String username) throws Exception;

	// Nickname으로 회원 조회
	public Users selectByNickname(String nickname) throws Exception;
	
	// 회원 가입
	public int join(Users user) throws Exception;
	
	// 회원 수정
	public int update(Users user) throws Exception;
	public int updateProfileImg(@Param("userId") String userId, @Param("profileImg") String profileImg) throws Exception;

	// 회원 삭제
	public int delete(Long no) throws Exception;
	
	// 회원 권한 등록
	public int insertAuth(UserAuth userAuth) throws Exception;

	// 회원 권한 삭제
	public int deleteAuth(@Param("userId") String userId, @Param("auth") String auth) throws Exception;

}
