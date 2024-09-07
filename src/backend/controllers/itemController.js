const { Pool } = require('pg');
require('dotenv').config();
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

exports.getAllItems = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Item');
    res.render('items', { items: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Item WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      const item = result.rows[0];

      // Lấy thông tin Category
      const categoryResult = await db.query('SELECT * FROM Category WHERE id = $1', [item.category_id]);
      const category = categoryResult.rows[0];

      // Lấy thông tin Suppliers
      const suppliersResult = await db.query('SELECT * FROM Supplier WHERE id IN (SELECT supplier_id FROM Item_Supplier WHERE item_id = $1)', [item.id]);
      const suppliers = suppliersResult.rows;

      res.render('item', { item, category, suppliers });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createItem = async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO Item (name, description, price) VALUES ($1, $2, $3) RETURNING *',
      [name, description, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const result = await db.query(
      'UPDATE Item SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING *',
      [name, description, price, req.params.id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM Item WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length > 0) {
      res.json({ message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getItemsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const result = await db.query('SELECT * FROM Item WHERE category_id = $1', [categoryId]);
    res.render('items', { items: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};