const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all products
router.get('/', (req, res) => {
  const { category } = req.query;
  let products;

  if (category && category !== 'all') {
    products = db.prepare(
      'SELECT * FROM products WHERE category = ?'
    ).all(category);
  } else {
    products = db.prepare('SELECT * FROM products').all();
  }

  res.json(products);
});

// GET single product
router.get('/:id', (req, res) => {
  const product = db.prepare(
    'SELECT * FROM products WHERE id = ?'
  ).get(req.params.id);

  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

module.exports = router;