CREATE DATABASE  IF NOT EXISTS `planbook_ai` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `planbook_ai`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: planbook_ai
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `prompts`
--

DROP TABLE IF EXISTS `prompts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prompts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `version` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `ix_prompts_name` (`name`),
  KEY `ix_prompts_id` (`id`),
  KEY `ix_prompts_type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prompts`
--

LOCK TABLES `prompts` WRITE;
/*!40000 ALTER TABLE `prompts` DISABLE KEYS */;
INSERT INTO `prompts` VALUES (1,'generate_exercise','exercise','\nYou are an AI assistant for teachers.\n\nGenerate EXACTLY {number_of_questions} multiple choice questions ONLY about \"{topic}\" for grade {grade} with difficulty \"{difficulty}\".\n\nRETURN ONLY VALID JSON:\n\n{{\n  \"questions\": [\n    {{\n      \"question\": \"string\",\n      \"options\": [\"string\", \"string\", \"string\", \"string\"],\n      \"answer\": \"Choose the best option among A, B, C or D\"\n    }}\n  ]\n}}\n\nIMPORTANT:\n- Do NOT return text outside JSON\n',1,1,'admin',NULL,'2026-04-11 15:46:00','2026-04-12 16:25:14'),(2,'generate_lesson_plan','lesson_plan','\nYou are an AI assistant for teachers.\n\nCreate a lesson plan for topic \"{topic}\", grade {grade}, duration {duration_minutes} minutes.\n\nSTRICT RULES:\n- Follow Vietnamese school teaching style\n- Activities must match duration\n- Total time must equal {duration_minutes}\n\nRETURN ONLY VALID JSON:\n\n{{\n  \"title\": \"string\",\n  \"topic\": \"string\",\n  \"grade\": \"string\",\n  \"durationMinutes\": number,\n  \"objectives\": [\"string\"],\n  \"activities\": [\n    {\n      \"time\": number,\n      \"activity\": \"string\"\n    }\n  ],\n  \"assessment\": \"string\"\n}}\n\nIMPORTANT:\n- durationMinutes must be number\n- activities.time must be number (NOT string)\n- Do NOT return text outside JSON\n',1,1,'admin',NULL,'2026-04-11 15:47:12','2026-04-11 15:47:12'),(5,'generate_test','exercise','You are an AI assistant for teachers.\n\nGenerate EXACTLY {number_of_questions} multiple choice questions ONLY about \"{topic}\" for grade {grade} with difficulty \"{difficulty}\".\n\n{{\n  \"questions\": [\n    {{\n      \"question\": \"string\",\n      \"options\": [\"string\", \"string\", \"string\", \"string\"],\n      \"answer\": \"Choose the best option among A, B, C or D\"\n    }}\n  ]\n}}\n\nIMPORTANT:\n- Do NOT return text outside JSON',4,1,'admin',NULL,'2026-04-12 16:19:58','2026-04-12 16:23:28'),(7,'ocr_extract_answers','ocr','You are an OCR grading assistant. Read the uploaded answer-sheet image and extract multiple-choice answers in order. Return STRICT JSON only with this format: {\"detectedAnswers\":[\"A\",\"B\",\"C\"]}. Use only A, B, C, D values. Do not include explanations or markdown.',1,0,'seed_sql','seed_sql','2026-04-12 22:37:22','2026-04-12 22:38:50'),(8,'ocr_extract_answers','ocr','You are an OCR grading assistant. Read the uploaded answer-sheet image and extract multiple-choice answers in order. Return STRICT JSON only with this format: {\"detectedAnswers\":[\"A\",\"B\",\"C\"]}. Use only A, B, C, D values. Do not include explanations or markdown.',2,1,'seed_sql','seed_sql','2026-04-12 22:38:56','2026-04-12 22:38:56');
/*!40000 ALTER TABLE `prompts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-21 15:05:57
