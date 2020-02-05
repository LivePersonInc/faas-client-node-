import { AppJwtCredentials } from './../types/appJwtCredentials';
import { IsImplementedCache } from './../helper/isImplementedCache';
import * as request from 'request-promise';
import { Guid } from 'guid-typescript';
import { BaseClient } from './baseClient';
import { Config, defaultConfig } from './clientConfig';
import { Tooling, Fetch, GetCsdsEntry } from '../types/tooling';
import { CsdsClient } from '../helper/csdsClient';
import { RequestError } from 'request-promise/errors';

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

  const defaultFetch: Fetch = async ({ url, body, headers, method }) => {
    try {
      const resp = await request(url, {
        body,
        headers,
        method,
        json: true,
        simple: true,
        resolveWithFullResponse: true,
        timeout: config.timeout,
      });

      return {
        url,
        headers: resp.headers,
        body: resp.body,
        ok: true,
        status: resp.statusCode,
        statusText: resp.statusMessage,
      };
    } catch (error) {
      if (error instanceof RequestError) {
        throw error;
      }
      const { response: resp } = error;
      return {
        url,
        headers: resp.headers,
        body: resp.body,
        ok: false,
        status: resp.statusCode,
        statusText: resp.statusMessage,
      };
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
    const configuration = { ...defaultConfig, ...config };
    super(configuration, getTooling(configuration, tooling));
  }
}
