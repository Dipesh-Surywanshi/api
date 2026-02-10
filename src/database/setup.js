const pool = require('./db');

const setupDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('🔧 Setting up database...');


    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Clients table created');


    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        client_id INTEGER UNIQUE NOT NULL REFERENCES clients(id),
        balance DECIMAL(15, 2) DEFAULT 0.00 CHECK (balance >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Wallets table created');


    await client.query(`
      CREATE TABLE IF NOT EXISTS ledger (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('CREDIT', 'DEBIT', 'ORDER')),
        amount DECIMAL(15, 2) NOT NULL,
        balance_after DECIMAL(15, 2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Ledger table created');


    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        amount DECIMAL(15, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
        fulfillment_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Orders table created');


    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ledger_client_id ON ledger(client_id);
      CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
    `);
    console.log('✅ Indexes created');


    await client.query(`
      INSERT INTO clients (id, name) VALUES 
        (1, 'Test Client 1'),
        (2, 'Test Client 2')
      ON CONFLICT (id) DO NOTHING;
    `);


    await client.query(`
      INSERT INTO wallets (client_id, balance) VALUES 
        (1, 1000.00),
        (2, 500.00)
      ON CONFLICT (client_id) DO NOTHING;
    `);
    console.log('✅ Sample data inserted');

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

setupDatabase().catch(err => {
  console.error('Failed to setup database:', err);
  process.exit(1);
});