const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
  try {
    // Tạo bảng Category
    await db.query(`
      CREATE TABLE IF NOT EXISTS Category (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      )
    `);

    // Tạo bảng Item
    await db.query(`
      CREATE TABLE IF NOT EXISTS Item (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES Category(id) ON DELETE SET NULL,
        price DECIMAL(10, 2) CHECK (price >= 0),
        stock INTEGER CHECK (stock >= 0),
        brand VARCHAR(100),
        model VARCHAR(100)
      )
    `);

    // Tạo bảng Supplier
    await db.query(`
      CREATE TABLE IF NOT EXISTS Supplier (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        contact_info VARCHAR(255) NOT NULL,
        address TEXT
      )
    `);

    // Tạo bảng Item_Supplier
    await db.query(`
      CREATE TABLE IF NOT EXISTS Item_Supplier (
        item_id INTEGER REFERENCES Item(id) ON DELETE CASCADE,
        supplier_id INTEGER REFERENCES Supplier(id) ON DELETE CASCADE,
        supply_price DECIMAL(10, 2) CHECK (supply_price >= 0),
        PRIMARY KEY (item_id, supplier_id)
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await db.end();
  }
}

initializeDatabase();