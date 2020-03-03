-- DPA Database Schema
-- Version 1.0

-- Copyright (c) 2019, San Jose State University Senior Project. 
-- All rights reserved.

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

DROP SCHEMA IF EXISTS dpa;
CREATE SCHEMA dpa;
USE dpa;

--
-- Table structure for table `User`
-- 

CREATE TABLE User (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  isAdmin TINYINT(1) NOT NULL DEFAULT 1,
  name VARCHAR(255) NOT NULL,  
  major VARCHAR(255),  
  gradYear INT,  
  createTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, email)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `User_Course`
-- User enters their taken course
-- 

CREATE TABLE User_Course (
  studentID INT NOT NULL,
  courseCode VARCHAR(255) NOT NULL,
  semesterTaken VARCHAR(255) NULL,
  professorName VARCHAR(255) NULL,
  courseDifficulty INT NULL,
  PRIMARY KEY (studentID, courseCode)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `DegreePlan`
-- Each student will have his/her own degree plan
-- This will contain studentID and expected gradutation plan
-- 

CREATE TABLE DegreePlan (
  id INT NOT NULL AUTO_INCREMENT,
  studentID INT NOT NULL,
  graduationYear INT NOT NULL,
  graduationSemester VARCHAR(255) NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `DegreePlan_Semester`
-- Each degree plan will have many semesters and 1 specific studentID
-- 

CREATE TABLE DegreePlan_Semester (
  semesterID INT NOT NULL,
  degreePlanID INT NOT NULL,
  studentID INT NOT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Table structure for table `Semester`
-- 

CREATE TABLE Semester (
  id INT NOT NULL AUTO_INCREMENT,
  season VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  isCompleted TINYINT NOT NULL,
  difficulty INT NULL,
  PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `Course`
-- This is for constant course manually added by admin or faculty.
-- 

CREATE TABLE Course (
  id INT NOT NULL AUTO_INCREMENT,
  Department VARCHAR(255) NOT NULL,
  courseCode VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  hasPreRequisite TINYINT NOT NULL,
  hasCoRequisite TINYINT NOT NULL,
  difficultyLevel INT NOT NULL,
  impactionLevel DOUBLE NOT NULL,
  link VARCHAR(255) NULL,
  PRIMARY KEY (id, Department, courseCode)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `Course_Semester`
-- Each semester will has many course based on the difficulty
-- 

CREATE TABLE Course_Semester (
  courseID INT NOT NULL,
  semesterID INT NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `Prerequisite`
-- 

CREATE TABLE Course_Prerequisite (
  courseCode VARCHAR(255) NOT NULL,
  PrerequisiteCourseCode VARCHAR(255) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `Corequisite`
-- 

CREATE TABLE Course_Corequisite (
  courseCode VARCHAR(255) NOT NULL,
  CorequisiteCourseCode VARCHAR(255) NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


