import { successWrapper, errorWrapper } from './responses';
import { Metrics } from '../common';

describe('DynamoDB stream responses', () => {
  const metrics = new Metrics('DynamoDB Stream');
  const callback = jest.fn((err, result) => (err ? new Error(err) : result));

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('Handles success response', () => {
    const success = successWrapper(metrics, callback);
    success('success');
    expect(callback).toHaveBeenCalledWith(null, 'success');
  });

  it('Handles error response', () => {
    const error = errorWrapper(metrics, callback);
    error('error');
    expect(callback).toHaveBeenCalledWith('error');
  });
});
