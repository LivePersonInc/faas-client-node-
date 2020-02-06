import { VError } from 'verror';
import {
  DefaultConfig,
  BaseConfig,
  Config,
} from '../../src/client/clientConfig';
import { PROTOCOL, HTTTP_METHOD } from '../../src/types/getUrlOptions';
import { Tooling } from '../../src/types/tooling';
import { IsImplementedCache } from '../../src/helper/isImplementedCache';
import { Response } from '../../src/types/response';
import { Invocation, LambdaRequest } from '../../src/types/invocationTypes';
import { BaseClient, EVENT } from '../../src';

const defaultTestConfig: Required<DefaultConfig> = {
  gwCsdsServiceName: 'faasGW',
  uiCsdsServiceName: 'faasUI',
  apiVersion: '1',
  timeout: 10_000, // ms
  protocol: PROTOCOL.HTTPS,
  getLambdasUri: 'api/account/%s/lambdas/',
  invokeUuidUri: 'api/account/%s/lambdas/%s/invoke',
  invokeEventUri: 'api/account/%s/events/%s/invoke',
  isImplementedUri: 'api/account/%s/events/%s/isImplemented',
  failOnErrorStatusCode: false,
  csdsHttpHeaders: {},
  csdsTtlSeconds: 600,
  jwtRefreshAfterMinutes: 30,
  isImplementedCacheDurationInSeconds: 60,
};

const testBaseConfig: Required<BaseConfig> = {
  accountId: '123456',
  authStrategy: jest.fn(async () => {
    return 'authorizationHeader';
  }),
};

const testConfig: Required<Config> = {
  ...defaultTestConfig,
  ...testBaseConfig,
};

const testTooling: Required<Tooling> = {
  fetch: jest.fn(async () => ({
    body: {
      implemented: true,
    },
    headers: {},
    url: 'https://test-domain.com/',
    ok: true,
    status: 200,
    statusText: 'Ok',
  })),
  generateId: jest.fn(() => 'testId'),
  getCsdsEntry: jest.fn(() => Promise.resolve('test-domain.com')),
  isImplementedCache: new IsImplementedCache(
    defaultTestConfig.isImplementedCacheDurationInSeconds
  ),
  metricCollector: {
    onInvoke: jest.fn(() => {}),
    onGetLambdas: jest.fn(() => {}),
    onIsImplemented: jest.fn(() => {}),
  },
};

const baseChecks = (resp: Response): void => {
  expect(resp).toBeDefined();
  expect(testTooling.generateId).toHaveBeenCalledTimes(1);
  expect(testTooling.getCsdsEntry).toHaveBeenCalledTimes(1);
  expect(testTooling.fetch).toHaveBeenCalledTimes(1);
};

const invoke = async (data: Invocation): Promise<Response> => {
  const client = new BaseClient(testConfig, testTooling);
  const resp = await client.invoke(data);

  baseChecks(resp);
  expect(testTooling.getCsdsEntry).toHaveBeenCalledWith(
    testConfig.accountId,
    testConfig.gwCsdsServiceName
  );
  expect(testTooling.metricCollector.onInvoke).toHaveBeenCalledTimes(1);
  expect(testTooling.metricCollector.onInvoke).toHaveBeenCalledWith(
    expect.objectContaining({
      accountId: testConfig.accountId,
      externalSystem: 'test',
      fromCache: false,
      domain: 'test-domain.com',
    })
  );

  expect(testTooling.fetch).toHaveBeenCalledWith(
    expect.objectContaining({
      url: expect.toBeNonEmptyString(),
      body: expect.objectContaining({
        timestamp: expect.toBeNumber(),
      }),
      headers: expect.objectContaining({
        Authorization: expect.toBeNonEmptyString(),
        'Content-Type': expect.toBeNonEmptyString(),
        'User-Agent': expect.toBeNonEmptyString(),
        'X-Request-ID': expect.toBeNonEmptyString(),
      }),
      method: HTTTP_METHOD.POST,
    })
  );
  return resp;
};

