import * as jwt from 'jsonwebtoken';
import request from 'request-promise';
import { BaseClient } from '../../src/client/baseClient';
import { Client } from '../../src/client/client';
import { CsdsClient } from '../../src/helper/csdsClient';
import { BaseConfig, Config } from '../../src/client/clientConfig';

jest.mock('../../src/helper/csdsClient', () => {
  return {
    CsdsClient: jest.fn().mockImplementation(() => {
      return {
        get: jest.fn(() => 'someDomain'),
      };
    }),
  };
});
jest.mock('request-promise', () => {
  return jest.fn(async url => {
    return {
      url: 'helloWorld',
      headers: {
        'Content-Type': 'application/json',
      },
      body: { resp: 'body' },
      ok: true,
      status: 200,
      statusText: 'OK',
    };
  });
});
jest.mock('simple-oauth2', () => ({
  create: () => ({
    clientCredentials: {
      getToken: async () => ({
        access_token: jwt.sign(
          {
            aud: 'le4711',
            azp: 'bf16f923-b256-40c8-afa5-1b8e8372da09',
            scope: 'faas.lambda.invoke',
            iss: 'Sentinel',
            exp: Date.now() / 1000 + 60 * 60,
            iat: Date.now(),
          },
          'mySecret'
        ),
      }),
    },
  }),
}));

const requestMock: jest.Mock<any> = request as any;

const testConfig: Required<BaseConfig> = {
  accountId: '123456',
  authStrategy: {
    clientId: 'foo',
    clientSecret: 'bar',
  },
};

describe('Client', () => {
  afterEach(jest.clearAllMocks);
  describe('success flows', () => {
    test('class and constructor - Base', () => {
      const client = new Client(testConfig);
      expect(CsdsClient).toHaveBeenCalledTimes(1);
      expect(client).toBeInstanceOf(Client);
      expect(client).toBeInstanceOf(BaseClient);
    });

    test('invoke method', async () => {
      const client1 = new Client(testConfig);

      await expect(
        client1.invoke({
          eventId: 'fooBar',
          externalSystem: 'testSystem',
          body: {
            payload: {},
          },
        })
      ).resolves.toBeNonEmptyObject();

      const client2 = new Client({ ...testConfig, accountId: 'le12345' });
      await expect(
        client2.invoke({
          eventId: 'fooBar',
          externalSystem: 'testSystem',
          body: {
            payload: {},
          },
        })
      ).resolves.toBeNonEmptyObject();
      expect(request).toHaveBeenCalledTimes(2);
    });

    test('getLambdas method', async () => {
      const client = new Client({ ...testConfig, accountId: 'fr12345' });
      await expect(
        client.getLambdas({
          accountId: '123456',
          externalSystem: 'testSystem',
        })
      ).resolves.toBeNonEmptyObject();

      expect(request).toHaveBeenCalledTimes(1);
    });
  });

  describe('Unhappy flows', () => {
    test('should throw if Funcitnos returns a none-okay status code', () => {
      requestMock.mockRejectedValueOnce({
        response: {
          headers: [],
          body: {},
          statusCode: 502,
          statusMessage: 'Whoops',
        },
      });
      const config: Config = { ...testConfig, failOnErrorStatusCode: true };
      const client = new Client(config);

      expect(
        client.invoke({
          lambdaUuid: '4711',
          externalSystem: 'test-system',
          body: {
            payload: {},
          },
        })
      ).rejects.toMatchObject({
        name: 'FaaSInvokeError',
        message: expect.stringContaining('502 - Whoops'),
      });
    });
  });
});
