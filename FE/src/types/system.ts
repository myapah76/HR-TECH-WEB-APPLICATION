export interface SystemConfigRequest {
  websiteName: string;
  maxFileSize: number;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  jwtAccessExpirationMinutes?: number;
  jwtRefreshTokenExpirationDays?: number;
  jwtIssuer?: string;
  jwtAudience?: string;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
  payosClientId?: string;
  payosApiKey?: string;
  payosChecksumKey?: string;
}

export interface SystemConfigResponse {
  id: string;
  websiteName: string;
  maxFileSize: number;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  jwtAccessExpirationMinutes?: number;
  jwtRefreshTokenExpirationDays?: number;
  jwtIssuer?: string;
  jwtAudience?: string;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
  payosClientId?: string;
  payosApiKey?: string;
  payosChecksumKey?: string;
  dbOnline: boolean;
  dbSize: string;
}

export interface PublicSystemConfigResponse {
  websiteName: string;
  maxFileSize: number;
}
