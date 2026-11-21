SET @token_version_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'token_version'
);

SET @token_version_ddl = IF(
    @token_version_column_exists = 0,
    'ALTER TABLE users ADD COLUMN token_version INT UNSIGNED NOT NULL DEFAULT 0',
    'SELECT 1'
);

PREPARE token_version_statement FROM @token_version_ddl;
EXECUTE token_version_statement;
DEALLOCATE PREPARE token_version_statement;
