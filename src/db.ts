/**
 * Copyright (C) 2023 Sieve
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 **/
import { Database } from "sqlite3/mod.ts";
import {fs_file_exists, fs_write_utf8} from "nonstd/os/fs.ts"

const BASE_DIR = `${Deno.env.get("HOME")}/.config/ko-sync`;
const DB_PATH = `${BASE_DIR}/data.sqlite3`;
let _db: Database|undefined = undefined;

function db_init() {
    if (_db) return _db!;
    if (!fs_file_exists(DB_PATH)) fs_write_utf8(DB_PATH, '');
    _db = new Database(DB_PATH);
    const db = _db;
    db.exec("CREATE TABLE IF NOT EXISTS user(username TEXT UNIQUE, password TEXT);");
    db.exec("CREATE TABLE IF NOT EXISTS progress(username TEXT, document TEXT, percentage number, progress TEXT, device TEXT, device_id TEXT, timestamp number, UNIQUE(username, document));");
    return db;
}

function query(sql: string, ...xs: any): any[] {
    const db = db_init();
    return db.prepare(sql).values(...xs);
}

function exec(sql: string, ...xs: any) {
    const db = db_init();
    db.exec("BEGIN;");
    db.exec(sql, ...xs);
    db.exec("COMMIT;");
}

export function db_user_add(user: string, pass: string) {
    try {
        console.log(`${user}: ${pass}`);
        console.log(query("SELECT * FROM user WHERE username = ? AND password = ?", user, pass));
        console.log(query("SELECT * FROM user WHERE username = ?", user));
        exec("INSERT INTO user(username, password) VALUES(?, ?);", user, pass);
        return user;
    }
    catch (e) {
        console.log(e);
        if (e.message.startsWith('UNIQUE constraint')) return undefined;
        throw  e;
    }
}

export function db_user_auth(user: string, pass: string) {
    const xs = query("SELECT username FROM user WHERE username = ? AND password = ?", user, pass);
    if (xs.length) return user;
    return undefined;
}

export function db_update_progress(user: string, doc: string, percentage: number, progress: string, device: string, device_id: string, timestamp: number) {
    const xs = query("SELECT username, document FROM progress WHERE username = ? AND document = ?", user, doc);
    if (xs.length) {
        exec("UPDATE progress SET percentage = ?, progress = ?, device = ?, device_id = ?, timestamp = ? WHERE username = ? AND document = ?", percentage, progress, device, device_id, timestamp, user, doc);
    }
    else {
        exec("INSERT INTO progress(percentage, progress, device, device_id, timestamp, username, document) VALUES(?, ?, ?, ?, ?, ?, ?);", percentage, progress, device, device_id, timestamp, user, doc);
    }
}

export function db_get_progress(user: string, doc: string) {
    const xs = query("SELECT percentage, progress, device, device_id, timestamp FROM progress WHERE username = ? AND document = ?", user, doc);
    return xs[0];
}