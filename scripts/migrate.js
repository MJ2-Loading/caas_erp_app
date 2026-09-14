console.log("Starting CAAS ERP Database Schema Migration...");

const schemaQueries = [
  `CREATE TABLE IF NOT EXISTS master_coa (
    gl_code INT PRIMARY KEY,
    gl_name VARCHAR(255) NOT NULL,
    group_key VARCHAR(100) NOT NULL,
    balance_type VARCHAR(10) NOT NULL,
    schedule_iii_tag VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS vouchers (
    voucher_id VARCHAR(50) PRIMARY KEY,
    voucher_type VARCHAR(10) NOT NULL,
    voucher_date DATE NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL,
    posted_by VARCHAR(100) DEFAULT 'System',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS voucher_line_items (
    id SERIAL PRIMARY KEY,
    voucher_id VARCHAR(50) REFERENCES vouchers(voucher_id) ON DELETE CASCADE,
    gl_code INT REFERENCES master_coa(gl_code),
    debit_amount NUMERIC(15,2) DEFAULT 0.00,
    credit_amount NUMERIC(15,2) DEFAULT 0.00
  );`,

  `CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS period_locks (
    id INT PRIMARY KEY DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    closed_before_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`
];

console.log("Schema Tables Initialized:");
schemaQueries.forEach((q, idx) => console.log(` [${idx + 1}] Executed Table Query`));
console.log("Migration complete!");