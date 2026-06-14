export interface CvSummaryResponse {
  id: string;
  title: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface CvDetailResponse extends CvSummaryResponse {
  fileUrl?: string;
  parsedContent?: string;
  extractionStatus?: string;
}
