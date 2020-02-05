import { HttpMethod } from './getUrlOptions';
export interface AuthorizationHeaderOptions {
  readonly url: string;
  readonly method: typeof HttpMethod[keyof typeof HttpMethod];
  readonly [others: string]: any;
}
