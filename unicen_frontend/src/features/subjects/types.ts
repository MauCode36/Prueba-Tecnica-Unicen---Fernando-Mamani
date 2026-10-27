/** Subject of the academic catalog. */
export interface Subject {
  id: string
  code: string
  name: string
  credits: number
  createdAt: string
}

/** Payload for POST /subjects. */
export interface CreateSubjectRequest {
  code: string
  name: string
  credits: number
}

/** Payload for PATCH /subjects/:id. */
export type UpdateSubjectRequest = Partial<CreateSubjectRequest>
