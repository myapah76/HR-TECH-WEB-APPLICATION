import { CvExtractionStatus } from '../enums/cv.enum'

export interface CvSummaryResponse {
  id: string;
  title: string;
  isPrimary: boolean;
  extractionStatus: CvExtractionStatus;
  createdAt: string;
}

export interface UploadCvRequest {
  title: string
  fileUrl: string
}

export interface CvDetailResponse extends CvSummaryResponse {
  fileUrl?: string;
  parsedContent?: string;
}

// --- Component Props ---

import { RefObject } from 'react'
import { AiMatchHistoryResponse } from './recommendation'

export interface CvJobMatchCardProps {
  cvs: CvSummaryResponse[]
  savedJobs: any[]
  selectedCvId: string
  setSelectedCvId: (id: string) => void
  selectedJobId: string
  setSelectedJobId: (id: string) => void
  handleMatch: () => void
  isPending: boolean
  matchScore: AiMatchHistoryResponse | null
}

export interface CvUploadCardProps {
  cvTitle: string
  setCvTitle: (title: string) => void
  selectedFile: File | null
  fileInputRef: RefObject<HTMLInputElement | null>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleUpload: () => void
  isPending: boolean
}

export interface CvListCardProps {
  cvs: CvSummaryResponse[]
  editingCvId: string | null
  setEditingCvId: (id: string | null) => void
  editTitle: string
  setEditTitle: (title: string) => void
  handleUpdateTitle: (id: string, oldTitle: string) => void
  handleViewCv: (id: string) => void
  handleSetPrimary: (id: string) => void
  handleDelete: (id: string) => void
}

export interface CvDetailModalProps {
  viewCv: CvDetailResponse | null
  loadingDetail: boolean
  setViewCvId: (id: string | null) => void
}
