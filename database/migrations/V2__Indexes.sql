-- =====================================================
-- V2__Indexes.sql
-- Migration: adds performance indexes across all tables
-- =====================================================

SOURCE ../indexes/authentication_indexes.sql;
SOURCE ../indexes/catalog_indexes.sql;
SOURCE ../indexes/shopping_indexes.sql;
SOURCE ../indexes/order_indexes.sql;
SOURCE ../indexes/review_indexes.sql;
