CREATE TABLE `availableTests` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`unit` varchar(50),
	`minValue` decimal(10,2),
	`maxValue` decimal(10,2),
	`targetValue` decimal(10,2),
	`tolerance` decimal(10,2),
	`duration` int,
	`cost` decimal(10,2),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `availableTests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monteCarloSimulations` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`iterations` int NOT NULL DEFAULT 10000,
	`meanValue` decimal(10,4),
	`stdDeviation` decimal(10,4),
	`confidenceLevel` decimal(5,2) DEFAULT '95.00',
	`lowerBound` decimal(10,4),
	`upperBound` decimal(10,4),
	`successProbability` decimal(5,2),
	`distributionData` json,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `monteCarloSimulations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectTests` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`testId` varchar(64) NOT NULL,
	`status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
	`startDate` timestamp,
	`endDate` timestamp,
	`assignedTo` varchar(64),
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectTests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testResults` (
	`id` varchar(64) NOT NULL,
	`projectTestId` varchar(64) NOT NULL,
	`measuredValue` decimal(10,4),
	`passedCriteria` boolean,
	`notes` text,
	`testedBy` varchar(64),
	`testedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `testResults_id` PRIMARY KEY(`id`)
);
