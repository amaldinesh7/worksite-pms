// Console SMS Service - For development mode (no actual SMS sent)

import type { SmsService } from './types';

export class ConsoleSmsService implements SmsService {
  async sendOtp(phone: string, code: string): Promise<boolean> {
    console.log('\n' + '='.repeat(50));
    console.log('[DEV MODE] OTP Verification');
    console.log('='.repeat(50));
    console.log(`📱 Phone: ${phone}`);
    console.log(`🔐 OTP Code: ${code}`);
    console.log(`💡 Or use bypass code: 123456`);
    console.log('='.repeat(50) + '\n');

    return true;
  }
}
