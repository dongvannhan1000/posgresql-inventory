const { Pool } = require('pg');
require('dotenv').config();
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

exports.getAllSuppliers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Supplier');
    res.render('suppliers', { suppliers: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Supplier WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      const supplier = result.rows[0];

      // Lấy thông tin Items
      const itemsResult = await db.query('SELECT * FROM Item WHERE id IN (SELECT item_id FROM Item_Supplier WHERE supplier_id = $1)', [supplier.id]);
      const items = itemsResult.rows;

      // Lấy thông tin Categories cho các Items
      const categories = await Promise.all(items.map(async (item) => {
        const categoryResult = await db.query('SELECT * FROM Category WHERE id = $1', [item.category_id]);
        return categoryResult.rows[0];
      }));

      res.render('supplier', { supplier, items, categories });
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  const { name, contact_info, address } = req.body;
  try {
      const result = await db.query(
          'INSERT INTO Supplier (name, contact_info, address) VALUES ($1, $2, $3) RETURNING *',
          [name, contact_info, address]
      );
      res.redirect('/suppliers'); 
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  const { name, contactInfo } = req.body;
  try {
    const result = await db.query(
      'UPDATE Supplier SET name = $1, contact_info = $2 WHERE id = $3 RETURNING *',
      [name, contactInfo, req.params.id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    // Xóa tất cả các sản phẩm liên quan đến Supplier
    await db.query('DELETE FROM Item_Supplier WHERE supplier_id = $1', [req.params.id]);
    
    // Xóa Supplier
    const result = await db.query('DELETE FROM Supplier WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length > 0) {
      res.redirect('/suppliers');
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSupplierItems = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM Item WHERE supplier_id = $1', [id]);
    res.render('items', { items: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};