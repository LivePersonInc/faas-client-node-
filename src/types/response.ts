import { Headers } from './headers';
export interface Response {
  body: any;
  headers: Headers;
  url: string;
  ok: boolean;
  status: number;
  statusText: string;
}
