-- 기존 튜터 회원들의 프로필 이미지를 랜덤한 동물 이미지로 변경
-- 실행 방법: MySQL 워크벤치나 터미널에서 이 파일을 실행하세요

USE matching;

-- 프로필 이미지 목록 (16개의 동물 이미지)
-- bear.svg, cat.svg, cow.svg, deer.svg, dog.svg, fox.svg, giraffe.svg, koala.svg, 
-- koala2.svg, lion.svg, monkey.svg, panda.svg, rabbit.svg, raccoon.svg, sloth.svg, tiger.svg

-- 각 튜터에게 랜덤한 프로필 이미지 할당
UPDATE users SET profile_img = '/img/profil/bear.svg' WHERE id = 'u-tutor-1';
UPDATE users SET profile_img = '/img/profil/cat.svg' WHERE id = 'u-tutor-2';
UPDATE users SET profile_img = '/img/profil/panda.svg' WHERE id = 'u-tutor-3';
UPDATE users SET profile_img = '/img/profil/dog.svg' WHERE id = 'u-tutor-4';
UPDATE users SET profile_img = '/img/profil/fox.svg' WHERE id = 'u-tutor-5';
UPDATE users SET profile_img = '/img/profil/lion.svg' WHERE id = 'u-tutor-6';
UPDATE users SET profile_img = '/img/profil/tiger.svg' WHERE id = 'u-tutor-7';
UPDATE users SET profile_img = '/img/profil/koala.svg' WHERE id = 'u-tutor-8';
UPDATE users SET profile_img = '/img/profil/rabbit.svg' WHERE id = 'u-tutor-9';
UPDATE users SET profile_img = '/img/profil/deer.svg' WHERE id = 'u-tutor-10';
UPDATE users SET profile_img = '/img/profil/raccoon.svg' WHERE id = 'u-tutor-11';
UPDATE users SET profile_img = '/img/profil/monkey.svg' WHERE id = 'u-tutor-12';
UPDATE users SET profile_img = '/img/profil/giraffe.svg' WHERE id = 'u-tutor-13';
UPDATE users SET profile_img = '/img/profil/cow.svg' WHERE id = 'u-tutor-14';
UPDATE users SET profile_img = '/img/profil/sloth.svg' WHERE id = 'u-tutor-15';
UPDATE users SET profile_img = '/img/profil/koala2.svg' WHERE id = 'u-tutor-16';
UPDATE users SET profile_img = '/img/profil/bear.svg' WHERE id = 'u-tutor-17';
UPDATE users SET profile_img = '/img/profil/cat.svg' WHERE id = 'u-tutor-18';
UPDATE users SET profile_img = '/img/profil/panda.svg' WHERE id = 'u-tutor-19';
UPDATE users SET profile_img = '/img/profil/dog.svg' WHERE id = 'u-tutor-20';

-- 변경 결과 확인
SELECT id, username, name, profile_img 
FROM users 
WHERE id LIKE 'u-tutor-%' 
ORDER BY id;
