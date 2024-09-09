const { Pool } = require('pg');
require('dotenv').config();
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.getHome = async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM Category');
    const items = await db.query('SELECT * FROM Item');
    const suppliers = await db.query('SELECT * FROM Supplier');
    res.render('home', { categories: categories.rows, items: items.rows, suppliers: suppliers.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};