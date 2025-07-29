import { afterAll } from 'vitest';

// Global cleanup to prevent hanging
afterAll(async () => {
  // Force close any open handles
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Clear all timers
  if (globalThis.clearInterval) {
    for (let i = 1; i < 10000; i++) {
      clearInterval(i);
      clearTimeout(i);
    }
  }
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

// Ensure process exits cleanly
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection in tests:', error);
  process.exit(1);
});