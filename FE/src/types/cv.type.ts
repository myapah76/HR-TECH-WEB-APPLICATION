export interface CvSummaryResponse {
  id: string;
  title: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface CvDetailResponse extends CvSummaryResponse {
  pdfUrl: string;
  extractedSkills: string[];
}
