
import mysql from "mysql2/promise";
import "dotenv/config";
import fs from "node:fs";

const local = await mysql.createConnection({
  host: process.env.LOCAL_DB_HOST || "localhost",
  user: process.env.LOCAL_DB_USER,
  password: process.env.LOCAL_DB_PASSWORD,
  database: "ecommerce_db",
});

const cloud = await mysql.createConnection({
  host: process.env.CLOUD_DB_HOST,
  port: Number(process.env.CLOUD_DB_PORT || 4000),
  user: process.env.CLOUD_DB_USER,
  password: process.env.CLOUD_DB_PASSWORD,
  database: "ecommerce_db",
  ssl: {
    ca: fs.readFileSync(process.env.CLOUD_DB_SSL_CA_PATH),
    rejectUnauthorized: true,
  },
});

try {
  const [tables] = await local.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'ecommerce_db'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  const [cloudTables] = await cloud.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'ecommerce_db'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  const cloudNames = new Set(
    cloudTables.map((table) => table.table_name)
  );

  const results = [];

  for (const { table_name } of tables) {
    if (!cloudNames.has(table_name)) {
      results.push({
        table: table_name,
        local: "exists",
        cloud: "missing",
        status: "MISMATCH",
      });
      continue;
    }

    const [localRows] = await local.query(
      `SELECT COUNT(*) AS total FROM \`${table_name}\``
    );

    const [cloudRows] = await cloud.query(
      `SELECT COUNT(*) AS total FROM \`${table_name}\``
    );

    const localCount = Number(localRows[0].total);
    const cloudCount = Number(cloudRows[0].total);

    results.push({
      table: table_name,
      local: localCount,
      cloud: cloudCount,
      status:
        localCount === cloudCount ? "MATCH" : "MISMATCH",
    });
  }

  for (const table of cloudTables) {
    if (!tables.some((item) => item.table_name === table.table_name)) {
      results.push({
        table: table.table_name,
        local: "missing",
        cloud: "exists",
        status: "MISMATCH",
      });
    }
  }

  console.table(results);

  const mismatches = results.filter(
    (item) => item.status === "MISMATCH"
  );

  console.log(`Tables checked: ${results.length}`);
  console.log(`Mismatches: ${mismatches.length}`);

  if (mismatches.length > 0) {
    process.exitCode = 1;
  } else {
    console.log("SUCCESS: All table row counts match!");
  }
} finally {
  await Promise.all([
    local.end(),
    cloud.end(),
  ]);
}
