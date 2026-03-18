USE matching;

-- 관리자 계정 생성 id: admin@local.com password: Admin102938$&
SET @admin_id = UUID();

INSERT IGNORE INTO users (id, username, password, name, nickname, status)
VALUES (
  @admin_id,
  'admin@local.com',
  '$2a$10$H0BAEl9U9wCjOdkvsSlOK.E3FtKW8hm4Cj2/RaEvPos3/ww2O3jUu',
  '관리자',
  'admin',
  'ACTIVE'
);

INSERT IGNORE INTO user_auth (user_id, id, auth)
VALUES (@admin_id, UUID(), 'ROLE_ADMIN');

-- Shared bcrypt hash for password: Admin102938$&
SET @pw = '$2a$10$eZzE7fa53G86AOcvAN8wbOVoAnOVq5YnvLEAgsFaNDzsgFYCVXRye';

-- Users
INSERT IGNORE INTO users (id, username, password, name, nickname, status)
VALUES
('u-student-1','student1@test.com', @pw, '박학생', '열공중', 'ACTIVE'),
('u-student-2','student2@test.com', @pw, '김학생', '공부천재', 'ACTIVE'),
('u-student-3','student3@test.com', @pw, '이학생', '영어초보', 'ACTIVE'),
('u-student-4','student4@test.com', @pw, '최학생', '수학도사', 'ACTIVE'),
('u-student-5','student5@test.com', @pw, '정학생', '회화도사', 'ACTIVE'),
('u-student-6','student6@test.com', @pw, '조학생', '시험준비중', 'ACTIVE'),
('u-student-7','student7@test.com', @pw, '윤학생', '실무영어', 'ACTIVE'),
('u-student-8','student8@test.com', @pw, '장학생', '발음교정', 'ACTIVE'),
('u-student-9','student9@test.com', @pw, '임학생', '토익준비', 'ACTIVE'),
('u-student-10','student10@test.com', @pw, '하학생', '일본어시작', 'ACTIVE'),
('u-tutor-1','tutor1@test.com', @pw, '김튜터', '수학마스터', 'ACTIVE'),
('u-tutor-2','tutor2@test.com', @pw, '이튜터', '영어천재', 'ACTIVE'),
('u-tutor-3','tutor3@test.com', @pw, '박튜터', '회화전문', 'ACTIVE'),
('u-tutor-4','tutor4@test.com', @pw, '최튜터', '발음완벽', 'ACTIVE'),
('u-tutor-5','tutor5@test.com', @pw, '정튜터', '문법마스터', 'ACTIVE'),
('u-tutor-6','tutor6@test.com', @pw, '조튜터', '토익강사', 'ACTIVE'),
('u-tutor-7','tutor7@test.com', @pw, '윤튜터', '중국어전문', 'ACTIVE'),
('u-tutor-8','tutor8@test.com', @pw, '장튜터', '일본어마스터', 'ACTIVE'),
('u-tutor-9','tutor9@test.com', @pw, '임튜터', '스페인어', 'ACTIVE'),
('u-tutor-10','tutor10@test.com', @pw, '하튜터', '비즈니스영어', 'ACTIVE'),
('u-tutor-11','tutor11@test.com', @pw, '강튜터', '드라마로배우는영어', 'ACTIVE'),
('u-tutor-12','tutor12@test.com', @pw, '고튜터', '노래로배우는영어', 'ACTIVE'),
('u-tutor-13','tutor13@test.com', @pw, '곽튜터', '영어문화', 'ACTIVE'),
('u-tutor-14','tutor14@test.com', @pw, '구튜터', '여행영어', 'ACTIVE'),
('u-tutor-15','tutor15@test.com', @pw, '권튜터', '어린이영어', 'ACTIVE'),
('u-tutor-16','tutor16@test.com', @pw, '김동튜터', '고등수학', 'ACTIVE'),
('u-tutor-17','tutor17@test.com', @pw, '김선튜터', '중등수학', 'ACTIVE'),
('u-tutor-18','tutor18@test.com', @pw, '김주튜터', '물리전문', 'ACTIVE'),
('u-tutor-19','tutor19@test.com', @pw, '김찬튜터', '화학전문', 'ACTIVE'),
('u-tutor-20','tutor20@test.com', @pw, '김태튜터', '생물전문', 'ACTIVE');

-- 각 튜터에게 랜덤한 프로필 이미지 할당 (16개의 동물 이미지)
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


-- Roles
INSERT INTO user_auth (user_id, id, auth)
VALUES
('u-student-1', 'ua-s1', 'ROLE_USER'),
('u-student-2', 'ua-s2', 'ROLE_USER'),
('u-student-3', 'ua-s3', 'ROLE_USER'),
('u-student-4', 'ua-s4', 'ROLE_USER'),
('u-student-5', 'ua-s5', 'ROLE_USER'),
('u-student-6', 'ua-s6', 'ROLE_USER'),
('u-student-7', 'ua-s7', 'ROLE_USER'),
('u-student-8', 'ua-s8', 'ROLE_USER'),
('u-student-9', 'ua-s9', 'ROLE_USER'),
('u-student-10', 'ua-s10', 'ROLE_USER'),
('u-tutor-1', 'ua-t1', 'ROLE_TUTOR'),
('u-tutor-2', 'ua-t2', 'ROLE_TUTOR'),
('u-tutor-3', 'ua-t3', 'ROLE_TUTOR'),
('u-tutor-4', 'ua-t4', 'ROLE_TUTOR'),
('u-tutor-5', 'ua-t5', 'ROLE_TUTOR'),
('u-tutor-6', 'ua-t6', 'ROLE_TUTOR'),
('u-tutor-7', 'ua-t7', 'ROLE_TUTOR'),
('u-tutor-8', 'ua-t8', 'ROLE_TUTOR'),
('u-tutor-9', 'ua-t9', 'ROLE_TUTOR'),
('u-tutor-10', 'ua-t10', 'ROLE_TUTOR'),
('u-tutor-11', 'ua-t11', 'ROLE_TUTOR'),
('u-tutor-12', 'ua-t12', 'ROLE_TUTOR'),
('u-tutor-13', 'ua-t13', 'ROLE_TUTOR'),
('u-tutor-14', 'ua-t14', 'ROLE_TUTOR'),
('u-tutor-15', 'ua-t15', 'ROLE_TUTOR'),
('u-tutor-16', 'ua-t16', 'ROLE_TUTOR'),
('u-tutor-17', 'ua-t17', 'ROLE_TUTOR'),
('u-tutor-18', 'ua-t18', 'ROLE_TUTOR'),
('u-tutor-19', 'ua-t19', 'ROLE_TUTOR'),
('u-tutor-20', 'ua-t20', 'ROLE_TUTOR');

-- Subject groups
INSERT INTO subject_group (id, name, seq)
VALUES
('sg-kor', '한국어', 1),
('sg-eng', '영어', 2),
('sg-jpn', '일본어', 3),
('sg-chn', '중국어', 4),
('sg-fra', '프랑스어', 5),
('sg-spa', '스페인어', 6),
('sg-ger', '독일어', 7),
('sg-rus', '러시아어', 8);

-- Language fields
INSERT INTO language_field (id, name, category, seq)
VALUES
('lf-general-conversation', '회화', 'GENERAL', 1),
('lf-general-grammar', '문법', 'GENERAL', 2),
('lf-general-reading', '읽기', 'GENERAL', 3),
('lf-general-writing', '작문', 'GENERAL', 4),
('lf-general-pronunciation', '발음', 'GENERAL', 5),
('lf-domain-school', '학교', 'DOMAIN',  1),
('lf-domain-business', '비즈니스', 'DOMAIN',  2),
('lf-domain-travel', '여행', 'DOMAIN',  3),
('lf-domain-music', '노래', 'DOMAIN',  4),
('lf-domain-movie', '영화', 'DOMAIN',  5),
('lf-domain-drama', '드라마', 'DOMAIN',  6),
('lf-domain-culture', '문화', 'DOMAIN',  7);

-- Subjects
INSERT INTO subject (group_id, id, name, seq_in_group)
VALUES
('sg-kor', 'sub-kor-basic', '기초 한국어', 1),
('sg-kor', 'sub-kor-mid', '중등 한국어', 2),
('sg-kor', 'sub-kor-high','고등 한국어', 3),
('sg-eng', 'sub-eng-basic', '기초 영어', 1),
('sg-eng', 'sub-eng-mid', '중등 영어', 2),
('sg-eng', 'sub-eng-high','고등 영어', 3),
('sg-eng', 'sub-eng-toeic','TOEIC', 4),
('sg-jpn', 'sub-jpn-basic','기초 일본어', 1),
('sg-jpn', 'sub-jpn-mid', '중등 일본어', 2),
('sg-jpn', 'sub-jpn-high','고등 일본어', 3),
('sg-chn', 'sub-chn-basic','기초 중국어', 1),
('sg-chn', 'sub-chn-mid', '중등 중국어', 2),
('sg-chn', 'sub-chn-high','고등 중국어', 3),
('sg-fra', 'sub-fra-basic','기초 프랑스어', 1),
('sg-fra', 'sub-fra-mid', '중등 프랑스어', 2),
('sg-fra', 'sub-fra-high','고등 프랑스어', 3),
('sg-spa', 'sub-spa-basic','기초 스페인어', 1),
('sg-spa', 'sub-spa-mid', '중등 스페인어', 2),
('sg-spa', 'sub-spa-high','고등 스페인어', 3),
('sg-ger', 'sub-ger-basic','기초 독일어', 1),
('sg-ger', 'sub-ger-mid', '중등 독일어', 2),
('sg-ger', 'sub-ger-high','고등 독일어', 3),
('sg-rus', 'sub-rus-basic','기초 러시아어', 1),
('sg-rus', 'sub-rus-mid', '중등 러시아어', 2),
('sg-rus', 'sub-rus-high','고등 러시아어', 3);

INSERT INTO tutor_profile (
    user_id, id, phone, headline, bio, self_intro, video_url,
    default_zoom_url, bank_name, account_number, account_holder,
    is_verified, rating_avg, review_count
)
VALUES
('u-tutor-1','tp-1','010-1111-1111',
 '국·영어 전문 튜터','시험 대비 중심 수업',
 '기초부터 심화까지 단계별로 이해시키는 체계적인 수업을 진행합니다.',NULL,
 'https://zoom.us/j/1111111111','KB','111-111-111111','김튜터',TRUE,4.80,12),

('u-tutor-2','tp-2','010-2222-2222',
 '비즈니스 영어 튜터','실무 영어 집중',
 '면접, 프레젠테이션, 이메일까지 실무에 바로 쓰는 영어를 알려드립니다.',NULL,
 'https://zoom.us/j/2222222222','Shinhan','222-222-222222','이튜터',TRUE,4.70,8),

('u-tutor-3','tp-3','010-3333-3333',
 '일본어 회화 튜터','기초부터 자연스럽게',
 '회화 위주로 일본어 감각을 빠르게 익히도록 도와드립니다.',NULL,
 'https://zoom.us/j/3333333333','Woori','333-333-333333','박튜터',TRUE,4.60,5),

('u-tutor-4','tp-4','010-4444-4444',
 '영어 발음 교정 튜터','발음·억양 집중',
 '원어민에 가까운 발음을 목표로 단계별 교정을 진행합니다.',NULL,
 'https://zoom.us/j/4444444444','Hana','444-444-444444','최튜터',TRUE,4.75,9),

('u-tutor-5','tp-5','010-5555-5555',
 '영어 문법 튜터','개념 중심 문법',
 '헷갈리는 문법을 예문과 구조로 명확하게 정리합니다.',NULL,
 'https://zoom.us/j/5555555555','KB','555-555-555555','정튜터',TRUE,4.68,7),

('u-tutor-6','tp-6','010-6666-6666',
 '토익 전문 튜터','점수 상승 전략',
 'LC/RC 유형 분석과 시간 관리 전략으로 목표 점수를 만듭니다.',NULL,
 'https://zoom.us/j/6666666666','Shinhan','666-666-666666','조튜터',TRUE,4.82,14),

('u-tutor-7','tp-7','010-7777-7777',
 '중국어 튜터','회화·HSK 대비',
 '실생활 회화와 시험 대비를 함께 진행합니다.',NULL,
 'https://zoom.us/j/7777777777','Woori','777-777-777777','윤튜터',TRUE,4.61,6),

('u-tutor-8','tp-8','010-8888-8888',
 '일본어 전문 튜터','JLPT·회화',
 '시험 대비와 실전 회화를 균형 있게 지도합니다.',NULL,
 'https://zoom.us/j/8888888888','Hana','888-888-888888','장튜터',TRUE,4.73,10),

('u-tutor-9','tp-9','010-9999-9999',
 '스페인어 튜터','기초·여행 회화',
 '여행에서 바로 쓸 수 있는 표현 위주로 수업합니다.',NULL,
 'https://zoom.us/j/9999999999','KB','999-999-999999','임튜터',TRUE,4.55,4),

('u-tutor-10','tp-10','010-1010-1010',
 '비즈니스 영어 튜터','실무 회화 중심',
 '회의, 협상, 이메일 상황별 영어를 연습합니다.',NULL,
 'https://zoom.us/j/1010101010','Shinhan','101-101-101010','하튜터',TRUE,4.79,11),

