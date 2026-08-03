#!/usr/bin/env bash
# =====================================================
# backup.sh
# Dumps the ecommerce_db database to a timestamped
# .sql file in this directory.
#
# Usage:
#   ./backup.sh [db_user] [db_host]
#
# Environment variable MYSQL_PWD can be set beforehand
# to avoid an interactive password prompt:
#   export MYSQL_PWD='yourpassword'
# =====================================================

set -euo pipefail

DB_NAME="ecommerce_db"
DB_USER="${1:-root}"
DB_HOST="${2:-localhost}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${SCRIPT_DIR}/${DB_NAME}_backup_${TIMESTAMP}.sql"

echo "Backing up database '${DB_NAME}' as user '${DB_USER}' on host '${DB_HOST}'..."

mysqldump \
  --user="${DB_USER}" \
  --host="${DB_HOST}" \
  --routines \
  --triggers \
  --single-transaction \
  --databases "${DB_NAME}" > "${BACKUP_FILE}"

echo "Backup complete: ${BACKUP_FILE}"

# Keep only the 10 most recent backups
ls -1t "${SCRIPT_DIR}"/${DB_NAME}_backup_*.sql 2>/dev/null | tail -n +11 | xargs -r rm --

echo "Old backups pruned (keeping the 10 most recent)."
