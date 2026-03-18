CREATE DATABASE IF NOT EXISTS matching;

USE matching;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS
    featured_tutor,
    admin_inquiry_message,
    admin_inquiry,
    lesson_ai_homework,
    lesson_ai_summary,
    tutor_message,
    tutor_student_note,
    review,
    toss_payment_order_item,
    toss_payment_order,
    payment,
    refresh_token,
    booking,
    tutor_availability,
    tutor_subject,
    tutor_field,
    lesson,
    subject,
    subject_group,
    language_field,
    tutor_career,
    tutor_education,
    tutor_time_range,
    tutor_document,
    tutor_profile,
    user_auth,
    persistent_logins,
    korean_proverb,
    users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    no BIGINT NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    username VARCHAR(64) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(64) NOT NULL,
    nickname VARCHAR(64) NOT NULL,
    profile_img VARCHAR(255) NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_users_id (id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_nickname (nickname)
);

CREATE TABLE user_auth (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    auth VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_user_auth_id (id),
    KEY idx_user_auth_user_id (user_id),
    CONSTRAINT fk_user_auth_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE tutor_profile (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    phone VARCHAR(20) NULL,
    headline VARCHAR(100) NULL,
    bio TEXT NULL,
    self_intro TEXT NULL,
    video_url VARCHAR(255) NULL,
    default_zoom_url VARCHAR(255) NULL,
    bank_name VARCHAR(50) NULL,
    account_number VARCHAR(50) NULL,
    account_holder VARCHAR(50) NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    rating_avg DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    review_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_tutor_profile_user_id (user_id),
    UNIQUE KEY uk_tutor_profile_id (id),
    CONSTRAINT fk_tutor_profile_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE persistent_logins (
    series VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    username VARCHAR(64) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (series),
    UNIQUE KEY uk_persistent_logins_id (id),
    KEY idx_persistent_logins_username (username)
);

CREATE TABLE subject_group (
    no BIGINT NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    name VARCHAR(64) NOT NULL,
    seq INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_subject_group_id (id),
    KEY idx_subject_group_name (name)
);

CREATE TABLE language_field (
    no BIGINT NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    name VARCHAR(64) NOT NULL,
    category ENUM('GENERAL', 'DOMAIN') NOT NULL,
    seq INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_language_field_id (id),
    KEY idx_language_field_category (category),
    KEY idx_language_field_name (name)
);

CREATE TABLE tutor_field (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    field_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    seq INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_tutor_field_id (id),
    KEY idx_tutor_field_user_id (user_id),
    KEY idx_tutor_field_field_id (field_id),
    CONSTRAINT fk_tutor_field_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_tutor_field_field FOREIGN KEY (field_id) REFERENCES language_field (id) ON DELETE CASCADE
);

CREATE TABLE subject (
    no BIGINT NOT NULL AUTO_INCREMENT,
    group_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    name VARCHAR(64) NOT NULL,
    seq_in_group INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_subject_id (id),
    KEY idx_subject_group_id (group_id),
    KEY idx_subject_name (name),
    CONSTRAINT fk_subject_group FOREIGN KEY (group_id) REFERENCES subject_group (id) ON DELETE CASCADE
);

CREATE TABLE lesson (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    subject_id VARCHAR(64) NOT NULL,
    field_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NULL,
    status ENUM('OPEN', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_lesson_id (id),
    KEY idx_lesson_user_id (user_id),
    KEY idx_lesson_subject_id (subject_id),
    KEY idx_lesson_field_id (field_id),
    CONSTRAINT fk_lesson_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_subject FOREIGN KEY (subject_id) REFERENCES subject (id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_field FOREIGN KEY (field_id) REFERENCES language_field (id) ON DELETE CASCADE
);

CREATE TABLE tutor_availability (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    status ENUM('OPEN', 'BOOKED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_tutor_availability_id (id),
    KEY idx_tutor_availability_user_id (user_id),
    KEY idx_tutor_availability_start_at (start_at),
    CONSTRAINT fk_tutor_availability_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE booking (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    tutor_id VARCHAR(64) NULL,
    lesson_id VARCHAR(64) NOT NULL,
    availability_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    title VARCHAR(100) NOT NULL,
    requested_at DATETIME NOT NULL,
    confirmed_at DATETIME NULL,
    canceled_at DATETIME NULL,
    done_at DATETIME NULL,
    paid_at DATETIME NULL,
    memo VARCHAR(255) NULL,
    zoom_join_url VARCHAR(255) NULL,
    PRIMARY KEY (no),
    UNIQUE KEY uk_booking_id (id),
    KEY idx_booking_user_id (user_id),
    KEY idx_booking_tutor_id (tutor_id),
    KEY idx_booking_lesson_id (lesson_id),
    KEY idx_booking_availability_id (availability_id),
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_tutor FOREIGN KEY (tutor_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_booking_lesson FOREIGN KEY (lesson_id) REFERENCES lesson (id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_availability FOREIGN KEY (availability_id) REFERENCES tutor_availability (id) ON DELETE CASCADE
);

CREATE TABLE lesson_ai_summary (
    no BIGINT NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    booking_id VARCHAR(64) NOT NULL,
    tutor_id VARCHAR(64) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    model_name VARCHAR(64) NULL,
    prompt_text TEXT NULL,
    summary_text TEXT NOT NULL,
    next_action TEXT NULL,
    version INT NOT NULL DEFAULT 1,
    status ENUM('DRAFT', 'FINAL') NOT NULL DEFAULT 'DRAFT',
    created_by ENUM('AI', 'TUTOR') NOT NULL DEFAULT 'AI',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_lesson_ai_summary_id (id),
    KEY idx_lesson_ai_summary_booking_id (booking_id),
    KEY idx_lesson_ai_summary_tutor_id (tutor_id),
    KEY idx_lesson_ai_summary_student_id (student_id),
    KEY idx_lesson_ai_summary_status (status),
    CONSTRAINT fk_lesson_ai_summary_booking FOREIGN KEY (booking_id) REFERENCES booking (id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_ai_summary_tutor FOREIGN KEY (tutor_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_ai_summary_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE lesson_ai_homework (
    no BIGINT NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    booking_id VARCHAR(64) NOT NULL,
    summary_id VARCHAR(64) NULL,
    tutor_id VARCHAR(64) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    due_date DATE NULL,
    status ENUM('ASSIGNED', 'SUBMITTED', 'REVIEWED', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'ASSIGNED',
    generated_by ENUM('AI', 'TUTOR') NOT NULL DEFAULT 'AI',
    submission_text TEXT NULL,
    feedback_text TEXT NULL,
    submitted_at DATETIME NULL,
    reviewed_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_lesson_ai_homework_id (id),
    KEY idx_lesson_ai_homework_booking_id (booking_id),
    KEY idx_lesson_ai_homework_summary_id (summary_id),
    KEY idx_lesson_ai_homework_tutor_id (tutor_id),
    KEY idx_lesson_ai_homework_student_id (student_id),
    KEY idx_lesson_ai_homework_status (status),
    CONSTRAINT fk_lesson_ai_homework_booking FOREIGN KEY (booking_id) REFERENCES booking (id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_ai_homework_summary FOREIGN KEY (summary_id) REFERENCES lesson_ai_summary (id) ON DELETE SET NULL,
    CONSTRAINT fk_lesson_ai_homework_tutor FOREIGN KEY (tutor_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_ai_homework_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE admin_inquiry (
    no BIGINT NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    category ENUM('INQUIRY', 'REPORT', 'PAYMENT', 'ACCOUNT') NOT NULL DEFAULT 'INQUIRY',
    title VARCHAR(200) NOT NULL,
    contact_name VARCHAR(64) NULL,
    contact_email VARCHAR(128) NULL,
    contact_phone VARCHAR(32) NULL,
    status ENUM('OPEN', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at DATETIME NULL,
    PRIMARY KEY (no),
    UNIQUE KEY uk_admin_inquiry_id (id),
    KEY idx_admin_inquiry_user_id (user_id),
    KEY idx_admin_inquiry_status (status),
    KEY idx_admin_inquiry_category (category),
    KEY idx_admin_inquiry_created_at (created_at),
    CONSTRAINT fk_admin_inquiry_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE admin_inquiry_message (
    no BIGINT NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    inquiry_id VARCHAR(64) NOT NULL,
    sender_id VARCHAR(64) NOT NULL,
    sender_role ENUM('USER', 'ADMIN') NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_admin_inquiry_message_id (id),
    KEY idx_admin_inquiry_message_inquiry_id (inquiry_id),
    KEY idx_admin_inquiry_message_sender_id (sender_id),
    KEY idx_admin_inquiry_message_created_at (created_at),
    CONSTRAINT fk_admin_inquiry_message_inquiry FOREIGN KEY (inquiry_id) REFERENCES admin_inquiry (id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_inquiry_message_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE tutor_message (
    no BIGINT NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    booking_id VARCHAR(64) NOT NULL,
    tutor_id VARCHAR(64) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    sender_role ENUM('TUTOR', 'STUDENT') NOT NULL DEFAULT 'TUTOR',
    content VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_tutor_message_id (id),
    KEY idx_tutor_message_booking_id (booking_id),
    KEY idx_tutor_message_tutor_id (tutor_id),
    KEY idx_tutor_message_student_id (student_id),
    CONSTRAINT fk_tutor_message_booking FOREIGN KEY (booking_id) REFERENCES booking (id) ON DELETE CASCADE,
    CONSTRAINT fk_tutor_message_tutor FOREIGN KEY (tutor_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_tutor_message_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE tutor_student_note (
    no BIGINT NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    tutor_id VARCHAR(64) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    progress TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_tutor_student_note_id (id),
    UNIQUE KEY uk_tutor_student_pair (tutor_id, student_id),
    KEY idx_tutor_student_note_tutor_id (tutor_id),
    KEY idx_tutor_student_note_student_id (student_id),
    CONSTRAINT fk_tutor_student_note_tutor FOREIGN KEY (tutor_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_tutor_student_note_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE payment (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    booking_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    provider VARCHAR(20) NOT NULL,
    status VARCHAR(20) NULL,
    paid_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_payment_id (id),
    KEY idx_payment_user_id (user_id),
    KEY idx_payment_booking_id (booking_id),
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES booking (id) ON DELETE CASCADE
);

CREATE TABLE toss_payment_order (
    no BIGINT NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    order_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    tutor_id VARCHAR(64) NOT NULL,
    tutor_name VARCHAR(64) NOT NULL,
    booking_count INT NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'READY',
    payment_key VARCHAR(200) NULL,
    paid_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_toss_payment_order_id (id),
    UNIQUE KEY uk_toss_payment_order_order_id (order_id),
    KEY idx_toss_payment_order_user_id (user_id),
    KEY idx_toss_payment_order_tutor_id (tutor_id),
    KEY idx_toss_payment_order_status (status),
    CONSTRAINT fk_toss_payment_order_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_toss_payment_order_tutor FOREIGN KEY (tutor_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE toss_payment_order_item (
    no BIGINT NOT NULL AUTO_INCREMENT,
    id VARCHAR(64) NOT NULL,
    order_id VARCHAR(64) NOT NULL,
    booking_id VARCHAR(64) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_toss_payment_order_item_id (id),
    UNIQUE KEY uk_toss_payment_order_item_order_booking (order_id, booking_id),
    KEY idx_toss_payment_order_item_order_id (order_id),
    KEY idx_toss_payment_order_item_booking_id (booking_id),
    CONSTRAINT fk_toss_payment_order_item_order FOREIGN KEY (order_id) REFERENCES toss_payment_order (order_id) ON DELETE CASCADE,
    CONSTRAINT fk_toss_payment_order_item_booking FOREIGN KEY (booking_id) REFERENCES booking (id) ON DELETE CASCADE
);

CREATE TABLE review (
    no BIGINT NOT NULL AUTO_INCREMENT,
    booking_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    rating TINYINT NULL,
    content TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_review_id (id),
    KEY idx_review_booking_id (booking_id),
    CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES booking (id) ON DELETE CASCADE
);

CREATE TABLE tutor_subject (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    subject_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    seq INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_tutor_subject_id (id),
    UNIQUE KEY uk_tutor_subject_user_subject (user_id, subject_id),
    KEY idx_tutor_subject_subject_id (subject_id),
    CONSTRAINT fk_tutor_subject_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_tutor_subject_subject FOREIGN KEY (subject_id) REFERENCES subject (id) ON DELETE CASCADE
);

CREATE TABLE featured_tutor (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    seq INT NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_featured_tutor_id (id),
    KEY idx_featured_tutor_user_id (user_id),
    KEY idx_featured_tutor_visible_seq (visible, seq),
    CONSTRAINT fk_featured_tutor_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE tutor_career (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    company_name VARCHAR(64) NOT NULL,
    job_category VARCHAR(64) NOT NULL,
    job_role VARCHAR(64) NOT NULL,
    start_year INT NOT NULL,
    end_year INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_tutor_career_id (id),
    KEY idx_tutor_career_user_id (user_id),
    CONSTRAINT fk_tutor_career_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE tutor_education (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    school_name VARCHAR(64) NOT NULL,
    degree VARCHAR(64) NOT NULL,
    start_year INT NOT NULL,
    graduated_year INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_tutor_education_id (id),
    KEY idx_tutor_education_user_id (user_id),
    CONSTRAINT fk_tutor_education_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE tutor_time_range (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    start_at TIME NOT NULL,
    end_at TIME NOT NULL,
    day_of_week ENUM('월', '화', '수', '목', '금', '토', '일') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_tutor_time_range_id (id),
    KEY idx_tutor_time_range_user_id (user_id),
    CONSTRAINT fk_tutor_time_range_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE tutor_document (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    doc_type VARCHAR(64) NOT NULL,
    file_size INT NOT NULL,
    reviewed_by VARCHAR(64) NULL,
    reviewed_at DATETIME NULL,
    reject_reason TEXT NULL,
    original_name VARCHAR(100) NULL,
    store_name VARCHAR(100) NULL,
    file_path VARCHAR(255) NOT NULL,
    content_type VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_tutor_document_id (id),
    KEY idx_tutor_document_user_id (user_id),
    CONSTRAINT fk_tutor_document_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE refresh_token (
    no BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(64) NOT NULL,
    id VARCHAR(64) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    user_agent VARCHAR(255) NULL,
    ip VARCHAR(64) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    UNIQUE KEY uk_refresh_token_id (id),
    KEY idx_refresh_token_user_id (user_id),
    KEY idx_refresh_token_expires_at (expires_at),
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE korean_proverb (
    no INT NOT NULL AUTO_INCREMENT,
    question VARCHAR(255) NOT NULL,
    answer VARCHAR(100) NOT NULL,
    option1 VARCHAR(100) NOT NULL,
    option2 VARCHAR(100) NOT NULL,
    option3 VARCHAR(100) NOT NULL,
    option4 VARCHAR(100) NOT NULL,
    meaning TEXT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'EASY',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (no),
    KEY idx_korean_proverb_difficulty_active (difficulty, is_active)
);
