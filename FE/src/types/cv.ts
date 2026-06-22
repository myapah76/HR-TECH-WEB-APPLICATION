import { CvExtractionStatus } from '../enums/cv.enum'

export interface CvSummaryResponse {
  id: string;
  title: string;
  isPrimary: boolean;
  extractionStatus: CvExtractionStatus;
  createdAt: string;
}

export interface CvDetailResponse extends CvSummaryResponse {
  fileUrl?: string;
  parsedContent?: string;
}
