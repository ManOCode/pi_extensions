import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { saveMemory, getMemory, listMemory, setMemoryDir } from '../src/index.js';

describe('Memory Extension', () => {
  const testMemoryDir = path.join(process.cwd(), 'test-memory');

  beforeEach(async () => {
    setMemoryDir(testMemoryDir);
    
    // Ensure fresh test directory
    await fs.rm(testMemoryDir, { recursive: true, force: true });
    await fs.mkdir(testMemoryDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testMemoryDir, { recursive: true, force: true });
  });

  it('should save memory successfully', async () => {
    const key = 'test-key';
    const content = '# Test Memory\nThis is a test.';
    
    const result = await saveMemory.execute('test-id', { key, content });
    
    expect(result.content[0].text).toContain(`Memory saved successfully under key: ${key}`);
    
    const filePath = path.join(testMemoryDir, `${key}.md`);
    const savedContent = await fs.readFile(filePath, 'utf8');
    expect(savedContent).toBe(content);
  });

  it('should retrieve memory successfully', async () => {
    const key = 'test-key';
    const content = '# Test Memory\nThis is a test.';
    const filePath = path.join(testMemoryDir, `${key}.md`);
    await fs.writeFile(filePath, content, 'utf8');
    
    const result = await getMemory.execute('test-id', { key });
    
    expect(result.content[0].text).toBe(content);
  });

  it('should return not found when retrieving non-existent memory', async () => {
    const result = await getMemory.execute('test-id', { key: 'non-existent' });
    
    expect(result.content[0].text).toBe('No memory found for key: non-existent');
  });

  it('should list memory keys successfully', async () => {
    const memories = [
      { key: 'key1', content: 'content1' },
      { key: 'key2', content: 'content2' },
      { key: 'key3', content: 'content3' },
    ];
    
    for (const m of memories) {
      await fs.writeFile(path.join(testMemoryDir, `${m.key}.md`), m.content, 'utf8');
    }
    
    const result = await listMemory.execute('test-id');
    
    expect(result.content[0].text).toContain('Available memory keys:');
    expect(result.content[0].text).toContain('key1');
    expect(result.content[0].text).toContain('key2');
    expect(result.content[0].text).toContain('key3');
  });

  it('should return "No memories stored" when memory directory is empty', async () => {
    // Empty directory already ensured by beforeEach
    const result = await listMemory.execute('test-id');
    
    expect(result.content[0].text).toBe('No memories stored.');
  });
});
