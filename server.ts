import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-seguro';

// Usa a variável de ambiente DB_PATH se existir (para Render/Railway com discos persistentes), 
// caso contrário, usa o arquivo local 'database.sqlite'
const dbPath = process.env.DB_PATH || 'database.sqlite';
console.log(`Iniciando banco de dados em: ${path.resolve(dbPath)}`);

let db: Database.Database;
try {
  db = new Database(dbPath);
  console.log('Banco de dados conectado com sucesso.');
} catch (error) {
  console.error('Erro ao conectar ao banco de dados:', error);
  process.exit(1);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  );
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

// Seed admin user
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
const adminPassword = '135792468admin';
const hashedAdminPassword = bcrypt.hashSync(adminPassword, 10);

if (!adminExists) {
  db.prepare('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)').run('admin', hashedAdminPassword, 'Administrador', 'admin');
} else {
  // Update existing admin password to the new one
  db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hashedAdminPassword, 'admin');
}

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // Auth Route
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      return res.status(401).json({ error: 'Este usuário não existe ou não está cadastrado no sistema' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const token = jwt.sign({ 
      id: user.id, 
      username: user.username, 
      role: user.role, 
      full_name: user.full_name 
    }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        full_name: user.full_name 
      } 
    });
  });

  // API Routes
  app.get('/api/roles', authenticateToken, (req, res) => {
    const roles = db.prepare('SELECT * FROM roles').all();
    res.json(roles);
  });

  app.post('/api/roles', authenticateToken, (req, res) => {
    const { name, active } = req.body;
    const info = db.prepare('INSERT INTO roles (name, active) VALUES (?, ?)').run(name, active ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/roles/:id', authenticateToken, (req, res) => {
    const { name, active } = req.body;
    db.prepare('UPDATE roles SET name = ?, active = ? WHERE id = ?').run(name, active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/roles/:id', authenticateToken, (req, res) => {
    try {
      db.prepare('DELETE FROM roles WHERE id = ?').run(Number(req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: 'Não é possível excluir este cargo pois existem pessoas vinculadas a ele.' });
    }
  });

  app.get('/api/orixas', authenticateToken, (req, res) => {
    const orixas = db.prepare('SELECT * FROM orixas').all();
    res.json(orixas);
  });

  app.post('/api/orixas', authenticateToken, (req, res) => {
    const { name, active } = req.body;
    const info = db.prepare('INSERT INTO orixas (name, active) VALUES (?, ?)').run(name, active ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/orixas/:id', authenticateToken, (req, res) => {
    const { name, active } = req.body;
    db.prepare('UPDATE orixas SET name = ?, active = ? WHERE id = ?').run(name, active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/orixas/:id', authenticateToken, (req, res) => {
    try {
      db.prepare('DELETE FROM orixas WHERE id = ?').run(Number(req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: 'Não é possível excluir este orixá pois existem pessoas vinculadas a ele.' });
    }
  });

  app.get('/api/people', authenticateToken, (req, res) => {
    const people = db.prepare('SELECT * FROM people').all();
    res.json(people);
  });

  app.post('/api/people', authenticateToken, (req, res) => {
    const p = req.body;
    
    // Check for duplicate CPF
    if (p.cpf) {
      const existing = db.prepare('SELECT id FROM people WHERE cpf = ?').get(p.cpf);
      if (existing) {
        return res.status(400).json({ error: 'Este CPF já está cadastrado no sistema.' });
      }
    }

    const now = new Date().toISOString();
    const user = (req as any).user.full_name;
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

  app.put('/api/people/:id', authenticateToken, (req, res) => {
    const p = req.body;
    
    // Check for duplicate CPF (excluding the current person)
    if (p.cpf) {
      const existing = db.prepare('SELECT id FROM people WHERE cpf = ? AND id != ?').get(p.cpf, req.params.id);
      if (existing) {
        return res.status(400).json({ error: 'Este CPF já está cadastrado no sistema.' });
      }
    }

    const now = new Date().toISOString();
    const user = (req as any).user.full_name;
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

  app.delete('/api/people/:id', authenticateToken, (req, res) => {
    try {
      db.prepare('DELETE FROM people WHERE id = ?').run(Number(req.params.id));
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: 'Erro ao excluir pessoa.' });
    }
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
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
