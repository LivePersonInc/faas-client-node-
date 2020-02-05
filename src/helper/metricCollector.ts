export interface InvocationMetricData {
  accountId: string;
  requestDurationInMillis: number;
  domain?: string;
  externalSystem?: string;
  userId?: string;
  event?: string;
  UUID?: string;
  statusCode?: number;
  error?: Error;
  fromCache?: boolean;
}
export interface MetricCollector {
  onInvoke(invocationData: InvocationMetricData): void;
  onGetLambdas(invocationData: InvocationMetricData): void;
  onIsImplemented(invocationData: InvocationMetricData): void;
}
