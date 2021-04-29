import {
  MetricCollector,
  InvocationMetricData,
} from '../src/helper/metricCollector';

export class TestMetricCollector implements MetricCollector {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onInvoke(_invocationData: InvocationMetricData): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onGetLambdas(_invocationData: InvocationMetricData): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onIsImplemented(_invocationData: InvocationMetricData): void {}
}
