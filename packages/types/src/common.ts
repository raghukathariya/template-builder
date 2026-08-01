export type Id = string;

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface ActorRef {
  id: Id;
  name?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