('u-tutor-11','tp-11','010-1112-1112',
 '드라마 영어 튜터','콘텐츠 기반 학습',
 '드라마 장면을 활용해 자연스러운 표현을 익힙니다.',NULL,
 'https://zoom.us/j/1112111211','Woori','111-211-121112','강튜터',TRUE,4.66,5),

('u-tutor-12','tp-12','010-1212-1212',
 '노래로 배우는 영어','리스닝·발음 강화',
 '영어 노래를 통해 발음과 표현을 자연스럽게 익힙니다.',NULL,
 'https://zoom.us/j/1212121212','Hana','121-212-121212','고튜터',TRUE,4.58,3),

('u-tutor-13','tp-13','010-1313-1313',
 '영어 문화 튜터','문화 이해 중심',
 '언어와 함께 문화적 배경까지 설명합니다.',NULL,
 'https://zoom.us/j/1313131313','KB','131-313-131313','곽튜터',TRUE,4.60,4),

('u-tutor-14','tp-14','010-1414-1414',
 '여행 영어 튜터','상황별 회화',
 '공항·호텔·식당 등 여행 필수 표현을 연습합니다.',NULL,
 'https://zoom.us/j/1414141414','Shinhan','141-414-141414','구튜터',TRUE,4.63,6),

('u-tutor-15','tp-15','010-1515-1515',
 '어린이 영어 튜터','놀이 중심 수업',
 '게임과 활동으로 영어에 대한 흥미를 키워줍니다.',NULL,
 'https://zoom.us/j/1515151515','Woori','151-515-151515','권튜터',TRUE,4.71,8),

('u-tutor-16','tp-16','010-1616-1616',
 '고등 영어 튜터','내신·수능 대비',
 '독해 구조와 문제 풀이 전략을 중심으로 지도합니다.',NULL,
 'https://zoom.us/j/1616161616','KB','161-616-161616','김동튜터',TRUE,4.74,9),

('u-tutor-17','tp-17','010-1717-1717',
 '중등 영어 튜터','기초부터 탄탄하게',
 '문법과 독해의 기본기를 확실히 잡아드립니다.',NULL,
 'https://zoom.us/j/1717171717','Shinhan','171-717-171717','김선튜터',TRUE,4.62,5),

('u-tutor-18','tp-18','010-1818-1818',
 '영어 회화 튜터','말하기 집중',
 '반복 연습으로 말이 자연스럽게 나오도록 합니다.',NULL,
 'https://zoom.us/j/1818181818','Woori','181-818-181818','김주튜터',TRUE,4.68,6),

('u-tutor-19','tp-19','010-1919-1919',
 '영어 시험 대비 튜터','유형별 문제 풀이',
 '시험에 자주 나오는 패턴을 집중 공략합니다.',NULL,
 'https://zoom.us/j/1919191919','Hana','191-919-191919','김찬튜터',TRUE,4.57,4),

('u-tutor-20','tp-20','010-2020-2020',
 '스페인어 회화 튜터','기초·일상 회화',
 '일상에서 바로 쓸 수 있는 회화를 중심으로 진행합니다.',NULL,
 'https://zoom.us/j/2020202020','KB','202-020-202020','김태튜터',TRUE,4.64,5);

-- Tutor field mapping
INSERT INTO tutor_field (user_id, field_id, id, seq)
VALUES
('u-tutor-1', 'lf-general-grammar',       'tf-1-1', 1),
('u-tutor-1', 'lf-general-conversation',  'tf-1-2', 2),

('u-tutor-2', 'lf-domain-business',       'tf-2-1', 1),
('u-tutor-2', 'lf-general-conversation',  'tf-2-2', 2),

('u-tutor-3', 'lf-general-pronunciation', 'tf-3-1', 1),

('u-tutor-4',  'lf-general-pronunciation', 'tf-4-1', 1),
('u-tutor-4',  'lf-general-conversation',  'tf-4-2', 2),

('u-tutor-5',  'lf-general-grammar',       'tf-5-1', 1),
('u-tutor-5',  'lf-general-writing',       'tf-5-2', 2),

('u-tutor-6',  'lf-general-reading',       'tf-6-1', 1),
('u-tutor-6',  'lf-domain-business',       'tf-6-2', 2),

('u-tutor-7',  'lf-general-conversation',  'tf-7-1', 1),
('u-tutor-7',  'lf-general-pronunciation', 'tf-7-2', 2),

('u-tutor-8',  'lf-general-grammar',       'tf-8-1', 1),
('u-tutor-8',  'lf-general-conversation',  'tf-8-2', 2),

('u-tutor-9',  'lf-domain-travel',         'tf-9-1', 1),
('u-tutor-9',  'lf-general-conversation',  'tf-9-2', 2),

('u-tutor-10', 'lf-domain-business',       'tf-10-1', 1),
('u-tutor-10', 'lf-general-writing',       'tf-10-2', 2),

('u-tutor-11', 'lf-domain-drama',          'tf-11-1', 1),
('u-tutor-11', 'lf-general-pronunciation', 'tf-11-2', 2),

('u-tutor-12', 'lf-domain-music',          'tf-12-1', 1),
('u-tutor-12', 'lf-general-pronunciation', 'tf-12-2', 2),

('u-tutor-13', 'lf-domain-culture',        'tf-13-1', 1),
('u-tutor-13', 'lf-general-reading',       'tf-13-2', 2),

('u-tutor-14', 'lf-domain-travel',         'tf-14-1', 1),
('u-tutor-14', 'lf-general-conversation',  'tf-14-2', 2),

('u-tutor-15', 'lf-domain-school',         'tf-15-1', 1),
('u-tutor-15', 'lf-general-pronunciation', 'tf-15-2', 2),

('u-tutor-16', 'lf-domain-school',         'tf-16-1', 1),
('u-tutor-17', 'lf-domain-school',         'tf-17-1', 1),
('u-tutor-18', 'lf-domain-school',         'tf-18-1', 1),
('u-tutor-19', 'lf-domain-school',         'tf-19-1', 1),
('u-tutor-20', 'lf-domain-school',         'tf-20-1', 1);

INSERT INTO lesson (user_id, subject_id, field_id, id, title, description, status, price)
VALUES
('u-tutor-1','sub-kor-high','lf-general-grammar','lesson-1','고등 국어 핵심','문법·독해 핵심 개념 정리','OPEN',30000),
('u-tutor-1','sub-eng-mid','lf-general-conversation','lesson-2','중등 영어 회화','패턴 중심 말하기 연습','OPEN',32000),

('u-tutor-2','sub-eng-toeic','lf-domain-business','lesson-3','토익 실무 영어','점수와 실무를 함께 잡는 수업','OPEN',45000),

('u-tutor-3','sub-jpn-basic','lf-general-pronunciation','lesson-4','일본어 기초 회화','발음과 기본 표현 익히기','OPEN',28000),

('u-tutor-4','sub-eng-basic','lf-general-pronunciation','lesson-5','영어 발음 집중','억양·강세 교정','OPEN',35000),

('u-tutor-5','sub-eng-mid','lf-general-grammar','lesson-6','영어 문법 정리','핵심 문법 완성','OPEN',33000),

('u-tutor-6','sub-eng-toeic','lf-general-reading','lesson-7','토익 독해 전략','RC 유형별 공략','OPEN',42000),

('u-tutor-7','sub-chn-basic','lf-general-conversation','lesson-8','중국어 기초 회화','기본 회화와 성조 연습','OPEN',30000),

('u-tutor-8','sub-jpn-high','lf-general-grammar','lesson-9','JLPT 문법 집중','시험 대비 문법 정리','OPEN',38000),

('u-tutor-9','sub-spa-basic','lf-domain-travel','lesson-10','스페인어 여행 회화','여행 필수 표현','OPEN',31000),

('u-tutor-10','sub-eng-high','lf-domain-business','lesson-11','비즈니스 영어 실전','회의·이메일·협상','OPEN',50000),

('u-tutor-11','sub-eng-mid','lf-domain-drama','lesson-12','드라마 영어 쉐도잉','장면 기반 표현 학습','OPEN',36000),

('u-tutor-12','sub-eng-mid','lf-domain-music','lesson-13','노래로 배우는 영어','리스닝·발음 향상','OPEN',34000),

('u-tutor-13','sub-eng-mid','lf-domain-culture','lesson-14','영어 문화 이해','문화와 표현 함께 학습','OPEN',37000),

('u-tutor-14','sub-eng-basic','lf-domain-travel','lesson-15','여행 영어 생존 회화','여행 상황별 연습','OPEN',32000),

('u-tutor-15','sub-eng-basic','lf-domain-school','lesson-16','어린이 영어 놀이 수업','게임·활동 중심','OPEN',29000),

('u-tutor-16','sub-eng-high','lf-general-reading','lesson-17','고등 영어 독해','지문 구조와 해석','OPEN',40000),

('u-tutor-17','sub-eng-mid','lf-general-grammar','lesson-18','중등 영어 문법','기초 문법 완성','OPEN',35000),

('u-tutor-18','sub-eng-basic','lf-general-conversation','lesson-19','영어 회화 루틴','상황별 말하기','OPEN',42000),

('u-tutor-19','sub-eng-high','lf-general-reading','lesson-20','영어 시험 집중','기출 유형 분석','OPEN',41000),

('u-tutor-20','sub-spa-basic','lf-general-conversation','lesson-21','스페인어 기초 회화','일상 회화 입문','OPEN',39000);

-- Tutor subject mapping
INSERT INTO tutor_subject (user_id, subject_id, id, seq)
VALUES
('u-tutor-1', 'sub-kor-high',  'ts-1-1', 1),
('u-tutor-1', 'sub-eng-mid',   'ts-1-2', 2),
('u-tutor-2', 'sub-eng-toeic', 'ts-2-1', 1),
('u-tutor-3', 'sub-jpn-basic', 'ts-3-1', 1),
('u-tutor-4',  'sub-eng-basic',  'ts-4-1',  1),
('u-tutor-5',  'sub-eng-mid',    'ts-5-1',  1),
('u-tutor-6',  'sub-eng-toeic',  'ts-6-1',  1),
('u-tutor-7',  'sub-chn-basic',  'ts-7-1',  1),
('u-tutor-8',  'sub-jpn-high',   'ts-8-1',  1),
('u-tutor-9',  'sub-spa-basic',  'ts-9-1',  1),
('u-tutor-10', 'sub-eng-high',   'ts-10-1', 1),
('u-tutor-11', 'sub-eng-mid',    'ts-11-1', 1),
('u-tutor-12', 'sub-eng-mid',    'ts-12-1', 1),
('u-tutor-13', 'sub-eng-mid',    'ts-13-1', 1),
('u-tutor-14', 'sub-eng-basic',  'ts-14-1', 1),
('u-tutor-15', 'sub-eng-basic',  'ts-15-1', 1),
('u-tutor-16', 'sub-eng-high',  'ts-16-1', 1),
('u-tutor-17', 'sub-eng-mid',   'ts-17-1', 1),
('u-tutor-18', 'sub-eng-basic', 'ts-18-1', 1),
('u-tutor-19', 'sub-jpn-basic', 'ts-19-1', 1),
('u-tutor-20', 'sub-spa-basic', 'ts-20-1', 1);

-- Featured tutors
INSERT INTO featured_tutor (user_id, id, seq, visible)
VALUES
('u-tutor-1',  'ft-1',  1, TRUE),
('u-tutor-2',  'ft-2',  2, TRUE),
('u-tutor-3',  'ft-3',  3, TRUE),
('u-tutor-4',  'ft-4',  4, TRUE),
('u-tutor-5',  'ft-5',  5, TRUE),
('u-tutor-6',  'ft-6',  6, TRUE),
('u-tutor-7',  'ft-7',  7, TRUE),
('u-tutor-8',  'ft-8',  8, TRUE),
('u-tutor-9',  'ft-9',  9, TRUE),
('u-tutor-10', 'ft-10', 10, TRUE);
-- Tutor career
INSERT INTO tutor_career (user_id, id, company_name, job_category, job_role, start_year, end_year)
VALUES
('u-tutor-1','tc-1-1','알파 아카데미','교육','강사',2019,NULL),
('u-tutor-1','tc-1-2','베타 학원','교육','국어/영어 튜터',2017,2019),

('u-tutor-2','tc-2-1','글로벌 기업','비즈니스','사내 강사',2018,2023),
('u-tutor-2','tc-2-2','커리어 영어 센터','교육','비즈니스 영어 튜터',2016,2018),

('u-tutor-3','tc-3-1','언어 교육 센터','교육','일본어 튜터',2021,NULL),
('u-tutor-3','tc-3-2','JLPT 전문 스터디','교육','코치',2019,2021),

('u-tutor-4','tc-4-1','발음 교정 스튜디오','교육','발음 코치',2020,NULL),
('u-tutor-4','tc-4-2','회화 전문 학원','교육','영어 회화 강사',2018,2020),

('u-tutor-5','tc-5-1','문법 연구 스터디','교육','문법 강사',2019,NULL),
('u-tutor-5','tc-5-2','중등 영어 학원','교육','전임 강사',2017,2019),

