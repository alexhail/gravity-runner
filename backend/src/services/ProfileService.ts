import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Profile } from '../models/Profile';

export class ProfileService {
  private profileRepository: Repository<Profile>;

  constructor() {
    this.profileRepository = AppDataSource.getRepository(Profile);
  }

  async createProfile(userId: number, username: string): Promise<Profile> {
    const profile = new Profile();
    profile.userId = userId;
    profile.displayName = username;
    profile.preferences = {
      musicVolume: 0.5,
      sfxVolume: 0.5,
      theme: 'default'
    };
    profile.achievements = [];
    profile.stats = {
      totalGamesPlayed: 0,
      totalPlayTime: 0,
      totalScore: 0,
      bestDistance: 0,
      totalCollectibles: 0
    };

    const savedProfile = await this.profileRepository.save(profile);
    
    return {
      ...savedProfile,
      preferences: {
        musicVolume: savedProfile.preferences?.musicVolume ?? 0.5,
        sfxVolume: savedProfile.preferences?.sfxVolume ?? 0.5,
        theme: savedProfile.preferences?.theme ?? 'default'
      },
      achievements: savedProfile.achievements ?? [],
      stats: {
        totalGamesPlayed: savedProfile.stats?.totalGamesPlayed ?? 0,
        totalPlayTime: savedProfile.stats?.totalPlayTime ?? 0,
        totalScore: savedProfile.stats?.totalScore ?? 0,
        bestDistance: savedProfile.stats?.bestDistance ?? 0,
        totalCollectibles: savedProfile.stats?.totalCollectibles ?? 0
      }
    };
  }

  async getProfile(userId: number): Promise<Profile> {
    const profile = await this.profileRepository.createQueryBuilder('profile')
      .select([
        'profile.id',
        'profile.userId',
        'profile.displayName',
        'profile.avatar',
        'profile.preferences',
        'profile.achievements',
        'profile.stats',
        'profile.createdAt',
        'profile.updatedAt'
      ])
      .where('profile.userId = :userId', { userId })
      .getOne();

    if (!profile) {
      throw new Error('Profile not found');
    }

    return {
      ...profile,
      preferences: {
        musicVolume: profile.preferences?.musicVolume ?? 0.5,
        sfxVolume: profile.preferences?.sfxVolume ?? 0.5,
        theme: profile.preferences?.theme ?? 'default'
      },
      achievements: profile.achievements ?? [],
      stats: {
        totalGamesPlayed: profile.stats?.totalGamesPlayed ?? 0,
        totalPlayTime: profile.stats?.totalPlayTime ?? 0,
        totalScore: profile.stats?.totalScore ?? 0,
        bestDistance: profile.stats?.bestDistance ?? 0,
        totalCollectibles: profile.stats?.totalCollectibles ?? 0
      }
    };
  }

  async updateProfile(userId: number, data: Partial<Profile>): Promise<Profile> {
    const profile = await this.getProfile(userId);

    if (data.avatar !== undefined) profile.avatar = data.avatar;
    if (data.preferences !== undefined) profile.preferences = { ...profile.preferences, ...data.preferences };

    return await this.profileRepository.save(profile);
  }

  async updateStats(userId: number, gameStats: {
    playTime: number;
    score: number;
    distance: number;
    collectibles: number;
  }): Promise<Profile> {
    const profile = await this.getProfile(userId);

    profile.stats = {
      totalGamesPlayed: profile.stats.totalGamesPlayed + 1,
      totalPlayTime: profile.stats.totalPlayTime + gameStats.playTime,
      totalScore: profile.stats.totalScore + gameStats.score,
      bestDistance: Math.max(profile.stats.bestDistance, gameStats.distance),
      totalCollectibles: profile.stats.totalCollectibles + gameStats.collectibles,
    };

    return await this.profileRepository.save(profile);
  }

  async addAchievement(userId: number, achievementId: string): Promise<Profile> {
    const profile = await this.getProfile(userId);

    if (!profile.achievements.includes(achievementId)) {
      profile.achievements = [...profile.achievements, achievementId];
      await this.profileRepository.save(profile);
    }

    return profile;
  }

  async updatePreferences(userId: number, preferences: {
    musicVolume?: number;
    sfxVolume?: number;
    theme?: string;
  }): Promise<Profile> {
    const profile = await this.getProfile(userId);
    profile.preferences = { ...profile.preferences, ...preferences };
    return await this.profileRepository.save(profile);
  }
} 