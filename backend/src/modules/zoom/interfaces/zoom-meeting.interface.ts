export interface ZoomMeetingRequest {
  topic: string;
  startTime: Date;
  duration: number;
  timezone: string;
}

export interface ZoomMeetingResponse {
  id: number;
  join_url: string;
  start_url: string;
  password: string;
  topic: string;
}

export interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
