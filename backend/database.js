const Database = require('better-sqlite3');
const db = new Database('campuseats.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    emoji TEXT,
    category TEXT,
    vendor TEXT,
    rating REAL DEFAULT 4.5,
    delivery_time TEXT DEFAULT '10 min',
    badge TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL,
    status TEXT DEFAULT 'pending',
    delivery_location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_name TEXT,
    price REAL,
    quantity INTEGER,
    emoji TEXT
  );
`);

const count = db.prepare('SELECT COUNT(*) as c FROM products').get();
if (count.c === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, price, emoji, category, vendor, rating, delivery_time, badge)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const products = [
    ['Veg Thali',         30,  '🍛', 'food',       'Main Cafeteria', 4.8, '10 min', '50% OFF'],
    ['Chicken Biryani',   90,  '🍚', 'food',       'Main Cafeteria', 4.9, '15 min', 'HOT'],
    ['Veg Biryani',       79,  '🍚', 'food',       'Main Cafeteria', 4.7, '15 min', null],
    ['Dal Tadka + Rice',  55,  '🍲', 'food',       'Hostel Kitchen', 4.6, '12 min', null],
    ['Rajma Chawal',      60,  '🫘', 'food',       'Hostel Kitchen', 4.8, '10 min', null],
    ['Chole Bhature',     70,  '🥙', 'food',       'Main Cafeteria', 4.9, '12 min', null],
    ['Masala Dosa',       55,  '🥞', 'food',       'South Corner',   4.8, '10 min', null],
    ['Idli Sambar',       45,  '🍥', 'food',       'South Corner',   4.7, '8 min',  null],
    ['Veg Burger',        60,  '🍔', 'food',       'Campus Canteen', 4.4, '8 min',  'NEW'],
    ['Maggi Noodles',     30,  '🍜', 'food',       'Tea Stall',      4.9, '7 min',  'HOT'],
    ['Aloo Paratha',      50,  '🫓', 'food',       'Hostel Kitchen', 4.8, '10 min', null],
    ['Pav Bhaji',         55,  '🍛', 'food',       'Main Cafeteria', 4.6, '10 min', null],
    ['Masala Chai',       15,  '☕', 'beverage',   'Tea Stall',      4.9, '3 min',  null],
    ['Cold Coffee',       40,  '🥤', 'beverage',   'Campus Canteen', 4.7, '5 min',  null],
    ['Mango Juice',       25,  '🧃', 'beverage',   'Tea Stall',      4.5, '2 min',  'COMBO'],
    ['Sweet Lassi',       30,  '🥛', 'beverage',   'Main Cafeteria', 4.8, '3 min',  'NEW'],
    ['Nimbu Pani',        15,  '🍋', 'beverage',   'Tea Stall',      4.6, '2 min',  null],
    ['Hot Chocolate',     45,  '🍫', 'beverage',   'Campus Canteen', 4.7, '5 min',  null],
    ['Protein Shake',     80,  '💪', 'beverage',   'Gym Cafe',       4.6, '5 min',  'NEW'],
    ['Samosa',            20,  '🥨', 'snack',      'Main Cafeteria', 4.8, '5 min',  'HOT'],
    ['Vada Pav',          15,  '🥖', 'snack',      'Main Cafeteria', 4.9, '5 min',  'HOT'],
    ['Masala Popcorn',    20,  '🍿', 'snack',      'Campus Canteen', 4.6, '2 min',  null],
    ['Bhel Puri',         25,  '🥗', 'snack',      'Main Cafeteria', 4.7, '5 min',  null],
    ['Chips Pack',        20,  '🥔', 'snack',      'Campus Store',   4.3, '1 min',  null],
    ['Biscuit Pack',      10,  '🍪', 'snack',      'Campus Store',   4.2, '1 min',  null],
    ['Chocolate Bar',     30,  '🍫', 'snack',      'Campus Store',   4.5, '1 min',  null],
    ['A4 Notebook',       40,  '📝', 'stationery', 'Campus Store',   4.5, '5 min',  null],
    ['Pen Set',           30,  '🖊️','stationery',  'Campus Store',   4.3, '5 min',  null],
    ['Highlighter Set',   45,  '🖍️','stationery',  'Campus Store',   4.6, '5 min',  'NEW'],
    ['Sticky Notes',      25,  '🗒️','stationery',  'Campus Store',   4.4, '5 min',  null],
    ['Geometry Box',      80,  '📐', 'stationery', 'Campus Store',   4.5, '5 min',  null],
    ['Milk Packet',       25,  '🥛', 'grocery',    'Campus Store',   4.4, '5 min',  null],
    ['Bread Loaf',        35,  '🍞', 'grocery',    'Campus Store',   4.3, '5 min',  null],
    ['Eggs (6 pcs)',      45,  '🥚', 'grocery',    'Campus Store',   4.5, '5 min',  null],
    ['Instant Noodles',   15,  '🍜', 'grocery',    'Campus Store',   4.2, '3 min',  null],
    ['Paracetamol Strip', 15,  '💊', 'medicine',   'Medical Store',  4.8, '5 min',  null],
    ['Bandage Pack',      25,  '🩹', 'medicine',   'Medical Store',  4.6, '5 min',  null],
    ['Hand Sanitizer',    50,  '🧴', 'hygiene',    'Campus Store',   4.7, '5 min',  null],
    ['Toothpaste',        45,  '🪥', 'hygiene',    'Campus Store',   4.5, '5 min',  null],
    ['Soap Bar',          35,  '🧼', 'hygiene',    'Campus Store',   4.4, '5 min',  null],
  ];

  for (const p of products) insert.run(...p);
  console.log('✅ Products seeded!');
}

module.exports = db;