import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, access } from 'fs/promises';

const execAsync = promisify(exec);

test.describe('Romance Fantasy Automation System E2E', () => {
  test.beforeEach(async () => {
    // Clean up any existing test files
    try {
      await execAsync('rm -rf src/content/novels/test-* src/content/chapters/test-*');
    } catch {
      // Ignore if files don't exist
    }
  });

  test('should run full automation and generate content', async () => {
    // Run automation script
    const { stdout, stderr } = await execAsync('node scripts/run-automation.js --verbose');
    
    expect(stderr).toBe('');
    expect(stdout).toContain('자동화 성공');
    
    // Verify that content was generated
    const novelsExist = await checkDirectoryHasFiles('src/content/novels');
    const chaptersExist = await checkDirectoryHasFiles('src/content/chapters');
    
    expect(novelsExist).toBe(true);
    expect(chaptersExist).toBe(true);
  });

  test('should generate novel with proper markdown format', async () => {
    // Run automation to ensure we have content
    await execAsync('node scripts/run-automation.js');
    
    // Check latest generated chapter for markdown format compliance
    const { stdout: chapterFiles } = await execAsync('ls -t src/content/chapters/*.md | head -1');
    const latestChapter = chapterFiles.trim();
    
    if (latestChapter) {
      const content = await readFile(latestChapter, 'utf-8');
      
      // Check for proper markdown format
      expect(content).toContain('---'); // Frontmatter
      expect(content).toContain('title:');
      expect(content).toContain('novel:');
      expect(content).toContain('chapterNumber:');
      
      // Check for proper dialogue format
      if (content.includes('"')) {
        expect(content).toMatch(/> ".*"/); // Should have > " dialogue format
      }
      
      // Check for proper monologue format
      if (content.includes("'")) {
        expect(content).toMatch(/> \*'.*'\*/); // Should have > *'monologue'* format
      }
      
      // Check for proper action format
      expect(content).toMatch(/> \[.*\]/); // Should have > [action] format
    }
  });

  test('should handle automation errors gracefully', async () => {
    // Test with invalid environment
    const result = await execAsync('ANTHROPIC_API_KEY="" node scripts/run-automation.js').catch(e => e);
    
    // Should handle error gracefully
    expect(result.code).toBe(1);
    expect(result.stderr || result.stdout).toContain('오류');
  });

  test('should maintain consistent file structure', async () => {
    await execAsync('node scripts/run-automation.js');
    
    // Check directory structure exists
    await expect(access('src/content/novels')).resolves.toBeUndefined();
    await expect(access('src/content/chapters')).resolves.toBeUndefined();
    await expect(access('src/content/tropes')).resolves.toBeUndefined();
  });
});

async function checkDirectoryHasFiles(directory: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`ls ${directory}/*.md | wc -l`);
    return parseInt(stdout.trim()) > 0;
  } catch {
    return false;
  }
}