#!/usr/bin/env bash
# =====================================================
# restore.sh
# Restores the ecommerce_db database from a .sql backup
# file produced by backup.sh
#
# Usage:
#   ./restore.sh <backup_file.sql> [db_user] [db_host]
#
# Environment variable MYSQL_PWD can be set beforehand
# to avoid an interactive password prompt:
#   export MYSQL_PWD='yourpassword'
# =====================================================

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 <backup_file.sql> [db_user] [db_host]"
    exit 1
fi

BACKUP_FILE="$1"
DB_USER="${2:-root}"
DB_HOST="${3:-localhost}"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: backup file '${BACKUP_FILE}' not found."
    exit 1
fi

read -p "This will overwrite the current ecommerce_db database. Continue? (y/N) " CONFIRM
if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
    echo "Restore cancelled."
    exit 0
fi

echo "Restoring database from '${BACKUP_FILE}' as user '${DB_USER}' on host '${DB_HOST}'..."

mysql \
  --user="${DB_USER}" \
  --host="${DB_HOST}" < "${BACKUP_FILE}"

echo "Restore complete."
