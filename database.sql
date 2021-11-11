CREATE DATABASE IF NOT EXISTS mmustsys;
USE mmustsys;
CREATE TABLE users ( 
	id int AUTO_INCREMENT,
	username varchar(20),
	fullname varchar(20),
	password varchar(128),
	department varchar(10),
	PRIMARY KEY (id)
);

CREATE TABLE items (
	id int AUTO_INCREMENT,
	tevent varchar(20),
	unit varchar(20),
	unitname varchar(20),
	venue varchar(20),
	cgroup varchar(20),
	cyear varchar(6),
	lstart varchar(20),
	lend varchar(20),
	lec_id varchar(20),
	comments varchar(255),
	edate varchar(10),
	PRIMARY KEY (id)
);

CREATE TABLE venue(
	venue_name varchar(10),
	capacity int,
	PRIMARY KEY(venue_name)
);

CREATE TABLE class(
	class_name varchar(10),
	stu_no int,
	department varchar(6),
	PRIMARY KEY(class_name)
);

CREATE TABLE students(
	reg_no varchar(25),
	student_name varchar(30),
	phone_no varchar(15),
	course varchar(6),
	cyear varchar(6),
	department varchar(10),
	PRIMARY KEY(reg_no)
);

CREATE TABLE admin(
	id int AUTO_INCREMENT,
	username varchar(20),
	fullname varchar(20),
	password varchar(128),
	department varchar(10),
	PRIMARY KEY (id)
);

CREATE TABLE stu_message(
	id int AUTO_INCREMENT,
	tmessage varchar(255),
	cgroup varchar(20),
	cyear varchar(20),
	estart varchar(20),
	edate varchar(30),
	PRIMARY KEY(id)
);

CREATE TABLE auto (
	id int AUTO_INCREMENT,
	tevent varchar(20),
	unit varchar(20),
	unitname varchar(20),
	venue varchar(20),
	cgroup varchar(20),
	cyear varchar(6),
	lstart varchar(20),
	lend varchar(20),
	lec varchar (30),
	lec_id varchar(20),
	comments varchar(255),
	ldate varchar(20),
	PRIMARY KEY (id)
);

CREATE TABLE stu_issue(
	id int AUTO_INCREMENT,
	issue varchar(255),
	reg_no varchar(20),
	PRIMARY KEY(id)
);

CREATE TABLE communications(
	id int AUTO_INCREMENT,
	username varchar(20),
	fullname varchar(20),
	password varchar(128),
	PRIMARY KEY (id)
);

