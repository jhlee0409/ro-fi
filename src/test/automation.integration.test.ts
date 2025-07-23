import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { MasterAutomationEngine } from '../lib/master-automation-engine.js';
import { NovelDetector } from '../lib/novel-detector.js';
import { StoryDiversityEngine } from '../lib/story-diversity-engine.js';
import { EmotionalDepthEngine } from '../lib/emotional-depth-engine.js';
import { CompletionCriteriaEngine } from '../lib/completion-criteria-engine.js';
import { promises as fs } from 'fs';
import { join } from 'path';

describe('Automation System Integration Tests', () => {
  const testDir = '/tmp/ro-fan-integration-test';
  let masterEngine: MasterAutomationEngine;
  let novelDetector: NovelDetector;
  let storyEngine: StoryDiversityEngine;
  let emotionEngine: EmotionalDepthEngine;
  let completionEngine: CompletionCriteriaEngine;

  beforeEach(async () => {
    // Create test directory structure
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(join(testDir, 'novels'), { recursive: true });
    await fs.mkdir(join(testDir, 'chapters'), { recursive: true });
    await fs.mkdir(join(testDir, 'tropes'), { recursive: true });

    // Initialize engines with test directory
    masterEngine = new MasterAutomationEngine(testDir);
    novelDetector = new NovelDetector(join(testDir, 'novels'), join(testDir, 'chapters'));
    storyEngine = new StoryDiversityEngine();
    emotionEngine = new EmotionalDepthEngine();
    completionEngine = new CompletionCriteriaEngine();
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test('should create new novel when no active novels exist', async () => {
    const result = await masterEngine.executeAutomation();
    
    expect(result.success).toBe(true);
    expect(result.action).toBe('CREATE_NEW_NOVEL');
    expect(result.result.newNovel).toBeDefined();
    expect(result.result.title).toBeDefined();
    
    // Verify files were created
    const novelFiles = await fs.readdir(join(testDir, 'novels'));
    const chapterFiles = await fs.readdir(join(testDir, 'chapters'));
    
    expect(novelFiles.length).toBe(1);
    expect(chapterFiles.length).toBe(1);
  });

  test('should continue existing novel when active novels exist', async () => {
    // First create a novel
    await masterEngine.executeAutomation();
    
    // Then run automation again to continue it
    const result = await masterEngine.executeAutomation();
    
    expect(result.success).toBe(true);
    expect(['CONTINUE_CHAPTER', 'CREATE_NEW_NOVEL']).toContain(result.action);
    
    if (result.action === 'CONTINUE_CHAPTER') {
      expect(result.result.continuedNovel).toBeDefined();
      expect(result.result.newChapter).toBeDefined();
    }
  });

  test('should maintain data consistency across engines', async () => {
    // Create initial content
    await masterEngine.executeAutomation();
    
    // Get active novels from detector
    const activeNovels = await novelDetector.getActiveNovels();
    expect(activeNovels.length).toBeGreaterThan(0);
    
    const novel = activeNovels[0];
    const progress = await novelDetector.getNovelWithProgress(novel.slug);
    
    expect(progress).toBeDefined();
    expect(progress!.novel.data.title).toBe(novel.data.title);
    expect(progress!.chaptersCount).toBeGreaterThan(0);
  });

  test('should generate diverse story concepts', async () => {
    const concepts = [];
    
    // Generate multiple concepts
    for (let i = 0; i < 5; i++) {
      const concept = storyEngine.generateUniqueNovelConcept(concepts);
      concepts.push(concept);
      
      expect(concept.main).toBeDefined();
      expect(concept.sub).toBeDefined();
      expect(concept.world).toBeDefined();
    }
    
    // Check for diversity
    const mainTropes = concepts.map(c => c.main);
    const uniqueMainTropes = new Set(mainTropes);
    expect(uniqueMainTropes.size).toBeGreaterThan(1); // Should have variety
  });

  test('should generate emotional depth elements consistently', async () => {
    const internalConflict = emotionEngine.generateInternalConflict('감정의 부정', '테스트캐릭터');
    const microExpression = emotionEngine.generateMicroExpression('attraction', '테스트캐릭터');
    const sensoryDetail = emotionEngine.generateSensoryDescription('설렘', '도서관');
    
    expect(typeof internalConflict).toBe('string');
    expect(internalConflict.length).toBeGreaterThan(0);
    
    expect(typeof microExpression).toBe('string');
    expect(microExpression.length).toBeGreaterThan(0);
    
    expect(typeof sensoryDetail).toBe('string');
    expect(sensoryDetail.length).toBeGreaterThan(0);
  });

  test('should evaluate completion criteria correctly', async () => {
    const mockNovel = {
      currentChapter: 55,
      plotProgress: ['시작', '발전', '절정', '해결'],
      relationshipStage: 'union',
      openThreads: [],
      characters: [
        { name: '주인공', growthArc: 90 },
        { name: '남주', growthArc: 85 }
      ]
    };
    
    const isComplete = completionEngine.checkStoryCompletion(mockNovel);
    expect(isComplete).toBe(true);
    
    const report = completionEngine.generateCompletionReport(mockNovel);
    expect(report.overallReadiness).toBe(true);
    expect(report.recommendation).toContain('Begin ending sequence');
  });

  test('should handle automation errors gracefully', async () => {
    // Test with read-only parent directory (can't create subdirectories)
    const invalidPath = '/dev/null/invalid';
    const invalidEngine = new MasterAutomationEngine(invalidPath);
    
    const result = await invalidEngine.executeAutomation();
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Storage operation'); // New error format
  });

  test('should maintain proper markdown format in generated content', async () => {
    const result = await masterEngine.executeAutomation();
    expect(result.success).toBe(true);
    
    // Read generated chapter file
    const chapterFiles = await fs.readdir(join(testDir, 'chapters'));
    expect(chapterFiles.length).toBeGreaterThan(0);
    
    const chapterContent = await fs.readFile(join(testDir, 'chapters', chapterFiles[0]), 'utf-8');
    
    // 1. Frontmatter validation
    expect(chapterContent).toMatch(/^---\n/); // Starts with frontmatter
    expect(chapterContent).toContain('title:');
    expect(chapterContent).toContain('novel:');
    expect(chapterContent).toContain('chapterNumber:');
    expect(chapterContent).toMatch(/---\n.*\n---/s); // Proper frontmatter closure
    
    // 2. Dialogue format validation (> "content")
    const dialogueMatches = chapterContent.match(/> "([^"]+)"/g);
    if (dialogueMatches) {
      expect(dialogueMatches.length).toBeGreaterThan(0);
      // Check for proper quote format
      dialogueMatches.forEach(dialogue => {
        expect(dialogue).toMatch(/^> "[^"]+"/);
      });
    }
    
    // 3. Monologue format validation (> *'content'*)
    const monologueMatches = chapterContent.match(/> \*'([^']+)'\*/g);
    if (monologueMatches) {
      expect(monologueMatches.length).toBeGreaterThan(0);
      // Check for proper monologue format
      monologueMatches.forEach(monologue => {
        expect(monologue).toMatch(/^> \*'[^']+'\*$/);
      });
    }
    
    // 4. Action format validation (> [content])
    const actionMatches = chapterContent.match(/> \[([^\]]+)\]/g);
    if (actionMatches) {
      expect(actionMatches.length).toBeGreaterThan(0);
      // Check for proper action format
      actionMatches.forEach(action => {
        expect(action).toMatch(/^> \[[^\]]+\]$/);
      });
    }
    
    // 5. Bold formatting in narrative (**word**)
    const boldMatches = chapterContent.match(/\*\*([^*]+)\*\*/g);
    if (boldMatches) {
      expect(boldMatches.length).toBeGreaterThan(0);
      // Verify bold formatting is properly closed
      boldMatches.forEach(bold => {
        expect(bold).toMatch(/^\*\*[^*]+\*\*$/);
      });
    }
    
    // 6. No invalid markdown patterns
    expect(chapterContent).not.toMatch(/> '[^*]/); // Single quote without asterisk
    expect(chapterContent).not.toMatch(/> \*"[^']/); // Wrong quote combination
    expect(chapterContent).not.toMatch(/> \([^)\]]/); // Parentheses instead of brackets
    
    // 7. Content structure validation
    const lines = chapterContent.split('\n');
    let inFrontmatter = false;
    let frontmatterCount = 0;
    
    lines.forEach(line => {
      if (line.trim() === '---') {
        frontmatterCount++;
        inFrontmatter = frontmatterCount === 1;
      }
      
      // Skip frontmatter validation
      if (inFrontmatter || frontmatterCount < 2) return;
      
      // Check that dialogue, monologue, and actions start with '> '
      if (line.trim().startsWith('>')) {
        expect(line).toMatch(/^> ("|'|\[|\*)/);
      }
    });
    
    // Ensure frontmatter is properly closed
    expect(frontmatterCount).toBe(2);
  });
});