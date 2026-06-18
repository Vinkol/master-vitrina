import '@testing-library/jest-dom';
import { beforeEach } from 'node:test';

beforeEach(() => {
  if (typeof window !== 'undefined') {
    delete window.Telegram;
  }
});
