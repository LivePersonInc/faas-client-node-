export interface GetUrlOptions {
  readonly accountId: string;
  readonly domain: string;
  readonly apiVersion: string;
  readonly externalSystem?: string;
  readonly protocol: typeof Protocol[keyof typeof Protocol];
  readonly path: string;

  readonly [others: string]: any;
}

export const HttpMethod = Object.freeze({
  POST: 'post',
  GET: 'get',
} as const);

export const Protocol = Object.freeze({
  HTTP: 'http',
  HTTPS: 'https',
} as const);
