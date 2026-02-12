import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { format } from 'date-fns';
import { ZoomAuthService } from './zoom-auth.service';
import {
  ZoomMeetingRequest,
  ZoomMeetingResponse,
} from '../interfaces/zoom-meeting.interface';

@Injectable()
export class ZoomMeetingService {
  private readonly logger = new Logger(ZoomMeetingService.name);
  private readonly userId: string;

  constructor(
    private readonly authService: ZoomAuthService,
    private readonly configService: ConfigService,
  ) {
    this.userId = this.configService.get<string>('zoom.userId', 'me');
  }

  async createMeeting(
    request: ZoomMeetingRequest,
  ): Promise<ZoomMeetingResponse> {
    if (!this.authService.isConfigured()) {
      this.logger.warn('Zoom is not configured, returning mock meeting data');
      return this.createMockMeeting(request);
    }

    const token = await this.authService.getAccessToken();

    const startTimeFormatted = format(
      request.startTime,
      "yyyy-MM-dd'T'HH:mm:ss",
    );

    const response = await fetch(
      `https://api.zoom.us/v2/users/${this.userId}/meetings`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: request.topic,
          type: 2,
          start_time: startTimeFormatted,
          duration: request.duration,
          timezone: request.timezone,
          settings: {
            join_before_host: false,
            waiting_room: true,
            auto_recording: 'none',
            meeting_authentication: false,
            mute_upon_entry: true,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Zoom meeting creation failed: ${response.status} ${errorText}`,
      );
      throw new Error(`Zoom meeting creation failed: ${response.status}`);
    }

    const data = (await response.json()) as ZoomMeetingResponse;

    this.logger.log(`Zoom meeting created: ${data.id}`);
    return {
      id: data.id,
      join_url: data.join_url,
      start_url: data.start_url,
      password: data.password,
      topic: data.topic,
    };
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    if (!this.authService.isConfigured()) {
      this.logger.warn('Zoom not configured, skipping meeting deletion');
      return;
    }

    const token = await this.authService.getAccessToken();

    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok && response.status !== 404) {
      this.logger.error(`Zoom meeting deletion failed: ${response.status}`);
    } else {
      this.logger.log(`Zoom meeting deleted: ${meetingId}`);
    }
  }

  private createMockMeeting(
    request: ZoomMeetingRequest,
  ): ZoomMeetingResponse {
    const mockId = Math.floor(Math.random() * 9000000000) + 1000000000;
    return {
      id: mockId,
      join_url: `https://zoom.us/j/${mockId}`,
      start_url: `https://zoom.us/s/${mockId}`,
      password: 'mock123',
      topic: request.topic,
    };
  }
}
