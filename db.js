import Database from 'better-sqlite3';

const db = new Database('data.db');

db.pragma('journal_mode = WAL');
\export { db };

export function run(sql, params = []) {
  return db.prepare(sql).run(...params);
}
export function get(sql, params = []) {
  return db.prepare(sql).get(...params);
}
export function all(sql, params = []) {
  return db.prepare(sql).all(...params);
}
