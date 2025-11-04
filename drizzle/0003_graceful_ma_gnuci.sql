CREATE TABLE `monitoredKeywords` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64),
	`keyword` varchar(255) NOT NULL,
	`platform` enum('instagram','facebook','tiktok','twitter','reclameaqui','nestle_site','all') DEFAULT 'all',
	`isActive` enum('yes','no') DEFAULT 'yes',
	`category` varchar(100),
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `monitoredKeywords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monitoredTopics` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64),
	`topic` varchar(255) NOT NULL,
	`description` text,
	`keywords` text,
	`platform` enum('instagram','facebook','tiktok','twitter','reclameaqui','nestle_site','all') DEFAULT 'all',
	`isActive` enum('yes','no') DEFAULT 'yes',
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `monitoredTopics_id` PRIMARY KEY(`id`)
);
