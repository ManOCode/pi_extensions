import { describe, it, expect } from 'vitest';
import { ExtensionSession } from '../src/index.js';

describe('ExtensionSession', () => {
  it('should set and get values', () => {
    const session = new ExtensionSession();
    session.set('foo', 'bar');
    expect(session.get('foo')).toBe('bar');
  });

  it('should clear values', () => {
    const session = new ExtensionSession();
    session.set('foo', 'bar');
    session.clear();
    expect(session.get('foo')).toBeUndefined();
  });

  it('should return all data', () => {
    const session = new ExtensionSession();
    session.set('foo', 'bar');
    session.set('baz', 123);
    expect(session.getAll()).toEqual({ foo: 'bar', baz: 123 });
  });
});
