import { success, error } from './responses';

describe('Generic responses', () => {
  it('Handles success response', () => {
    expect(success('success')).toEqual('success');
  });

  it('Handles error response', () => {
    expect(() => error('error')).toThrow('error');
  });
});
