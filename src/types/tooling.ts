import {MetricCollector} from '../helper/metricCollector';
import {IsImplementedCache} from '../helper/isImplementedCache';
import {FetchOptions} from './fetchOptions';
import {Response} from './response';

export interface Tooling {
  readonly getCsdsEntry: GetCsdsEntry;
  readonly fetch: Fetch;
  readonly generateId: GenerateId;

  readonly metricCollector?: MetricCollector;
  readonly isImplementedCache: IsImplementedCache;
}

export type GetCsdsEntry = (
  account: string,
  csdsType: string
) => Promise<string>;
export type Fetch = (
  options: FetchOptions,
  attempt?: number
) => Promise<Response>;
export type GenerateId = () => string;
