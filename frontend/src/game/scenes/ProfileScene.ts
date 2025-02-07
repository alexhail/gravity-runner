import { Scene } from 'phaser';

interface Profile {
  displayName?: string;
  avatar?: string;
  preferences: {
    musicVolume?: number;
    sfxVolume?: number;
    theme?: string;
  };
  achievements: string[];
  stats: {
    totalGamesPlayed: number;
    totalPlayTime: number;
    totalScore: number;
    bestDistance: number;
    totalCollectibles: number;
  };
}

export class ProfileScene extends Scene {
  private profile: Profile | null = null;

  constructor() {
    super({ key: 'ProfileScene' });
  }

  create() {
    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8)
      .setOrigin(0, 0);

    // Add title
    this.add.text(this.cameras.main.centerX, 50, 'PROFILE', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Add back button
    this.add.text(50, 50, '< BACK', {
      fontSize: '20px',
      color: '#ffffff',
    })
      .setInteractive()
      .on('pointerdown', () => this.scene.start('MenuScene'));

    // Add logout button
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

    // Fetch and display profile data
    this.fetchProfile();
  }

  private async fetchProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.scene.start('MenuScene');
        return;
      }

      const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, ''); // Remove trailing slash if present
      const response = await fetch(`${baseUrl}/api/profiles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      this.profile = await response.json();
      this.displayProfile();
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  private displayProfile() {
    if (!this.profile) return;

    const startY = 150;
    const spacing = 40;
    let currentY = startY;

    // Display name (now read-only)
    this.add.text(100, currentY, 'Username:', {
      fontSize: '24px',
      color: '#ffffff',
    });

    // Get the user data from localStorage as a backup for the displayName
    let username = this.profile.displayName;
    if (!username) {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          username = user.username;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    this.add.text(300, currentY, username || 'Anonymous', {
      fontSize: '24px',
      color: '#ffff00',
    });
    currentY += spacing;

    // Stats section
    currentY += spacing;
    this.add.text(100, currentY, 'STATISTICS', {
      fontSize: '28px',
      color: '#ffffff',
    });
    currentY += spacing;

    const stats = [
      ['Total Games', this.profile.stats?.totalGamesPlayed?.toString() || '0'],
      ['Play Time', `${Math.floor((this.profile.stats?.totalPlayTime || 0) / 60)} minutes`],
      ['Total Score', this.profile.stats?.totalScore?.toString() || '0'],
      ['Best Distance', `${this.profile.stats?.bestDistance || 0}m`],
      ['Collectibles', this.profile.stats?.totalCollectibles?.toString() || '0'],
    ];

    stats.forEach(([label, value]) => {
      this.add.text(120, currentY, label + ':', {
        fontSize: '20px',
        color: '#ffffff',
      });
      this.add.text(300, currentY, value, {
        fontSize: '20px',
        color: '#ffff00',
      });
      currentY += spacing;
    });

    // Achievements section
    currentY += spacing;
    this.add.text(100, currentY, 'ACHIEVEMENTS', {
      fontSize: '28px',
      color: '#ffffff',
    });
    currentY += spacing;

    const achievements = this.profile.achievements || [];
    if (achievements.length === 0) {
      this.add.text(120, currentY, 'No achievements yet', {
        fontSize: '20px',
        color: '#888888',
      });
    } else {
      achievements.forEach(achievement => {
        this.add.text(120, currentY, achievement, {
          fontSize: '20px',
          color: '#ffff00',
        });
        currentY += spacing;
      });
    }
  }
}