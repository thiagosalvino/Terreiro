import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';

// Usa a variável de ambiente DB_PATH se existir (para Render/Railway com discos persistentes), 
// caso contrário, usa o arquivo local 'database.sqlite'
const dbPath = process.env.DB_PATH || 'database.sqlite';
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    active INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS orixas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    active INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    full_name TEXT NOT NULL,
    social_name TEXT,
    birth_date TEXT,
    cpf TEXT,
    phone TEXT,
    email TEXT,
    zip_code TEXT,
    address TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    entry_date TEXT,
    role_id INTEGER,
    orixa1_id INTEGER,
    orixa2_id INTEGER,
    orixa3_id INTEGER,
    participation TEXT,
    active INTEGER DEFAULT 1,
    inactive_date TEXT,
    created_at TEXT,
    updated_at TEXT,
    created_by TEXT,
    updated_by TEXT,
    FOREIGN KEY(role_id) REFERENCES roles(id),
    FOREIGN KEY(orixa1_id) REFERENCES orixas(id),
    FOREIGN KEY(orixa2_id) REFERENCES orixas(id),
    FOREIGN KEY(orixa3_id) REFERENCES orixas(id)
  );
`);

const addColumn = (table: string, column: string, type: string) => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  } catch (e) {
    // Column might already exist
  }
};

addColumn('people', 'created_at', 'TEXT');
addColumn('people', 'updated_at', 'TEXT');
addColumn('people', 'created_by', 'TEXT');
addColumn('people', 'updated_by', 'TEXT');
addColumn('people', 'neighborhood', 'TEXT');

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/roles', (req, res) => {
    const roles = db.prepare('SELECT * FROM roles').all();
    res.json(roles);
  });

  app.post('/api/roles', (req, res) => {
    const { name, active } = req.body;
    const info = db.prepare('INSERT INTO roles (name, active) VALUES (?, ?)').run(name, active ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/roles/:id', (req, res) => {
    const { name, active } = req.body;
    db.prepare('UPDATE roles SET name = ?, active = ? WHERE id = ?').run(name, active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.get('/api/orixas', (req, res) => {
    const orixas = db.prepare('SELECT * FROM orixas').all();
    res.json(orixas);
  });

  app.post('/api/orixas', (req, res) => {
    const { name, active } = req.body;
    const info = db.prepare('INSERT INTO orixas (name, active) VALUES (?, ?)').run(name, active ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/orixas/:id', (req, res) => {
    const { name, active } = req.body;
    db.prepare('UPDATE orixas SET name = ?, active = ? WHERE id = ?').run(name, active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.get('/api/people', (req, res) => {
    const people = db.prepare('SELECT * FROM people').all();
    res.json(people);
  });

  app.post('/api/people', (req, res) => {
    const p = req.body;
    
    // Check for duplicate CPF
    if (p.cpf) {
      const existing = db.prepare('SELECT id FROM people WHERE cpf = ?').get(p.cpf);
      if (existing) {
        return res.status(400).json({ error: 'Este CPF já está cadastrado no sistema.' });
      }
    }

    const now = new Date().toISOString();
    const user = 'Admin'; // Mocked user
    const info = db.prepare(`
      INSERT INTO people (
        type, full_name, social_name, birth_date, cpf, phone, email,
        zip_code, address, number, complement, neighborhood, city, state,
        entry_date, role_id, orixa1_id, orixa2_id, orixa3_id, participation, active, inactive_date,
        created_at, updated_at, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      p.type, p.full_name, p.social_name, p.birth_date, p.cpf, p.phone, p.email,
      p.zip_code, p.address, p.number, p.complement, p.neighborhood, p.city, p.state,
      p.entry_date, p.role_id, p.orixa1_id, p.orixa2_id, p.orixa3_id, p.participation, p.active ? 1 : 0, p.inactive_date,
      now, now, user, user
    );
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/people/:id', (req, res) => {
    const p = req.body;
    
    // Check for duplicate CPF (excluding the current person)
    if (p.cpf) {
      const existing = db.prepare('SELECT id FROM people WHERE cpf = ? AND id != ?').get(p.cpf, req.params.id);
      if (existing) {
        return res.status(400).json({ error: 'Este CPF já está cadastrado no sistema.' });
      }
    }

    const now = new Date().toISOString();
    const user = 'Admin'; // Mocked user
    db.prepare(`
      UPDATE people SET
        type = ?, full_name = ?, social_name = ?, birth_date = ?, cpf = ?, phone = ?, email = ?,
        zip_code = ?, address = ?, number = ?, complement = ?, neighborhood = ?, city = ?, state = ?,
        entry_date = ?, role_id = ?, orixa1_id = ?, orixa2_id = ?, orixa3_id = ?, participation = ?, active = ?, inactive_date = ?,
        updated_at = ?, updated_by = ?
      WHERE id = ?
    `).run(
      p.type, p.full_name, p.social_name, p.birth_date, p.cpf, p.phone, p.email,
      p.zip_code, p.address, p.number, p.complement, p.neighborhood, p.city, p.state,
      p.entry_date, p.role_id, p.orixa1_id, p.orixa2_id, p.orixa3_id, p.participation, p.active ? 1 : 0, p.inactive_date,
      now, user,
      req.params.id
    );
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
