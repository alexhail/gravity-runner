import { Scene } from 'phaser';

interface FormField extends Phaser.GameObjects.Container {
  value: string;
  isPassword?: boolean;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

interface LoginError {
  code: string;
  message: string;
  details?: unknown;
}

export class LoginScene extends Scene {
  private formFields: { [key: string]: FormField } = {};
  private errorText?: Phaser.GameObjects.Text;
  private loadingText?: Phaser.GameObjects.Text;
  private selectedField?: string;
  private returnScene?: string;

  constructor() {
    super({ key: 'LoginScene' });
  }

  init(data: { returnScene?: string }) {
    this.returnScene = data.returnScene;
  }

  create() {
    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8)
      .setOrigin(0, 0);

    // Add title
    this.add.text(this.cameras.main.centerX, 50, 'LOGIN', {
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

    // Add switch to register text
    this.add.text(this.cameras.main.centerX, this.cameras.main.height - 50, 'Don\'t have an account? Register', {
      fontSize: '16px',
      color: '#888888',
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('RegisterScene', { returnScene: this.returnScene });
      });

    this.createForm();

    // Add keyboard input handling
    this.input.keyboard?.on('keydown', this.handleKeyPress.bind(this));
  }

  private createForm() {
    const startY = 200;
    const spacing = 80;
    let currentY = startY;

    // Clear existing form fields and error text
    Object.values(this.formFields).forEach(field => field.destroy());
    this.formFields = {};
    this.errorText?.destroy();

    this.createField('username', 'Username', currentY);
    currentY += spacing;
    this.createField('password', 'Password', currentY, true);
    currentY += spacing;

    // Add submit button with improved styling
    const submitButton = this.add.container(this.cameras.main.centerX, currentY + 20);
    const buttonBg = this.add.rectangle(0, 0, 200, 50, 0x00ff00, 0.8)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => buttonBg.setFillStyle(0x00cc00))
      .on('pointerout', () => buttonBg.setFillStyle(0x00ff00))
      .on('pointerdown', () => this.handleSubmit());
    const buttonText = this.add.text(0, 0, 'Login', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    submitButton.add([buttonBg, buttonText]);

    // Position error text below the submit button if it exists
    if (this.errorText) {
      this.errorText.setPosition(this.cameras.main.centerX, currentY + 100);
    }
  }

  private createField(key: string, label: string, y: number, isPassword = false) {
    const container = this.add.container(this.cameras.main.centerX, y);
    const width = 300;
    const height = 40;

    // Add label with improved visibility and positioning
    const labelText = this.add.text(-width/2, -height, label, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    .setShadow(1, 1, '#000000', 2);

    // Add input field background with slight adjustment for label space
    const inputBg = this.add.rectangle(0, 0, width, height, 0x333333)
      .setInteractive()
      .on('pointerdown', () => this.selectField(key));

    // Add input text with proper padding
    const inputText = this.add.text(-width/2 + 10, 0, '', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);

    // Add a placeholder text with gray color
    const placeholder = this.add.text(-width/2 + 10, 0, isPassword ? 'Enter your password' : 'Enter your username', {
      fontSize: '18px',
      color: '#666666',
    }).setOrigin(0, 0.5);

    container.add([labelText, inputBg, inputText, placeholder]);
    (container as FormField).value = '';
    (container as FormField).isPassword = isPassword;
    this.formFields[key] = container as FormField;

    // Update the handleKeyPress method to handle placeholder visibility
    const updatePlaceholder = () => {
      placeholder.setVisible(!inputText.text);
    };

    // Store the placeholder reference for later use
    (container as any).placeholder = placeholder;
    (container as any).updatePlaceholder = updatePlaceholder;
  }

  private selectField(key: string) {
    this.selectedField = key;
    Object.entries(this.formFields).forEach(([fieldKey, field]) => {
      const bg = field.list[1] as Phaser.GameObjects.Rectangle;
      bg.setStrokeStyle(fieldKey === key ? 2 : 0, 0x00ff00);
    });
  }

  private handleKeyPress(event: KeyboardEvent) {
    if (!this.selectedField) return;

    const field = this.formFields[this.selectedField];
    const text = field.list[2] as Phaser.GameObjects.Text;
    const placeholder = (field as any).placeholder;

    if (event.key === 'Backspace') {
      field.value = field.value.slice(0, -1);
    } else if (event.key.length === 1) {
      field.value += event.key;
    }

    text.setText(field.isPassword ? '•'.repeat(field.value.length) : field.value);
    
    // Update placeholder visibility
    placeholder.setVisible(!field.value);
  }

  private async handleSubmit() {
    try {
      this.errorText?.destroy();
      
      // Show loading text
      this.loadingText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'Logging in...', {
        fontSize: '16px',
        color: '#ffffff',
      }).setOrigin(0.5);

      const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, ''); // Remove trailing slash if present
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.formFields.username.value,
          password: this.formFields.password.value,
        }),
        credentials: 'include',
      });

      const data = await response.json() as LoginResponse | LoginError;

      if (!response.ok) {
        const error = data as LoginError;
        throw new Error(error.message || 'Login failed');
      }

      const result = data as LoginResponse;
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Dispatch login event
      window.dispatchEvent(new Event('userLoggedIn'));

      // Remove loading text
      this.loadingText.destroy();

      // Return to the specified scene or menu
      const returnScene = this.returnScene || 'MenuScene';
      this.scene.start(returnScene);
    } catch (error) {
      // Remove loading text
      this.loadingText?.destroy();

      // Show error message with more detail
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Login error:', error);
      
      this.errorText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 100,
        errorMessage,
        {
          fontSize: '16px',
          color: '#ff0000',
        }
      ).setOrigin(0.5);
    }
  }
} 