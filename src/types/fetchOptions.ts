import { InvocationDomain } from './apiSpec';
import { HttpMethod } from './getUrlOptions';
import { AuthorizationHeaderOptions } from './authorizationHeaderOptions';
import { Headers } from './headers';

export interface FetchOptions {
  readonly url: string;
  readonly body?: any;
  readonly headers?: Headers;
  readonly method?: typeof HttpMethod[keyof typeof HttpMethod];
}

export interface DoFetchOptions extends AuthorizationHeaderOptions {
  readonly body?: InvocationDomain;
  readonly requestId: string;
  readonly failOnErrorStatusCode?: boolean;
}
