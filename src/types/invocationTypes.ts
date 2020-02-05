import { Event, InvocationDomain } from './apiSpec';
import { HttpMethod } from './getUrlOptions';
import { BaseConfig } from '../client/clientConfig';

export interface BaseInvocation extends Partial<BaseConfig> {
  readonly method?: typeof HttpMethod[keyof typeof HttpMethod];
  readonly externalSystem: string;
  readonly apiVersion?: string;
  readonly userId?: string;
}

export interface BasePostInvocation extends BaseInvocation {
  readonly body: InvocationDomain;
}

export interface EventRequest {
  // setting specifying it with "| string" allows to the use of future event names that are not bundled
  // in the current typings
  readonly eventId: typeof Event[keyof typeof Event] | string;
}

export interface FilterLambdas extends Partial<EventRequest> {
  readonly state?: string | string[];
  readonly name?: string;
}

export type Invocation = EventInvocation | UuidInvocation;

export type IsImplemented = BaseInvocation & EventRequest;

export type LambdaRequest = FilterLambdas & Partial<BaseInvocation>;

export type EventInvocation = BasePostInvocation & EventRequest;

export interface UuidInvocation extends BasePostInvocation {
  readonly lambdaUuid: string;
}
