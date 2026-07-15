export interface RetailerChildService {
  id: string;
  name: string;
  /** Internal only — never render in UI */
  code?: string;
  parentId?: string;
  parentName?: string;
}

export interface RetailerParentService {
  id: string;
  name: string;
  children: RetailerChildService[];
  /** Internal only — never render in UI */
  code?: string;
}

export interface RetailerServicesState {
  parents: RetailerParentService[];
  children: RetailerChildService[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
}
