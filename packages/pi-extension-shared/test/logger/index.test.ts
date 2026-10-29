import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLogger, getLogger, LogLevel } from '../../src/index.js';
import { FileTransport } from '../../src/clients/log/file-transport.js';
import fs from 'node:fs';
import path from 'node:path';

describe('pi-extension-logger', () => {
  const testLogFile = path.join(process.cwd(), 'test-app.log');

  beforeEach(() => {
    vi.clearAllMocks();
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('Logger Basic Functionality', () => {
    it('should log messages at the correct level', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger({ level: LogLevel.DEBUG });

      logger.info('Test info message');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test info message'));
      
      consoleSpy.mockRestore();
    });

    it('should filter messages below the minimum level', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = createLogger({ level: LogLevel.WARN });

      logger.info('This should be filtered');
      expect(consoleSpy).not.toHaveBeenCalled();

      logger.warn('This should be logged');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('This should be logged'));
      
      consoleSpy.mockRestore();
    });
  });

  describe('FileTransport', () => {
    it('should write logs to a file', () => {
      const logger = createLogger({ logFile: testLogFile });
      logger.info('File log message');

      const content = fs.readFileSync(testLogFile, 'utf8');
      expect(content).toContain('INFO');
      expect(content).toContain('File log message');
    });

    it('should handle log rotation', () => {
      const transport = new FileTransport({ filePath: testLogFile, maxFileSize: 10 });

      transport.log({
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Message 1 that exceeds 10 bytes',
      });

      // First write
      expect(fs.existsSync(testLogFile)).toBe(true);

      // Second write should trigger rotation
      transport.log({
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Message 2',
      });

      expect(fs.existsSync(`${testLogFile}.old`)).toBe(true);
      expect(fs.existsSync(testLogFile)).toBe(true);
    });
  });

  describe('Logger Manager', () => {
    it('should return the same instance from getLogger', () => {
      const logger1 = getLogger();
      const logger2 = getLogger();
      expect(logger1).toBe(logger2);
    });
  });
});
