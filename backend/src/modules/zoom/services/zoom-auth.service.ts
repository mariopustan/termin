import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZoomTokenResponse } from '../interfaces/zoom-meeting.interface';

@Injectable()
export class ZoomAuthService {
  private readonly logger = new Logger(ZoomAuthService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private readonly accountId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.accountId = this.configService.get<string>('zoom.accountId', '');
    this.clientId = this.configService.get<string>('zoom.clientId', '');
    this.clientSecret = this.configService.get<string>('zoom.clientSecret', '');
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    return this.refreshToken();
  }

  private async refreshToken(): Promise<string> {
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: this.accountId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Zoom OAuth failed: ${response.status} ${errorText}`);
      throw new Error(`Zoom authentication failed: ${response.status}`);
    }

    const data = (await response.json()) as ZoomTokenResponse;

    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;

    this.logger.log('Zoom access token refreshed successfully');
    return this.accessToken;
  }

  isConfigured(): boolean {
    return !!(this.accountId && this.clientId && this.clientSecret);
  }
}
