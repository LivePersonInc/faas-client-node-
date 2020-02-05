export interface AppJwtCredentials {
  /**
   * The OAuth2 Client ID. Can be overridden per invocation.
   */
  readonly clientId: string;
  /**
   * The OAuth2 Client secret. Can be overridden per invocation.
   */
  readonly clientSecret: string;
}