const getLambdas = async (data: LambdaRequest): Promise<Response> => {
  const client = new BaseClient(testConfig, testTooling);
  const resp = await client.getLambdas(data);
  baseChecks(resp);
  expect(testTooling.getCsdsEntry).toHaveBeenCalledWith(
    testConfig.accountId,
    testConfig.uiCsdsServiceName
  );

  expect(testTooling.metricCollector.onGetLambdas).toHaveBeenCalledTimes(1);

  expect(testTooling.metricCollector.onGetLambdas).toHaveBeenCalledWith(
    expect.objectContaining({
      accountId: testConfig.accountId,
      fromCache: false,
      externalSystem: 'test',
      domain: 'test-domain.com',
    })
  );

  expect(testTooling.fetch).toHaveBeenCalledWith(
    expect.objectContaining({
      url: expect.toBeNonEmptyString(),
      headers: expect.objectContaining({
        Authorization: expect.toBeNonEmptyString(),
        'Content-Type': expect.toBeNonEmptyString(),
        'User-Agent': expect.toBeNonEmptyString(),
        'X-Request-ID': expect.toBeNonEmptyString(),
      }),
      method: HTTTP_METHOD.GET,
    })
  );
  return resp;
};

describe('Base Client', () => {
  afterEach(jest.clearAllMocks);
  describe('success flows', () => {
    test('class and constructor', () => {
      const client = new BaseClient(testConfig, testTooling);

      expect(client).toBeInstanceOf(BaseClient);
      expect(client.version).toBeDefined();
      expect(client.invoke).toBeDefined();
      expect(client.getLambdas).toBeDefined();
      expect(client.isImplemented).toBeDefined();
    });

    test('invoke method with eventId', async () => {
      expect.hasAssertions();
      await invoke({
        eventId: EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION,
        body: { payload: null },
        externalSystem: 'test',
      });
    });

    test('invoke method with lambda UUID', async () => {
      expect.hasAssertions();
      await invoke({
        lambdaUuid: '12345678',
        body: { payload: null },
        externalSystem: 'test',
      });
    });

    test('isImplemented method', async () => {
      expect.hasAssertions();
      const client = new BaseClient(testConfig, testTooling);
      const hasBeenImplemented = await client.isImplemented({
        eventId: EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION,
        externalSystem: 'test',
      });
      expect(testTooling.metricCollector.onIsImplemented).toHaveBeenCalledTimes(
        1
      );
      expect(testTooling.metricCollector.onIsImplemented).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: testConfig.accountId,
          event: EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION,
          externalSystem: 'test',
          domain: 'test-domain.com',
          fromCache: false,
        })
      );
      expect(hasBeenImplemented).toBeTrue();
      expect(testTooling.generateId).toHaveBeenCalledTimes(1);
      expect(testTooling.getCsdsEntry).toHaveBeenCalledTimes(1);
      expect(testTooling.fetch).toHaveBeenCalledTimes(1);
      const hasBeenImplementedAgain = await client.isImplemented({
        eventId: EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION,
        externalSystem: 'test',
      });
      // should still only have been called once as second call result was cached
      expect(testTooling.fetch).toHaveBeenCalledTimes(1);
      expect(hasBeenImplementedAgain).toBeTrue();
      expect(testTooling.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.toBeNonEmptyString(),
          headers: expect.objectContaining({
            Authorization: expect.toBeNonEmptyString(),
            'Content-Type': expect.toBeNonEmptyString(),
            'User-Agent': expect.toBeNonEmptyString(),
            'X-Request-ID': expect.toBeNonEmptyString(),
          }),
          method: HTTTP_METHOD.GET,
        })
      );
    });
    test('isImplemented with Cache Expired', async () => {
      const testToolingChanged = {
        ...testTooling,
        isImplementedCache: new IsImplementedCache(3),
      };
      const client = new BaseClient(testConfig, testToolingChanged);
      await client.isImplemented({
        eventId: EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION,
        externalSystem: 'test',
      });

      expect(testTooling.metricCollector.onIsImplemented).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: testConfig.accountId,
          event: EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION,
          externalSystem: 'test',
          domain: 'test-domain.com',
          fromCache: false,
        })
      );

      await new Promise(r => setTimeout(r, 2000));
      await client.isImplemented({
        eventId: EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION,
        externalSystem: 'test',
      });
      // will be called only once because cache has stored prior result
      expect(testTooling.fetch).toHaveBeenCalledTimes(1);
      expect(testTooling.metricCollector.onIsImplemented).toHaveBeenCalledTimes(
        2
      );
      expect(testTooling.metricCollector.onIsImplemented).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: testConfig.accountId,
          event: EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION,
          externalSystem: 'test',
          domain: 'unresolved',
          fromCache: true,
        })
      );
    });

    test('getLambdas with filtering', async () => {
      expect.hasAssertions();
      await getLambdas({
        accountId: '123456',
        eventId: EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION,
        externalSystem: 'test',
        state: ['Productive'],
      });
    });

    test('getLambdas without filtering', async () => {
      expect.hasAssertions();
      await getLambdas({
        accountId: '123456',
        externalSystem: 'test',
      });
    });
  });

  describe('failure flows', () => {
    test('invoke method with eventId with failed csds lookup', async () => {
      expect.hasAssertions();

      const failureTooling = {
        ...testTooling,
        getCsdsEntry: jest.fn(() => {
          const error = new Error('test csds error 1');
          const vError = new VError(
            {
              cause: error,
            },
            'Test error'
          );
          return Promise.reject(vError);
        }),
      };

      const client = new BaseClient(testConfig, failureTooling);
      await expect(
        client.invoke({
          eventId: EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION,
          body: { payload: null },
          externalSystem: 'test',
        })
      ).rejects.toBeInstanceOf(VError);

      expect(failureTooling.getCsdsEntry).toHaveBeenCalledTimes(1);
      expect(failureTooling.metricCollector.onInvoke).toHaveBeenCalledTimes(1);
      expect(failureTooling.metricCollector.onInvoke).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: testConfig.accountId,
          fromCache: false,
          externalSystem: 'test',
          event: EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION,
          domain: 'unresolved',
        })
      );
    });

    test('invoke method with lambda UUID with failed csds lookup', async () => {
      expect.hasAssertions();

      const failureTooling = {
        ...testTooling,
        getCsdsEntry: jest.fn(() => {
          const error = new Error('test csds error 2');
          const vError = new VError(
            {
              cause: error,
            },
            'Test csds error'
          );
          return Promise.reject(vError);
        }),
      };

      const client = new BaseClient(testConfig, failureTooling);

      await expect(
        client.invoke({
          lambdaUuid: '12345678',
          body: { payload: null },
          externalSystem: 'test',
        })
      ).rejects.toBeInstanceOf(VError);

      expect(failureTooling.getCsdsEntry).toHaveBeenCalledTimes(1);
      expect(failureTooling.metricCollector.onInvoke).toHaveBeenCalledTimes(1);
      expect(failureTooling.metricCollector.onInvoke).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: testConfig.accountId,
          fromCache: false,
          externalSystem: 'test',
          UUID: '12345678',
          domain: 'unresolved',
        })
      );
    });

    test('invoke method with lambda UUID with failed fetch request', async () => {
      expect.hasAssertions();

      const failureTooling = {
        ...testTooling,
        fetch: jest.fn(() => Promise.reject(new Error('test fetch error 1'))),
      };

      const client = new BaseClient(testConfig, failureTooling);
      await expect(
        client.invoke({
          lambdaUuid: '12345678',
          body: { payload: null },
          externalSystem: 'test',
        })
      ).rejects.toBeInstanceOf(VError);

      expect(failureTooling.fetch).toHaveBeenCalledTimes(1);
      expect(failureTooling.metricCollector.onInvoke).toHaveBeenCalledTimes(1);
      expect(failureTooling.metricCollector.onInvoke).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: testConfig.accountId,
          fromCache: false,
          externalSystem: 'test',
          UUID: '12345678',
          domain: 'test-domain.com',
        })
      );
    });

    test('invoke method with lambda UUID with failed custom error', async () => {
      expect.hasAssertions();

      const failureTooling = {
        ...testTooling,
        fetch: jest.fn(async () => ({
          ok: false,
          body: {
            errorCode: 'com.liveperson.faas.handler.custom-failure',
            errorMsg: 'Oops, something went wrong.',
          },
          headers: {},
          url: 'https://test-domain.com/',
          status: 500,
          statusText: 'Ok',
        })),
      };

      const customTestConfig = { ...testConfig, failOnErrorStatusCode: true };

      const client = new BaseClient(customTestConfig, failureTooling);
      await expect(
        client.invoke({
          lambdaUuid: '12345678',
          body: { payload: null },
          externalSystem: 'test',
        })
      ).rejects.toMatchObject({
        name: 'FaaSLambdaError',
      });

      expect(failureTooling.fetch).toHaveBeenCalledTimes(1);
      expect(failureTooling.metricCollector.onInvoke).toHaveBeenCalledTimes(1);
      expect(failureTooling.metricCollector.onInvoke).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: testConfig.accountId,
          fromCache: false,
          externalSystem: 'test',
          UUID: '12345678',
          domain: 'test-domain.com',
        })
      );
    });

    test('invoke method with lambda UUID with failed undefined error', async () => {
      expect.hasAssertions();

      const failureTooling = {
        ...testTooling,
        fetch: jest.fn(async () => ({
          ok: false,
          body: undefined,
          headers: {},
          url: 'https://test-domain.com/',
          status: 500,
          statusText: 'Ok',
        })),
      };

      const customTestConfig = { ...testConfig, failOnErrorStatusCode: true };

      const client = new BaseClient(customTestConfig, failureTooling);
      await expect(
        client.invoke({
          lambdaUuid: '12345678',
          body: { payload: null },
          externalSystem: 'test',
        })
      ).rejects.toMatchObject({
        name: 'FaaSInvokeError',
      });

      expect(failureTooling.fetch).toHaveBeenCalledTimes(1);
    });

    test('isImplemented method with failed csds lookup', async () => {
      expect.hasAssertions();

      const failureTooling = {
        ...testTooling,
        getCsdsEntry: jest.fn(() =>
          Promise.reject(new Error('test csds error 3'))
        ),
      };

      const client = new BaseClient(testConfig, failureTooling);
      await expect(
        client.isImplemented({
          eventId: EVENT.DENVER_POST_SURVEY_EMAIL_TRANSCRIPT,
          externalSystem: 'test',
        })
      ).rejects.toBeInstanceOf(VError);

      expect(failureTooling.getCsdsEntry).toHaveBeenCalledTimes(1);
      expect(
        failureTooling.metricCollector.onIsImplemented
      ).toHaveBeenCalledTimes(1);
      expect(
        failureTooling.metricCollector.onIsImplemented
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: testConfig.accountId,
          fromCache: false,
          externalSystem: 'test',
          event: EVENT.DENVER_POST_SURVEY_EMAIL_TRANSCRIPT,
          domain: 'unresolved',
        })
      );
    });

    test('isImplemented method with unsuccessful fetch response', async () => {
      expect.hasAssertions();

      const failureTooling = {
        ...testTooling,
        fetch: jest.fn(() =>
          Promise.resolve({
            body: {},
            headers: {},
            url: 'https://test-domain.com/',
            ok: false,
            status: 400,
            statusText: 'Bad Request',
          })
        ),
      };
      const customTestConfig = { ...testConfig, failOnErrorStatusCode: true };

      const client = new BaseClient(customTestConfig, failureTooling);
      await expect(
        client.isImplemented({
          eventId: EVENT.DENVER_POST_SURVEY_EMAIL_TRANSCRIPT,
          externalSystem: 'test',
        })
      ).rejects.toBeInstanceOf(VError);

      expect(failureTooling.fetch).toHaveBeenCalledTimes(1);
      expect(
        failureTooling.metricCollector.onIsImplemented
      ).toHaveBeenCalledTimes(1);
      expect(
        failureTooling.metricCollector.onIsImplemented
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: testConfig.accountId,
          fromCache: false,
          externalSystem: 'test',
          event: EVENT.DENVER_POST_SURVEY_EMAIL_TRANSCRIPT,
          domain: 'test-domain.com',
        })
      );
    });

    test('getLambdas failed csds lookup', async () => {
      expect.hasAssertions();

      const failureTooling = {
        ...testTooling,
        getCsdsEntry: jest.fn(() =>
          Promise.reject(new Error('test csds error 4'))
        ),
      };

      const client = new BaseClient(testConfig, failureTooling);
      await expect(
        client.getLambdas({
          accountId: '12345678',
          eventId: EVENT.CONTROLLERBOT_MESSAGING_NEW_CONVERSATION,
          externalSystem: 'test',
        })
      ).rejects.toBeInstanceOf(VError);

      expect(failureTooling.getCsdsEntry).toHaveBeenCalledTimes(1);
      expect(failureTooling.metricCollector.onGetLambdas).toHaveBeenCalledTimes(
        1
      );
      expect(failureTooling.metricCollector.onGetLambdas).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: testConfig.accountId,
          fromCache: false,
          externalSystem: 'test',
          domain: 'unresolved',
        })
      );
    });
  });
});
