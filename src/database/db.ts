import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { IDatabase } from './db-interface';

const localAppData = process.env.LOCALAPPDATA;
const dbPath = path.join(localAppData || os.homedir(), 'Almaden', 'relay-db.sqlite');

function rowsFromStatement(stmt: any) {
  const rows: any[] = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

class SqlJsDatabase implements IDatabase {
  private SQL: any = null;
  private db: any = null;
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async init() {
    if (this.SQL) return; // Only initialize SQL.js library once
    const SQLlib = await initSqlJs({ locateFile: (file: string) => require.resolve('sql.js/dist/sql-wasm.wasm') });
    this.SQL = SQLlib;
    this.reloadDatabase();
  }

  private reloadDatabase() {
    // Close existing database if open
    if (this.db) {
      try {
        this.db.close();
      } catch (_) {}
    }
    
    // Reload database from file to get fresh data
    const fileBuffer = fs.readFileSync(this.filePath);
    this.db = new this.SQL.Database(new Uint8Array(fileBuffer));
  }

  isAvailable(): boolean {
    return this.db !== null;
  }

  queryAll<T = any>(sql: string, params?: any[]): T[] {
    if (!this.db) throw new Error('Database not initialized');
    
    // Reload database to get latest data from file
    this.reloadDatabase();
    
    const stmt = this.db.prepare(sql);
    if (params && params.length) stmt.bind(params);
    return rowsFromStatement(stmt) as T[];
  }

  close() {
    if (this.db) {
      try {
        this.db.close();
      } catch (_) {}
      this.db = null;
    }
  }
}

export const dbClient: IDatabase = new SqlJsDatabase(dbPath);
