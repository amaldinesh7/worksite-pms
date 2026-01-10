// SMS Service Factory

import type { SmsService } from './types';
import { ConsoleSmsService } from './console.sms';
import { TwilioSmsService } from './twilio.sms';

export type { SmsService } from './types';

export function getSmsService(): SmsService {
  const mode = process.env.OTP_MODE || 'development';

  if (mode === 'development') {
    return new ConsoleSmsService();
  }

  const provider = process.env.SMS_PROVIDER || 'twilio';

  switch (provider) {
    case 'twilio':
      return new TwilioSmsService();
    // Add more providers here as needed:
    // case 'aws_sns':
    //   return new AwsSnsService();
    // case 'msg91':
    //   return new Msg91Service();
    default:
      console.warn(`Unknown SMS provider: ${provider}, falling back to console`);
      return new ConsoleSmsService();
  }
}

// Singleton instance
let smsServiceInstance: SmsService | null = null;

export function smsService(): SmsService {
  if (!smsServiceInstance) {
    smsServiceInstance = getSmsService();
  }
  return smsServiceInstance;
}
