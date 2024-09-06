const { Pool } = require('pg');
require('dotenv').config(); 
const db = new Pool({
  connectionString: process.env.DATABASE_URL, 
});

exports.getAllCategories = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Category');
    res.render('categories', { categories: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Category WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      const category = result.rows[0];
      const items = await db.query('SELECT * FROM Item WHERE category_id = $1', [category.id]);
      res.render('category', { category, items: items.rows });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO Category (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await db.query(
      'UPDATE Category SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, req.params.id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM Category WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length > 0) {
      res.json({ message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};