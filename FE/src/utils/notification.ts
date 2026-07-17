export const getNotificationRedirectUrl = (type: string, referenceId?: string): string => {
  switch (type) {
    case 'APPLICATION_STATUS_UPDATED':
      return `/candidate/applied-jobs${referenceId ? `?id=${referenceId}` : ''}`
    case 'INTERVIEW_SCHEDULED':
      return `/candidate/mock-interview`
    case 'NEW_JOB_POSTED':
      return `/jobs/${referenceId}`
    case 'SUBSCRIPTION_UPGRADED':
      return `/recruiter/billing`
    case 'JOB_STATUS_UPDATED':
      return `/recruiter/manage-jobs/${referenceId}/update`
    default:
      return '/'
  }
}
