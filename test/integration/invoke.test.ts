import { AppJwtCredentials } from './../../src/types/appJwtCredentials';
import { Client } from '../../src/client/client';
import { stringLiteral } from '@babel/types';

const successLambdaUUID =
  process.env['SUCCESS_LAMBDA_UUID'] || 'does-not-exist';
const accountId = process.env['ACCOUNT_ID'] || 'does-not-exist';
const clientId = process.env['CLIENT_ID'] || 'does-not-exist';
const clientSecret = process.env['CLIENT_SECRET'] || 'does-not-exist';
const appJwtCredentials: AppJwtCredentials = {
  clientId,
  clientSecret,
};
describe('Invoke by UUID', () => {
  it('should invoke and get result', async () => {
    const client = new Client({
      accountId,
      authStrategy: appJwtCredentials,
      failOnErrorStatusCode: true,
    });
    const payload = {
      foo: 'bar',
    };

    const response = await client.invoke({
      lambdaUuid: successLambdaUUID,
      externalSystem: 'integration-tests',
      body: {
        headers: [],
        payload,
      },
    });

    expect(response.ok).toEqual(true);
  });

  it('should fail if lambda does not exist', async () => {
    const client = new Client({
      accountId,
      authStrategy: appJwtCredentials,
      failOnErrorStatusCode: true,
    });
    const payload = {
      foo: 'bar',
    };

    expect(
      client.invoke({
        lambdaUuid: 'does-not-exist',
        externalSystem: 'integration-tests',
        body: {
          headers: [],
          payload,
        },
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining(
        `There is no does-not-exist deployed on ${accountId}`
      ),
      name: 'FaaSInvokeError',
    });
  });
});

describe('Invoke by event id', () => {
  it('should invoke and get result', async () => {
    const client = new Client({
      accountId,
      authStrategy: appJwtCredentials,
      failOnErrorStatusCode: true,
    });
    const payload = {
      foo: 'bar',
    };

    const response = await client.invoke({
      eventId: 'conversational_commands',
      externalSystem: 'integration-tests',
      body: {
        headers: [],
        payload,
      },
    });

    expect(response.ok).toEqual(true);
    expect(response.body).toEqual([]);
  });
});
