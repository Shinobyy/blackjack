import { PrismaClient as MongoClient } from "../../db/mongodb/prisma/client.ts";

interface GameData {
  tournamentId: string;
  timestamp?: Date;
  rounds: any[];
  winnerId?: string;
  metadata?: { durationSeconds: number };
  [key: string]: any;
}

export default class GameService {
  private mongoClient: MongoClient;

  constructor() {
    this.mongoClient = new MongoClient();
  }

  async findAll() {
    return this.mongoClient.$runCommandRaw({
      find: "games",
    });
  }

  async findById(id: string) {
    return this.mongoClient.$runCommandRaw({
      find: "games",
      filter: { _id: id },
    });
  }

  async create(data: GameData) {
    return this.mongoClient.$runCommandRaw({
      insert: "games",
      documents: [data],
    });
  }

  async updateById(id: string, data: Partial<GameData>) {
    return this.mongoClient.$runCommandRaw({
      update: "games",
      updates: [
        {
          q: { _id: id },
          u: { $set: data },
        },
      ],
    });
  }

  async deleteById(id: string) {
    return this.mongoClient.$runCommandRaw({
      delete: "games",
      deletes: [
        {
          q: { _id: id },
        },
      ],
    });
  }
}