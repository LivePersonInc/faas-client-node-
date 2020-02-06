import { InvocationDomain } from './apiSpec';
import { HTTTP_METHOD } from './getUrlOptions';
import { AuthorizationHeaderOptions } from './authorizationHeaderOptions';
import { Headers } from './headers';

export interface FetchOptions {
  readonly url: string;
  readonly body?: any;
  readonly headers?: Headers;
  readonly method?: typeof HTTTP_METHOD[keyof typeof HTTTP_METHOD];
}

export interface DoFetchOptions extends AuthorizationHeaderOptions {
  readonly body?: InvocationDomain;
  readonly requestId: string;
  readonly failOnErrorStatusCode?: boolean;
}