('u-tutor-6','tc-6-1','토익 전문 학원','교육','토익 강사',2018,NULL),
('u-tutor-6','tc-6-2','모의고사 출제팀','교육','문항 검수',2017,2018),

('u-tutor-7','tc-7-1','중국어 회화 센터','교육','중국어 튜터',2019,NULL),
('u-tutor-7','tc-7-2','HSK 대비반','교육','강사',2018,2019),

('u-tutor-8','tc-8-1','일본어 교육원','교육','JLPT 강사',2019,NULL),
('u-tutor-8','tc-8-2','일본어 회화 클럽','교육','코치',2017,2019),

('u-tutor-9','tc-9-1','스페인어 스쿨','교육','스페인어 튜터',2020,NULL),
('u-tutor-9','tc-9-2','여행 회화 클래스','교육','강사',2019,2020),

('u-tutor-10','tc-10-1','비즈니스 커뮤니케이션 센터','교육','비즈니스 영어 강사',2019,NULL),
('u-tutor-10','tc-10-2','외국계 기업','비즈니스','해외영업',2016,2019),

('u-tutor-11','tc-11-1','콘텐츠 영어 연구소','교육','드라마 영어 튜터',2021,NULL),
('u-tutor-11','tc-11-2','회화 학원','교육','영어 강사',2019,2021),

('u-tutor-12','tc-12-1','뮤직 잉글리시 클래스','교육','영어 튜터',2020,NULL),
('u-tutor-12','tc-12-2','보컬 스튜디오','문화','보컬 코치',2018,2020),

('u-tutor-13','tc-13-1','문화 영어 살롱','교육','튜터',2020,NULL),
('u-tutor-13','tc-13-2','번역 프로젝트','콘텐츠','영문 번역',2018,2020),

('u-tutor-14','tc-14-1','여행 영어 스터디','교육','코치',2020,NULL),
('u-tutor-14','tc-14-2','관광 서비스','서비스','해외 고객 응대',2017,2020),

('u-tutor-15','tc-15-1','키즈 영어 센터','교육','어린이 영어 강사',2020,NULL),
('u-tutor-15','tc-15-2','방과후 영어','교육','강사',2018,2020),

('u-tutor-16','tc-16-1','고등 영어 학원','교육','전임 강사',2019,NULL),
('u-tutor-16','tc-16-2','내신 대비 스터디','교육','코치',2017,2019),

('u-tutor-17','tc-17-1','중등 영어 학원','교육','전임 강사',2019,NULL),
('u-tutor-17','tc-17-2','기초 영어 클래스','교육','강사',2018,2019),

('u-tutor-18','tc-18-1','회화 전문 센터','교육','영어 회화 강사',2019,NULL),
('u-tutor-18','tc-18-2','스터디 커뮤니티','교육','코치',2018,2019),

('u-tutor-19','tc-19-1','시험 영어 연구팀','교육','문항 분석',2020,NULL),
('u-tutor-19','tc-19-2','고등 영어 학원','교육','강사',2017,2020),

('u-tutor-20','tc-20-1','스페인어 회화 클래스','교육','튜터',2021,NULL),
('u-tutor-20','tc-20-2','여행 회화 스터디','교육','코치',2019,2021);

-- Tutor education
INSERT INTO tutor_education (user_id, id, school_name, degree, start_year, graduated_year)
VALUES
('u-tutor-1','te-1','서울대학교','국어교육학 학사',2012,2016),
('u-tutor-2','te-2','연세대학교','영어영문학 학사',2011,2015),
('u-tutor-3','te-3','오사카대학교','일본어 전공 학사',2014,2018),
('u-tutor-4','te-4','한국외국어대학교','영어통번역학 학사',2013,2017),
('u-tutor-5','te-5','서강대학교','영어영문학 학사',2012,2016),
('u-tutor-6','te-6','고려대학교','영어교육학 학사',2010,2014),
('u-tutor-7','te-7','중국 상해대학교','중국어학 학사',2013,2017),
('u-tutor-8','te-8','도쿄외국어대학교','일본어교육학 학사',2012,2016),
('u-tutor-9','te-9','바르셀로나대학교','스페인어학 학사',2014,2018),
('u-tutor-10','te-10','성균관대학교','경영학 학사',2011,2015),
('u-tutor-11','te-11','한양대학교','영어영문학 학사',2013,2017),
('u-tutor-12','te-12','이화여자대학교','커뮤니케이션학 학사',2012,2016),
('u-tutor-13','te-13','중앙대학교','문화콘텐츠학 학사',2011,2015),
('u-tutor-14','te-14','부산대학교','관광학 학사',2010,2014),
('u-tutor-15','te-15','경희대학교','아동학 학사',2013,2017),
('u-tutor-16','te-16','서울시립대학교','영어영문학 학사',2012,2016),
('u-tutor-17','te-17','인하대학교','영어교육학 학사',2014,2018),
('u-tutor-18','te-18','홍익대학교','교육학 학사',2013,2017),
('u-tutor-19','te-19','동국대학교','영어영문학 학사',2011,2015),
('u-tutor-20','te-20','전북대학교','스페인어학 학사',2014,2018);

-- Tutor documents
INSERT INTO tutor_document (user_id, id, doc_type, file_size, reviewed_by, reviewed_at, reject_reason, original_name, store_name, file_path, content_type)
VALUES
('u-tutor-1','td-1-1','EDUCATION',120000,'admin',DATE_SUB(NOW(),INTERVAL 10 DAY),NULL,'학력 증빙서류.pdf','td-1-1.pdf','/uploads/tutors/documents/td-1-1.pdf','application/pdf'),
('u-tutor-1','td-1-2','CERTIFICATE',98000,'admin',DATE_SUB(NOW(),INTERVAL 9 DAY),NULL,'교원 자격증.jpg','td-1-2.jpg','/uploads/tutors/documents/td-1-2.jpg','image/jpeg'),

('u-tutor-2','td-2-1','EDUCATION',110000,'admin',DATE_SUB(NOW(),INTERVAL 8 DAY),NULL,'졸업 증명서.pdf','td-2-1.pdf','/uploads/tutors/documents/td-2-1.pdf','application/pdf'),
('u-tutor-2','td-2-2','CERTIFICATE',95000,'admin',DATE_SUB(NOW(),INTERVAL 7 DAY),NULL,'토익 성적표.jpg','td-2-2.jpg','/uploads/tutors/documents/td-2-2.jpg','image/jpeg'),

