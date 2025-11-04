CREATE TABLE `sentimentAnalysis` (
	`id` varchar(64) NOT NULL,
	`postId` varchar(64) NOT NULL,
	`projectId` varchar(64),
	`sentiment` enum('very_positive','positive','neutral','negative','very_negative') NOT NULL,
	`sentimentScore` varchar(10),
	`confidence` varchar(10),
	`keywords` text,
	`topics` text,
	`emotions` text,
	`language` varchar(10),
	`modelVersion` varchar(50),
	`analyzedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `sentimentAnalysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sentimentSummary` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`platform` enum('instagram','facebook','tiktok','twitter','reclameaqui','nestle_site','all') NOT NULL,
	`period` varchar(20),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`totalPosts` varchar(20),
	`veryPositiveCount` varchar(20),
	`positiveCount` varchar(20),
	`neutralCount` varchar(20),
	`negativeCount` varchar(20),
	`veryNegativeCount` varchar(20),
	`averageSentiment` varchar(10),
	`totalEngagement` varchar(20),
	`topKeywords` text,
	`topTopics` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `sentimentSummary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialMediaAccounts` (
	`id` varchar(64) NOT NULL,
	`platform` enum('instagram','facebook','tiktok','twitter','reclameaqui','nestle_site') NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`accountUrl` varchar(500),
	`isActive` enum('yes','no') DEFAULT 'yes',
	`lastSyncAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `socialMediaAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialMediaPosts` (
	`id` varchar(64) NOT NULL,
	`accountId` varchar(64) NOT NULL,
	`projectId` varchar(64),
	`platform` enum('instagram','facebook','tiktok','twitter','reclameaqui','nestle_site') NOT NULL,
	`postId` varchar(255) NOT NULL,
	`author` varchar(255),
	`content` text,
	`url` varchar(500),
	`likes` varchar(20),
	`comments` varchar(20),
	`shares` varchar(20),
	`engagement` varchar(10),
	`publishedAt` timestamp,
	`collectedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `socialMediaPosts_id` PRIMARY KEY(`id`)
);
