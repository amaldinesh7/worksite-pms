// JWT Service - Token generation and management

import crypto from 'crypto';
import { prisma } from '../lib/prisma';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

// JWT payload structure
export interface JwtPayload {
  userId: string;
  phone: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export class JwtService {
  private fastifyInstance: any = null;

  /**
   * Initialize with Fastify instance (call after @fastify/jwt is registered)
   */
  setFastify(fastify: any) {
    this.fastifyInstance = fastify;
  }

  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokens(userId: string, phone: string): Promise<TokenPair> {
    if (!this.fastifyInstance) {
      throw new Error('JWT service not initialized. Call setFastify() first.');
    }

    const payload: JwtPayload = { userId, phone };

    // Generate access token (short-lived)
    const accessToken = this.fastifyInstance.jwt.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    // Generate refresh token (long-lived, stored in DB)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Verify and decode access token
   */
  verifyAccessToken(token: string): JwtPayload {
    if (!this.fastifyInstance) {
      throw new Error('JWT service not initialized');
    }

    try {
      return this.fastifyInstance.jwt.verify(token) as JwtPayload;
    } catch {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    // Find refresh token in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    // Check if expired
    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new Error('Refresh token expired. Please log in again.');
    }

    // Delete old refresh token (rotation)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new token pair
    return this.generateTokens(storedToken.userId, storedToken.user.phone);
  }

  /**
   * Revoke a specific refresh token (logout)
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Revoke all refresh tokens for a user (logout all devices)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Cleanup expired refresh tokens (can be called periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}

export const jwtService = new JwtService();
