import { AppDataSource } from '../data-source';
import { Score } from '../models/Score';
import { Profile } from '../models/Profile';

async function resetData(): Promise<void> {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection initialized');

    // Get repositories
    const scoreRepository = AppDataSource.getRepository(Score);
    const profileRepository = AppDataSource.getRepository(Profile);

    // Delete all scores
    await scoreRepository.clear();
    console.log('All scores deleted');

    // Reset all profile stats
    const profiles = await profileRepository.find();
    for (const profile of profiles) {
      profile.stats = {
        totalGamesPlayed: 0,
        totalPlayTime: 0,
        totalScore: 0,
        bestDistance: 0,
        totalCollectibles: 0
      };
      await profileRepository.save(profile);
    }
    console.log(`Reset stats for ${profiles.length} profiles`);

    console.log('Data reset complete');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting data:', error);
    process.exit(1);
  }
}

resetData(); 