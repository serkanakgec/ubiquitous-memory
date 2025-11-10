require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const DB_PATH = process.env.NODE_ENV === 'test' ? ':memory:' : (process.env.DB_PATH || './prod.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) { console.error("Error opening database", err.message); return; }
    console.log(`Connected to the database at ${DB_PATH}`);
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, full_name TEXT, wallet_address TEXT UNIQUE NOT NULL, is_admin INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
        db.run(`CREATE TABLE IF NOT EXISTS tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, symbol TEXT UNIQUE NOT NULL, name TEXT NOT NULL, price REAL NOT NULL)`);
        db.run(`CREATE TABLE IF NOT EXISTS balances (user_id INTEGER NOT NULL, token_id INTEGER NOT NULL, amount REAL DEFAULT 0, PRIMARY KEY (user_id, token_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (token_id) REFERENCES tokens(id))`);
        db.run(`CREATE TABLE IF NOT EXISTS transfers (id INTEGER PRIMARY KEY AUTOINCREMENT, from_user_id INTEGER NOT NULL, to_user_id INTEGER NOT NULL, token_id INTEGER NOT NULL, amount REAL NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (from_user_id) REFERENCES users(id), FOREIGN KEY (to_user_id) REFERENCES users(id), FOREIGN KEY (token_id) REFERENCES tokens(id))`);

        const tokens = [{ symbol: 'BTC', name: 'Bitcoin', price: 60000.00 }, { symbol: 'ETH', name: 'Ethereum', price: 3000.00 }];
        const stmt = db.prepare("INSERT OR IGNORE INTO tokens (symbol, name, price) VALUES (?, ?, ?)");
        tokens.forEach(t => stmt.run(t.symbol, t.name, t.price));
        stmt.finalize();
    });
});

app.use(bodyParser.json());

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized.' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-and-long-jwt-secret-key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden: Invalid token.' });
        req.user = user;
        next();
    });
};

const adminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    next();
};

app.post('/api/auth/register', async (req, res) => {
    const { email, password, fullName, isAdmin = 0 } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const walletAddress = crypto.randomBytes(16).toString('hex');
        const sql = `INSERT INTO users (email, password_hash, full_name, wallet_address, is_admin) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [email, hashedPassword, fullName, walletAddress, isAdmin], function(err) {
            if (err) return res.status(500).json({ error: 'Database error.', details: err.message });
            db.get(`SELECT id, email, full_name, wallet_address, is_admin FROM users WHERE id = ?`, [this.lastID], (err, row) => {
                if (err) return res.status(500).json({ error: 'Failed to retrieve user.' });
                res.status(201).json(row);
            });
        });
    } catch (error) { res.status(500).json({ error: 'Server error.' }); }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const accessToken = jwt.sign({ id: user.id, email: user.email, isAdmin: user.is_admin === 1 }, process.env.JWT_SECRET || 'your-super-secret-and-long-jwt-secret-key', { expiresIn: '1h' });
        res.json({ accessToken });
    });
});

app.post('/api/transfer', authMiddleware, (req, res) => {
    const { to_wallet_address, token_symbol, amount } = req.body;
    const from_user_id = req.user.id;
    if (!to_wallet_address || !token_symbol || !amount || amount <= 0) return res.status(400).json({ error: 'Recipient, token, and a positive amount are required.' });

    db.get("SELECT id as token_id FROM tokens WHERE symbol = ?", [token_symbol], (err, token) => {
        if (err || !token) return res.status(404).json({ error: 'Token not found.' });
        db.get("SELECT id as to_user_id FROM users WHERE wallet_address = ?", [to_wallet_address], (err, recipient) => {
            if (err || !recipient) return res.status(404).json({ error: 'Recipient not found.' });
            if (recipient.to_user_id === from_user_id) return res.status(400).json({ error: 'Cannot transfer to yourself.' });

            db.get("SELECT amount FROM balances WHERE user_id = ? AND token_id = ?", [from_user_id, token.token_id], (err, balance) => {
                if (err || !balance || balance.amount < amount) return res.status(400).json({ error: 'Insufficient funds.' });

                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");
                    db.run("UPDATE balances SET amount = amount - ? WHERE user_id = ? AND token_id = ?", [amount, from_user_id, token.token_id]);
                    db.run(`INSERT INTO balances (user_id, token_id, amount) VALUES (?, ?, ?) ON CONFLICT(user_id, token_id) DO UPDATE SET amount = amount + excluded.amount`, [recipient.to_user_id, token.token_id, amount]);
                    db.run(`INSERT INTO transfers (from_user_id, to_user_id, token_id, amount) VALUES (?, ?, ?, ?)`, [from_user_id, recipient.to_user_id, token.token_id, amount]);
                    db.run("COMMIT", (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            return res.status(500).json({ error: 'Transfer commit failed.' });
                        }
                        res.status(200).json({ message: 'Transfer successful.' });
                    });
                });
            });
        });
    });
});

app.get('/api/tokens', (req, res) => {
    db.all("SELECT * FROM tokens", [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        res.json(rows);
    });
});

app.post('/api/admin/users/:id/topup', authMiddleware, adminMiddleware, (req, res) => {
    const { id: userId } = req.params;
    const { tokenSymbol, amount } = req.body;
    if (!tokenSymbol || !amount || amount <= 0) return res.status(400).json({ error: 'Token symbol and a positive amount are required.' });
    db.get("SELECT id FROM tokens WHERE symbol = ?", [tokenSymbol], (err, token) => {
        if (err || !token) return res.status(404).json({ error: 'Token not found.' });
        const sql = `INSERT INTO balances (user_id, token_id, amount) VALUES (?, ?, ?) ON CONFLICT(user_id, token_id) DO UPDATE SET amount = amount + excluded.amount`;
        db.run(sql, [userId, token.id, amount], (err) => {
            if (err) return res.status(500).json({ error: 'Database error during top-up.' });
            res.status(200).json({ message: 'Top-up successful.' });
        });
    });
});

module.exports = { app, db };

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}
