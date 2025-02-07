import { Scene } from 'phaser';

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
  private errorText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create() {
    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8)
      .setOrigin(0, 0);

    // Add title
    this.add.text(this.cameras.main.centerX, 50, 'LEADERBOARD', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Add timeframe buttons
    const timeframes: Array<'all' | 'daily' | 'weekly' | 'monthly'> = ['all', 'daily', 'weekly', 'monthly'];
    timeframes.forEach((timeframe, index) => {
      const button = this.add.text(100 + index * 150, 100, timeframe.toUpperCase(), {
        fontSize: '20px',
        color: '#ffffff',
      })
        .setInteractive()
        .on('pointerdown', () => this.changeTimeframe(timeframe))
        .on('pointerover', () => button.setColor('#ffff00'))
        .on('pointerout', () => button.setColor('#ffffff'));
    });

    // Add navigation buttons
    this.add.text(100, this.cameras.main.height - 50, '< PREV', {
      fontSize: '20px',
      color: '#ffffff',
    })
      .setInteractive()
      .on('pointerdown', () => this.changePage(-1));

    this.add.text(this.cameras.main.width - 100, this.cameras.main.height - 50, 'NEXT >', {
      fontSize: '20px',
      color: '#ffffff',
    })
      .setInteractive()
      .on('pointerdown', () => this.changePage(1));

    // Add back button
    this.add.text(50, 50, '< BACK', {
      fontSize: '20px',
      color: '#ffffff',
    })
      .setInteractive()
      .on('pointerdown', () => this.scene.start('MenuScene'));

    // Add logout button if user is logged in
    if (!this.game.registry.get('isGuestMode')) {
      const logoutButton = this.add.text(this.cameras.main.width - 80, 50, 'LOGOUT', {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      })
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => logoutButton.setColor('#ff0000'))
        .on('pointerout', () => logoutButton.setColor('#ffffff'))
        .on('pointerdown', () => {
          // Clear user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Dispatch logout event
          window.dispatchEvent(new Event('userLoggedOut'));
          // Return to menu
          this.scene.start('MenuScene');
        });
    }

    // Load initial leaderboard data
    this.fetchLeaderboard();
  }

  private async fetchLeaderboard() {
    try {
      const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, ''); // Remove trailing slash if present
      const url = `${baseUrl}/api/scores/leaderboard?` +
        `timeframe=${this.currentTimeframe}&` +
        `limit=${this.entriesPerPage}&` +
        `offset=${this.page * this.entriesPerPage}`;

      console.log('Fetching leaderboard from:', url);

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : undefined
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      console.log('Received leaderboard data:', data);

      this.leaderboardEntries = data.leaderboard;
      this.totalEntries = data.total;
      this.displayLeaderboard();

      // Clear any error message if the request was successful
      this.errorText?.destroy();
      this.errorText = undefined;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      
      // Display error message to user
      this.errorText?.destroy();
      this.errorText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'Failed to load leaderboard.\nPlease try again later.',
        {
          fontSize: '24px',
          color: '#ff0000',
          align: 'center',
        }
      ).setOrigin(0.5);

      // Clear any existing leaderboard entries
      this.children.list
        .filter(child => child.getData('type') === 'leaderboard-entry')
        .forEach(child => child.destroy());
    }
  }

  private displayLeaderboard() {
    if (!this.leaderboardEntries || this.leaderboardEntries.length === 0) {
      // Display "No scores yet" message
      this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'No scores available for this timeframe',
        {
          fontSize: '24px',
          color: '#888888',
          align: 'center',
        }
      )
        .setOrigin(0.5)
        .setData('type', 'leaderboard-entry');
      return;
    }

    // Clear existing entries
    this.children.list
      .filter(child => child.getData('type') === 'leaderboard-entry')
      .forEach(child => child.destroy());

    // Display new entries
    this.leaderboardEntries.forEach((entry, index) => {
      const y = 150 + index * 40;
      
      // Rank
      this.add.text(100, y, `#${entry.rank}`, {
        fontSize: '20px',
        color: '#ffffff',
      }).setData('type', 'leaderboard-entry');

      // Player name
      this.add.text(200, y, entry.playerName || 'Unknown', {
        fontSize: '20px',
        color: '#ffffff',
      }).setData('type', 'leaderboard-entry');

      // Score
      this.add.text(500, y, entry.score.toString(), {
        fontSize: '20px',
        color: '#ffff00',
      }).setData('type', 'leaderboard-entry');

      // Date
      const date = new Date(entry.timestamp).toLocaleDateString();
      this.add.text(700, y, date, {
        fontSize: '16px',
        color: '#888888',
      }).setData('type', 'leaderboard-entry');
    });

    // Display page info
    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 50,
      `Page ${this.page + 1} of ${Math.ceil(this.totalEntries / this.entriesPerPage)}`,
      {
        fontSize: '16px',
        color: '#ffffff',
      }
    ).setOrigin(0.5).setData('type', 'leaderboard-entry');
  }

  private async changeTimeframe(timeframe: 'all' | 'daily' | 'weekly' | 'monthly') {
    this.currentTimeframe = timeframe;
    this.page = 0;
    await this.fetchLeaderboard();
  }

  private async changePage(delta: number) {
    const maxPage = Math.ceil(this.totalEntries / this.entriesPerPage) - 1;
    this.page = Math.max(0, Math.min(this.page + delta, maxPage));
    await this.fetchLeaderboard();
  }
} 