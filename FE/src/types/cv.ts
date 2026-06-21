export interface CvSummaryResponse {
  id: string;
  title: string;
  isPrimary: boolean;
  extractionStatus: string;
  createdAt: string;
}

export interface CvDetailResponse extends CvSummaryResponse {
  fileUrl?: string;
  parsedContent?: string;
}
