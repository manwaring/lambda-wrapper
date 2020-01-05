import { success, error } from './responses';

describe('Generic responses', () => {
  it('Handles success response', () => {
    const response = success('success');
    expect(response).toEqual('success');
  });

  it('Handles error response', () => {
    expect(() => error('error')).toThrow();
  });
});
