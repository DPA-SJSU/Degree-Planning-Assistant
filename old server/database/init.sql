CREATE TABLE User (
	`id` INT NOT NULL AUTO_INCREMENT,
	`email` VARCHAR(255) NOT NULL,
	`password` VARCHAR(255) NOT NULL,
	`role` VARCHAR(255) 
	`name` VARCHAR(255) NOT NULL,  
	`major` VARCHAR(255),  
	`grad_year` INT,  
	`create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`, `email`)
);


