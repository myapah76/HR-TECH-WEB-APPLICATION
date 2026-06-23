# Job Rules Summary

This document summarizes the Job module business rules, authorization rules, and status transition rules based on the current backend implementation.

## Job Statuses

- **DRAFT**: Initial state after job creation.
- **PENDING_APPROVAL**: Submitted for HR Manager review.
- **APPROVED**: Approved by HR Manager and available for recruitment.
- **REJECTED**: Rejected by HR Manager.
- **CLOSED**: Recruitment has ended.

## Status Flow

```text
DRAFT
 └─> PENDING_APPROVAL
       ├─> APPROVED
       └─> REJECTED

Any status except CLOSED
 └─> CLOSED
```

Valid transitions:

```text
DRAFT -> PENDING_APPROVAL
PENDING_APPROVAL -> APPROVED
PENDING_APPROVAL -> REJECTED
DRAFT -> CLOSED
PENDING_APPROVAL -> CLOSED
APPROVED -> CLOSED
REJECTED -> CLOSED
```

Invalid transitions are rejected by the backend.

Examples:

- A `DRAFT` job cannot be approved directly.
- A `DRAFT` job cannot be rejected directly.
- A non-`DRAFT` job cannot be submitted.
- A non-`PENDING_APPROVAL` job cannot be approved or rejected.
- A `CLOSED` job cannot be closed again.
- A `CLOSED` job cannot be reopened unless a new endpoint explicitly supports it.

## Permissions

### Job Owner

A user is the Job Owner when:

```java
job.createdById.equals(currentUserId)
```

Job Owner permissions:

- Owns jobs they created.
- Edit `DRAFT` jobs only.
- Submit `DRAFT` jobs for approval.
- Close their own non-`CLOSED` jobs.

Notes:

- Job Owner is not the same as company `OWNER`.
- Ownership is determined per job using `createdById`.

### HR

HR permissions:

- Create jobs when they have `CREATE_JOB` permission.
- Edit own `DRAFT` jobs only.
- Submit own `DRAFT` jobs for approval.

HR cannot:

- Approve jobs.
- Reject jobs.
- Close jobs unless they are also the Job Owner.
- Edit non-`DRAFT` jobs.
- Submit non-`DRAFT` jobs.

### HR Manager

HR Manager permissions:

- Create jobs when they have `CREATE_JOB` permission.
- Approve `PENDING_APPROVAL` jobs.
- Reject `PENDING_APPROVAL` jobs.
- Close any non-`CLOSED` job in their company.

HR Manager cannot:

- Approve or reject jobs that are not `PENDING_APPROVAL`.
- Edit non-`DRAFT` jobs.
- Close a job that is already `CLOSED`.

## Business Rules

### Create Job

- Company must be approved.
- User must have `CREATE_JOB` permission.
- New jobs are created with status `DRAFT`.
- The authenticated user becomes the Job Owner through `createdById`.

### Edit Job

- Only `DRAFT` jobs can be edited.
- `APPROVED` jobs cannot be edited.
- `PENDING_APPROVAL`, `REJECTED`, and `CLOSED` jobs also cannot be edited in the current backend implementation.

### Submit Job

Requirements:

- Job must be in `DRAFT` status.
- User must be the Job Owner or allowed HR user.

Result:

- Status becomes `PENDING_APPROVAL`.

### Approve Job

Requirements:

- Job must be in `PENDING_APPROVAL` status.
- Only HR Manager can perform this action.
- User must have the required approval permission.

Result:

- Status becomes `APPROVED`.

### Reject Job

Requirements:

- Job must be in `PENDING_APPROVAL` status.
- Only HR Manager can perform this action.
- User must have the required approval permission.

Result:

- Status becomes `REJECTED`.

### Close Job

Requirements:

- Job must not already be `CLOSED`.
- Job Owner may close their own jobs.
- HR Manager may close any job in their company.

Result:

- Status becomes `CLOSED`.

Notes:

- `CLOSED` is terminal in the current implementation.
- A `CLOSED` job cannot be reopened unless explicitly supported by new backend logic.

## Permission Matrix

| Action | HR | HR Manager | Job Owner |
| --- | --- | --- | --- |
| Create Job | ✓ | ✓ | N/A before creation |
| Edit Job | Own `DRAFT` jobs only | Own `DRAFT` jobs only | Own `DRAFT` jobs only |
| Submit Job | Own `DRAFT` jobs only | Own `DRAFT` jobs only | Own `DRAFT` jobs only |
| Approve Job | ✗ | `PENDING_APPROVAL` only | ✗ |
| Reject Job | ✗ | `PENDING_APPROVAL` only | ✗ |
| Close Job | Own jobs only | Any non-`CLOSED` company job | Own non-`CLOSED` jobs |

## Enforcement

The backend enforces these rules through:

- `JobController` role checks using `@PreAuthorize`.
- `CompanySecurityExpression` role and ownership checks.
- `JobValidator` company, permission, ownership, and membership validation.
- `JobServiceImpl` status transition validation.

Important backend validations:

```java
// Edit
job.getStatus() == JobStatus.DRAFT

// Submit
job.getStatus() == JobStatus.DRAFT

// Approve
job.getStatus() == JobStatus.PENDING_APPROVAL

// Reject
job.getStatus() == JobStatus.PENDING_APPROVAL

// Close
job.getStatus() != JobStatus.CLOSED
```

Invalid authorization or status transitions are rejected using the project’s existing `AppException` and API error response style.

