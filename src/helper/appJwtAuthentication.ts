import {
  create as oauth2Create,
  ModuleOptions as Oauth2Options,
  Token,
} from 'simple-oauth2';
import {decode as jwtDecode} from 'jsonwebtoken';
import {GetCsdsEntry} from '../types/tooling';
import VError = require('verror');

interface Options {
  accountId: string;
  clientId: string;
  clientSecret: string;
  getCsdsEntry: GetCsdsEntry;
  expirationBufferMinutes?: number;
}

export class AppJwtAuthentication {
  private accountId: string;
  private clientId: string;
  private clientSecret: string;
  private getCsdsEntry: GetCsdsEntry;
  private expirationBufferMinutes: number;

  private currentJwt: {
    exp: number;
  };

  private currentAccessToken: string;
  constructor({
    accountId,
    clientId,
    clientSecret,
    getCsdsEntry,
    expirationBufferMinutes = 30,
  }: Options) {
    this.accountId = accountId;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.getCsdsEntry = getCsdsEntry;
    this.expirationBufferMinutes = expirationBufferMinutes;

    this.currentJwt = {
      exp: 0,
    };
    this.currentAccessToken = '';
  }

  async getHeader(): Promise<string> {
    try {
      return await this.getAccessToken();
    } catch (error) {
      throw new VError(
        {
          cause: error as Error,
          name: 'FaaSAppJWTAuthenticationError',
        },
        'Error while creating authentication bearer via AppJWT (Client Credentials)'
      );
    }
  }

  private async getAccessToken() {
    if (this.isCurrentJwtExpiring()) {
      const options = await this.getOptions();
      const {clientCredentials} = oauth2Create(options);

      const {access_token}: Token = await clientCredentials.getToken({
        scope: [],
      });

      const jwt: unknown = jwtDecode(access_token);

      if (jwt !== null) {
        this.currentAccessToken = access_token;
        this.currentJwt = jwt as {exp: number};
      } else if (this.isJwtExpired(this.currentJwt)) {
        throw new VError(
          {
            name: 'FaaSAppJWTRetrievalError',
            info: {
              access_token,
            },
          },
          'Current AppJWT is expired and new Jwt could not be retrieved.'
        );
      }
    }
    return `Bearer ${this.currentAccessToken}`;
  }

  private isCurrentJwtExpiring(): boolean {
    return (
      Date.now() / 1000 >
      this.currentJwt.exp - this.expirationBufferMinutes * 60
    );
  }

  private isJwtExpired(jwt: Record<string, number>): boolean {
    return Date.now() / 1000 > jwt.exp;
  }

  private async getOptions(): Promise<Oauth2Options> {
    const sentinelDomain = await this.getCsdsEntry(this.accountId, 'sentinel');

    return {
      client: {
        id: this.clientId,
        secret: this.clientSecret,
      },
      auth: {
        tokenHost: `https://${sentinelDomain}`,
        tokenPath: `/sentinel/api/account/${this.accountId}/app/token?v=2.0`,
      },
      options: {
        authorizationMethod: 'body',
      },
    };
  }
}
