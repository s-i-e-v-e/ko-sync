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
import {http_serve, Resource} from "nonstd/os/http.ts"
import {db_get_progress, db_update_progress, db_user_add, db_user_auth} from "./db.ts";
import {error_unauthorized_user, error_user_exists, SyncResponse} from "./errors.ts";

const println = console.log;

function health_check() {
    return {status: 200, state: 'OK' };
}

function get_creds(map: Record<string, Resource>, re: Request) {
    const user = re.headers.get('x-auth-user') || map.data.username || '';
    const pass = re.headers.get('x-auth-key') || map.data.password || '';
    return {user: user, pass: pass};
}

function create_user(map: Record<string, Resource>, re: Request): SyncResponse {
    const c = get_creds(map, re);
    const x = db_user_add(c.user, c.pass);
    if (x) {
        return { status: 201, username: x};
    }
    else {
        return error_user_exists;
    }
}

function auth_user(map: Record<string, Resource>, re: Request): SyncResponse {
    const c = get_creds(map, re);
    const x = db_user_auth(c.user, c.pass);
    if (x) {
        return { status: 200, authorized: 'OK'};
    }
    else {
        return error_unauthorized_user;
    }
}

function update_progress(map: Record<string, Resource>, re: Request) {
    const c = get_creds(map, re);
    const a = auth_user(map, re);
    if (!(a as any).authorized) return a;

    const doc = map.data.document;
    const percentage = Number(map.data.percentage);
    const progress = map.data.progress;
    const device = map.data.device;
    const device_id = map.data.device_id;
    const timestamp = Math.floor(Date.now()/1000);
    db_update_progress(c.user, doc, percentage, progress, device, device_id, timestamp);

    return {
        status: 200,
        timestamp: timestamp,
        document: doc,
    };
}

function get_progress(map: Record<string, Resource>, re: Request, document: string) {
    const c = get_creds(map, re);
    const a = auth_user(map, re);
    if (!(a as any).authorized) return a;
    const xs = db_get_progress(c.user, document);

    return {
        status: 200,
        percentage: xs[0],
        progress: xs[1],
        device: xs[2],
        device_id: xs[3],
        timestamp: xs[4],
        document: document,
    };
}

const text_encoder = new TextEncoder();
async function handle_request(method: string, url: string, map: Record<string, Resource>, re: Request) {
    let q: SyncResponse;
    if (method === 'GET') {
        if (url === '/healthcheck') {
            q = health_check();
        }
        else if (url === '/users/auth') {
            q = auth_user(map, re);
        }
        else if (url.startsWith('/syncs/progress/')) {
            q = get_progress(map, re, url.substring(url.lastIndexOf('/')+1));
        }
        else {
            throw new Error();
        }
    }
    else if (method === 'PUT') {
        if (url === '/syncs/progress') {
            q = update_progress(map, re);
        }
        else {
            throw new Error();
        }
    }
    else if (method === 'POST') {
        if (url === '/users/create') {
            q = create_user(map, re);
        }
        else {
            throw new Error();
        }
    }
    else {
        throw new Error();
    }

    return {
        mime: "application/json",
        bytes:  text_encoder.encode(JSON.stringify(q)),
        status: q.status,
    };
}

async function serve(port: string) {
    const p = port ? Number(port) : 3030;
    await http_serve(p, handle_request);
}

function version() {
    println('ko-sync 0.1');
    println('Copyright (C) 2023 Sieve (https://github.com/s-i-e-v-e)');
    println('This is free software; see the source for copying conditions.  There is NO');
    println('warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.');
}

function help() {
    version();
    println('Usage:');
    println('help,    --help,              Display this information.');
    println('version, --version            Display version information.');
    println('serve [port]                  Serve http over port.');
}

export function main(args: string[]) {
    const cmd = args[0];
    switch(cmd) {
        case "serve": serve(args[1]); break;
        case "--version":
        case "version": version(); break;
        case "--help":
        case "help":
        default: help(); break;
    }
}

if (import.meta.main) main(Deno.args);

