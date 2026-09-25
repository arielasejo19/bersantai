/*
SQLyog Ultimate v11.11 (32 bit)
MySQL - 5.5.5-10.4.32-MariaDB : Database - bersantai
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`bersantai` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `bersantai`;

/*Table structure for table `email_verification_challenges` */

DROP TABLE IF EXISTS `email_verification_challenges`;

CREATE TABLE `email_verification_challenges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `verification_token` varchar(128) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_verification_challenges_verification_token_unique` (`verification_token`),
  KEY `email_verification_challenges_email_created_at_index` (`email`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `email_verification_challenges` */

insert  into `email_verification_challenges`(`id`,`email`,`code_hash`,`verification_token`,`expires_at`,`verified_at`,`created_at`) values (35,'ariel.asejo20@gmail.com','$2b$10$P3vFZSz6x90KmVufCRYbDuactVKOSDiuMTQXooBviyPNPc6exafAq','bbebf872-25e0-4617-8601-1924c13108d2','2026-09-25 15:35:35','2026-09-25 13:24:38','2026-09-25 13:24:25'),(36,'ariel.asejo20@gmail.com','$2b$10$6k.SAEaBV//f2YUW8IrUfOBsqSIpX7xXMLpe7dyuEJDHRG4p0HK62','d52a89ec-56e6-4a89-b5d4-76ef6336261e','2026-09-25 15:35:35','2026-09-25 13:51:57','2026-09-25 13:51:47'),(37,'ariel.asejo19@gmail.com','$2b$10$zSd7Z1UcPY9qtFq7vR39Muag2J1JzNy/.jtm/.JeRDTPPM4slf412','8fd68ec2-1660-4115-93f7-8697866f8a2d','2026-09-25 15:18:16','2026-09-25 13:53:10','2026-09-25 13:53:02'),(38,'ariel.asejo20@gmail.com','$2b$10$1OqCaz3VGEtY.3cKpHZhZuqkwGgTlLoz.YzMGClAD6uk0xFzJJH5K','1d99ee9f-4b2c-46ac-9fab-e3ff6042e16f','2026-09-25 15:35:35','2026-09-25 13:54:07','2026-09-25 13:54:01'),(39,'ariel.asejo19@gmail.com','$2b$10$TShrPBLMCTgnbhem8NnvlO61YmiD9p0CqogpAsRLXxIPINNO4qQIy','d2e166e5-f9ef-4aac-9163-841db347244b','2026-09-25 15:18:16','2026-09-25 13:55:56','2026-09-25 13:55:49'),(40,'ariel.asejo20@gmail.com','$2b$10$KrjNJE.o6dASS5jWFMLVFe1QYjk11zzkpL4bXllJhB/EfDvhg3Gnu','d1d7e5b3-c6d9-4b0c-817e-3718326c5971','2026-09-25 15:35:35','2026-09-25 14:13:25','2026-09-25 14:13:14'),(41,'ariel.asejo20@gmail.com','$2b$10$k/oCDAWEPYikmkKSv//uwuLnGcOUb/wK10QSwnapfjZo.0ztPQE2a','311af55e-80f7-4142-8f3c-3070ef5c409f','2026-09-25 15:35:35','2026-09-25 14:47:47','2026-09-25 14:47:40'),(42,'ariel.asejo20@gmail.com','$2b$10$hFgK4iSPCIqeSvmLKzXo2.En3Ck0X0kJCRrovsrMUlQDX3zvvPc7u','1500ea4b-9de7-4f93-99cf-928a18b16838','2026-09-25 15:35:35','2026-09-25 14:52:42','2026-09-25 14:52:35'),(43,'ariel.asejo19@gmail.com','$2b$10$yblnKjItuvbxAlOPVhYaJO/Sy6HUOP8WWZauaGSnJBzrnOkN4rZVm','2443df20-53eb-45a7-bdcc-dce0cc5b573a','2026-09-25 15:18:16','2026-09-25 14:53:58','2026-09-25 14:53:48'),(44,'ariel.asejo19@gmail.com','$2b$10$YES2438XEeTYNW56p2Yh6uQwqoMQe1fab1vOYeWzgr5.uT0bdiD4C','ffc215fa-bc42-450a-83c3-95f4dd9e8b18','2026-09-25 15:23:16',NULL,'2026-09-25 15:18:16'),(45,'ariel.asejo20@gmail.com','$2b$10$gDGEbH3Q39RQtOQJ.XkHQOrHnDJEpyfJKDRLjcDLFGb1a1kkrlmDa','d7d8db58-883b-45d6-8a8f-873ecbf52b84','2026-09-25 15:35:35','2026-09-25 15:19:11','2026-09-25 15:19:02'),(46,'ariel.asejo20@gmail.com','$2b$10$zaGTbk/R4YNT4Gog7fJ2ZuTiZFNPD5k.c1Bf2nS/sNibPxzHjYwH6','659c1c83-20c4-4c50-aca4-81b55d91436b','2026-09-25 15:35:35','2026-09-25 15:20:09','2026-09-25 15:20:04'),(47,'arielasejo.work@gmail.com','$2b$10$VEPPV60zWNzRwRvQPFPNre7RmjUTzQBliCvV4AcLUtClwtofcaQk2','eec92ff3-913a-401f-8666-59a470467ed6','2026-09-25 15:30:59','2026-09-25 15:26:07','2026-09-25 15:25:59'),(48,'ariel.asejo20@gmail.com','$2b$10$q3Gfk2dSfBehzhAPF2.7pewsW2UdAbJBEiSnFzI08xfnNKv4AuO5G','bb1a5534-ab1a-4d6c-98db-aca86de773b5','2026-09-25 15:40:36','2026-09-25 15:35:42','2026-09-25 15:35:36');

/*Table structure for table `knex_migrations` */

DROP TABLE IF EXISTS `knex_migrations`;

CREATE TABLE `knex_migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `knex_migrations` */

insert  into `knex_migrations`(`id`,`name`,`batch`,`migration_time`) values (1,'202609140001_create_foundation_tables.cjs',1,'2026-09-15 10:04:02'),(2,'202609140002_extend_users_and_profiles_for_auth.cjs',1,'2026-09-15 10:04:02'),(3,'202609150001_create_villa_management_tables.cjs',2,'2026-09-15 11:45:20'),(4,'202609150002_create_system_settings_table.cjs',3,'2026-09-15 12:31:36'),(5,'202609150003_extend_villa_media.cjs',4,'2026-09-15 12:42:28'),(6,'202609170001_create_services_table.cjs',5,'2026-09-22 09:10:47'),(7,'202609170002_create_villa_types.cjs',5,'2026-09-22 09:10:47'),(8,'202609170003_extend_booking_workflow.cjs',5,'2026-09-22 09:10:47'),(9,'202609180001_add_guest_verification_and_social_auth.cjs',5,'2026-09-22 09:10:47'),(10,'202609220001_expand_villa_types_for_booking.cjs',6,'2026-09-22 10:19:57'),(11,'202609220002_add_villa_stay_type.cjs',7,'2026-09-22 16:26:59'),(12,'202609240001_create_menu_and_package_tables.cjs',8,'2026-09-24 10:38:47'),(13,'202609240002_add_meal_of_day_to_menu_items.cjs',9,'2026-09-24 10:46:22'),(14,'202609240003_add_media_types_to_content.cjs',10,'2026-09-24 10:50:48'),(15,'202609240004_add_standard_check_times.cjs',11,'2026-09-24 10:55:33'),(16,'202609240005_create_villa_pricing_rules.cjs',12,'2026-09-24 11:09:26'),(17,'202609240006_create_reservation_billing_tables.cjs',13,'2026-09-24 11:16:51'),(18,'202609240007_support_villa_type_pricing.cjs',14,'2026-09-24 11:37:28'),(19,'202609240008_add_guest_note_to_reservations.cjs',15,'2026-09-24 13:24:38'),(20,'202609240009_add_stay_type_to_pricing_rules.cjs',16,'2026-09-24 14:26:43'),(21,'202609240010_add_villa_map_positions.cjs',17,'2026-09-24 16:21:21'),(22,'202609250001_add_reservation_lifecycle.cjs',18,'2026-09-25 12:39:05'),(23,'202609250002_add_guest_phone.cjs',19,'2026-09-25 15:19:25');

/*Table structure for table `knex_migrations_lock` */

DROP TABLE IF EXISTS `knex_migrations_lock`;

CREATE TABLE `knex_migrations_lock` (
  `index` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `is_locked` int(11) DEFAULT NULL,
  PRIMARY KEY (`index`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `knex_migrations_lock` */

insert  into `knex_migrations_lock`(`index`,`is_locked`) values (1,0);

/*Table structure for table `menu_categories` */

DROP TABLE IF EXISTS `menu_categories`;

CREATE TABLE `menu_categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `menu_categories_slug_unique` (`slug`),
  KEY `menu_categories_is_active_name_index` (`is_active`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `menu_categories` */

insert  into `menu_categories`(`id`,`name`,`slug`,`is_active`,`created_at`,`updated_at`) values (1,'Breakfast','breakfast',0,'2026-09-24 10:39:57','2026-09-24 10:46:24'),(2,'Lunch','lunch',0,'2026-09-24 10:39:57','2026-09-24 10:46:24'),(3,'Dinner','dinner',0,'2026-09-24 10:39:57','2026-09-24 10:46:24'),(4,'Drinks','drinks',1,'2026-09-24 10:39:57','2026-09-24 10:39:57'),(5,'Snacks','snacks',0,'2026-09-24 10:39:57','2026-09-24 10:46:24'),(16,'Main Course','main-course',1,'2026-09-24 10:46:24','2026-09-24 10:46:24'),(18,'Appetizer','appetizer',1,'2026-09-24 10:46:24','2026-09-24 10:46:24'),(25,'Pica-pica','pica-pica',1,'2026-09-24 11:00:47','2026-09-24 11:00:47');

/*Table structure for table `menu_items` */

DROP TABLE IF EXISTS `menu_items`;

CREATE TABLE `menu_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `meal_of_day` varchar(40) DEFAULT NULL,
  `name` varchar(180) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(1000) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `media_type` varchar(20) NOT NULL DEFAULT 'image',
  PRIMARY KEY (`id`),
  UNIQUE KEY `menu_items_slug_unique` (`slug`),
  KEY `menu_items_category_id_is_active_is_available_index` (`category_id`,`is_active`,`is_available`),
  KEY `menu_items_meal_of_day_is_active_is_available_index` (`meal_of_day`,`is_active`,`is_available`),
  CONSTRAINT `menu_items_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `menu_items` */

insert  into `menu_items`(`id`,`category_id`,`meal_of_day`,`name`,`slug`,`description`,`image_url`,`price`,`is_available`,`is_active`,`created_at`,`updated_at`,`media_type`) values (1,16,'breakfast','Khao Tom Gai','khao-tom-gai','Comforting jasmine rice soup with tender chicken, ginger, scallions, and fried garlic.','https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=1000&q=85',260.00,1,1,'2026-09-24 10:40:06','2026-09-24 10:46:24','image'),(2,16,'lunch','Pad Thai Goong','pad-thai-goong','Wok-tossed rice noodles with prawns, egg, bean sprouts, peanuts, and tamarind sauce.','https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1000&q=85',420.00,1,1,'2026-09-24 10:40:06','2026-09-24 10:46:24','image'),(3,18,'lunch','Som Tam Thai','som-tam-thai','Green papaya salad with long beans, cherry tomatoes, peanuts, lime, and a bright chilli dressing.','https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85',280.00,1,1,'2026-09-24 10:40:06','2026-09-24 10:46:24','image'),(4,16,'dinner','Moo Ping','moo-ping','Moo Ping (Thai-Style Grilled Pork Skewers) Recipe','/uploads/1790241486538-58d27681-8e43-4916-be84-bcbc987ba2e1.jpg',480.00,1,1,'2026-09-24 10:40:06','2026-09-24 17:18:06','image'),(5,16,'dinner','Green Curry Chicken','green-curry-chicken','Silky coconut green curry with chicken, Thai basil, aubergine, and steamed jasmine rice.','https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1000&q=85',460.00,1,1,'2026-09-24 10:40:06','2026-09-24 10:46:24','image'),(6,16,'dinner','Massaman Beef Curry','massaman-beef-curry','Slow-cooked beef in a gently spiced coconut curry with potatoes, peanuts, and crispy shallots.','https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85',540.00,1,1,'2026-09-24 10:40:06','2026-09-24 10:46:24','image'),(7,18,NULL,'Mango Sticky Rice','mango-sticky-rice','Sweet coconut sticky rice with ripe Nam Dok Mai mango and toasted mung beans.','/uploads/1790253788568-24ce30ac-a722-433c-b0f5-1eb5b5d2f887.jpg',240.00,1,1,'2026-09-24 10:40:06','2026-09-24 20:43:08','image'),(8,18,NULL,'Thai Spring Rolls','thai-spring-rolls','Crisp vegetable spring rolls served with a sweet chilli dipping sauce.','/uploads/1790253795417-c84903c4-bc42-4807-a031-c67394139e75.jpg',220.00,1,1,'2026-09-24 10:40:06','2026-09-24 20:43:15','image'),(9,4,NULL,'Thai Iced Tea','thai-iced-tea','Strong Thai tea poured over ice with sweetened condensed milk and evaporated milk.','https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=1000&q=85',180.00,1,1,'2026-09-24 10:40:06','2026-09-24 10:40:06','image'),(49,16,'dinner','Tom Yum Goong','tom-yum-goong','A fragrant hot-and-sour prawn broth with lemongrass, galangal, kaffir lime, and mushrooms.','/uploads/1790253802328-3f9a3176-5c28-4964-8dd5-717339c4d668.jpg',480.00,1,1,'2026-09-24 17:30:12','2026-09-24 20:43:22','image');

/*Table structure for table `package_menu_items` */

DROP TABLE IF EXISTS `package_menu_items`;

CREATE TABLE `package_menu_items` (
  `package_id` bigint(20) unsigned NOT NULL,
  `menu_item_id` bigint(20) unsigned NOT NULL,
  `quantity` int(10) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`package_id`,`menu_item_id`),
  KEY `package_menu_items_menu_item_id_index` (`menu_item_id`),
  CONSTRAINT `package_menu_items_menu_item_id_foreign` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `package_menu_items_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `package_menu_items` */

insert  into `package_menu_items`(`package_id`,`menu_item_id`,`quantity`) values (1,2,1),(1,7,1),(1,9,2),(2,5,1),(2,6,1),(2,8,1),(2,9,2),(3,3,1),(3,7,2),(3,49,1);

/*Table structure for table `package_villas` */

DROP TABLE IF EXISTS `package_villas`;

CREATE TABLE `package_villas` (
  `package_id` bigint(20) unsigned NOT NULL,
  `villa_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`package_id`,`villa_id`),
  KEY `package_villas_villa_id_index` (`villa_id`),
  CONSTRAINT `package_villas_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `package_villas_villa_id_foreign` FOREIGN KEY (`villa_id`) REFERENCES `villas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `package_villas` */

insert  into `package_villas`(`package_id`,`villa_id`) values (1,9),(2,3),(3,7);

/*Table structure for table `packages` */

DROP TABLE IF EXISTS `packages`;

CREATE TABLE `packages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(1000) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `media_type` varchar(20) NOT NULL DEFAULT 'image',
  PRIMARY KEY (`id`),
  UNIQUE KEY `packages_slug_unique` (`slug`),
  KEY `packages_is_active_is_available_index` (`is_active`,`is_available`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `packages` */

insert  into `packages`(`id`,`name`,`slug`,`description`,`image_url`,`price`,`is_available`,`is_active`,`created_at`,`updated_at`,`media_type`) values (1,'Bersantai Plus','highland-thai-welcome','A gentle first evening above the clouds with a private villa and a table of Thai favourites.','/uploads/1790333707044-1ca8aa33-25cc-41e4-9dc9-838ca9b687e6.jpg',5000.00,1,1,'2026-09-24 10:40:06','2026-09-25 18:55:25','image'),(2,'2 Nights at Sulawesi','taste-of-the-north','A two-night mountain escape paired with a generous Thai dinner for slow, shared evenings.','/uploads/1790333848037-313bc8ae-62b4-47e6-9e4b-31ee63785d6f.jpg',6000.00,1,1,'2026-09-24 10:40:06','2026-09-25 18:57:28','image'),(3,'Bersantai Table for Two','bersantai-table-for-two','A private villa day with bright salads, fragrant soup, and something sweet to finish.','/uploads/1790333885413-85f698e9-d024-41f5-bb31-5cdc1c450d28.jpg',4000.00,1,1,'2026-09-24 10:40:06','2026-09-25 18:58:05','image');

/*Table structure for table `places` */

DROP TABLE IF EXISTS `places`;

CREATE TABLE `places` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `places_slug_unique` (`slug`),
  KEY `places_status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `places` */

insert  into `places`(`id`,`name`,`slug`,`description`,`status`,`created_at`,`updated_at`) values (10,'Bersantai Demo Place','bersantai-demo-place','A development seed place for validating the initial database foundation.','draft','2026-09-24 17:30:11','2026-09-24 17:30:11');

/*Table structure for table `profiles` */

DROP TABLE IF EXISTS `profiles`;

CREATE TABLE `profiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `display_name` varchar(150) NOT NULL,
  `bio` text DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `phone_number` varchar(40) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `profiles_user_id_unique` (`user_id`),
  CONSTRAINT `profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `profiles` */

insert  into `profiles`(`id`,`user_id`,`display_name`,`bio`,`avatar_url`,`phone_number`,`created_at`,`updated_at`) values (1,1,'Ariel Asejo',NULL,NULL,NULL,'2026-09-15 11:49:38','2026-09-15 11:49:38'),(2,2,'Host 1','-',NULL,NULL,'2026-09-15 12:13:36','2026-09-15 12:14:13'),(3,3,'Receptionist',NULL,NULL,NULL,'2026-09-15 12:29:04','2026-09-15 12:29:04'),(4,4,'Demo Admin',NULL,NULL,NULL,'2026-09-22 09:13:26','2026-09-22 09:13:26'),(5,5,'Demo Host',NULL,NULL,NULL,'2026-09-22 09:13:26','2026-09-22 09:13:26'),(6,6,'Demo Receptionist',NULL,NULL,NULL,'2026-09-22 09:13:27','2026-09-22 09:13:27'),(7,7,'Demo Guest',NULL,NULL,NULL,'2026-09-22 09:13:27','2026-09-22 09:13:27'),(8,8,'Guest',NULL,NULL,NULL,'2026-09-24 13:19:25','2026-09-24 13:19:25'),(9,9,'Jun Serrano',NULL,NULL,NULL,'2026-09-24 19:00:04','2026-09-24 19:00:04');

/*Table structure for table `reservation_activity` */

DROP TABLE IF EXISTS `reservation_activity`;

CREATE TABLE `reservation_activity` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `reservation_id` bigint(20) unsigned NOT NULL,
  `guest_user_id` bigint(20) unsigned DEFAULT NULL,
  `villa_id` bigint(20) unsigned DEFAULT NULL,
  `staff_user_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `remarks` text DEFAULT NULL,
  `metadata_json` text DEFAULT NULL,
  `occurred_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reservation_activity_guest_user_id_foreign` (`guest_user_id`),
  KEY `reservation_activity_villa_id_foreign` (`villa_id`),
  KEY `reservation_activity_staff_user_id_foreign` (`staff_user_id`),
  KEY `reservation_activity_timeline_idx` (`reservation_id`,`occurred_at`),
  CONSTRAINT `reservation_activity_guest_user_id_foreign` FOREIGN KEY (`guest_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservation_activity_reservation_id_foreign` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservation_activity_staff_user_id_foreign` FOREIGN KEY (`staff_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservation_activity_villa_id_foreign` FOREIGN KEY (`villa_id`) REFERENCES `villas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `reservation_activity` */

insert  into `reservation_activity`(`id`,`reservation_id`,`guest_user_id`,`villa_id`,`staff_user_id`,`action`,`remarks`,`metadata_json`,`occurred_at`) values (1,5,NULL,9,NULL,'booking-requested',NULL,NULL,'2026-09-25 15:20:10'),(2,5,NULL,9,1,'booking-confirmed',NULL,NULL,'2026-09-25 15:21:52'),(3,6,NULL,3,NULL,'booking-requested',NULL,NULL,'2026-09-25 15:26:08'),(4,6,NULL,3,1,'booking-cancelled',NULL,NULL,'2026-09-25 15:26:55'),(5,7,NULL,NULL,NULL,'booking-requested',NULL,NULL,'2026-09-25 15:35:46'),(6,7,NULL,NULL,1,'booking-confirmed',NULL,NULL,'2026-09-25 15:48:26'),(7,7,NULL,4,1,'villa-assigned',NULL,NULL,'2026-09-25 15:48:40'),(8,4,9,NULL,1,'booking-confirmed',NULL,NULL,'2026-09-25 15:48:52'),(9,4,9,5,1,'villa-assigned',NULL,NULL,'2026-09-25 15:48:59'),(10,4,9,5,1,'check-in',NULL,NULL,'2026-09-25 15:49:05');

/*Table structure for table `reservation_charges` */

DROP TABLE IF EXISTS `reservation_charges`;

CREATE TABLE `reservation_charges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `reservation_id` bigint(20) unsigned NOT NULL,
  `item_type` varchar(30) NOT NULL,
  `item_id` bigint(20) unsigned DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` int(10) unsigned NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reservation_charges_created_by_user_id_foreign` (`created_by_user_id`),
  KEY `reservation_charges_reservation_id_created_at_index` (`reservation_id`,`created_at`),
  CONSTRAINT `reservation_charges_created_by_user_id_foreign` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservation_charges_reservation_id_foreign` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `reservation_charges` */

insert  into `reservation_charges`(`id`,`reservation_id`,`item_type`,`item_id`,`description`,`quantity`,`unit_price`,`total_amount`,`created_by_user_id`,`created_at`) values (2,4,'food',8,'Thai Spring Rolls',1,220.00,220.00,NULL,'2026-09-24 20:57:57');

/*Table structure for table `reservation_emails` */

DROP TABLE IF EXISTS `reservation_emails`;

CREATE TABLE `reservation_emails` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `reservation_id` bigint(20) unsigned NOT NULL,
  `recipient` varchar(255) NOT NULL,
  `template` varchar(80) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'sent',
  `sent_at` timestamp NULL DEFAULT NULL,
  `attempted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `error_message` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reservation_emails_reservation_id_foreign` (`reservation_id`),
  CONSTRAINT `reservation_emails_reservation_id_foreign` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `reservation_emails` */

insert  into `reservation_emails`(`id`,`reservation_id`,`recipient`,`template`,`status`,`sent_at`,`attempted_at`,`error_message`) values (1,2,'ariel.asejo20@gmail.com','reservation-received','sent','2026-09-24 20:35:11','2026-09-25 12:39:05',NULL),(2,3,'ariel.asejo20@gmail.com','reservation-received','sent','2026-09-24 20:47:01','2026-09-25 12:39:05',NULL),(3,4,'ariel.asejo20@gmail.com','reservation-received','sent','2026-09-24 20:57:57','2026-09-25 12:39:05',NULL),(4,5,'ariel.asejo20@gmail.com','reservation-received','sent','2026-09-25 15:20:15','2026-09-25 15:20:10',NULL),(5,5,'ariel.asejo20@gmail.com','reservation-confirmed','sent','2026-09-25 15:21:56','2026-09-25 15:21:56',NULL),(6,6,'arielasejo.work@gmail.com','reservation-received','sent','2026-09-25 15:26:12','2026-09-25 15:26:08',NULL),(7,7,'ariel.asejo20@gmail.com','reservation-received','sent','2026-09-25 15:35:50','2026-09-25 15:35:46',NULL),(8,7,'ariel.asejo20@gmail.com','reservation-confirmed','sent','2026-09-25 15:48:32','2026-09-25 15:48:32',NULL),(9,4,'ariel.asejo20@gmail.com','reservation-confirmed','sent','2026-09-25 15:48:55','2026-09-25 15:48:55',NULL),(10,4,'ariel.asejo20@gmail.com','check-in-confirmation','sent','2026-09-25 15:49:08','2026-09-25 15:49:08',NULL);

/*Table structure for table `reservation_payments` */

DROP TABLE IF EXISTS `reservation_payments`;

CREATE TABLE `reservation_payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `reservation_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(40) NOT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'collected',
  `collected_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `collected_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reservation_payments_collected_by_user_id_foreign` (`collected_by_user_id`),
  KEY `reservation_payments_reservation_id_collected_at_index` (`reservation_id`,`collected_at`),
  CONSTRAINT `reservation_payments_collected_by_user_id_foreign` FOREIGN KEY (`collected_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservation_payments_reservation_id_foreign` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `reservation_payments` */

insert  into `reservation_payments`(`id`,`reservation_id`,`amount`,`payment_method`,`reference`,`status`,`collected_by_user_id`,`collected_at`) values (1,5,7500.00,'card','Initial booking payment','collected',NULL,'2026-09-25 15:20:10'),(2,6,15000.00,'card','Initial booking payment','collected',NULL,'2026-09-25 15:26:08'),(3,7,7500.00,'card','Initial booking payment','collected',NULL,'2026-09-25 15:35:46');

/*Table structure for table `reservation_services` */

DROP TABLE IF EXISTS `reservation_services`;

CREATE TABLE `reservation_services` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `reservation_id` bigint(20) unsigned NOT NULL,
  `service_id` bigint(20) unsigned NOT NULL,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `quantity` int(10) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reservation_services_reservation_id_service_id_unique` (`reservation_id`,`service_id`),
  KEY `reservation_services_service_id_foreign` (`service_id`),
  CONSTRAINT `reservation_services_reservation_id_foreign` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservation_services_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `reservation_services` */

insert  into `reservation_services`(`id`,`reservation_id`,`service_id`,`unit_price`,`quantity`) values (1,2,1,1800.00,1),(2,2,2,1800.00,1),(3,3,1,1800.00,1),(4,3,2,1800.00,1);

/*Table structure for table `reservations` */

DROP TABLE IF EXISTS `reservations`;

CREATE TABLE `reservations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `villa_id` bigint(20) unsigned DEFAULT NULL,
  `villa_type_id` bigint(20) unsigned DEFAULT NULL,
  `booking_kind` varchar(30) NOT NULL DEFAULT 'overnight',
  `payment_method` varchar(40) DEFAULT NULL,
  `payment_status` varchar(30) NOT NULL DEFAULT 'unpaid',
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reference_number` varchar(40) DEFAULT NULL,
  `guest_user_id` bigint(20) unsigned DEFAULT NULL,
  `guest_name` varchar(180) NOT NULL,
  `guest_email` varchar(255) NOT NULL,
  `guest_phone` varchar(32) DEFAULT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `booking_status` varchar(50) NOT NULL DEFAULT 'confirmed',
  `checked_in_at` timestamp NULL DEFAULT NULL,
  `checked_out_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `guest_note` text DEFAULT NULL,
  `guests` int(10) unsigned NOT NULL DEFAULT 1,
  `booking_mode` varchar(20) NOT NULL DEFAULT 'airbnb',
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `confirmed_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT NULL,
  `assigned_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `checked_in_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `check_in_remarks` text DEFAULT NULL,
  `checked_out_by_user_id` bigint(20) unsigned DEFAULT NULL,
  `check_out_remarks` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reservations_reference_number_unique` (`reference_number`),
  KEY `reservations_guest_user_id_foreign` (`guest_user_id`),
  KEY `reservations_villa_id_check_in_check_out_index` (`villa_id`,`check_in`,`check_out`),
  KEY `reservations_status_booking_status_index` (`status`,`booking_status`),
  KEY `reservations_villa_type_id_check_in_check_out_index` (`villa_type_id`,`check_in`,`check_out`),
  KEY `reservations_booking_kind_check_in_index` (`booking_kind`,`check_in`),
  KEY `reservations_payment_status_index` (`payment_status`),
  KEY `reservations_confirmed_by_user_id_foreign` (`confirmed_by_user_id`),
  KEY `reservations_assigned_by_user_id_foreign` (`assigned_by_user_id`),
  KEY `reservations_checked_in_by_user_id_foreign` (`checked_in_by_user_id`),
  KEY `reservations_checked_out_by_user_id_foreign` (`checked_out_by_user_id`),
  KEY `reservations_mode_status_idx` (`booking_mode`,`booking_status`),
  CONSTRAINT `reservations_assigned_by_user_id_foreign` FOREIGN KEY (`assigned_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservations_checked_in_by_user_id_foreign` FOREIGN KEY (`checked_in_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservations_checked_out_by_user_id_foreign` FOREIGN KEY (`checked_out_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservations_confirmed_by_user_id_foreign` FOREIGN KEY (`confirmed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservations_guest_user_id_foreign` FOREIGN KEY (`guest_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservations_villa_id_foreign` FOREIGN KEY (`villa_id`) REFERENCES `villas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_villa_type_id_foreign` FOREIGN KEY (`villa_type_id`) REFERENCES `villa_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `reservations` */

insert  into `reservations`(`id`,`villa_id`,`villa_type_id`,`booking_kind`,`payment_method`,`payment_status`,`total_amount`,`reference_number`,`guest_user_id`,`guest_name`,`guest_email`,`guest_phone`,`check_in`,`check_out`,`status`,`booking_status`,`checked_in_at`,`checked_out_at`,`created_at`,`updated_at`,`guest_note`,`guests`,`booking_mode`,`confirmed_at`,`confirmed_by_user_id`,`assigned_at`,`assigned_by_user_id`,`checked_in_by_user_id`,`check_in_remarks`,`checked_out_by_user_id`,`check_out_remarks`) values (1,2,NULL,'overnight',NULL,'unpaid',0.00,NULL,NULL,'Ariel','arasejo@ddh.com.ph',NULL,'2026-09-16','2026-09-17','pending','checked_in',NULL,NULL,'2026-09-15 13:54:35','2026-09-24 20:51:54',NULL,1,'airbnb',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,3,NULL,'overnight','pay_later','pending',16100.00,'BRS-MUFILJYG',9,'Jun Serrano','ariel.asejo20@gmail.com',NULL,'2026-09-25','2026-09-27','pending','checked_in',NULL,NULL,'2026-09-24 20:35:11','2026-09-24 20:37:57',NULL,1,'airbnb',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,9,NULL,'day_tour','card','paid',8600.00,'BRS-MUFJ0RQD',9,'Jun Serrano','ariel.asejo20@gmail.com',NULL,'2026-09-25','2026-09-25','pending','pending',NULL,NULL,'2026-09-24 20:47:01','2026-09-24 20:47:01',NULL,1,'airbnb',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,5,2,'overnight','card','paid',700.00,'BRS-MUFJEU18',9,'Jun Serrano','ariel.asejo20@gmail.com',NULL,'2026-09-26','2026-09-28','checked_in','checked_in','2026-09-25 15:49:05',NULL,'2026-09-24 20:57:57','2026-09-25 15:49:05',NULL,1,'hotel','2026-09-25 15:48:52',1,'2026-09-25 15:48:59',1,1,NULL,NULL,NULL),(5,9,4,'day_tour','card','paid',7500.00,'BRS-MUGMSAUH',NULL,'Jose Rizal','ariel.asejo20@gmail.com','09190829981','2026-09-26','2026-09-26','confirmed','confirmed',NULL,NULL,'2026-09-25 15:20:10','2026-09-25 15:21:52',NULL,2,'airbnb','2026-09-25 15:21:52',1,NULL,NULL,NULL,NULL,NULL,NULL),(6,3,1,'overnight','card','paid',15000.00,'BRS-MUGMZYOV',NULL,'Boss Leo','arielasejo.work@gmail.com','09190829981','2026-09-26','2026-09-28','cancelled','cancelled',NULL,NULL,'2026-09-25 15:26:08','2026-09-25 15:26:55',NULL,2,'hotel',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,4,1,'overnight','card','paid',7500.00,'BRS-MUGNCCU5',NULL,'Test','ariel.asejo20@gmail.com','09190829981','2026-09-26','2026-09-27','confirmed','confirmed',NULL,NULL,'2026-09-25 15:35:46','2026-09-25 15:48:40',NULL,2,'hotel','2026-09-25 15:48:26',1,'2026-09-25 15:48:40',1,NULL,NULL,NULL,NULL);

/*Table structure for table `roles` */

DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `key` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `roles` */

insert  into `roles`(`key`,`label`,`created_at`) values ('admin','Admin','2026-09-15 11:44:32'),('guest','Guest','2026-09-15 11:44:32'),('host','Host','2026-09-15 11:44:32'),('receptionist','Receptionist','2026-09-15 11:44:32');

/*Table structure for table `services` */

DROP TABLE IF EXISTS `services`;

CREATE TABLE `services` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(180) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `category` varchar(80) NOT NULL DEFAULT 'service',
  `image_url` varchar(1000) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `day_tour_only` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `media_type` varchar(20) NOT NULL DEFAULT 'image',
  PRIMARY KEY (`id`),
  UNIQUE KEY `services_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `services` */

insert  into `services`(`id`,`title`,`slug`,`description`,`price`,`category`,`image_url`,`is_active`,`day_tour_only`,`sort_order`,`created_at`,`updated_at`,`media_type`) values (1,'Airport Transfer: Davao to Bersantai','airport-transfer-davao-to-bersantai','Private one-way transfer from Davao International Airport to Bersantai, with a comfortable vehicle and a local driver.',1800.00,'transport','/uploads/1790304636428-52a2a258-0af8-43f5-bf46-96186581f09e.webp',1,0,10,'2026-09-24 17:30:12','2026-09-24 17:30:12','image'),(2,'Airport Transfer: Bersantai to Davao','airport-transfer-bersantai-to-davao','Private one-way transfer from Bersantai to Davao International Airport, scheduled around your departure time.',1800.00,'transport','/uploads/1790313563786-b96b8dec-398b-4bb9-a805-b1dcdc4b3e77.webp',1,0,20,'2026-09-24 17:30:12','2026-09-24 17:30:12','image'),(3,'Massage Spa','massage-spa','A restorative in-villa massage using warm oils and slow, grounding techniques from a local wellness practitioner.',1500.00,'wellness','https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=85',1,0,30,'2026-09-24 17:30:12','2026-09-24 17:30:12','image'),(4,'Davao City Tour','davao-city-tour','A private guided day tour through Davao City, including local landmarks, food stops, and time to explore at your own pace.',3200.00,'tour','/uploads/1790313535237-fe67bb53-fc98-46a5-8eda-08cdfee25ee3.jpg',1,1,40,'2026-09-24 17:30:12','2026-09-24 17:30:12','image'),(5,'Highland Nature Tour','highland-nature-tour','Discover nearby viewpoints, forest paths, and quiet highland villages with a private local guide.',2800.00,'tour','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',0,1,50,'2026-09-24 17:30:12','2026-09-24 17:30:12','image'),(7,'Private Dinner Setup','private-dinner-setup','A beautifully prepared private dinner setting with table styling, candles, and a chef-curated local menu.',2500.00,'dining','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85',1,0,70,'2026-09-24 17:30:12','2026-09-24 17:30:12','image'),(8,'Villa Celebration Setup','villa-celebration-setup','A thoughtful in-villa setup for birthdays, anniversaries, proposals, and other memorable stays.',1800.00,'special-occasion','https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85',1,0,80,'2026-09-24 17:30:12','2026-09-24 17:30:12','image');

/*Table structure for table `social_identities` */

DROP TABLE IF EXISTS `social_identities`;

CREATE TABLE `social_identities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `provider` varchar(30) NOT NULL,
  `provider_user_id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `social_identities_provider_provider_user_id_unique` (`provider`,`provider_user_id`),
  UNIQUE KEY `social_identities_provider_email_unique` (`provider`,`email`),
  KEY `social_identities_user_id_foreign` (`user_id`),
  CONSTRAINT `social_identities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `social_identities` */

insert  into `social_identities`(`id`,`user_id`,`provider`,`provider_user_id`,`email`,`created_at`,`updated_at`) values (1,1,'google','google-ariel.asejo19@gmail.com','ariel.asejo19@gmail.com','2026-09-22 10:12:07','2026-09-22 10:12:07');

/*Table structure for table `system_settings` */

DROP TABLE IF EXISTS `system_settings`;

CREATE TABLE `system_settings` (
  `key` varchar(100) NOT NULL,
  `value` varchar(255) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `system_settings` */

insert  into `system_settings`(`key`,`value`,`updated_at`) values ('operating_mode','airbnb','2026-09-25 16:16:37'),('public_address','Davao City, Philippines','2026-09-24 14:43:03'),('public_contactNumber','+62 361 234 567','2026-09-24 14:43:03'),('public_description','Private Bali mountain stays made for slower days, warm welcomes, and a closer connection to the highlands.','2026-09-24 14:43:03'),('public_email','hello@bersantai.com','2026-09-24 14:43:03'),('public_location','Tagurano Davao City','2026-09-24 14:43:03'),('public_mapUrl','/uploads/1790238149212-c267e81f-0e99-43b4-a903-54a64f7cd5d5.png','2026-09-24 16:22:29');

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'guest',
  `account_status` varchar(50) NOT NULL DEFAULT 'active',
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_account_status_index` (`account_status`),
  KEY `users_role_index` (`role`),
  CONSTRAINT `users_role_foreign` FOREIGN KEY (`role`) REFERENCES `roles` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `users` */

insert  into `users`(`id`,`email`,`password_hash`,`role`,`account_status`,`email_verified`,`last_login_at`,`created_at`,`updated_at`) values (1,'ariel.asejo19@gmail.com','$2b$12$bsWsbo.aa6G3dUJJOT8Q0uTQVQVwlEgdf2HxpIT5akLQhb.pUp.sa','admin','active',0,'2026-09-25 18:52:05','2026-09-15 11:49:38','2026-09-25 18:52:05'),(2,'ariel.asejo19+host@gmail.com','$2b$12$EM7jt4gH4U6Sd44bQmI7B.Oq0JMGtX2r5hDF9RSkczlEnfONF9D.S','host','active',0,'2026-09-25 15:23:03','2026-09-15 12:13:36','2026-09-25 15:23:03'),(3,'ariel.asejo19+receptionist@gmail.com','$2b$12$eW2Jl2kJBvTLGgIwZw8zMOdRkrd3W8fW366KTl2u7zFnH95shkgIu','receptionist','active',0,NULL,'2026-09-15 12:29:04','2026-09-15 12:29:04'),(4,'demo.admin@bersantai.local','$2b$12$q1wi1BpW7IyHB72WhPZKqOV.PT8USK56deybjUivNDng5lIU8TtKq','admin','active',1,NULL,'2026-09-22 09:13:26','2026-09-24 17:30:11'),(5,'demo.host@bersantai.local','$2b$12$vEC.hpPW4bDIFK1xvGHSxua1wIDQ0/XFW3qNowzSPX/xtPdm6PwZK','host','active',1,'2026-09-24 13:32:23','2026-09-22 09:13:26','2026-09-24 17:30:12'),(6,'demo.receptionist@bersantai.local','$2b$12$krYdKRE.3khWLlvwamnvF.qnNbf51Jk5D8snh4Hlkv42M.pFkKCJu','receptionist','active',1,NULL,'2026-09-22 09:13:27','2026-09-24 17:30:12'),(7,'demo.guest@bersantai.local','$2b$12$sN6XFaaKn5LsRZytmiXNTubTQJMtbSBXE.4cyByVWnCYSnk6WiLs.','guest','active',1,NULL,'2026-09-22 09:13:27','2026-09-24 17:30:12'),(8,'guest@gmail.com','$2b$12$JYGmFL5ehRU7pprGrsbxg.zohEWPSO3J7XRO/Am18W.Od9mEDD0Wy','guest','active',1,'2026-09-24 17:44:40','2026-09-24 13:19:25','2026-09-24 17:44:40'),(9,'ariel.asejo20@gmail.com','$2b$12$xjbFu4iyGPEnIGUFbu3X8eIrm2FEqyWQRPKGFHXXfY6f8pUz/7C0m','guest','active',1,'2026-09-25 15:24:42','2026-09-24 19:00:04','2026-09-25 15:24:42');

/*Table structure for table `villa_amenities` */

DROP TABLE IF EXISTS `villa_amenities`;

CREATE TABLE `villa_amenities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `villa_id` bigint(20) unsigned NOT NULL,
  `name` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `villa_amenities_villa_id_name_unique` (`villa_id`,`name`),
  CONSTRAINT `villa_amenities_villa_id_foreign` FOREIGN KEY (`villa_id`) REFERENCES `villas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `villa_amenities` */

insert  into `villa_amenities`(`id`,`villa_id`,`name`) values (29,2,'Air conditioning'),(30,2,'Fresh linens'),(31,2,'Swimming pool'),(32,2,'Wi-Fi'),(28,9,'Infinity Pool');

/*Table structure for table `villa_photos` */

DROP TABLE IF EXISTS `villa_photos`;

CREATE TABLE `villa_photos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `villa_id` bigint(20) unsigned NOT NULL,
  `url` varchar(1000) NOT NULL,
  `media_type` varchar(30) NOT NULL DEFAULT 'image',
  `alt_text` varchar(255) DEFAULT NULL,
  `is_thumbnail` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `villa_photos_villa_id_sort_order_index` (`villa_id`,`sort_order`),
  KEY `villa_photos_villa_id_is_thumbnail_index` (`villa_id`,`is_thumbnail`),
  CONSTRAINT `villa_photos_villa_id_foreign` FOREIGN KEY (`villa_id`) REFERENCES `villas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `villa_photos` */

insert  into `villa_photos`(`id`,`villa_id`,`url`,`media_type`,`alt_text`,`is_thumbnail`,`sort_order`) values (31,5,'/uploads/1790232511383-ea346d26-1911-4df3-b12e-62165b4d2ab2.png','image','',1,0),(32,5,'/uploads/1790235200556-e4e207ee-cbaa-499d-adc4-94c1fac96a3f.png','image','',0,1),(54,9,'/uploads/1790232268999-727e7b6b-8777-4d65-b6a8-3bf209d5dc44.jpg','image','',1,0),(55,9,'/uploads/1790236482453-89dc5b2a-958c-490a-ba3b-0439a85c1092.jpg','image','',0,1),(56,9,'/uploads/1790236482454-2141bfe9-5389-4873-9155-4240582dd80d.jpg','image','',0,2),(57,9,'/uploads/1790236482454-f106d44a-c310-4b61-a7c8-5d0692c3a544.jpg','image','',0,3),(62,3,'/uploads/1790254126995-ef3c75e1-387a-4d16-bb7b-ada71433bbae.jpg','image','',1,0),(64,4,'/uploads/1790254164960-bc835429-1700-46d0-b93a-884d5f0cfb22.jpg','image','',1,0),(66,6,'/uploads/1790254194231-dcd44f51-efc8-4671-800c-d6c47d413b2e.jpg','image','',1,0),(68,7,'/uploads/1790254219633-802505f4-6aa5-4950-815d-88039dbf990a.jpg','image','',1,0),(70,8,'/uploads/1790254249264-6e8f70bb-f793-4f80-9e5d-19a389986fe8.jpg','image','',1,0),(72,2,'/uploads/1790254264152-e978ae6a-47d4-4656-9447-88b67d977646.webp','image','',1,0),(74,1,'/uploads/1790254284201-0e269a11-cb27-4cca-8a54-0b92cfe8f3f1.jpg','image','',1,0);

/*Table structure for table `villa_pricing_rules` */

DROP TABLE IF EXISTS `villa_pricing_rules`;

CREATE TABLE `villa_pricing_rules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `villa_id` bigint(20) unsigned DEFAULT NULL,
  `villa_type_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(180) NOT NULL,
  `stay_type` varchar(20) NOT NULL DEFAULT 'both',
  `rule_type` varchar(30) NOT NULL,
  `starts_on` date DEFAULT NULL,
  `ends_on` date DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `villa_pricing_rules_villa_id_rule_type_starts_on_ends_on_index` (`villa_id`,`rule_type`,`starts_on`,`ends_on`),
  KEY `villa_pricing_rules_is_active_index` (`is_active`),
  KEY `pricing_rules_type_dates_idx` (`villa_type_id`,`rule_type`,`starts_on`,`ends_on`),
  KEY `villa_pricing_rules_stay_type_index` (`stay_type`),
  CONSTRAINT `villa_pricing_rules_villa_id_foreign` FOREIGN KEY (`villa_id`) REFERENCES `villas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `villa_pricing_rules_villa_type_id_foreign` FOREIGN KEY (`villa_type_id`) REFERENCES `villa_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `villa_pricing_rules` */

insert  into `villa_pricing_rules`(`id`,`villa_id`,`villa_type_id`,`name`,`stay_type`,`rule_type`,`starts_on`,`ends_on`,`price`,`is_active`,`created_at`,`updated_at`) values (1,3,NULL,'Weekdays','both','weekday',NULL,NULL,5000.00,1,'2026-09-24 11:32:07','2026-09-24 11:32:07'),(2,3,NULL,'Weekends','both','weekend',NULL,NULL,7500.00,1,'2026-09-24 11:32:31','2026-09-24 11:32:31'),(3,9,NULL,'Pavillion Weekday','day_tour','weekday',NULL,NULL,5000.00,1,'2026-09-24 13:40:35','2026-09-24 18:01:07'),(5,9,NULL,'Pavillion Weekend','day_tour','weekend',NULL,NULL,7500.00,1,'2026-09-24 14:37:00','2026-09-24 18:11:45'),(6,NULL,1,'Weekday Rate','overnight','weekday',NULL,NULL,5000.00,1,'2026-09-25 12:42:00','2026-09-25 12:42:00'),(7,NULL,1,'7500','overnight','weekend',NULL,NULL,6000.00,1,'2026-09-25 12:42:23','2026-09-25 12:42:23'),(8,NULL,4,'Pavillion Weekday','day_tour','weekday',NULL,NULL,5000.00,1,'2026-09-25 13:36:18','2026-09-25 13:36:18'),(9,NULL,4,'Pavillion Weekend','day_tour','weekend',NULL,NULL,7500.00,1,'2026-09-25 13:36:42','2026-09-25 13:36:42');

/*Table structure for table `villa_receptionist_assignments` */

DROP TABLE IF EXISTS `villa_receptionist_assignments`;

CREATE TABLE `villa_receptionist_assignments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `villa_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `villa_receptionist_assignments_villa_id_user_id_unique` (`villa_id`,`user_id`),
  KEY `villa_receptionist_assignments_user_id_index` (`user_id`),
  CONSTRAINT `villa_receptionist_assignments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `villa_receptionist_assignments_villa_id_foreign` FOREIGN KEY (`villa_id`) REFERENCES `villas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `villa_receptionist_assignments` */

/*Table structure for table `villa_types` */

DROP TABLE IF EXISTS `villa_types`;

CREATE TABLE `villa_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `default_image_url` varchar(1000) DEFAULT NULL,
  `nightly_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `capacity` int(10) unsigned NOT NULL DEFAULT 2,
  `bedroom_count` int(10) unsigned NOT NULL DEFAULT 1,
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `availability_status` varchar(50) NOT NULL DEFAULT 'available',
  `amenities_json` text DEFAULT NULL,
  `gallery_urls_json` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `day_tour_only` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `default_media_type` varchar(20) NOT NULL DEFAULT 'image',
  `standard_check_in` varchar(5) NOT NULL DEFAULT '15:00',
  `standard_check_out` varchar(5) NOT NULL DEFAULT '11:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `villa_types_name_unique` (`name`),
  UNIQUE KEY `villa_types_slug_unique` (`slug`),
  KEY `villa_types_status_availability_status_index` (`status`,`availability_status`),
  KEY `villa_types_standard_check_in_standard_check_out_index` (`standard_check_in`,`standard_check_out`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `villa_types` */

insert  into `villa_types`(`id`,`name`,`slug`,`description`,`default_image_url`,`nightly_price`,`capacity`,`bedroom_count`,`status`,`availability_status`,`amenities_json`,`gallery_urls_json`,`is_active`,`day_tour_only`,`created_at`,`updated_at`,`default_media_type`,`standard_check_in`,`standard_check_out`) values (1,'Sulawesi','sulawesi',NULL,'/uploads/1790317280792-f1667fb5-142b-4b1c-83f0-5d5d8a25f93b.jpg',0.00,2,1,'active','available','[]','[]',1,0,'2026-09-22 09:10:47','2026-09-22 09:10:47','image','15:00','11:00'),(2,'Java','java',NULL,'/uploads/1790317268561-b939372f-1a2e-4e3f-b5cd-02ee6a8d49db.jpg',0.00,2,1,'active','available','[]','[]',1,0,'2026-09-22 09:10:47','2026-09-22 09:10:47','image','15:00','11:00'),(3,'Sumatra','sumatra',NULL,'/uploads/1790317290259-b1d46c4a-9e5c-4d1f-9cdd-26ad00972972.jpg',0.00,2,1,'active','available','[]','[]',1,0,'2026-09-22 09:10:47','2026-09-22 09:10:47','image','15:00','11:00'),(4,'Dining Pavilion','dining-pavilion','A day-use dining pavilion with an Infinity Pool.','/images/villas/dining-pavillion.jpg',0.00,2,1,'active','available',NULL,NULL,1,1,'2026-09-22 09:13:27','2026-09-22 09:13:27','image','15:00','11:00');

/*Table structure for table `villas` */

DROP TABLE IF EXISTS `villas`;

CREATE TABLE `villas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `location` varchar(255) NOT NULL,
  `villa_type_id` bigint(20) unsigned DEFAULT NULL,
  `description` text DEFAULT NULL,
  `nightly_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `capacity` int(10) unsigned NOT NULL DEFAULT 1,
  `bedroom_count` int(10) unsigned NOT NULL DEFAULT 1,
  `status` varchar(50) NOT NULL DEFAULT 'draft',
  `availability_status` varchar(50) NOT NULL DEFAULT 'available',
  `stay_type` varchar(20) NOT NULL DEFAULT 'both',
  `owner_user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `standard_check_in` varchar(5) NOT NULL DEFAULT '15:00',
  `standard_check_out` varchar(5) NOT NULL DEFAULT '11:00',
  `map_x` decimal(5,2) DEFAULT NULL,
  `map_y` decimal(5,2) DEFAULT NULL,
  `occupancy_status` varchar(20) NOT NULL DEFAULT 'available',
  PRIMARY KEY (`id`),
  UNIQUE KEY `villas_slug_unique` (`slug`),
  KEY `villas_owner_user_id_index` (`owner_user_id`),
  KEY `villas_status_availability_status_index` (`status`,`availability_status`),
  KEY `villas_villa_type_id_index` (`villa_type_id`),
  KEY `villas_stay_type_index` (`stay_type`),
  KEY `villas_standard_check_in_standard_check_out_index` (`standard_check_in`,`standard_check_out`),
  KEY `villas_occupancy_status_index` (`occupancy_status`),
  CONSTRAINT `villas_owner_user_id_foreign` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `villas_villa_type_id_foreign` FOREIGN KEY (`villa_type_id`) REFERENCES `villa_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `villas` */

insert  into `villas`(`id`,`name`,`slug`,`location`,`villa_type_id`,`description`,`nightly_price`,`capacity`,`bedroom_count`,`status`,`availability_status`,`stay_type`,`owner_user_id`,`created_at`,`updated_at`,`standard_check_in`,`standard_check_out`,`map_x`,`map_y`,`occupancy_status`) values (1,'Sulawesi Villa','sulawesi-villa','Tagurano',NULL,'',5000.00,2,1,'active','available','both',NULL,'2026-09-15 12:22:32','2026-09-25 16:48:43','15:00','11:00',65.10,40.15,'available'),(2,'Java 103','java','Tagurano',NULL,'',4000.00,2,2,'active','available','both',2,'2026-09-15 12:38:10','2026-09-25 18:56:34','15:00','11:00',50.22,40.66,'occupied'),(3,'Sulawesi 101','sulawesi-101','Sulawesi, Bali',1,'A private Sulawesi villa prepared for a considered island stay.',3500.00,2,1,'active','available','both',5,'2026-09-22 09:13:27','2026-09-25 18:56:47','15:00','11:00',25.90,41.68,'occupied'),(4,'Sulawesi 102','sulawesi-102','Sulawesi, Bali',1,'A private Sulawesi villa prepared for a considered island stay.',3500.00,2,1,'active','available','both',NULL,'2026-09-22 09:13:27','2026-09-25 18:56:48','15:00','11:00',37.00,41.03,'available'),(5,'Java 101','java-101','Java, Bali',2,'A private Java villa prepared for a considered island stay.',4000.00,2,1,'active','available','both',NULL,'2026-09-22 09:13:27','2026-09-25 18:56:36','15:00','11:00',55.78,59.86,'occupied'),(6,'Java 102','java-102','Java, Bali',2,'A private Java villa prepared for a considered island stay.',4000.00,2,1,'active','available','both',NULL,'2026-09-22 09:13:27','2026-09-25 18:56:36','15:00','11:00',26.98,57.34,'available'),(7,'Sumatra 101','sumatra-101','Sumatra, Bali',3,'A private Sumatra villa prepared for a considered island stay.',4500.00,2,1,'active','available','both',NULL,'2026-09-22 09:13:27','2026-09-25 18:56:52','15:00','11:00',40.59,58.87,'available'),(8,'Sumatra 102','sumatra-102','Sumatra, Bali',3,'A private Sumatra villa prepared for a considered island stay.',4500.00,2,1,'active','available','both',NULL,'2026-09-22 09:13:27','2026-09-25 18:56:56','15:00','11:00',69.25,58.14,'available'),(9,'Dining Pavilion','dining-pavilion','Tagurano',4,'Day tour dining pavilion with Infinity Pool.',5000.00,20,2,'active','available','both',NULL,'2026-09-22 09:13:27','2026-09-24 16:23:31','15:00','11:00',37.47,13.02,'available');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
