import bcrypt from 'bcrypt';
import { db, run, get, all } from './db.js';
import fs from 'fs';

const schema = fs.readFileSync('./schema.sql', 'utf8');

db.exec(schema);

async function up() {
  const saltRounds = 12;

  const users = [
    { username: 'kuwait', display_name: 'Kuwait', password: 'Kuwait', role: 'user' },
    { username: 'trent',  display_name: 'Trent',  password: 'Trent',  role: 'user' },
    // you can add yourself as admin by uncommenting:
    // { username: 'admin', display_name: 'Coach', password: 'Admin123!', role: 'admin' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, saltRounds);
    await run(
      `INSERT OR IGNORE INTO users (username, display_name, password_hash, role) VALUES (?,?,?,?)`,
      [u.username.toLowerCase(), u.display_name, hash, u.role]
    );
  }

  // attach basic coaching profiles
  const rows = await all(`SELECT id, username FROM users`);
  for (const row of rows) {
    await run(
      `INSERT OR IGNORE INTO coaching_profiles (user_id, rank, focus_areas, availability, notes)
       VALUES (?,?,?,?,?)`,
      [row.id, 'Champ 2', JSON.stringify(['recovery mechanics','air consistency','flick consistency']), 'Evenings CST', 'Circle rule for 2s emphasized.']
    );

    // sample sessions
    await run(
      `INSERT INTO sessions (user_id, coach, start_utc, duration_min, topic, summary)
       VALUES (?,?,?,?,?,?)`,
      [row.id, 'Coach Bushi', new Date(Date.now()+86400000).toISOString(), 60, 'Recovery & Aerial Control', 'Drill ladder: recoveries → wall touches → air dribble first touch.']
    );

    // sample progress logs
    await run(
      `INSERT INTO progress_logs (user_id, category, metric, value, note)
       VALUES (?,?,?, ?, ?)`,
      [row.id, 'mechanics', 'air dribble success %', 42, 'Baseline set from freeplay drill set A.']
    );
  }

  console.log('Seed complete. Users: Kuwait / Trent (passwords match names).');
  process.exit(0);
}

up();