('u-tutor-3','td-3-1','EDUCATION',105000,'admin',DATE_SUB(NOW(),INTERVAL 6 DAY),NULL,'학위 증명서.pdf','td-3-1.pdf','/uploads/tutors/documents/td-3-1.pdf','application/pdf'),
('u-tutor-3','td-3-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'JLPT N1 보유','td-3-2.txt','/uploads/tutors/documents/td-3-2.txt','text/plain'),

('u-tutor-4','td-4-1','EDUCATION',112000,'admin',DATE_SUB(NOW(),INTERVAL 6 DAY),NULL,'학력 증빙서류.pdf','td-4-1.pdf','/uploads/tutors/documents/td-4-1.pdf','application/pdf'),
('u-tutor-4','td-4-2','CERTIFICATE',88000,'admin',DATE_SUB(NOW(),INTERVAL 5 DAY),NULL,'발음 코칭 수료증.jpg','td-4-2.jpg','/uploads/tutors/documents/td-4-2.jpg','image/jpeg'),

('u-tutor-5','td-5-1','EDUCATION',99000,'admin',DATE_SUB(NOW(),INTERVAL 5 DAY),NULL,'졸업 증명서.pdf','td-5-1.pdf','/uploads/tutors/documents/td-5-1.pdf','application/pdf'),
('u-tutor-5','td-5-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'문법 지도 경력 5년','td-5-2.txt','/uploads/tutors/documents/td-5-2.txt','text/plain'),

('u-tutor-6','td-6-1','EDUCATION',100000,'admin',DATE_SUB(NOW(),INTERVAL 4 DAY),NULL,'학력 증빙서류.pdf','td-6-1.pdf','/uploads/tutors/documents/td-6-1.pdf','application/pdf'),
('u-tutor-6','td-6-2','CERTIFICATE',92000,'admin',DATE_SUB(NOW(),INTERVAL 3 DAY),NULL,'토익 만점 인증.jpg','td-6-2.jpg','/uploads/tutors/documents/td-6-2.jpg','image/jpeg'),

('u-tutor-7','td-7-1','EDUCATION',97000,NULL,NULL,NULL,'학위 증명서.pdf','td-7-1.pdf','/uploads/tutors/documents/td-7-1.pdf','application/pdf'),
('u-tutor-7','td-7-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'HSK 6급 보유','td-7-2.txt','/uploads/tutors/documents/td-7-2.txt','text/plain'),

('u-tutor-8','td-8-1','EDUCATION',108000,'admin',DATE_SUB(NOW(),INTERVAL 4 DAY),NULL,'졸업 증명서.pdf','td-8-1.pdf','/uploads/tutors/documents/td-8-1.pdf','application/pdf'),
('u-tutor-8','td-8-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'JLPT N1 보유','td-8-2.txt','/uploads/tutors/documents/td-8-2.txt','text/plain'),

('u-tutor-9','td-9-1','EDUCATION',103000,NULL,NULL,NULL,'학력 증빙서류.pdf','td-9-1.pdf','/uploads/tutors/documents/td-9-1.pdf','application/pdf'),
('u-tutor-9','td-9-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'스페인어 회화 수료','td-9-2.txt','/uploads/tutors/documents/td-9-2.txt','text/plain'),

('u-tutor-10','td-10-1','EDUCATION',101000,'admin',DATE_SUB(NOW(),INTERVAL 3 DAY),NULL,'졸업 증명서.pdf','td-10-1.pdf','/uploads/tutors/documents/td-10-1.pdf','application/pdf'),
('u-tutor-10','td-10-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'비즈니스 영어 강의 경력','td-10-2.txt','/uploads/tutors/documents/td-10-2.txt','text/plain'),

('u-tutor-11','td-11-1','EDUCATION',100500,NULL,NULL,NULL,'학력 증빙서류.pdf','td-11-1.pdf','/uploads/tutors/documents/td-11-1.pdf','application/pdf'),
('u-tutor-11','td-11-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'드라마 기반 커리큘럼 보유','td-11-2.txt','/uploads/tutors/documents/td-11-2.txt','text/plain'),

('u-tutor-12','td-12-1','EDUCATION',99500,NULL,NULL,NULL,'졸업 증명서.pdf','td-12-1.pdf','/uploads/tutors/documents/td-12-1.pdf','application/pdf'),
('u-tutor-12','td-12-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'노래 쉐도잉 커리큘럼','td-12-2.txt','/uploads/tutors/documents/td-12-2.txt','text/plain'),

('u-tutor-13','td-13-1','EDUCATION',98000,NULL,NULL,NULL,'학위 증명서.pdf','td-13-1.pdf','/uploads/tutors/documents/td-13-1.pdf','application/pdf'),
('u-tutor-13','td-13-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'문화/표현 중심 수업 자료','td-13-2.txt','/uploads/tutors/documents/td-13-2.txt','text/plain'),

('u-tutor-14','td-14-1','EDUCATION',101500,NULL,NULL,NULL,'졸업 증명서.pdf','td-14-1.pdf','/uploads/tutors/documents/td-14-1.pdf','application/pdf'),
('u-tutor-14','td-14-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'여행 영어 시나리오 자료','td-14-2.txt','/uploads/tutors/documents/td-14-2.txt','text/plain'),

('u-tutor-15','td-15-1','EDUCATION',102000,NULL,NULL,NULL,'학력 증빙서류.pdf','td-15-1.pdf','/uploads/tutors/documents/td-15-1.pdf','application/pdf'),
('u-tutor-15','td-15-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'키즈 영어 활동 자료','td-15-2.txt','/uploads/tutors/documents/td-15-2.txt','text/plain'),

('u-tutor-16','td-16-1','EDUCATION',100000,NULL,NULL,NULL,'졸업 증명서.pdf','td-16-1.pdf','/uploads/tutors/documents/td-16-1.pdf','application/pdf'),
('u-tutor-16','td-16-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'고등 내신 대비 자료','td-16-2.txt','/uploads/tutors/documents/td-16-2.txt','text/plain'),

('u-tutor-17','td-17-1','EDUCATION',99000,NULL,NULL,NULL,'학력 증빙서류.pdf','td-17-1.pdf','/uploads/tutors/documents/td-17-1.pdf','application/pdf'),
('u-tutor-17','td-17-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'중등 문법/독해 자료','td-17-2.txt','/uploads/tutors/documents/td-17-2.txt','text/plain'),

('u-tutor-18','td-18-1','EDUCATION',98000,NULL,NULL,NULL,'졸업 증명서.pdf','td-18-1.pdf','/uploads/tutors/documents/td-18-1.pdf','application/pdf'),
('u-tutor-18','td-18-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'회화 롤플레이 자료','td-18-2.txt','/uploads/tutors/documents/td-18-2.txt','text/plain'),

('u-tutor-19','td-19-1','EDUCATION',97000,NULL,NULL,NULL,'학위 증명서.pdf','td-19-1.pdf','/uploads/tutors/documents/td-19-1.pdf','application/pdf'),
('u-tutor-19','td-19-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'기출 유형 분석 자료','td-19-2.txt','/uploads/tutors/documents/td-19-2.txt','text/plain'),

('u-tutor-20','td-20-1','EDUCATION',96500,NULL,NULL,NULL,'졸업 증명서.pdf','td-20-1.pdf','/uploads/tutors/documents/td-20-1.pdf','application/pdf'),
('u-tutor-20','td-20-2','CERTIFICATE_TEXT',0,NULL,NULL,NULL,'스페인어 회화 자료','td-20-2.txt','/uploads/tutors/documents/td-20-2.txt','text/plain');

-- Tutor base time ranges
INSERT INTO tutor_time_range (user_id, id, start_at, end_at, day_of_week)
VALUES
('u-tutor-1','tr-1-1','18:00:00','22:00:00','월'),
('u-tutor-1','tr-1-2','18:00:00','22:00:00','수'),
('u-tutor-1','tr-1-3','10:00:00','13:00:00','토'),

('u-tutor-2','tr-2-1','19:00:00','23:00:00','화'),
('u-tutor-2','tr-2-2','19:00:00','23:00:00','목'),
('u-tutor-2','tr-2-3','11:00:00','14:00:00','일'),

('u-tutor-3','tr-3-1','20:00:00','22:00:00','월'),
('u-tutor-3','tr-3-2','20:00:00','22:00:00','금'),
('u-tutor-3','tr-3-3','10:00:00','14:00:00','토'),

('u-tutor-4','tr-4-1','18:00:00','21:00:00','화'),
('u-tutor-4','tr-4-2','18:00:00','21:00:00','목'),
('u-tutor-4','tr-4-3','13:00:00','16:00:00','토'),

('u-tutor-5','tr-5-1','19:00:00','22:00:00','월'),
('u-tutor-5','tr-5-2','19:00:00','22:00:00','수'),
('u-tutor-5','tr-5-3','11:00:00','14:00:00','일'),

('u-tutor-6','tr-6-1','20:00:00','23:00:00','화'),
('u-tutor-6','tr-6-2','20:00:00','23:00:00','목'),
('u-tutor-6','tr-6-3','10:00:00','12:00:00','토'),

('u-tutor-7','tr-7-1','18:00:00','21:00:00','월'),
('u-tutor-7','tr-7-2','18:00:00','21:00:00','금'),
('u-tutor-7','tr-7-3','14:00:00','17:00:00','일'),

('u-tutor-8','tr-8-1','19:00:00','22:00:00','화'),
('u-tutor-8','tr-8-2','19:00:00','22:00:00','목'),
('u-tutor-8','tr-8-3','10:00:00','13:00:00','토'),

('u-tutor-9','tr-9-1','20:00:00','22:00:00','수'),
('u-tutor-9','tr-9-2','20:00:00','22:00:00','금'),
('u-tutor-9','tr-9-3','11:00:00','14:00:00','일'),

('u-tutor-10','tr-10-1','19:00:00','23:00:00','월'),
('u-tutor-10','tr-10-2','19:00:00','23:00:00','수'),
('u-tutor-10','tr-10-3','10:00:00','12:00:00','토'),

('u-tutor-11','tr-11-1','18:00:00','21:00:00','화'),
('u-tutor-11','tr-11-2','18:00:00','21:00:00','목'),
('u-tutor-11','tr-11-3','13:00:00','16:00:00','일'),

('u-tutor-12','tr-12-1','20:00:00','22:00:00','월'),
('u-tutor-12','tr-12-2','20:00:00','22:00:00','금'),
('u-tutor-12','tr-12-3','11:00:00','14:00:00','토'),

('u-tutor-13','tr-13-1','19:00:00','22:00:00','화'),
('u-tutor-13','tr-13-2','19:00:00','22:00:00','목'),
('u-tutor-13','tr-13-3','10:00:00','13:00:00','일'),

('u-tutor-14','tr-14-1','18:00:00','21:00:00','수'),
('u-tutor-14','tr-14-2','18:00:00','21:00:00','금'),
('u-tutor-14','tr-14-3','11:00:00','14:00:00','토'),

('u-tutor-15','tr-15-1','17:00:00','20:00:00','월'),
('u-tutor-15','tr-15-2','17:00:00','20:00:00','수'),
('u-tutor-15','tr-15-3','10:00:00','12:00:00','일'),

('u-tutor-16','tr-16-1','19:00:00','22:00:00','화'),
('u-tutor-16','tr-16-2','19:00:00','22:00:00','목'),
('u-tutor-16','tr-16-3','13:00:00','16:00:00','토'),

('u-tutor-17','tr-17-1','18:00:00','21:00:00','월'),
('u-tutor-17','tr-17-2','18:00:00','21:00:00','금'),
('u-tutor-17','tr-17-3','11:00:00','14:00:00','일'),

('u-tutor-18','tr-18-1','20:00:00','23:00:00','화'),
('u-tutor-18','tr-18-2','20:00:00','23:00:00','목'),
('u-tutor-18','tr-18-3','10:00:00','12:00:00','토'),

('u-tutor-19','tr-19-1','19:00:00','22:00:00','수'),
('u-tutor-19','tr-19-2','19:00:00','22:00:00','금'),
('u-tutor-19','tr-19-3','13:00:00','16:00:00','일'),

('u-tutor-20','tr-20-1','18:00:00','21:00:00','화'),
('u-tutor-20','tr-20-2','18:00:00','21:00:00','목'),
('u-tutor-20','tr-20-3','11:00:00','14:00:00','토');

-- Tutor availability slots
INSERT INTO tutor_availability (user_id, id, start_at, end_at, status)
VALUES
('u-tutor-1','avail-1-1', DATE_ADD(NOW(),INTERVAL 1 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 1 DAY),INTERVAL 1 HOUR), 'BOOKED'),
('u-tutor-1','avail-1-2', DATE_ADD(NOW(),INTERVAL 2 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 2 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-1','avail-1-3', DATE_ADD(NOW(),INTERVAL 3 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 3 DAY),INTERVAL 1 HOUR), 'BOOKED'),
('u-tutor-1','avail-1-4', DATE_ADD(NOW(),INTERVAL 5 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 5 DAY),INTERVAL 1 HOUR), 'OPEN'),

('u-tutor-2','avail-2-1', DATE_ADD(NOW(),INTERVAL 1 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 1 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-2','avail-2-2', DATE_ADD(NOW(),INTERVAL 2 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 2 DAY),INTERVAL 1 HOUR), 'BOOKED'),
('u-tutor-2','avail-2-3', DATE_ADD(NOW(),INTERVAL 4 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 4 DAY),INTERVAL 1 HOUR), 'OPEN'),

('u-tutor-3','avail-3-1', DATE_ADD(NOW(),INTERVAL 2 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 2 DAY),INTERVAL 1 HOUR), 'BOOKED'),
('u-tutor-3','avail-3-2', DATE_ADD(NOW(),INTERVAL 3 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 3 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-3','avail-3-3', DATE_ADD(NOW(),INTERVAL 6 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 6 DAY),INTERVAL 1 HOUR), 'OPEN'),

('u-tutor-4','avail-4-1', DATE_ADD(NOW(),INTERVAL 1 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 1 DAY),INTERVAL 1 HOUR), 'BOOKED'),
('u-tutor-4','avail-4-2', DATE_ADD(NOW(),INTERVAL 3 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 3 DAY),INTERVAL 1 HOUR), 'OPEN'),

('u-tutor-5','avail-5-1', DATE_ADD(NOW(),INTERVAL 2 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 2 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-5','avail-5-2', DATE_ADD(NOW(),INTERVAL 4 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 4 DAY),INTERVAL 1 HOUR), 'BOOKED'),

('u-tutor-6','avail-6-1', DATE_ADD(NOW(),INTERVAL 1 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 1 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-6','avail-6-2', DATE_ADD(NOW(),INTERVAL 3 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 3 DAY),INTERVAL 1 HOUR), 'BOOKED'),

('u-tutor-7','avail-7-1', DATE_ADD(NOW(),INTERVAL 2 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 2 DAY),INTERVAL 1 HOUR), 'BOOKED'),
('u-tutor-7','avail-7-2', DATE_ADD(NOW(),INTERVAL 5 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 5 DAY),INTERVAL 1 HOUR), 'OPEN'),

('u-tutor-8','avail-8-1', DATE_ADD(NOW(),INTERVAL 2 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 2 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-8','avail-8-2', DATE_ADD(NOW(),INTERVAL 4 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 4 DAY),INTERVAL 1 HOUR), 'BOOKED'),

('u-tutor-9','avail-9-1', DATE_ADD(NOW(),INTERVAL 1 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 1 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-9','avail-9-2', DATE_ADD(NOW(),INTERVAL 3 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 3 DAY),INTERVAL 1 HOUR), 'BOOKED'),

('u-tutor-10','avail-10-1',DATE_ADD(NOW(),INTERVAL 2 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 2 DAY),INTERVAL 1 HOUR), 'BOOKED'),
('u-tutor-10','avail-10-2',DATE_ADD(NOW(),INTERVAL 6 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 6 DAY),INTERVAL 1 HOUR), 'OPEN'),

('u-tutor-11','avail-11-1',DATE_ADD(NOW(),INTERVAL 1 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 1 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-11','avail-11-2',DATE_ADD(NOW(),INTERVAL 4 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 4 DAY),INTERVAL 1 HOUR), 'BOOKED'),

('u-tutor-12','avail-12-1',DATE_ADD(NOW(),INTERVAL 2 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 2 DAY),INTERVAL 1 HOUR), 'BOOKED'),
('u-tutor-12','avail-12-2',DATE_ADD(NOW(),INTERVAL 5 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 5 DAY),INTERVAL 1 HOUR), 'OPEN'),

('u-tutor-13','avail-13-1',DATE_ADD(NOW(),INTERVAL 3 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 3 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-13','avail-13-2',DATE_ADD(NOW(),INTERVAL 6 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 6 DAY),INTERVAL 1 HOUR), 'BOOKED'),

('u-tutor-14','avail-14-1',DATE_ADD(NOW(),INTERVAL 1 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 1 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-14','avail-14-2',DATE_ADD(NOW(),INTERVAL 3 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 3 DAY),INTERVAL 1 HOUR), 'BOOKED'),

('u-tutor-15','avail-15-1',DATE_ADD(NOW(),INTERVAL 2 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 2 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-15','avail-15-2',DATE_ADD(NOW(),INTERVAL 4 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 4 DAY),INTERVAL 1 HOUR), 'OPEN'),

('u-tutor-16','avail-16-1',DATE_ADD(NOW(),INTERVAL 2 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 2 DAY),INTERVAL 1 HOUR), 'BOOKED'),
('u-tutor-16','avail-16-2',DATE_ADD(NOW(),INTERVAL 5 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 5 DAY),INTERVAL 1 HOUR), 'OPEN'),

('u-tutor-17','avail-17-1',DATE_ADD(NOW(),INTERVAL 1 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 1 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-17','avail-17-2',DATE_ADD(NOW(),INTERVAL 3 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 3 DAY),INTERVAL 1 HOUR), 'BOOKED'),

('u-tutor-18','avail-18-1',DATE_ADD(NOW(),INTERVAL 2 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 2 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-18','avail-18-2',DATE_ADD(NOW(),INTERVAL 4 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 4 DAY),INTERVAL 1 HOUR), 'BOOKED'),

('u-tutor-19','avail-19-1',DATE_ADD(NOW(),INTERVAL 3 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 3 DAY),INTERVAL 1 HOUR), 'OPEN'),
('u-tutor-19','avail-19-2',DATE_ADD(NOW(),INTERVAL 6 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 6 DAY),INTERVAL 1 HOUR), 'OPEN'),

('u-tutor-20','avail-20-1',DATE_ADD(NOW(),INTERVAL 1 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 1 DAY),INTERVAL 1 HOUR), 'BOOKED'),
('u-tutor-20','avail-20-2',DATE_ADD(NOW(),INTERVAL 4 DAY),  DATE_ADD(DATE_ADD(NOW(),INTERVAL 4 DAY),INTERVAL 1 HOUR), 'OPEN');

-- Expansion seed: students 20, tutors 50 (keep existing tone)
DROP TEMPORARY TABLE IF EXISTS tmp_seed_tutor_nums;
CREATE TEMPORARY TABLE tmp_seed_tutor_nums (
    n INT PRIMARY KEY
);

INSERT INTO tmp_seed_tutor_nums (n)
VALUES
(21),(22),(23),(24),(25),(26),(27),(28),(29),(30),
(31),(32),(33),(34),(35),(36),(37),(38),(39),(40),
(41),(42),(43),(44),(45),(46),(47),(48),(49),(50),
(51),(52),(53),(54),(55),(56),(57),(58),(59),(60),
(61),(62),(63),(64),(65),(66),(67),(68),(69),(70),
(71),(72),(73),(74),(75),(76),(77),(78),(79),(80);

DROP TEMPORARY TABLE IF EXISTS tmp_seed_student_nums;
CREATE TEMPORARY TABLE tmp_seed_student_nums (
    n INT PRIMARY KEY
);

INSERT INTO tmp_seed_student_nums (n)
VALUES (11),(12),(13),(14),(15),(16),(17),(18),(19),(20);

-- Clean up existing students 11-20 if they exist (to update names)
DELETE FROM users WHERE id IN (
  'u-student-11', 'u-student-12', 'u-student-13', 'u-student-14', 'u-student-15',
  'u-student-16', 'u-student-17', 'u-student-18', 'u-student-19', 'u-student-20'
);

INSERT INTO users (id, username, password, name, nickname, status)
VALUES
('u-student-11', 'student11@test.com', @pw, '강민지', '열공하는민지', 'ACTIVE'),
('u-student-12', 'student12@test.com', @pw, '조현우', '독서왕현우', 'ACTIVE'),
('u-student-13', 'student13@test.com', @pw, '윤지아', '꿈꾸는지아', 'ACTIVE'),
('u-student-14', 'student14@test.com', @pw, '장서윤', '질문왕서윤', 'ACTIVE'),
('u-student-15', 'student15@test.com', @pw, '임주원', '성실한주원', 'ACTIVE'),
('u-student-16', 'student16@test.com', @pw, '한도현', '도전하는도현', 'ACTIVE'),
('u-student-17', 'student17@test.com', @pw, '오지우', '필기왕지우', 'ACTIVE'),
('u-student-18', 'student18@test.com', @pw, '서예준', '복습철저예준', 'ACTIVE'),
('u-student-19', 'student19@test.com', @pw, '권하은', '지각없는하은', 'ACTIVE'),
('u-student-20', 'student20@test.com', @pw, '송민재', '만점목표민재', 'ACTIVE');

-- Clean up existing tutors 21-80 if they exist
DELETE FROM users WHERE id LIKE 'u-tutor-%' AND CAST(SUBSTRING_INDEX(id, '-', -1) AS UNSIGNED) BETWEEN 21 AND 80;

INSERT INTO users (id, username, password, name, nickname, status)
VALUES
('u-tutor-21', 'tutor21@test.com', @pw, '김민준', '친절한민준쌤', 'ACTIVE'),
('u-tutor-22', 'tutor22@test.com', @pw, '이서준', '이해쏙쏙서준', 'ACTIVE'),
('u-tutor-23', 'tutor23@test.com', @pw, '박도현', '문법마스터도현', 'ACTIVE'),
('u-tutor-24', 'tutor24@test.com', @pw, '최예준', '발음교정예준', 'ACTIVE'),
('u-tutor-25', 'tutor25@test.com', @pw, '정지호', '회화전문지호', 'ACTIVE'),
('u-tutor-26', 'tutor26@test.com', @pw, '강하준', '토익만점하준', 'ACTIVE'),
('u-tutor-27', 'tutor27@test.com', @pw, '조주원', '스피킹강자주원', 'ACTIVE'),
('u-tutor-28', 'tutor28@test.com', @pw, '윤지후', '기초탈출지후', 'ACTIVE'),
('u-tutor-29', 'tutor29@test.com', @pw, '장준우', '비즈니스준우', 'ACTIVE'),
('u-tutor-30', 'tutor30@test.com', @pw, '임유준', '여행영어유준', 'ACTIVE'),
('u-tutor-31', 'tutor31@test.com', @pw, '한시우', '중국어통시우', 'ACTIVE'),
('u-tutor-32', 'tutor32@test.com', @pw, '오진우', '일본어고수진우', 'ACTIVE'),
('u-tutor-33', 'tutor33@test.com', @pw, '서건우', '스페인어건우', 'ACTIVE'),
('u-tutor-34', 'tutor34@test.com', @pw, '권선우', '프랑스어선우', 'ACTIVE'),
('u-tutor-35', 'tutor35@test.com', @pw, '송우진', '독일어우진', 'ACTIVE'),
('u-tutor-36', 'tutor36@test.com', @pw, '황연우', '러시아어연우', 'ACTIVE'),
('u-tutor-37', 'tutor37@test.com', @pw, '안민재', '꼼꼼한민재쌤', 'ACTIVE'),
('u-tutor-38', 'tutor38@test.com', @pw, '김현준', '열정가득현준', 'ACTIVE'),
('u-tutor-39', 'tutor39@test.com', @pw, '이도윤', '성적상승도윤', 'ACTIVE'),
('u-tutor-40', 'tutor40@test.com', @pw, '박은우', '핵심콕콕은우', 'ACTIVE'),
('u-tutor-41', 'tutor41@test.com', @pw, '최우빈', '속성마스터우빈', 'ACTIVE'),
('u-tutor-42', 'tutor42@test.com', @pw, '정하진', '재밋는수업하진', 'ACTIVE'),
('u-tutor-43', 'tutor43@test.com', @pw, '조재윤', '소통하는재윤', 'ACTIVE'),
('u-tutor-44', 'tutor44@test.com', @pw, '윤서진', '실력파서진', 'ACTIVE'),
('u-tutor-45', 'tutor45@test.com', @pw, '장수호', '든든한수호쌤', 'ACTIVE'),
('u-tutor-46', 'tutor46@test.com', @pw, '임이준', '친근한이준', 'ACTIVE'),
('u-tutor-47', 'tutor47@test.com', @pw, '한시현', '명쾌한시현', 'ACTIVE'),
('u-tutor-48', 'tutor48@test.com', @pw, '오동현', '체계적인동현', 'ACTIVE'),
('u-tutor-49', 'tutor49@test.com', @pw, '서지한', '집중케어지한', 'ACTIVE'),
('u-tutor-50', 'tutor50@test.com', @pw, '권태현', '동기부여태현', 'ACTIVE'),
('u-tutor-51', 'tutor51@test.com', @pw, '송민규', '원어민감각민규', 'ACTIVE'),
('u-tutor-52', 'tutor52@test.com', @pw, '황준서', '실전회화준서', 'ACTIVE'),
('u-tutor-53', 'tutor53@test.com', @pw, '안시율', '감성티칭시율', 'ACTIVE'),
('u-tutor-54', 'tutor54@test.com', @pw, '김승우', '논리적인승우', 'ACTIVE'),
('u-tutor-55', 'tutor55@test.com', @pw, '이지훈', '다정하지훈쌤', 'ACTIVE'),
('u-tutor-56', 'tutor56@test.com', @pw, '박성현', '카리스마성현', 'ACTIVE'),
('u-tutor-57', 'tutor57@test.com', @pw, '최지성', '스마트지성', 'ACTIVE'),
('u-tutor-58', 'tutor58@test.com', @pw, '정현우', '믿고듣는현우', 'ACTIVE'),
('u-tutor-59', 'tutor59@test.com', @pw, '조민수', '꼼꼼티칭민수', 'ACTIVE'),
('u-tutor-60', 'tutor60@test.com', @pw, '윤정우', '핵심요약정우', 'ACTIVE'),
('u-tutor-61', 'tutor61@test.com', @pw, '장우진', '합격보장우진', 'ACTIVE'),
('u-tutor-62', 'tutor62@test.com', @pw, '임상우', '실력향상상우', 'ACTIVE'),
('u-tutor-63', 'tutor63@test.com', @pw, '한도윤', '멘토링도윤', 'ACTIVE'),
('u-tutor-64', 'tutor64@test.com', @pw, '오건호', '친구같은건호', 'ACTIVE'),
('u-tutor-65', 'tutor65@test.com', @pw, '서지민', '섬세한지민', 'ACTIVE'),
('u-tutor-66', 'tutor66@test.com', @pw, '권현수', '빠른피드백현수', 'ACTIVE'),
('u-tutor-67', 'tutor67@test.com', @pw, '송다윗', '글로벌다윗', 'ACTIVE'),
('u-tutor-68', 'tutor68@test.com', @pw, '황요한', '열린마음요한', 'ACTIVE'),
('u-tutor-69', 'tutor69@test.com', @pw, '안다니엘','유쾌한다니엘', 'ACTIVE'),
('u-tutor-70', 'tutor70@test.com', @pw, '김지아', '상냥한지아쌤', 'ACTIVE'),
('u-tutor-71', 'tutor71@test.com', @pw, '이서아', '꼼꼼한서아', 'ACTIVE'),
('u-tutor-72', 'tutor72@test.com', @pw, '박나은', '밝은에너지나은', 'ACTIVE'),
('u-tutor-73', 'tutor73@test.com', @pw, '최유진', '차분한유진', 'ACTIVE'),
('u-tutor-74', 'tutor74@test.com', @pw, '정민서', '똑부러진민서', 'ACTIVE'),
('u-tutor-75', 'tutor75@test.com', @pw, '조수아', '친절한수아', 'ACTIVE'),
('u-tutor-76', 'tutor76@test.com', @pw, '윤하은', '미소천사하은', 'ACTIVE'),
('u-tutor-77', 'tutor77@test.com', @pw, '장지유', '센스쟁이지유', 'ACTIVE'),
('u-tutor-78', 'tutor78@test.com', @pw, '임윤아', '감각적인윤아', 'ACTIVE'),
('u-tutor-79', 'tutor79@test.com', @pw, '한채원', '따뜻한채원', 'ACTIVE'),
('u-tutor-80', 'tutor80@test.com', @pw, '오지안', '성실한지안', 'ACTIVE');

UPDATE users
SET profile_img = '/img/tutors/default.png'
WHERE id LIKE 'u-tutor-%';

INSERT INTO user_auth (user_id, id, auth)
SELECT
    CONCAT('u-student-', s.n),
    CONCAT('ua-s', s.n),
    'ROLE_USER'
FROM tmp_seed_student_nums s;

INSERT INTO user_auth (user_id, id, auth)
SELECT
    CONCAT('u-tutor-', t.n),
    CONCAT('ua-t', t.n),
    'ROLE_TUTOR'
FROM tmp_seed_tutor_nums t;

INSERT INTO tutor_profile (
    user_id, id, phone, headline, bio, self_intro, video_url,
    default_zoom_url, bank_name, account_number, account_holder,
    is_verified, rating_avg, review_count
)
SELECT
    CONCAT('u-tutor-', t.n) AS user_id,
    CONCAT('tp-', t.n) AS id,
    CONCAT('010-', LPAD(t.n, 4, '0'), '-', LPAD(3000 + t.n, 4, '0')) AS phone,
    CASE MOD(t.n, 6)
        WHEN 0 THEN '회화 중심 튜터'
        WHEN 1 THEN '문법 집중 튜터'
        WHEN 2 THEN '시험 대비 튜터'
        WHEN 3 THEN '비즈니스 영어 튜터'
        WHEN 4 THEN '여행 회화 튜터'
        ELSE '발음 교정 튜터'
    END AS headline,
    CASE MOD(t.n, 4)
        WHEN 0 THEN '학생 수준에 맞춘 단계형 수업을 제공합니다.'
        WHEN 1 THEN '목표 점수와 실전 적용을 함께 잡는 수업입니다.'
        WHEN 2 THEN '짧은 진단 후 맞춤 커리큘럼으로 진행합니다.'
        ELSE '회화와 피드백 반복으로 실력을 끌어올립니다.'
    END AS bio,
    CONCAT('신규 등록 튜터 ', t.n, '번입니다. 학습 목표와 일정에 맞춘 맞춤형 수업을 진행합니다.') AS self_intro,
    NULL AS video_url,
    CONCAT('https://zoom.us/j/', LPAD(t.n, 10, '0')) AS default_zoom_url,
    CASE MOD(t.n, 4)
        WHEN 0 THEN 'KB'
        WHEN 1 THEN 'Shinhan'
        WHEN 2 THEN 'Woori'
        ELSE 'Hana'
    END AS bank_name,
    CONCAT(LPAD(t.n, 3, '0'), '-', LPAD(100 + t.n, 3, '0'), '-', LPAD(100000 + (t.n * 37), 6, '0')) AS account_number,
    CONCAT('신규튜터', t.n) AS account_holder,
    TRUE AS is_verified,
    ROUND(4.20 + (MOD(t.n, 7) * 0.10), 2) AS rating_avg,
    3 + MOD(t.n, 15) AS review_count
FROM tmp_seed_tutor_nums t;

INSERT INTO tutor_field (user_id, field_id, id, seq)
SELECT
    CONCAT('u-tutor-', t.n),
    CASE MOD(t.n, 8)
        WHEN 0 THEN 'lf-general-conversation'
        WHEN 1 THEN 'lf-general-grammar'
        WHEN 2 THEN 'lf-general-reading'
        WHEN 3 THEN 'lf-general-pronunciation'
        WHEN 4 THEN 'lf-domain-business'
        WHEN 5 THEN 'lf-domain-travel'
        WHEN 6 THEN 'lf-domain-culture'
        ELSE 'lf-general-writing'
    END AS field_id,
    CONCAT('tf-', t.n, '-1') AS id,
    1 AS seq
FROM tmp_seed_tutor_nums t;

INSERT INTO lesson (user_id, subject_id, field_id, id, title, description, status, price)
SELECT
    CONCAT('u-tutor-', t.n) AS user_id,
    CASE MOD(t.n, 8)
        WHEN 0 THEN 'sub-eng-mid'
        WHEN 1 THEN 'sub-eng-high'
        WHEN 2 THEN 'sub-jpn-basic'
        WHEN 3 THEN 'sub-chn-basic'
        WHEN 4 THEN 'sub-spa-basic'
        WHEN 5 THEN 'sub-kor-mid'
        WHEN 6 THEN 'sub-fra-basic'
        ELSE 'sub-ger-basic'
    END AS subject_id,
    CASE MOD(t.n, 8)
        WHEN 0 THEN 'lf-general-conversation'
        WHEN 1 THEN 'lf-general-grammar'
        WHEN 2 THEN 'lf-general-reading'
        WHEN 3 THEN 'lf-general-pronunciation'
        WHEN 4 THEN 'lf-domain-business'
        WHEN 5 THEN 'lf-domain-travel'
        WHEN 6 THEN 'lf-domain-culture'
        ELSE 'lf-general-writing'
    END AS field_id,
    CONCAT('lesson-', t.n + 1) AS id,
    CONCAT('맞춤 수업 ', t.n) AS title,
    CONCAT('레벨 진단 후 핵심 약점을 보완하는 ', t.n, '번 튜터의 맞춤 수업입니다.') AS description,
    'OPEN' AS status,
    (28000 + (MOD(t.n, 8) * 3000)) AS price
FROM tmp_seed_tutor_nums t;

INSERT INTO tutor_subject (user_id, subject_id, id, seq)
SELECT
    CONCAT('u-tutor-', t.n) AS user_id,
    CASE MOD(t.n, 8)
        WHEN 0 THEN 'sub-eng-mid'
        WHEN 1 THEN 'sub-eng-high'
        WHEN 2 THEN 'sub-jpn-basic'
        WHEN 3 THEN 'sub-chn-basic'
        WHEN 4 THEN 'sub-spa-basic'
        WHEN 5 THEN 'sub-kor-mid'
        WHEN 6 THEN 'sub-fra-basic'
        ELSE 'sub-ger-basic'
    END AS subject_id,
    CONCAT('ts-', t.n, '-1') AS id,
    1 AS seq
FROM tmp_seed_tutor_nums t;

-- Normalize subjects: ensure exactly 10 tutors per subject_group (80 tutors total)
DELETE FROM tutor_subject WHERE user_id LIKE 'u-tutor-%';
DELETE FROM lesson WHERE user_id LIKE 'u-tutor-%';

INSERT INTO lesson (user_id, subject_id, field_id, id, title, description, status, price)
SELECT
    CONCAT('u-tutor-', nums.n) AS user_id,
    CASE FLOOR((nums.n - 1) / 10)
        WHEN 0 THEN 'sub-kor-basic'
        WHEN 1 THEN 'sub-eng-basic'
        WHEN 2 THEN 'sub-jpn-basic'
        WHEN 3 THEN 'sub-chn-basic'
        WHEN 4 THEN 'sub-fra-basic'
        WHEN 5 THEN 'sub-spa-basic'
        WHEN 6 THEN 'sub-ger-basic'
        ELSE 'sub-rus-basic'
    END AS subject_id,
    CASE FLOOR((nums.n - 1) / 10)
        WHEN 0 THEN 'lf-domain-school' ELSE 'lf-general-conversation' END AS field_id,
    CONCAT('lesson-', nums.n) AS id,
    CONCAT('맞춤 수업 ', nums.n) AS title,
    CONCAT('레벨 진단 후 핵심 약점을 보완하는 ', nums.n, '번 튜터의 맞춤 수업입니다.') AS description,
    'OPEN' AS status,
    (28000 + (MOD(nums.n, 8) * 3000)) AS price
FROM (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
    SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
    SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL
    SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL
    SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL
    SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL
    SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL
    SELECT 29 UNION ALL SELECT 30 UNION ALL SELECT 31 UNION ALL SELECT 32 UNION ALL
    SELECT 33 UNION ALL SELECT 34 UNION ALL SELECT 35 UNION ALL SELECT 36 UNION ALL
    SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39 UNION ALL SELECT 40 UNION ALL
    SELECT 41 UNION ALL SELECT 42 UNION ALL SELECT 43 UNION ALL SELECT 44 UNION ALL
    SELECT 45 UNION ALL SELECT 46 UNION ALL SELECT 47 UNION ALL SELECT 48 UNION ALL
    SELECT 49 UNION ALL SELECT 50 UNION ALL SELECT 51 UNION ALL SELECT 52 UNION ALL
    SELECT 53 UNION ALL SELECT 54 UNION ALL SELECT 55 UNION ALL SELECT 56 UNION ALL
    SELECT 57 UNION ALL SELECT 58 UNION ALL SELECT 59 UNION ALL SELECT 60 UNION ALL
    SELECT 61 UNION ALL SELECT 62 UNION ALL SELECT 63 UNION ALL SELECT 64 UNION ALL
    SELECT 65 UNION ALL SELECT 66 UNION ALL SELECT 67 UNION ALL SELECT 68 UNION ALL
    SELECT 69 UNION ALL SELECT 70 UNION ALL SELECT 71 UNION ALL SELECT 72 UNION ALL
    SELECT 73 UNION ALL SELECT 74 UNION ALL SELECT 75 UNION ALL SELECT 76 UNION ALL
    SELECT 77 UNION ALL SELECT 78 UNION ALL SELECT 79 UNION ALL SELECT 80
) nums;

INSERT INTO tutor_subject (user_id, subject_id, id, seq)
SELECT
    CONCAT('u-tutor-', nums.n) AS user_id,
    CASE FLOOR((nums.n - 1) / 10)
        WHEN 0 THEN 'sub-kor-basic'
        WHEN 1 THEN 'sub-eng-basic'
        WHEN 2 THEN 'sub-jpn-basic'
        WHEN 3 THEN 'sub-chn-basic'
        WHEN 4 THEN 'sub-fra-basic'
        WHEN 5 THEN 'sub-spa-basic'
        WHEN 6 THEN 'sub-ger-basic'
        ELSE 'sub-rus-basic'
    END AS subject_id,
    CONCAT('ts-', nums.n, '-1') AS id,
    1 AS seq
FROM (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
    SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
    SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL
    SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL
    SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL
    SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL
    SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL
    SELECT 29 UNION ALL SELECT 30 UNION ALL SELECT 31 UNION ALL SELECT 32 UNION ALL
    SELECT 33 UNION ALL SELECT 34 UNION ALL SELECT 35 UNION ALL SELECT 36 UNION ALL
    SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39 UNION ALL SELECT 40 UNION ALL
    SELECT 41 UNION ALL SELECT 42 UNION ALL SELECT 43 UNION ALL SELECT 44 UNION ALL
    SELECT 45 UNION ALL SELECT 46 UNION ALL SELECT 47 UNION ALL SELECT 48 UNION ALL
    SELECT 49 UNION ALL SELECT 50 UNION ALL SELECT 51 UNION ALL SELECT 52 UNION ALL
    SELECT 53 UNION ALL SELECT 54 UNION ALL SELECT 55 UNION ALL SELECT 56 UNION ALL
    SELECT 57 UNION ALL SELECT 58 UNION ALL SELECT 59 UNION ALL SELECT 60 UNION ALL
    SELECT 61 UNION ALL SELECT 62 UNION ALL SELECT 63 UNION ALL SELECT 64 UNION ALL
    SELECT 65 UNION ALL SELECT 66 UNION ALL SELECT 67 UNION ALL SELECT 68 UNION ALL
    SELECT 69 UNION ALL SELECT 70 UNION ALL SELECT 71 UNION ALL SELECT 72 UNION ALL
    SELECT 73 UNION ALL SELECT 74 UNION ALL SELECT 75 UNION ALL SELECT 76 UNION ALL
    SELECT 77 UNION ALL SELECT 78 UNION ALL SELECT 79 UNION ALL SELECT 80
) nums;

INSERT INTO tutor_career (user_id, id, company_name, job_category, job_role, start_year, end_year)
SELECT
    CONCAT('u-tutor-', t.n) AS user_id,
    CONCAT('tc-', t.n, '-1') AS id,
    CONCAT('확장 튜터 센터 ', t.n) AS company_name,
    '교육' AS job_category,
    '전임 튜터' AS job_role,
    2018 + MOD(t.n, 4) AS start_year,
    NULL AS end_year
FROM tmp_seed_tutor_nums t;

INSERT INTO tutor_education (user_id, id, school_name, degree, start_year, graduated_year)
SELECT
    CONCAT('u-tutor-', t.n) AS user_id,
    CONCAT('te-', t.n) AS id,
    CASE MOD(t.n, 5)
        WHEN 0 THEN '서울대학교'
        WHEN 1 THEN '연세대학교'
        WHEN 2 THEN '고려대학교'
        WHEN 3 THEN '한국외국어대학교'
        ELSE '성균관대학교'
    END AS school_name,
    CASE MOD(t.n, 4)
        WHEN 0 THEN '영어영문학 학사'
        WHEN 1 THEN '교육학 학사'
        WHEN 2 THEN '언어학 학사'
        ELSE '통번역학 학사'
    END AS degree,
    2011 + MOD(t.n, 5) AS start_year,
    2015 + MOD(t.n, 5) AS graduated_year
FROM tmp_seed_tutor_nums t;

INSERT INTO tutor_document (user_id, id, doc_type, file_size, reviewed_by, reviewed_at, reject_reason, original_name, store_name, file_path, content_type)
SELECT
    CONCAT('u-tutor-', t.n) AS user_id,
    CONCAT('td-', t.n, '-1') AS id,
    'EDUCATION' AS doc_type,
    100000 + (t.n * 10) AS file_size,
    'admin' AS reviewed_by,
    DATE_SUB(NOW(), INTERVAL (MOD(t.n, 7) + 2) DAY) AS reviewed_at,
    NULL AS reject_reason,
    '학력 증빙서류.pdf' AS original_name,
    CONCAT('td-', t.n, '-1.pdf') AS store_name,
    CONCAT('/uploads/tutors/documents/td-', t.n, '-1.pdf') AS file_path,
    'application/pdf' AS content_type
FROM tmp_seed_tutor_nums t;

INSERT INTO tutor_document (user_id, id, doc_type, file_size, reviewed_by, reviewed_at, reject_reason, original_name, store_name, file_path, content_type)
SELECT
    CONCAT('u-tutor-', t.n) AS user_id,
    CONCAT('td-', t.n, '-2') AS id,
    'CERTIFICATE_TEXT' AS doc_type,
    0 AS file_size,
    NULL AS reviewed_by,
    NULL AS reviewed_at,
    NULL AS reject_reason,
    '수업 커리큘럼 보유' AS original_name,
    CONCAT('td-', t.n, '-2.txt') AS store_name,
    CONCAT('/uploads/tutors/documents/td-', t.n, '-2.txt') AS file_path,
    'text/plain' AS content_type
FROM tmp_seed_tutor_nums t;

INSERT INTO tutor_time_range (user_id, id, start_at, end_at, day_of_week)
SELECT
    CONCAT('u-tutor-', t.n) AS user_id,
    CONCAT('tr-', t.n, '-', r.seq) AS id,
    CASE r.seq
        WHEN 1 THEN CASE MOD(t.n, 7)
                        WHEN 0 THEN '17:00:00' WHEN 1 THEN '18:00:00' WHEN 2 THEN '19:00:00'
                        WHEN 3 THEN '20:00:00' WHEN 4 THEN '16:00:00' WHEN 5 THEN '15:00:00' ELSE '21:00:00' END
        WHEN 2 THEN CASE MOD(t.n, 7)
                        WHEN 0 THEN '19:00:00' WHEN 1 THEN '20:00:00' WHEN 2 THEN '21:00:00'
                        WHEN 3 THEN '18:00:00' WHEN 4 THEN '17:00:00' WHEN 5 THEN '16:00:00' ELSE '22:00:00' END
        ELSE CASE MOD(t.n, 7)
                        WHEN 0 THEN '09:00:00' WHEN 1 THEN '10:00:00' WHEN 2 THEN '11:00:00'
                        WHEN 3 THEN '12:00:00' WHEN 4 THEN '13:00:00' WHEN 5 THEN '14:00:00' ELSE '15:00:00' END
    END AS start_at,
    CASE r.seq
        WHEN 1 THEN CASE MOD(t.n, 7)
                        WHEN 0 THEN '20:30:00' WHEN 1 THEN '21:30:00' WHEN 2 THEN '22:30:00'
                        WHEN 3 THEN '23:00:00' WHEN 4 THEN '19:30:00' WHEN 5 THEN '18:30:00' ELSE '23:30:00' END
        WHEN 2 THEN CASE MOD(t.n, 7)
                        WHEN 0 THEN '22:00:00' WHEN 1 THEN '23:00:00' WHEN 2 THEN '23:30:00'
                        WHEN 3 THEN '21:30:00' WHEN 4 THEN '20:30:00' WHEN 5 THEN '19:30:00' ELSE '23:59:00' END
        ELSE CASE MOD(t.n, 7)
                        WHEN 0 THEN '12:30:00' WHEN 1 THEN '13:30:00' WHEN 2 THEN '14:30:00'
                        WHEN 3 THEN '15:30:00' WHEN 4 THEN '16:30:00' WHEN 5 THEN '17:30:00' ELSE '18:30:00' END
    END AS end_at,
    CASE r.seq
        WHEN 1 THEN CASE MOD(t.n, 7)
                        WHEN 0 THEN '월' WHEN 1 THEN '화' WHEN 2 THEN '수' WHEN 3 THEN '목' WHEN 4 THEN '금' WHEN 5 THEN '토' ELSE '일' END
        WHEN 2 THEN CASE MOD(t.n, 7)
                        WHEN 0 THEN '화' WHEN 1 THEN '수' WHEN 2 THEN '목' WHEN 3 THEN '금' WHEN 4 THEN '토' WHEN 5 THEN '일' ELSE '월' END
        ELSE CASE MOD(t.n, 7)
                        WHEN 0 THEN '토' WHEN 1 THEN '일' WHEN 2 THEN '월' WHEN 3 THEN '화' WHEN 4 THEN '수' WHEN 5 THEN '목' ELSE '금' END
    END AS day_of_week
FROM tmp_seed_tutor_nums t
JOIN (
    SELECT 1 AS seq
    UNION ALL
    SELECT 2
    UNION ALL
    SELECT 3
) r;

DROP TEMPORARY TABLE IF EXISTS tmp_seed_tutor_nums;
DROP TEMPORARY TABLE IF EXISTS tmp_seed_student_nums;

-- Additional availability slots (richer seed)
-- Keep existing fixed IDs used by booking rows, and append deterministic extra OPEN slots.
INSERT INTO tutor_availability (user_id, id, start_at, end_at, status)
SELECT
    tr.user_id,
    CONCAT(
        'availx-',
        REPLACE(tr.user_id, 'u-tutor-', ''),
        '-',
        DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY), '%m%d'),
        '-',
        DATE_FORMAT(ADDTIME(tr.start_at, SEC_TO_TIME(s.minute_offset * 60)), '%H%i'),
        '-',
        SUBSTRING_INDEX(tr.id, '-', -1)
    ) AS id,
    TIMESTAMP(
        DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY),
        ADDTIME(tr.start_at, SEC_TO_TIME(s.minute_offset * 60))
    ) AS start_at,
    TIMESTAMP(
        DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY),
        ADDTIME(ADDTIME(tr.start_at, SEC_TO_TIME(s.minute_offset * 60)), '01:00:00')
    ) AS end_at,
    'OPEN' AS status
FROM tutor_time_range tr
JOIN (
    SELECT 1 AS day_offset UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
    SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL
    SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL
    SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL
    SELECT 20 UNION ALL SELECT 21
) d
JOIN (
    SELECT 0 AS minute_offset
    UNION ALL
    SELECT 60
) s
WHERE CASE DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL d.day_offset DAY))
        WHEN 1 THEN '일'
        WHEN 2 THEN '월'
        WHEN 3 THEN '화'
        WHEN 4 THEN '수'
        WHEN 5 THEN '목'
        WHEN 6 THEN '금'
        WHEN 7 THEN '토'
      END = tr.day_of_week
  AND ADDTIME(ADDTIME(tr.start_at, SEC_TO_TIME(s.minute_offset * 60)), '01:00:00') <= tr.end_at;

-- Additional booked slots (30-min aligned, one slot per tutor) for mypage visibility
INSERT INTO tutor_availability (user_id, id, start_at, end_at, status)
SELECT
    tr.user_id,
    CONCAT(
        'availb-',
        REPLACE(tr.user_id, 'u-tutor-', ''),
        '-',
        r.seq,
        '-',
        DATE_FORMAT(
            DATE_ADD(
                DATE_SUB(CURDATE(), INTERVAL (DAYOFWEEK(CURDATE()) - 1) DAY),
                INTERVAL CASE tr.day_of_week
                    WHEN '일' THEN 0
                    WHEN '월' THEN 1
                    WHEN '화' THEN 2
                    WHEN '수' THEN 3
                    WHEN '목' THEN 4
                    WHEN '금' THEN 5
                    ELSE 6
                END DAY
            ),
            '%m%d'
        )
    ) AS id,
    TIMESTAMP(
        DATE_ADD(
            DATE_SUB(CURDATE(), INTERVAL (DAYOFWEEK(CURDATE()) - 1) DAY),
            INTERVAL CASE tr.day_of_week
                WHEN '일' THEN 0
                WHEN '월' THEN 1
                WHEN '화' THEN 2
                WHEN '수' THEN 3
                WHEN '목' THEN 4
                WHEN '금' THEN 5
                ELSE 6
            END DAY
        ),
        ADDTIME(tr.start_at, SEC_TO_TIME((r.seq - 1) * 1800))
    ) AS start_at,
    TIMESTAMP(
        DATE_ADD(
            DATE_SUB(CURDATE(), INTERVAL (DAYOFWEEK(CURDATE()) - 1) DAY),
            INTERVAL CASE tr.day_of_week
                WHEN '일' THEN 0
                WHEN '월' THEN 1
                WHEN '화' THEN 2
                WHEN '수' THEN 3
                WHEN '목' THEN 4
                WHEN '금' THEN 5
                ELSE 6
            END DAY
        ),
        ADDTIME(ADDTIME(tr.start_at, SEC_TO_TIME((r.seq - 1) * 1800)), '00:30:00')
    ) AS end_at,
    'BOOKED' AS status
FROM tutor_time_range tr
JOIN (
    SELECT 1 AS seq UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
) r
ON 1=1
WHERE tr.id LIKE '%-1'
  AND ADDTIME(ADDTIME(tr.start_at, SEC_TO_TIME((r.seq - 1) * 1800)), '00:30:00') <= tr.end_at;

-- Bookings
INSERT INTO booking (
  user_id, tutor_id, lesson_id, availability_id, id, title,
  requested_at, confirmed_at, canceled_at, done_at, paid_at,
  memo, zoom_join_url
)
VALUES
('u-student-1','u-tutor-1','lesson-1','avail-1-1','book-1','국어 수업 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 1 HOUR), NULL, NULL, DATE_SUB(NOW(),INTERVAL 30 MINUTE),
 '첫 수업이라 현재 수준 진단도 부탁드려요.','https://zoom.us/j/1111111111'),

('u-student-2','u-tutor-1','lesson-2','avail-1-3','book-2','영어 회화 수업 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 20 MINUTE), NULL, NULL, NULL,
 '말하기가 약해서 회화 위주로 연습하고 싶어요.','https://zoom.us/j/1111111111'),

('u-student-3','u-tutor-2','lesson-3','avail-2-2','book-3','토익/실무 영어 상담 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 10 MINUTE), NULL, NULL, DATE_SUB(NOW(),INTERVAL 5 MINUTE),
 '목표 점수와 일정에 맞춰 플랜을 받고 싶습니다.','https://zoom.us/j/2222222222'),

('u-student-4','u-tutor-3','lesson-4','avail-3-1','book-4','일본어 기초 회화 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 40 MINUTE), NULL, NULL, NULL,
 '히라가나부터 다시 차근차근 배우고 싶어요.','https://zoom.us/j/3333333333'),

('u-student-5','u-tutor-4','lesson-5','avail-4-1','book-5','영어 발음 교정 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 15 MINUTE), NULL, NULL, NULL,
 '발음이 특히 약해서 녹음 피드백도 받고 싶어요.','https://zoom.us/j/4444444444'),

('u-student-6','u-tutor-5','lesson-6','avail-5-2','book-6','영어 문법 정리 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 25 MINUTE), NULL, NULL, DATE_SUB(NOW(),INTERVAL 10 MINUTE),
 '시제/가정법이 헷갈려요.','https://zoom.us/j/5555555555'),

('u-student-7','u-tutor-6','lesson-7','avail-6-2','book-7','토익 독해 전략 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 35 MINUTE), NULL, NULL, NULL,
 '파트7 시간이 부족합니다.','https://zoom.us/j/6666666666'),

('u-student-8','u-tutor-7','lesson-8','avail-7-1','book-8','중국어 기초 회화 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 50 MINUTE), NULL, NULL, DATE_SUB(NOW(),INTERVAL 45 MINUTE),
 '성조가 너무 어려워요.','https://zoom.us/j/7777777777'),

('u-student-9','u-tutor-8','lesson-9','avail-8-2','book-9','JLPT 문법 집중 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 30 MINUTE), NULL, NULL, NULL,
 'N2 준비 중인데 문법이 약합니다.','https://zoom.us/j/8888888888'),

('u-student-10','u-tutor-9','lesson-10','avail-9-2','book-10','스페인어 여행 회화 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 20 MINUTE), NULL, NULL, NULL,
 '여행 가기 전에 필수 표현만 빠르게 익히고 싶어요.','https://zoom.us/j/9999999999'),

('u-student-1','u-tutor-10','lesson-11','avail-10-1','book-11','비즈니스 영어 실전 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 15 MINUTE), NULL, NULL, DATE_SUB(NOW(),INTERVAL 5 MINUTE),
 '회의에서 말이 잘 안 나와요.','https://zoom.us/j/1010101010'),

('u-student-2','u-tutor-11','lesson-12','avail-11-2','book-12','드라마 영어 쉐도잉 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 15 MINUTE), NULL, NULL, NULL,
 '재밌게 배우고 싶어요.','https://zoom.us/j/1112111211'),

('u-student-3','u-tutor-12','lesson-13','avail-12-1','book-13','노래로 배우는 영어 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 10 MINUTE), NULL, NULL, NULL,
 '리스닝과 발음을 같이 잡고 싶어요.','https://zoom.us/j/1212121212'),

('u-student-4','u-tutor-13','lesson-14','avail-13-2','book-14','영어 문화 이해 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 12 MINUTE), NULL, NULL, NULL,
 '표현의 뉘앙스를 이해하고 싶습니다.','https://zoom.us/j/1313131313'),

('u-student-5','u-tutor-14','lesson-15','avail-14-2','book-15','여행 영어 생존 회화 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 8 MINUTE), NULL, NULL, DATE_SUB(NOW(),INTERVAL 2 MINUTE),
 '공항/호텔 상황이 가장 걱정돼요.','https://zoom.us/j/1414141414'),

('u-student-6','u-tutor-16','lesson-17','avail-16-1','book-16','고등 영어 독해 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 7 MINUTE), NULL, NULL, NULL,
 '지문 구조를 잡는 방법이 궁금합니다.','https://zoom.us/j/1616161616'),

('u-student-7','u-tutor-17','lesson-18','avail-17-2','book-17','중등 영어 문법 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 20 MINUTE), NULL, NULL, NULL,
 '기초부터 다시 정리하고 싶어요.','https://zoom.us/j/1717171717'),

('u-student-8','u-tutor-18','lesson-19','avail-18-2','book-18','영어 회화 루틴 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 11 MINUTE), NULL, NULL, NULL,
 '말하기 루틴을 만들고 싶어요.','https://zoom.us/j/1818181818'),

('u-student-9','u-tutor-20','lesson-21','avail-20-1','book-19','스페인어 기초 회화 예약',
 NOW(), DATE_SUB(NOW(),INTERVAL 13 MINUTE), NULL, NULL, NULL,
 '기초 회화를 빠르게 시작하고 싶어요.','https://zoom.us/j/2020202020');

-- Additional bookings connected to generated BOOKED availability
INSERT INTO booking (
  user_id, tutor_id, lesson_id, availability_id, id, title,
  requested_at, confirmed_at, canceled_at, done_at, paid_at,
  memo, zoom_join_url
)
SELECT
  CONCAT('u-student-', ((CAST(SUBSTRING_INDEX(ta.user_id, '-', -1) AS UNSIGNED) - 1) % 20) + 1) AS user_id,
  ta.user_id AS tutor_id,
  ls.id AS lesson_id,
  ta.id AS availability_id,
  CONCAT('bookx-', REPLACE(ta.user_id, 'u-tutor-', ''), '-', DATE_FORMAT(ta.start_at, '%m%d%H%i')) AS id,
  CONCAT('정규 수업 예약 ', REPLACE(ta.user_id, 'u-tutor-', '')) AS title,
  DATE_SUB(ta.start_at, INTERVAL 3 DAY) AS requested_at,
  DATE_SUB(ta.start_at, INTERVAL 2 DAY) AS confirmed_at,
  NULL AS canceled_at,
  NULL AS done_at,
  DATE_SUB(ta.start_at, INTERVAL 2 DAY) AS paid_at,
  '확장 시드 데이터 자동 생성 예약입니다.' AS memo,
  CONCAT('https://zoom.us/j/', LPAD(CAST(SUBSTRING_INDEX(ta.user_id, '-', -1) AS UNSIGNED), 10, '0')) AS zoom_join_url
FROM tutor_availability ta
JOIN (
  SELECT user_id, MIN(id) AS id
  FROM lesson
  GROUP BY user_id
) ls ON ls.user_id = ta.user_id
WHERE ta.id LIKE 'availb-%';


-- Payments
INSERT INTO payment (user_id, booking_id, id, amount, provider, status, paid_at)
VALUES
('u-student-1','book-1','pay-1',30000,'CARD','PAID',DATE_SUB(NOW(),INTERVAL 30 MINUTE)),
('u-student-2','book-2','pay-2',32000,'CARD','PENDING',NULL),
('u-student-3','book-3','pay-3',45000,'CARD','PAID',DATE_SUB(NOW(),INTERVAL 5 MINUTE)),
('u-student-4','book-4','pay-4',28000,'CARD','PENDING',NULL),
('u-student-5','book-5','pay-5',35000,'CARD','PENDING',NULL),
('u-student-6','book-6','pay-6',33000,'CARD','PAID',DATE_SUB(NOW(),INTERVAL 10 MINUTE)),
('u-student-7','book-7','pay-7',42000,'CARD','PENDING',NULL),
('u-student-8','book-8','pay-8',30000,'CARD','PAID',DATE_SUB(NOW(),INTERVAL 45 MINUTE)),
('u-student-9','book-9','pay-9',38000,'CARD','PENDING',NULL),
('u-student-10','book-10','pay-10',31000,'CARD','PENDING',NULL),
('u-student-1','book-11','pay-11',50000,'CARD','PAID',DATE_SUB(NOW(),INTERVAL 5 MINUTE)),
('u-student-2','book-12','pay-12',36000,'CARD','PENDING',NULL),
('u-student-3','book-13','pay-13',34000,'CARD','PENDING',NULL),
('u-student-4','book-14','pay-14',37000,'CARD','PENDING',NULL),
('u-student-5','book-15','pay-15',32000,'CARD','PAID',DATE_SUB(NOW(),INTERVAL 2 MINUTE)),
('u-student-6','book-16','pay-16',40000,'CARD','PENDING',NULL),
('u-student-7','book-17','pay-17',35000,'CARD','PENDING',NULL),
('u-student-8','book-18','pay-18',42000,'CARD','PENDING',NULL),
('u-student-9','book-19','pay-19',39000,'CARD','PENDING',NULL);

INSERT INTO payment (user_id, booking_id, id, amount, provider, status, paid_at)
SELECT
  b.user_id,
  b.id AS booking_id,
  CONCAT('payx-', SUBSTRING(b.id, 7)) AS id,
  COALESCE(l.price, 30000) AS amount,
  'CARD' AS provider,
  'PAID' AS status,
  COALESCE(b.paid_at, DATE_ADD(b.requested_at, INTERVAL 2 DAY)) AS paid_at
FROM booking b
LEFT JOIN lesson l ON l.id = b.lesson_id
WHERE b.id LIKE 'bookx-%';

-- Reviews
INSERT INTO review (booking_id, id, rating, content)
VALUES
('book-1','review-1',5,'설명이 정말 명확하고, 부족한 부분을 바로 잡아주셔서 도움이 많이 됐어요.'),
('book-3','review-3',5,'목표 점수에 맞춘 전략을 구체적으로 제시해 주셔서 좋았습니다.'),
('book-6','review-6',4,'문법 정리가 깔끔해서 이해가 빨랐습니다. 예문이 특히 좋았어요.'),
('book-8','review-8',5,'성조 교정이 도움이 됐고, 연습 방법을 알려주셔서 좋았습니다.'),
('book-11','review-11',5,'회의 상황 롤플레이가 실전 같아서 자신감이 생겼습니다.'),
('book-15','review-15',4,'여행 상황별 표현을 정리해 주셔서 바로 써먹을 것 같아요.');

INSERT INTO review (booking_id, id, rating, content)
SELECT
  b.id AS booking_id,
  CONCAT('reviewx-', SUBSTRING(b.id, 7)) AS id,
  4 + MOD(CAST(SUBSTRING_INDEX(b.tutor_id, '-', -1) AS UNSIGNED), 2) AS rating,
  '수업 구성이 탄탄하고 피드백이 구체적이어서 학습 방향을 잡는 데 도움이 되었습니다.'
FROM booking b
WHERE b.id LIKE 'bookx-%'
  AND MOD(CAST(SUBSTRING_INDEX(b.tutor_id, '-', -1) AS UNSIGNED), 3) = 0;

-- Ensure at least 10 reviews per tutor: insert 10 auto reviews referencing one generated booking per tutor
INSERT INTO review (booking_id, id, rating, content)
SELECT
    mb.bid AS booking_id,
    CONCAT('reviewx-', REPLACE(mb.tutor_id,'u-tutor-',''), '-', LPAD(r.n,2,'0')) AS id,
    3 + MOD(r.n,3) AS rating,
    CONCAT('자동 생성 리뷰 (튜터 ', REPLACE(mb.tutor_id,'u-tutor-',''), ') - No.', r.n) AS content
FROM (
    SELECT tutor_id, MIN(id) AS bid FROM booking WHERE id LIKE 'bookx-%' GROUP BY tutor_id
) mb
JOIN (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
    SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
    SELECT 9 UNION ALL SELECT 10
) r;

-- Tutor notes
INSERT INTO tutor_student_note (id, tutor_id, student_id, progress, notes)
VALUES
('tsn-1','u-tutor-1','u-student-1','문법 1단원 학습 완료','과제 제출이 꾸준하고 이해가 빠릅니다. 다음 수업 전 복습 권장.'),
('tsn-2','u-tutor-2','u-student-3','토익 목표 설정 완료','RC 파트7 시간 관리가 필요. 주 2회 모의고사 권장.'),
('tsn-3','u-tutor-7','u-student-8','성조 교정 진행 중','2성/3성 구분이 약함. 매일 10분 드릴 추천.'),
('tsn-4','u-tutor-10','u-student-1','회의 롤플레이 진행','자기소개/의견 제시 표현은 좋음. 반박 표현 보완 필요.');

-- Messages
INSERT INTO tutor_message (id, booking_id, tutor_id, student_id, sender_role, content, created_at)
VALUES
('tm-1-1','book-1','u-tutor-1','u-student-1','TUTOR','다음 수업 전까지 1단원 핵심 정리 부분을 한번 읽고 오시면 더 수월합니다.',DATE_SUB(NOW(),INTERVAL 1 DAY)),
('tm-1-2','book-1','u-tutor-1','u-student-1','STUDENT','네 알겠습니다! 오늘 안에 정리해서 준비하겠습니다.',DATE_SUB(NOW(),INTERVAL 20 HOUR)),

('tm-2-1','book-2','u-tutor-1','u-student-2','TUTOR','원하시는 회화 주제(일상/학교/여행 등) 3가지만 알려주시면 맞춰서 준비할게요.',DATE_SUB(NOW(),INTERVAL 18 HOUR)),
('tm-2-2','book-2','u-tutor-1','u-student-2','STUDENT','일상/학교/면접 상황 위주로 부탁드려요.',DATE_SUB(NOW(),INTERVAL 17 HOUR)),

('tm-3-1','book-3','u-tutor-2','u-student-3','TUTOR','목표 점수와 시험 날짜를 알려주시면 주차별 플랜을 짜드릴게요.',DATE_SUB(NOW(),INTERVAL 10 HOUR)),
('tm-3-2','book-3','u-tutor-2','u-student-3','STUDENT','목표는 850점이고 6주 안에 달성하고 싶어요.',DATE_SUB(NOW(),INTERVAL 9 HOUR)),

('tm-4-1','book-4','u-tutor-3','u-student-4','TUTOR','히라가나/가타카나 진도를 어디까지 했는지 알려주세요.',DATE_SUB(NOW(),INTERVAL 12 HOUR)),
('tm-4-2','book-4','u-tutor-3','u-student-4','STUDENT','히라가나만 조금 했고, 가타카나는 거의 몰라요.',DATE_SUB(NOW(),INTERVAL 11 HOUR)),

('tm-5-1','book-5','u-tutor-4','u-student-5','TUTOR','발음 교정은 녹음이 중요해요. 샘플 음성 30초만 보내도 좋습니다.',DATE_SUB(NOW(),INTERVAL 14 HOUR)),
('tm-5-2','book-5','u-tutor-4','u-student-5','STUDENT','네! 오늘 연습한 걸 녹음해서 보내볼게요.',DATE_SUB(NOW(),INTERVAL 13 HOUR));

-- Admin inquiries
INSERT INTO admin_inquiry (
    id, user_id, category, title, contact_name, contact_email, contact_phone, status, created_at, updated_at
)
VALUES
('inq-1','u-student-1','PAYMENT','결제 완료 확인 요청','박학생','student1@test.com','010-1111-1111','IN_PROGRESS',DATE_SUB(NOW(), INTERVAL 2 DAY),DATE_SUB(NOW(), INTERVAL 1 DAY)),
('inq-2','u-student-4','INQUIRY','예약 시간 변경 문의','최학생','student4@test.com','010-4444-4444','OPEN',DATE_SUB(NOW(), INTERVAL 18 HOUR),DATE_SUB(NOW(), INTERVAL 18 HOUR)),
('inq-3','u-student-8','REPORT','수업 품질 관련 문의','장학생','student8@test.com','010-8888-8888','DONE',DATE_SUB(NOW(), INTERVAL 5 DAY),DATE_SUB(NOW(), INTERVAL 4 DAY));

INSERT INTO admin_inquiry_message (
    id, inquiry_id, sender_id, sender_role, content, created_at
)
VALUES
('inq-msg-1','inq-1','u-student-1','USER','결제가 완료됐는데 마이페이지 상태가 늦게 바뀌는 것 같습니다.',DATE_SUB(NOW(), INTERVAL 2 DAY)),
('inq-msg-2','inq-1',@admin_id,'ADMIN','확인 후 상태 동기화 처리했습니다. 새로고침 후 다시 확인 부탁드립니다.',DATE_SUB(NOW(), INTERVAL 1 DAY)),
('inq-msg-3','inq-2','u-student-4','USER','이미 예약된 수업의 시간 변경 가능 범위를 알고 싶습니다.',DATE_SUB(NOW(), INTERVAL 18 HOUR)),
('inq-msg-4','inq-3','u-student-8','USER','수업 품질 관련으로 문의드립니다. 환불 기준 안내 부탁드립니다.',DATE_SUB(NOW(), INTERVAL 5 DAY)),
('inq-msg-5','inq-3',@admin_id,'ADMIN','관련 규정과 절차를 안내드렸습니다. 추가 문의는 같은 스레드로 남겨주세요.',DATE_SUB(NOW(), INTERVAL 4 DAY));

-- Korean proverb game seed
INSERT INTO korean_proverb (
    question, answer, option1, option2, option3, option4,
    meaning, difficulty, is_active
)
VALUES
('호랑이는 죽어서 가죽을 남기고, 사람은 죽어서 ____을(를) 남긴다.','이름','돈','이름','집','비밀',
 '사람은 죽은 뒤에도 명예나 이름이 남는다는 뜻입니다.','EASY',TRUE),

('시작이 반이다. 시작이 곧 ____이다.','성공','성공','결과','여정','비용',
 '어떤 일이든 시작하는 것이 가장 어렵고 중요하다는 의미입니다.','EASY',TRUE),

('가는 말이 고와야 ____도 곱다.','오는 말','오는 말','친구 말','뒷말','표정',
 '내가 남에게 좋게 말해야 상대도 좋게 말한다는 뜻입니다.','EASY',TRUE),

('원숭이도 ____에서 떨어진다.','나무','나무','물','의자','계단',
 '아무리 잘하는 사람도 실수할 때가 있다는 의미입니다.','EASY',TRUE),

('티끌 모아 ____ 된다.','태산','태산','강','바다','금',
 '작은 것도 모이면 큰 것이 된다는 뜻입니다.','EASY',TRUE),

('돌다리도 두들겨 보고 ____라.','건너라','건너라','뛰어라','밀어라','기다려라',
 '확실해 보여도 조심해서 확인하라는 의미입니다.','MEDIUM',TRUE),

('세 살 버릇 여든까지 ____다.','간다','간다','온다','먹는다','웃는다',
 '어릴 때 습관은 평생 간다는 뜻입니다.','MEDIUM',TRUE),

('우물 안 ____','개구리','개구리','호랑이','토끼','독수리',
 '좁은 세계에 갇혀 넓은 세상을 모르는 사람을 비유합니다.','MEDIUM',TRUE),

('등잔 밑이 ____','어둡다','어둡다','밝다','춥다','좁다',
 '가까운 곳의 일을 오히려 잘 모른다는 뜻입니다.','MEDIUM',TRUE),

('백문이 불여 ____','일견','일견','일기','일답','일행',
 '백 번 듣는 것보다 한 번 보는 것이 낫다는 뜻입니다.','MEDIUM',TRUE),

('고생 끝에 ____ 온다.','낙','낙','벌','돈','병',
 '힘든 시간이 지나면 좋은 일이 온다는 의미입니다.','EASY',TRUE),

('하늘의 별 따기처럼 ____하다.','어렵다','어렵다','쉽다','간단하다','가깝다',
 '매우 어려운 일을 비유합니다.','MEDIUM',TRUE),

('말 한마디로 천 냥 ____ 갚는다.','빚','빚','돈','집','옷',
 '말을 잘하면 큰 이득을 본다는 뜻입니다.','HARD',TRUE),

('낮말은 새가 듣고 밤말은 ____가 듣는다.','쥐','쥐','개','고양이','뱀',
 '언제 어디서나 말조심해야 한다는 의미입니다.','HARD',TRUE),

('바늘 도둑이 소 도둑 ____다.','된다','된다','아니다','피한다','운다',
 '작은 나쁜 짓을 반복하면 큰 죄로 이어진다는 뜻입니다.','MEDIUM',TRUE);
