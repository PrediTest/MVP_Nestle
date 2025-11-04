CREATE TABLE `alertConfigurations` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64),
	`platform` enum('instagram','facebook','tiktok','twitter','reclameaqui','nestle_site','all') DEFAULT 'all',
	`negativeThreshold` varchar(10) DEFAULT '30',
	`veryNegativeThreshold` varchar(10) DEFAULT '15',
	`sentimentDropThreshold` varchar(10) DEFAULT '20',
	`timeWindow` varchar(20) DEFAULT '24h',
	`minPostsRequired` varchar(10) DEFAULT '10',
	`isActive` enum('yes','no') DEFAULT 'yes',
	`notifyOwner` enum('yes','no') DEFAULT 'yes',
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `alertConfigurations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sentimentAlerts` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`platform` enum('instagram','facebook','tiktok','twitter','reclameaqui','nestle_site','all'),
	`alertType` enum('negative_spike','very_negative_spike','negative_threshold','sentiment_drop') NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`currentValue` varchar(20),
	`thresholdValue` varchar(20),
	`affectedPosts` varchar(20),
	`message` text,
	`status` enum('active','acknowledged','resolved') DEFAULT 'active',
	`acknowledgedBy` varchar(64),
	`acknowledgedAt` timestamp,
	`resolvedAt` timestamp,
	`notificationSent` enum('yes','no') DEFAULT 'no',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `sentimentAlerts_id` PRIMARY KEY(`id`)
);
