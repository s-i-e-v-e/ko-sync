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
export interface Error {
    status: number,
    code: number,
    message: string,
}

export interface State {
    status: number,
    state: string,
}

export interface UserRegistered {
    status: number,
    username: string,
}

export interface UserAuthorized {
    status: number,
    authorized: string,
}

export interface ProgressUpdate {
    status: number,
    document: string,
    timestamp: number,
}

export type SyncResponse = Error|State|UserRegistered|UserAuthorized|ProgressUpdate;

export const error_internal = { status: 502, code: 2000, message: "Unknown server error.", };
export const error_unauthorized_user = { status: 401, code: 2001, message: "Unauthorized", };
export const error_user_exists = { status: 402, code: 2002, message: "Username is already registered.", };
export const error_invalid_fields = { status: 403, code: 2003, message: "Invalid request", };
export const error_document_field_missing = { status: 403, code: 2004, message: "Field 'document' not provided.", };