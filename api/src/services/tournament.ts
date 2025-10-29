import { PrismaClient as PostgresClient } from "../../db/postgres/prisma/client.ts";
import { Prisma } from "../../db/postgres/prisma/client.ts";

interface Tournaments {
    id: string;
    user_id: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

interface CreateTournamentsData {
    user_id: string;
    active?: boolean;
}

interface UpdateTournamentsData {
    user_id?: string;
    active?: boolean;
}

export default class TournamentService {
    private pgClient: PostgresClient;

    constructor() {
        this.pgClient = new PostgresClient();
    }

    async findAll(): Promise<Tournaments[]> {
        const tournaments = await this.pgClient.$queryRaw<Tournaments[]>`
            SELECT * FROM tournaments
        `;
        return tournaments;
    }

    async findById(id: string): Promise<Tournaments | null> {
        const tournaments = await this.pgClient.$queryRaw<Tournaments[]>`
            SELECT * FROM tournaments WHERE id = ${id}
        `;
        return tournaments[0] ?? null;
    }

    async findByUserId(userId: string): Promise<Tournaments[]> {
        const tournaments = await this.pgClient.$queryRaw<Tournaments[]>`
            SELECT * FROM tournaments WHERE user_id = ${userId}
        `;
        return tournaments;
    }

    async findActiveByUserId(userId: string): Promise<Tournaments[]> {
        const tournaments = await this.pgClient.$queryRaw<Tournaments[]>`
            SELECT * FROM tournaments WHERE user_id = ${userId} AND active = true
        `;
        return tournaments;
    }

    async create(data: CreateTournamentsData): Promise<Tournaments> {
        const { user_id, active = false } = data;
        const tournaments = await this.pgClient.$queryRaw<Tournaments[]>`
            INSERT INTO tournaments (user_id, active)
            VALUES (${user_id}, ${active})
            RETURNING *
        `;
        return tournaments[0]!;
    }

    async updateById(id: string, data: UpdateTournamentsData): Promise<Tournaments | null> {
        const updates: string[] = [];

        if (data.user_id !== undefined) {
            updates.push(`user_id = '${data.user_id}'`);
        }
        if (data.active !== undefined) {
            updates.push(`active = ${data.active}`);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push(`updated_at = NOW()`);

        const query = Prisma.sql`
            UPDATE tournaments
            SET ${Prisma.raw(updates.join(', '))}
            WHERE id = ${id}
            RETURNING *
        `;

        const tournaments = await this.pgClient.$queryRaw<Tournaments[]>(query);
        return tournaments[0] ?? null;
    }

    async deleteById(id: string): Promise<Tournaments | null> {
        const tournaments = await this.pgClient.$queryRaw<Tournaments[]>`
            DELETE FROM tournaments WHERE id = ${id}
            RETURNING *
        `;
        return tournaments[0] ?? null;
    }

    async deleteByUserId(userId: string): Promise<number> {
        const result = await this.pgClient.$executeRaw`
            DELETE FROM tournaments WHERE user_id = ${userId}
        `;
        return result;
    }

    async disconnect(): Promise<void> {
        await this.pgClient.$disconnect();
    }
}
