import { Injectable } from '@nestjs/common';
import { twilio } from 'src/configs';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private twilioClient: Twilio;
  constructor() {
    const accountSid = twilio.twilio_account_sid;
    const authToken = twilio.twilio_auth_token;
    this.twilioClient = new Twilio(accountSid, authToken);
  }
  async sendSms(to: string, body: string): Promise<void> {
    await this.twilioClient.messages.create({
      to,
      from: twilio.twilio_sender_phone_number,
      body
    });
  }
}
