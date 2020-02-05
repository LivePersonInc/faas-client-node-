import {
  MetricCollector,
  InvocationMetricData,
} from '../src/helper/metricCollector';

export class TestMetricCollector implements MetricCollector {
  onInvoke(invocationData: InvocationMetricData): void {}
  onGetLambdas(invocationData: InvocationMetricData): void {}
  onIsImplemented(invocationData: InvocationMetricData): void {}
}
