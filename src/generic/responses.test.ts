import { successWrapper, errorWrapper } from './responses';
import { Metrics } from '../common';

describe('Generic responses', () => {
  const metrics = new Metrics('API Gateway');
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
