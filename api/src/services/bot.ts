import { PrismaClient as PostgresClient } from "../../db/postgres/prisma/client.ts";
import { Prisma } from "../../db/postgres/prisma/client.ts";

interface Bots {
    id: string;
    username: string;
    created_at: Date;
    updated_at: Date;
}

interface CreateBotData {
    username: string;
}

interface UpdateBotData {
    username?: string;
}

export default class BotService {
    private pgClient: PostgresClient;

    constructor() {
        this.pgClient = new PostgresClient();
    }

    async findAll(): Promise<Bots[]> {
        const bots = await this.pgClient.$queryRaw<Bots[]>`
            SELECT * FROM bots
        `;
        return bots;
    }

    async findById(id: string): Promise<Bots | null> {
        const bots = await this.pgClient.$queryRaw<Bots[]>`
            SELECT * FROM bots WHERE id = ${id}
        `;
        return bots[0] ?? null;
    }

    async findByUsername(username: string): Promise<Bots | null> {
        const bots = await this.pgClient.$queryRaw<Bots[]>`
            SELECT * FROM bots WHERE username = ${username}
        `;
        return bots[0] ?? null;
    }

    async create(data: CreateBotData): Promise<Bots> {
        const { username } = data;
        const bots = await this.pgClient.$queryRaw<Bots[]>`
            INSERT INTO bots (id, username)
            VALUES (gen_random_uuid(), ${username})
            RETURNING *
        `;
        return bots[0]!;
    }

    async updateById(id: string, data: UpdateBotData): Promise<Bots | null> {
        if (!data.username) {
            return this.findById(id);
        }

        const query = Prisma.sql`
            UPDATE bots
            SET username = ${data.username}, updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        const bots = await this.pgClient.$queryRaw<Bots[]>(query);
        return bots[0] ?? null;
    }

    async deleteById(id: string): Promise<Bots | null> {
        const bots = await this.pgClient.$queryRaw<Bots[]>`
            DELETE FROM bots WHERE id = ${id}
            RETURNING *
        `;
        return bots[0] ?? null;
    }

    async count(): Promise<number> {
        const result = await this.pgClient.$queryRaw<[{ count: bigint }]>`
            SELECT COUNT(*) as count FROM bots
        `;
        return Number(result[0].count);
    }

    async disconnect(): Promise<void> {
        await this.pgClient.$disconnect();
    }
}
