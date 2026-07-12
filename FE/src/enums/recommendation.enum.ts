export enum JobMatchingStatus {
  PENDING = 'PENDING',
  EXTRACTING = 'EXTRACTING',
  MAPPING = 'MAPPING',
  SCORING = 'SCORING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

export enum CandidateMatchGrade {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}
