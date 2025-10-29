import { PrismaClient as PostgresClient } from "../../db/postgres/prisma/client.ts";
import { Prisma } from "../../db/postgres/prisma/client.ts";

/*
findAll()
findById()

create()
updateById()
deleteById()
*/

interface User {
    id: string;
    session_id: string;
    username: string;
    max_profit: number;
    created_at: Date;
    updated_at: Date;
}

interface CreateUserData {
    session_id: string;
    username: string;
    max_profit?: number;
}

interface UpdateUserData {
    session_id?: string;
    username?: string;
    max_profit?: number;
}

export default class UserService {
    private pgClient: PostgresClient;

    constructor() {
        this.pgClient = new PostgresClient();
    }

    async findAll(): Promise<User[]> {
        const users = await this.pgClient.$queryRaw<User[]>`
            SELECT * FROM users
        `;
        return users;
    }

    async findById(id: string): Promise<User | null> {
        const users = await this.pgClient.$queryRaw<User[]>`
            SELECT * FROM users WHERE id = ${id}
        `;
        return users.length > 0 ? users[0]! : null;
    }

    async findBySessionId(sessionId: string): Promise<User | null> {
        const users = await this.pgClient.$queryRaw<User[]>`
            SELECT * FROM users WHERE session_id = ${sessionId}
        `;
        return users.length > 0 ? users[0]! : null;
    }

    async create(data: CreateUserData): Promise<User> {
        const { session_id, username, max_profit = 15000 } = data;
        const users = await this.pgClient.$queryRaw<User[]>`
            INSERT INTO users (id, session_id, username, max_profit)
            VALUES (gen_random_uuid(), ${session_id}, ${username}, ${max_profit})
            RETURNING *
        `;
        return users[0]!;
    }

    async updateById(id: string, data: UpdateUserData): Promise<User | null> {
        const updates: string[] = [];

        if (data.session_id !== undefined) {
            updates.push(`session_id = '${data.session_id}'`);
        }
        if (data.username !== undefined) {
            updates.push(`username = '${data.username}'`);
        }
        if (data.max_profit !== undefined) {
            updates.push(`max_profit = ${data.max_profit}`);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push(`updated_at = NOW()`);

        const users = await this.pgClient.$queryRaw<User[]>`
            UPDATE users
            SET ${Prisma.raw(updates.join(', '))}
            WHERE id = ${id}
            RETURNING *
        `;

        return users.length > 0 ? users[0]! : null;
    }

    async deleteById(id: string): Promise<User | null> {
        const users = await this.pgClient.$queryRaw<User[]>`
            DELETE FROM users WHERE id = ${id}
            RETURNING *
        `;
        return users.length > 0 ? users[0]! : null;
    }

    async disconnect(): Promise<void> {
        await this.pgClient.$disconnect();
    }
}