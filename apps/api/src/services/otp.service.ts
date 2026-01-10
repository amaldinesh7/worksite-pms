// OTP Service - Generate, store, and verify OTPs

import { randomInt } from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { smsService } from './sms';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const SALT_ROUNDS = 10;
const DEV_BYPASS_CODE = '123456';

export class OtpService {
  /**
   * Generate a cryptographically secure 6-digit OTP code.
   * Uses Node's crypto.randomInt() instead of Math.random() for security.
   * Range: 100000 to 999999 (always 6 digits)
   */
  private generateCode(): string {
    // randomInt(min, max) where min is inclusive and max is exclusive
    // This generates integers from 100000 to 999999 (6 digits)
    return randomInt(100000, 1000000).toString();
  }

  /**
   * Send OTP to phone number
   * - Generates new OTP
   * - Hashes and stores in database
   * - Sends via SMS (or logs in dev mode)
   */
  async sendOtp(phone: string): Promise<{ success: boolean; expiresAt: Date }> {
    // Clean up any existing unverified OTPs for this phone
    await prisma.otpVerification.deleteMany({
      where: {
        phone,
        verified: false,
      },
    });

    // Generate new OTP
    const code = this.generateCode();
    const hashedCode = await bcrypt.hash(code, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store in database
    await prisma.otpVerification.create({
      data: {
        phone,
        code: hashedCode,
        expiresAt,
      },
    });

    // Send OTP via SMS service (console in dev, real SMS in prod)
    await smsService().sendOtp(phone, code);

    return { success: true, expiresAt };
  }

  /**
   * Verify OTP code
   * Returns true if valid, throws error otherwise
   */
  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const isDev = process.env.OTP_MODE === 'development';

    // In dev mode, accept bypass code
    if (isDev && code === DEV_BYPASS_CODE) {
      // Mark any existing OTP as verified (for cleanup)
      await prisma.otpVerification.updateMany({
        where: { phone, verified: false },
        data: { verified: true },
      });
      return true;
    }

    // Find the latest unverified OTP for this phone
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phone,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new Error('OTP expired or not found. Please request a new one.');
    }

    // Check max attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      throw new Error('Too many attempts. Please request a new OTP.');
    }

    // Increment attempt count
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    // Verify the code
    const isValid = await bcrypt.compare(code, otpRecord.code);

    if (!isValid) {
      const remainingAttempts = MAX_ATTEMPTS - (otpRecord.attempts + 1);
      if (remainingAttempts > 0) {
        throw new Error(`Invalid OTP. ${remainingAttempts} attempts remaining.`);
      } else {
        throw new Error('Invalid OTP. Please request a new one.');
      }
    }

    // Mark as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return true;
  }

  /**
   * Cleanup expired OTPs (can be called periodically)
   */
  async cleanupExpiredOtps(): Promise<number> {
    const result = await prisma.otpVerification.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { verified: true }],
      },
    });
    return result.count;
  }
}

export const otpService = new OtpService();
