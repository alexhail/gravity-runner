import { Repository, MoreThan } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Score } from '../models/Score';

interface LeaderboardEntry {
  rank: number;
  playerId: number | null;
  playerName: string;
  score: number;
  timestamp: Date;
}

export class ScoreService {
  private scoreRepository: Repository<Score>;

  constructor() {
    this.scoreRepository = AppDataSource.getRepository(Score);
  }

  async submitScore(
    userId: number | null,
    data: { 
      score: number; 
      gameTime: number; 
      collectibles: number; 
      distance: number;
      guestUsername?: string;
    }
  ): Promise<{ id: number; rank: number; isHighScore: boolean }> {
    const score = new Score();
    if (userId) {
      score.userId = userId;
    } else {
      // For guest users, we'll use null for userId
      score.userId = null;
      score.guestUsername = data.guestUsername || 'Guest';
    }
    score.score = data.score;
    score.gameTime = data.gameTime;
    score.collectibles = data.collectibles;
    score.distance = data.distance;

    const savedScore = await this.scoreRepository.save(score);

    // For guest users, we only calculate rank
    if (!userId) {
      const rank = await this.calculateRank(data.score);
      return {
        id: savedScore.id,
        rank,
        isHighScore: false
      };
    }

    // Get user's previous high score
    const previousHighScore = await this.scoreRepository.findOne({
      where: { userId },
      order: { score: 'DESC' },
    });

    const isHighScore = !previousHighScore || data.score > previousHighScore.score;

    // Calculate rank
    const rank = await this.calculateRank(data.score);

    return {
      id: savedScore.id,
      rank,
      isHighScore,
    };
  }

  async getGlobalLeaderboard(options: {
    timeframe: 'all' | 'daily' | 'weekly' | 'monthly';
    limit?: number;
    offset?: number;
  }): Promise<{ leaderboard: LeaderboardEntry[]; total: number }> {
    try {
      const { timeframe = 'all', limit = 100, offset = 0 } = options;
      console.log('Fetching leaderboard with options:', { timeframe, limit, offset });

      const queryBuilder = this.scoreRepository.createQueryBuilder('score')
        .leftJoin('score.user', 'user')
        .select([
          'score.id',
          'score.userId',
          'score.score',
          'score.createdAt',
          'score.guestUsername',
          'user.id',
          'user.username'
        ]);

      // Apply date filter based on timeframe
      if (timeframe !== 'all') {
        const filterDate = new Date();
        
        switch (timeframe) {
          case 'daily': {
            filterDate.setHours(0, 0, 0, 0);
            break;
          }
          case 'weekly': {
            filterDate.setDate(filterDate.getDate() - 7);
            filterDate.setHours(0, 0, 0, 0);
            break;
          }
          case 'monthly': {
            filterDate.setMonth(filterDate.getMonth() - 1);
            filterDate.setHours(0, 0, 0, 0);
            break;
          }
          default:
            filterDate.setTime(0); // Fallback to epoch
        }

        queryBuilder.where('score.createdAt >= :filterDate', { filterDate });
      }

      // Add ordering, pagination
      queryBuilder
        .orderBy('score.score', 'DESC')
        .skip(offset)
        .take(limit);

      console.log('Executing query:', queryBuilder.getSql());
      console.log('Query parameters:', queryBuilder.getParameters());

      const [scores, total] = await queryBuilder.getManyAndCount();

      console.log(`Found ${scores.length} scores out of ${total} total`);

      const leaderboard: LeaderboardEntry[] = scores.map((score, index) => ({
        rank: offset + index + 1,
        playerId: score.userId || null,
        playerName: score.guestUsername || score.user?.username || 'Unknown',
        score: score.score,
        timestamp: score.createdAt
      }));

      return { leaderboard, total };
    } catch (error) {
      console.error('Error in getGlobalLeaderboard:', error);
      throw new Error(`Failed to fetch leaderboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPlayerStats(userId: number): Promise<{
    highScore: number;
    totalGames: number;
    averageScore: number;
    bestDistance: number;
    totalPlayTime: number;
  }> {
    const scores = await this.scoreRepository.createQueryBuilder('score')
      .select([
        'score.id',
        'score.score',
        'score.gameTime',
        'score.distance'
      ])
      .where('score.userId = :userId', { userId })
      .orderBy('score.score', 'DESC')
      .getMany();

    if (scores.length === 0) {
      return {
        highScore: 0,
        totalGames: 0,
        averageScore: 0,
        bestDistance: 0,
        totalPlayTime: 0,
      };
    }

    const totalGames = scores.length;
    const highScore = scores[0].score;
    const averageScore = scores.reduce((sum, score) => sum + score.score, 0) / totalGames;
    const bestDistance = Math.max(...scores.map(score => score.distance));
    const totalPlayTime = scores.reduce((sum, score) => sum + score.gameTime, 0);

    return {
      highScore,
      totalGames,
      averageScore,
      bestDistance,
      totalPlayTime,
    };
  }

  private async calculateRank(score: number): Promise<number> {
    const betterScores = await this.scoreRepository.createQueryBuilder('score')
      .select('COUNT(score.id)', 'count')
      .where('score.score > :score', { score })
      .getRawOne();
    
    return (betterScores?.count || 0) + 1;
  }
} 