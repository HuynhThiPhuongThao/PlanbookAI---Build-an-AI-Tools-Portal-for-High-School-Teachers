-- Create databases for each microservice
CREATE DATABASE IF NOT EXISTS db_auth;
CREATE DATABASE IF NOT EXISTS db_user;
CREATE DATABASE IF NOT EXISTS db_curriculum;
CREATE DATABASE IF NOT EXISTS db_question;
CREATE DATABASE IF NOT EXISTS db_exam;
CREATE DATABASE IF NOT EXISTS db_package;

-- Grant privileges (optional but good for dev)
-- GRANT ALL PRIVILEGES ON *.* TO 'planbook'@'%';
-- FLUSH PRIVILEGES;
