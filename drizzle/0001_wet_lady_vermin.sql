CREATE TABLE `alerts` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`type` enum('risk','compliance','quality','timeline') NOT NULL,
	`severity` enum('info','warning','error','critical') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`status` enum('active','acknowledged','resolved') DEFAULT 'active',
	`acknowledgedBy` varchar(64),
	`acknowledgedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complaints` (
	`id` varchar(64) NOT NULL,
	`productId` varchar(64),
	`productName` varchar(255),
	`category` varchar(100),
	`description` text,
	`sentiment` enum('positive','neutral','negative'),
	`severity` enum('low','medium','high','critical'),
	`status` enum('open','investigating','resolved','closed') DEFAULT 'open',
	`source` varchar(100),
	`reportedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `complaints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manufacturingData` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`factory` varchar(100) NOT NULL,
	`productionLine` varchar(100),
	`downtime` varchar(20),
	`efficiency` varchar(10),
	`qualityScore` varchar(10),
	`defectRate` varchar(10),
	`throughput` varchar(20),
	`timestamp` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `manufacturingData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`modelVersion` varchar(50),
	`riskScore` varchar(10),
	`successProbability` varchar(10),
	`failureFactors` text,
	`recommendations` text,
	`confidence` varchar(10),
	`metrics` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`productType` varchar(100),
	`factory` varchar(100),
	`status` enum('planning','testing','completed','cancelled') NOT NULL DEFAULT 'planning',
	`startDate` timestamp,
	`endDate` timestamp,
	`riskScore` varchar(10),
	`successProbability` varchar(10),
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('risk_analysis','compliance','performance','summary') NOT NULL,
	`format` enum('pdf','excel','json') DEFAULT 'pdf',
	`content` text,
	`fileUrl` varchar(500),
	`generatedBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `standards` (
	`id` varchar(64) NOT NULL,
	`code` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('nestle','iso','fda','other') NOT NULL,
	`category` varchar(100),
	`content` text,
	`version` varchar(50),
	`effectiveDate` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `standards_id` PRIMARY KEY(`id`)
);
