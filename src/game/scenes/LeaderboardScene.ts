import 'phaser';
import { Scene, GameObjects } from 'phaser';

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  timestamp: string;
}

export class LeaderboardScene extends Scene {
  private leaderboardEntries: LeaderboardEntry[] = [];
  private currentTimeframe: 'all' | 'daily' | 'weekly' | 'monthly' = 'all';
  private page = 0;
  private readonly entriesPerPage = 10;
  private totalEntries = 0;
  private errorText?: GameObjects.Text;
  private leaderboardContainer: GameObjects.Container;

  constructor() {
    super({ key: 'LeaderboardScene' });
    this.leaderboardContainer = this.add.container(0, 0);
  }

  create(): void {
    // ... existing code ...
  }

  private async fetchLeaderboard(): Promise<void> {
    // ... existing code ...
  }

  private displayLeaderboard(): void {
    // ... existing code ...
  }

  private async changeTimeframe(timeframe: 'all' | 'daily' | 'weekly' | 'monthly'): Promise<void> {
    // ... existing code ...
  }

  private async changePage(delta: number): Promise<void> {
    // ... existing code ...
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): void {
    const button = this.add.text(x, y, text, {
        fontSize: '32px',
        color: '#fff',
        backgroundColor: '#333',
        padding: { x: 10, y: 5 },
    });
    button.setInteractive();
    button.on('pointerdown', onClick);
  }

  private setupKeyboardInput(): void {
    const cursors = this.input.keyboard.createCursorKeys();
    cursors.up.on('down', () => this.changePage(-1));
    cursors.down.on('down', () => this.changePage(1));
    cursors.left.on('down', () => this.scene.start('MenuScene'));
  }

  private handleButtonClick(index: number): void {
    const timeframes: Array<'all' | 'daily' | 'weekly' | 'monthly'> = ['all', 'daily', 'weekly', 'monthly'];
    if (index >= 0 && index < timeframes.length) {
        this.changeTimeframe(timeframes[index]);
    }
  }

  private createLeaderboardEntry(index: number): void {
    const y = 200 + index * 50;
    this.createLeaderboardRow(0, y, index + 1, this.leaderboardEntries[index].playerName, this.leaderboardEntries[index].score);
  }

  private createLeaderboardRow(x: number, y: number, rank: number, username: string, score: number): void {
    const rankText = this.add.text(x + 50, y, `#${rank}`, { fontSize: '24px', color: '#fff' });
    const usernameText = this.add.text(x + 150, y, username, { fontSize: '24px', color: '#fff' });
    const scoreText = this.add.text(x + 400, y, score.toString(), { fontSize: '24px', color: '#fff' });
    
    // Add to container for easy cleanup
    this.leaderboardContainer.add(rankText);
    this.leaderboardContainer.add(usernameText);
    this.leaderboardContainer.add(scoreText);
  }

  private formatScore(score: number): string {
    return score.toString().padStart(6, '0');
  }
} 