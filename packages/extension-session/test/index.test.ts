import { describe, it, expect, beforeEach } from 'vitest';
import { ExtensionSession } from '../src/index.js';

describe('pi-extension-session', () => {
  let session: ExtensionSession;

  beforeEach(() => {
    session = new ExtensionSession();
  });

  it('should set and get session data', () => {
    session.set('user', 'Alice');
    expect(session.get('user')).toBe('Alice');
  });

  it('should return undefined for non-existent keys', () => {
    expect(session.get('non-existent')).toBeUndefined();
  });

  it('should clear session data', () => {
    session.set('key1', 'val1');
    session.set('key2', 'val2');
    session.clear();
    expect(session.getAll()).toEqual({});
    expect(session.get('key1')).toBeUndefined();
  });

  it('should return a copy of all session data', () => {
    session.set('a', 1);
    session.set('b', 2);
    const data = session.getAll();
    expect(data).toEqual({ a: 1, b: 2 });
    
    // Verify it is a copy
    data.a = 3;
    expect(session.get('a')).toBe(1);
  });
});
