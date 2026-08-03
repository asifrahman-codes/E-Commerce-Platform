-- ===================================================
-- Project : E-Commerce Platform
-- File    : 01_database.sql
-- Author  : Asif Rahman
-- Purpose : Create database
-- ===================================================

DROP DATABASE IF EXISTS ecommerce_db;

CREATE DATABASE ecommerce_db

CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ecommerce_db;

SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

SET time_zone = '+00:00';

SET default_storage_engine = InnoDB;

SHOW DATABASES;

USE ecommerce_db;

SELECT DATABASE();