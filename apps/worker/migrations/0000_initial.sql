-- DevClawWorker Database Schema

CREATE TABLE IF NOT EXISTS `users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `username` text NOT NULL,
  `password_hash` text NOT NULL,
  `role` text NOT NULL DEFAULT 'user',
  `created_at` text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `users_username_unique` ON `users` (`username`);

CREATE TABLE IF NOT EXISTS `license_keys` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `key` text NOT NULL,
  `status` text NOT NULL DEFAULT 'active',
  `device_id` text,
  `activated_at` text,
  `expires_at` text,
  `created_at` text NOT NULL,
  `created_by` integer REFERENCES `users`(`id`)
);

CREATE UNIQUE INDEX IF NOT EXISTS `license_keys_key_unique` ON `license_keys` (`key`);

CREATE TABLE IF NOT EXISTS `activation_logs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `key_id` integer NOT NULL REFERENCES `license_keys`(`id`),
  `device_id` text NOT NULL,
  `action` text NOT NULL,
  `ip` text,
  `success` integer NOT NULL,
  `message` text,
  `created_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `downloads` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `platform` text NOT NULL,
  `version` text NOT NULL,
  `ip` text,
  `user_agent` text,
  `created_at` text NOT NULL
);
