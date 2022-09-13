import {Headers} from './headers';
export interface Response {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  headers: Headers;
  url: string;
  ok: boolean;
  status: number;
  statusText: string;
  retryCount?: number;
}
