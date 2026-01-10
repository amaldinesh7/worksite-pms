// Twilio SMS Service - For production mode
// Note: Install twilio package when ready: pnpm add twilio --filter @worksite/api

import type { SmsService } from './types';

export class TwilioSmsService implements SmsService {
  async sendOtp(phone: string, code: string): Promise<boolean> {
    // TODO: Implement Twilio integration when ready
    // const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `Your verification code is: ${code}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone,
    // });

    console.warn('[TWILIO] SMS integration not yet configured. Set up TWILIO_* env vars.');
    throw new Error('Twilio SMS not configured. Please set up environment variables.');
  }
}
