const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database');

const SECRET = 'campuseats_secret_key';

// Middleware to check login
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Please login first' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// PLACE ORDER
router.post('/', authMiddleware, (req, res) => {
  const { items, total, delivery_location } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const order = db.prepare(
    'INSERT INTO orders (user_id, total, delivery_location, status) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, total, delivery_location || 'Campus', 'pending');

  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_name, price, quantity, emoji) VALUES (?, ?, ?, ?, ?)'
  );

  for (const item of items) {
    insertItem.run(order.lastInsertRowid, item.name, item.price, item.qty, item.emoji);
  }

  res.json({
    message: '🎉 Order placed successfully!',
    order_id: order.lastInsertRowid
  });
});

// GET all orders (for vendor and agent)
router.get('/all', authMiddleware, (req, res) => {
  const orders = db.prepare(
    'SELECT * FROM orders ORDER BY created_at DESC'
  ).all();

  const ordersWithItems = orders.map(order => {
    const items = db.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    ).all(order.id);
    return { ...order, items };
  });

  res.json(ordersWithItems);
});

// GET my orders (for customer)
router.get('/my', authMiddleware, (req, res) => {
  const orders = db.prepare(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);

  const ordersWithItems = orders.map(order => {
    const items = db.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    ).all(order.id);
    return { ...order, items };
  });

  res.json(ordersWithItems);
});

// GET single order
router.get('/:id', authMiddleware, (req, res) => {
  const order = db.prepare(
    'SELECT * FROM orders WHERE id = ?'
  ).get(req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  ).all(order.id);

  res.json({ ...order, items });
});

// UPDATE order status
router.patch('/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;

  const validStatuses = [
    'pending',
    'confirmed',
    'preparing',
    'on_the_way',
    'delivered',
    'rejected'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.prepare(
    'UPDATE orders SET status = ? WHERE id = ?'
  ).run(status, req.params.id);

  res.json({ message: 'Status updated!', status });
});

module.exports = router;