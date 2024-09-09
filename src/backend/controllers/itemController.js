const { Pool } = require('pg');
require('dotenv').config();
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

exports.getAllItems = async (req, res) => {
  try {
    const itemsResult = await db.query('SELECT * FROM Item ORDER BY id ASC');
    const categoriesResult = await db.query('SELECT * FROM Category'); 
    const suppliersResult = await db.query('SELECT * FROM Supplier');
    res.render('items', { items: itemsResult.rows, categories: categoriesResult.rows, suppliers: suppliersResult.rows }); 
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

      const supplyPriceResult = await db.query('SELECT supply_price FROM Item_Supplier WHERE item_id = $1', [item.id]);
      const supply_price = supplyPriceResult.rows.length > 0 ? supplyPriceResult.rows[0].supply_price : '';

      const categoriesResult = await db.query('SELECT * FROM Category');
      const categories = categoriesResult.rows;

      res.render('item', { item, category, suppliers, categories, supply_price });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createItem = async (req, res) => {
  const { name, description, price, category_id, supplier_id, supply_price, stock, brand, model } = req.body;
  try {

      const itemResult = await db.query(
          'INSERT INTO Item (name, description, price, category_id, stock, brand, model) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [name, description, price, category_id, stock, brand, model]
      );

      const newItem = itemResult.rows[0];

      await db.query(
          'INSERT INTO Item_Supplier (item_id, supplier_id, supply_price) VALUES ($1, $2, $3)',
          [newItem.id, supplier_id, supply_price]
      );

      res.redirect('/items');
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  const { name, description, price, stock, brand, model, category_id, supplier_id, supply_price } = req.body;
  try {
      const result = await db.query(
          'UPDATE Item SET name = $1, description = $2, price = $3, stock = $4, brand = $5, model = $6, category_id = $7,updated_at = NOW() WHERE id = $8 RETURNING *',
          [name, description, price, stock, brand, model, category_id, req.params.id]
      );  

      if (result.rows.length > 0) {
        // Kiểm tra xem bản ghi đã tồn tại trong Item_Supplier chưa
        const supplierCheck = await db.query(
            'SELECT * FROM Item_Supplier WHERE item_id = $1 AND supplier_id = $2',
            [req.params.id, supplier_id]
        );

        if (supplierCheck.rows.length > 0) {
            // Nếu đã tồn tại, cập nhật bản ghi
            await db.query(
                'UPDATE Item_Supplier SET supply_price = $1 WHERE item_id = $2 AND supplier_id = $3',
                [supply_price, req.params.id, supplier_id]
            );
        } else {
            // Nếu chưa tồn tại, chèn bản ghi mới
            await db.query(
                'INSERT INTO Item_Supplier (item_id, supplier_id, supply_price) VALUES ($1, $2, $3)',
                [req.params.id, supplier_id, supply_price]
            );
        }
        res.redirect('/items');
      } else {
          res.status(404).json({ message: 'Item not found' });
      }
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};


exports.editItem = async (req, res) => {
  try {
    const itemResult = await db.query('SELECT * FROM Item WHERE id = $1', [req.params.id]);
    const categoriesResult = await db.query('SELECT * FROM Category');
    const suppliersResult = await db.query('SELECT * FROM Supplier');

    if (itemResult.rows.length > 0) {
        const item = itemResult.rows[0];
        const categoryResult = await db.query('SELECT * FROM Category WHERE id = $1', [item.category_id]);
        const category = categoryResult.rows[0];
        res.render('item', { item, category, categories: categoriesResult.rows, suppliers: suppliersResult.rows });
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
      res.redirect('/items');
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
