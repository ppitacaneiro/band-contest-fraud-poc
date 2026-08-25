SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS vote_attempts;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS artists;
DROP TABLE IF EXISTS contests;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE votes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    contest_id INT UNSIGNED NOT NULL,
    artist_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contest_id) REFERENCES contests(id),
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);

CREATE TABLE vote_attempts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    contest_id INT UNSIGNED NOT NULL,
    artist_id INT UNSIGNED NOT NULL,

    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500),

    status ENUM(
        'accepted',
        'rejected',
        'suspicious'
    ) NOT NULL,

    risk_score INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_vote_attempts_ip_created (ip_address, created_at),
    INDEX idx_vote_attempts_user_created (user_id, created_at),

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contest_id) REFERENCES contests(id),
    FOREIGN KEY (artist_id) REFERENCES artists(id)
);