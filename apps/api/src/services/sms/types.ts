// SMS Service interface for provider abstraction

export interface SmsService {
  sendOtp(phone: string, code: string): Promise<boolean>;
}

export interface SmsConfig {
  mode: 'development' | 'production';
  provider?: 'twilio' | 'aws_sns' | 'msg91';
}
