import { PrismaClient as PostgresClient } from '../../db/postgres/prisma/client.ts';
import { PrismaClient as MongoClient } from '../../db/mongodb/prisma/client.ts';

interface RankingItem {
  user: { id: string; username: string };
  totalGains: number;
}

interface ActivePlayer {
  user: { id: string; username: string };
  gameCount: number;
}

interface BestPlayer {
  user: { id: string; username: string };
  winRate: number;
}

export default class AnalyticsService {
  private pgClient: PostgresClient;
  private mongoClient: MongoClient;

  constructor() {
    this.pgClient = new PostgresClient();
    this.mongoClient = new MongoClient();
  }

  async getPlayerRankingByTotalGains(): Promise<RankingItem[]> {
    const mongoResult = await this.mongoClient.$runCommandRaw({
      aggregate: 'games',
      pipeline: [
        { $match: { winnerId: { $ne: null } } },
        { $group: { _id: '$winnerId', totalGains: { $sum: 100 } } },
        { $sort: { totalGains: -1 } },
        { $limit: 10 }
      ],
      cursor: {}
    });

    const rankings: RankingItem[] = [];
    for (const item of (mongoResult.cursor as { firstBatch: any[] })?.firstBatch || []) {
      const user: any = await this.pgClient.$queryRaw`SELECT id, username FROM users WHERE id = ${item._id}`;
      if (user.length > 0) {
        rankings.push({ user: user[0] as { id: string; username: string }, totalGains: item.totalGains });
      }
    }
    return rankings;
  }

  async getAverageBetsPerGame(): Promise<number> {
    const result = await this.mongoClient.$runCommandRaw({
      aggregate: 'games',
      pipeline: [
        { $match: { 'metadata.durationSeconds': { $exists: true } } },
        { $group: { _id: null, avgBet: { $avg: '$metadata.durationSeconds' } } }
      ],
      cursor: {}
    });
    return (result.cursor as { firstBatch: any[] })?.firstBatch?.[0]?.avgBet || 0;
  }

  async getTopActivePlayers(): Promise<ActivePlayer[]> {
    const mongoResult = await this.mongoClient.$runCommandRaw({
      aggregate: 'games',
      pipeline: [
        { $group: { _id: '$winnerId', gameCount: { $sum: 1 } } },
        { $sort: { gameCount: -1 } },
        { $limit: 10 }
      ],
      cursor: {}
    });

    const topPlayers: ActivePlayer[] = [];
    for (const item of (mongoResult.cursor as { firstBatch: any[] })?.firstBatch || []) {
      const user: any = await this.pgClient.$queryRaw`SELECT id, username FROM users WHERE id = ${item._id}`;
      if (user.length > 0) {
        topPlayers.push({ user: user[0] as { id: string; username: string }, gameCount: item.gameCount });
      }
    }
    return topPlayers;
  }

  async getBestWinRatePlayer(): Promise<BestPlayer | null> {
    const mongoResult = await this.mongoClient.$runCommandRaw({
      aggregate: 'games',
      pipeline: [
        { $group: {
          _id: '$winnerId',
          wins: { $sum: 1 },
          totalGames: { $sum: 1 }
        }},
        { $addFields: { winRate: { $divide: ['$wins', '$totalGames'] } } },
        { $sort: { winRate: -1 } },
        { $limit: 1 }
      ],
      cursor: {}
    });

    const best = (mongoResult.cursor as { firstBatch: any[] })?.firstBatch?.[0];
    if (best) {
      const user: any = await this.pgClient.$queryRaw`SELECT id, username FROM users WHERE id = ${best._id}`;
      if (user.length > 0) {
        return { user: user[0] as { id: string; username: string }, winRate: best.winRate };
      }
    }
    return null;
  }
}