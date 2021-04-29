import * as jwt from 'jsonwebtoken';
import {AppJwtAuthentication} from '../../src/helper/appJwtAuthentication';

const validAccessToken = jwt.sign(
  {
    aud: 'le4711',
    azp: 'bf16f923-b256-40c8-afa5-1b8e8372da09',
    scope: 'faas.lambda.invoke',
    iss: 'Sentinel',
    exp: Date.now() / 1000 + 60 * 60,
    iat: Date.now(),
  },
  'mySecret'
);

const invalidAccessToken = 'not-a-valid-token';

const mockClientCredentials = (accessToken: string) => ({
  clientCredentials: {
    getToken: async () => ({
      access_token: accessToken,
    }),
  },
});

jest.mock('simple-oauth2', () => ({
  create: jest.fn(() => mockClientCredentials(validAccessToken)),
}));

import {create} from 'simple-oauth2';

const createMock = create as any;

describe('AppJWT Authentication', () => {
  afterEach(jest.clearAllMocks);
  describe('Success flows', () => {
    const getCsdsEntry = async () => 'sentinel.liveperson.net';

    it('should return bearer header', async () => {
      const auth = new AppJwtAuthentication({
        accountId: 'le4711',
        clientId: '4711',
        clientSecret: '4711',
        getCsdsEntry,
      });

      const bearer = await auth.getHeader();

      expect(create).toBeCalledTimes(1);
      expect(bearer).toBeNonEmptyString();
      expect(bearer).toContain('Bearer');
    });

    it('should not create a new one if old one is not expired', async () => {
      const auth = new AppJwtAuthentication({
        accountId: 'le4711',
        clientId: '4711',
        clientSecret: '4711',
        getCsdsEntry,
      });

      await auth.getHeader();
      await auth.getHeader();

      expect(create).toBeCalledTimes(1);
    });
  });

  describe('Unhappy flows', () => {
    const getCsdsEntry = async () => 'sentinel.liveperson.net';

    it('should throw error if access token invalid', async () => {
      createMock.mockReturnValue(mockClientCredentials(invalidAccessToken));

      const auth = new AppJwtAuthentication({
        accountId: 'le4711',
        clientId: '4711',
        clientSecret: '4711',
        getCsdsEntry,
      });

      expect(auth.getHeader()).rejects.toMatchObject({
        name: 'FaaSAppJWTAuthenticationError',
        message:
          'Error while creating authentication bearer via AppJWT (Client Credentials): Current AppJWT is expired and new Jwt could not be retrieved.',
      });
    });

    it('should not reset the access token if retrieving the JWT failed but the old JWT is still active', async () => {
      createMock
        .mockReturnValueOnce(mockClientCredentials(validAccessToken))
        .mockReturnValueOnce(mockClientCredentials(invalidAccessToken));

      const auth = new AppJwtAuthentication({
        accountId: 'le4711',
        clientId: '4711',
        clientSecret: '4711',
        getCsdsEntry,
        expirationBufferMinutes: 70,
      });

      const bearer = await auth.getHeader();
      const bearer2 = await auth.getHeader();

      expect(create).toBeCalledTimes(2);
      expect(bearer).toBeNonEmptyString();
      expect(bearer).toContain('Bearer');
      expect(bearer2).toEqual(bearer);
    });
  });
});
