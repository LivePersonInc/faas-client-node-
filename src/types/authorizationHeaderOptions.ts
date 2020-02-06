import { HTTTP_METHOD } from './getUrlOptions';
export interface AuthorizationHeaderOptions {
  readonly url: string;
  readonly method: typeof HTTTP_METHOD[keyof typeof HTTTP_METHOD];
  readonly [others: string]: any;
}
