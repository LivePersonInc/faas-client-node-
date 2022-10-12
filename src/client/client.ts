import {IsImplementedCache} from './../helper/isImplementedCache';
import {Guid} from 'guid-typescript';
import {BaseClient} from './baseClient';
import {Config, defaultConfig} from './clientConfig';
import {Tooling, Fetch, GetCsdsEntry} from '../types/tooling';
import {CsdsClient} from '../helper/csdsClient';
import {RETRIABLE_ERRORS} from '../helper/networkErrors';
import {Response} from '../types/response';
import {RequestError, RetryObject} from 'got';
import got from 'got';

const getTooling = (
  config: Required<Config>,
  tooling?: Partial<Tooling>
): Tooling => {
  const customTooling: Partial<Tooling> = tooling || {};

  const defaultGetCsdsEntry = (): GetCsdsEntry => {
    const csdsClient = new CsdsClient(config.csdsTtlSeconds);

    return csdsClient.get.bind(csdsClient);
  };

  const getCsdsEntry = customTooling.getCsdsEntry || defaultGetCsdsEntry();

  const metricCollector = customTooling.metricCollector;

  const defaultFetch: Fetch = async ({url, body, headers, method}) => {
    try {
      const resp = await got(url, {
        ...(method === 'post' && {body: Buffer.from(JSON.stringify(body))}),
        method,
        headers,
        resolveBodyOnly: false,
        responseType: 'json',
        throwHttpErrors: true,
        timeout: {
          request: config.timeout,
        },
        retry: {
          limit: 3,
          methods: ['GET', 'POST'],
          errorCodes: RETRIABLE_ERRORS,
          calculateDelay: ({computedValue, attemptCount}: RetryObject) => {
            return computedValue ? attemptCount * 350 : 0;
          },
        },
      });

      return {
        url,
        headers: resp.headers,
        body: resp.body,
        ok: true,
        status: resp.statusCode,
        statusText: resp.statusMessage,
      } as Response;
    } catch (error) {
      const {response: resp, request: req} = error as RequestError;
      return {
        url,
        headers: resp?.headers,
        body: resp?.body,
        ok: false,
        status: resp?.statusCode,
        statusText: resp?.statusMessage,
        retryCount: req?.retryCount,
      } as Response;
    }
  };

  const isImplementedCache = new IsImplementedCache(
    config.isImplementedCacheDurationInSeconds
  );

  const defaultGenerateId = () => Guid.create().toString();

  return {
    getCsdsEntry,
    fetch: customTooling.fetch || defaultFetch,
    generateId: customTooling.generateId || defaultGenerateId,
    isImplementedCache,
    metricCollector,
  };
};

/**
 * The FaaS Client.
 */
export class Client extends BaseClient {
  /**
   * Default constructor, creates a FaaS client.
   *
   * @param config The client configuration.
   * @param tooling Optional tooling used internally in the client, usually only needed for debugging/testing purposes.
   */
  constructor(config: Config, tooling?: Tooling) {
    const configuration = {...defaultConfig, ...config};
    super(configuration, getTooling(configuration, tooling));
  }
}
