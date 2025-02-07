import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from '../models/User';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { validate } from 'class-validator';
import { ProfileService } from './ProfileService';
import { UserRepository } from '../repositories/UserRepository';

export class AuthService {
  private userRepository: UserRepository;
  private profileService: ProfileService;
  private readonly forbiddenWords = [
    // Profanity and offensive terms
    'fuck', 'shit', 'ass', 'bitch', 'dick', 'pussy', 'cock', 'cunt', 'whore',
    'slut', 'bastard', 'piss', 'nigger', 'fag', 'gay', 'retard', 'nazi',
    // Common variations
    'f*ck', 'sh*t', 'b*tch', 'p*ssy', 'c*ck', 'c*nt', 'wh*re',
    'fuk', 'fck', 'sht', 'btch', 'dck', 'pss', 'cck',
    // Leetspeak variations
    'f4ck', 'sh1t', 'b1tch', 'p00sy', 'c0ck', 'd1ck',
  ];

  private readonly forbiddenUsernames = [
    // System/Admin related
    'admin', 'administrator', 'root', 'system', 'mod', 'moderator', 'owner',
    'support', 'help', 'staff', 'team', 'official', 'dev', 'developer',
    // Game related
    'server', 'bot', 'game', 'player', 'user', 'guest', 'anonymous',
    // Common impersonation attempts
    'billing', 'payment', 'account', 'security', 'verify', 'verification',
    // Special names
    'undefined', 'null', 'nan', 'localhost', 'everyone', 'somebody',
    // Additional gaming terms
    'gm', 'gamemaster', 'admin1', 'mod1', 'owner1', 'staff1',
    // Common fake names
    'system1', 'admin123', 'moderator1', 'helper', 'supporter'
  ];

  constructor() {
    this.userRepository = new UserRepository();
    this.profileService = new ProfileService();
  }

  private containsProfanity(text: string): boolean {
    const normalized = text.toLowerCase()
      // Remove common leetspeak substitutions
      .replace(/0/g, 'o')
      .replace(/1/g, 'i')
      .replace(/3/g, 'e')
      .replace(/4/g, 'a')
      .replace(/5/g, 's')
      .replace(/7/g, 't')
      .replace(/8/g, 'b')
      // Remove special characters
      .replace(/[^a-z0-9]/g, '');

    return this.forbiddenWords.some(word => 
      normalized.includes(word.toLowerCase()) || 
      normalized.includes(word.replace(/[^a-z0-9]/g, '').toLowerCase())
    );
  }

  private validateUsername(username: string): void {
    // Check length
    if (username.length < 3 || username.length > 20) {
      throw new Error('Username must be between 3 and 20 characters');
    }

    // Check if alphanumeric only
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      throw new Error('Username must contain only letters and numbers');
    }

    // Check for forbidden usernames (exact matches and contains)
    const lowerUsername = username.toLowerCase();
    if (this.forbiddenUsernames.some(word => lowerUsername.includes(word))) {
      throw new Error('This username is not allowed');
    }

    // Check for profanity
    if (this.containsProfanity(username)) {
      throw new Error('Username contains inappropriate words');
    }

    // Check for repeated characters (e.g., 'aaa', '111')
    if (/(.)\1{2,}/.test(username)) {
      throw new Error('Username cannot contain more than 2 repeated characters in a row');
    }

    // Check for common leetspeak substitutions
    const leetSpeakPattern = /[0-9]+/g;
    const numberCount = (username.match(leetSpeakPattern) || []).length;
    if (numberCount > username.length / 2) {
      throw new Error('Username cannot consist primarily of numbers');
    }
  }

  async register(username: string, password: string): Promise<{ user: User; token: string }> {
    // Normalize username
    username = username.trim();

    // Validate username format
    this.validateUsername(username);

    // Create new user instance
    const user = new User();
    user.username = username;
    user.password = await bcrypt.hash(password, 10);

    // Validate user data
    const errors = await validate(user);
    if (errors.length > 0) {
      throw new Error('Validation failed: ' + errors.toString());
    }

    // Check if username already exists
    const existingUser = await this.userRepository.findByUsername(username);

    if (existingUser) {
      throw new Error('Username already taken');
    }

    // Save user
    const savedUser = await this.userRepository.save(user);
    
    // Create profile with username as displayName
    await this.profileService.createProfile(savedUser.id, savedUser.username);
    
    const token = this.generateToken(savedUser);

    return { user: savedUser, token };
  }

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Safety check: Ensure profile exists
    try {
      await this.profileService.getProfile(user.id);
    } catch (error) {
      if (error instanceof Error && error.message === 'Profile not found') {
        // Profile doesn't exist, create it
        console.log(`[Profile Recovery] Creating missing profile for user ${user.username} (ID: ${user.id})`);
        try {
          await this.profileService.createProfile(user.id, user.username);
          console.log(`[Profile Recovery] Successfully created profile for user ${user.username}`);
        } catch (createError) {
          console.error(`[Profile Recovery] Failed to create profile for user ${user.username}:`, createError);
          // Continue with login even if profile creation fails - we can try again next login
        }
      } else {
        // Log other types of errors but don't block login
        console.error(`[Profile Check] Unexpected error checking profile for user ${user.username}:`, error);
      }
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  private generateToken(user: User): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
  }
} 