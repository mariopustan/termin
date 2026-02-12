import { Module } from '@nestjs/common';
import { ZoomAuthService } from './services/zoom-auth.service';
import { ZoomMeetingService } from './services/zoom-meeting.service';

@Module({
  providers: [ZoomAuthService, ZoomMeetingService],
  exports: [ZoomMeetingService],
})
export class ZoomModule {}
