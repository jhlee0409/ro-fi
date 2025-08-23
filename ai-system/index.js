#!/usr/bin/env node
/**
 * RO-FAN AI 자동 연재 시스템
 * 단일 진입점 - 모든 로직의 시작점
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Generator } from './generator.js';
import { Validator } from './validator.js';
import { Storage } from './storage.js';

class RoFanAI {
  constructor() {
    this.configPath = join(process.cwd(), 'ai-system', 'config.json');
    this.statePath = join(process.cwd(), 'ai-system', 'state.json');
    this.config = this.loadConfig();
    this.state = this.loadState();
    
    this.generator = new Generator(this.config);
    this.validator = new Validator(this.config);
    this.storage = new Storage(this.config);
  }

  loadConfig() {
    if (!existsSync(this.configPath)) {
      const defaultConfig = {
        maxActiveNovels: 3,
        chapterLength: { min: 3000, target: 4000, max: 5000 },
        completionChapter: 15,
        tropes: [
          "시간조작능력", "예지능력자", "운명적만남", "현대판타지",
          "회귀", "빙의", "계약결혼", "적에서연인으로",
          "마법학원", "드래곤라이더", "엘프왕자", "뱀파이어백작"
        ],
        geminiApiKey: process.env.GEMINI_API_KEY
      };
      writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2));
      return defaultConfig;
    }
    return JSON.parse(readFileSync(this.configPath, 'utf-8'));
  }

  loadState() {
    if (!existsSync(this.statePath)) {
      const defaultState = { novels: {}, lastRun: null, totalChaptersGenerated: 0 };
      this.saveState(defaultState);
      return defaultState;
    }
    return JSON.parse(readFileSync(this.statePath, 'utf-8'));
  }

  saveState(state = this.state) {
    writeFileSync(this.statePath, JSON.stringify(state, null, 2));
    this.state = state;
  }

  // 다음에 할 작업 결정 (우선순위: 완결 > 신작 > 연재)
  decideNextAction() {
    const novels = this.state.novels;
    
    // 1순위: 완결 가능한 소설 찾기
    for (const [slug, novel] of Object.entries(novels)) {
      if (novel.status === '연재 중' && novel.chapterCount >= this.config.completionChapter) {
        return { action: 'complete', slug, novel };
      }
    }

    // 2순위: 연재 중인 소설이 최대치보다 적으면 신작 생성
    const activeNovels = Object.values(novels).filter(n => n.status === '연재 중').length;
    if (activeNovels < this.config.maxActiveNovels) {
      return { action: 'new_novel' };
    }

    // 3순위: 기존 소설 연재 (가장 오래된 것)
    const continuing = Object.entries(novels)
      .filter(([_, novel]) => novel.status === '연재 중')
      .sort(([_, a], [__, b]) => new Date(a.lastUpdate) - new Date(b.lastUpdate));
    
    if (continuing.length > 0) {
      const [slug, novel] = continuing[0];
      return { action: 'continue', slug, novel };
    }

    return { action: 'none' };
  }

  async run() {
    try {
      console.log('🚀 RO-FAN AI 자동 연재 시스템 시작');
      
      const decision = this.decideNextAction();
      console.log(`📋 다음 작업: ${decision.action}`);

      let result = null;
      
      switch (decision.action) {
        case 'complete':
          result = await this.generator.completeNovel(decision.slug, decision.novel);
          break;
        case 'new_novel':
          result = await this.generator.createNewNovel();
          break;
        case 'continue':
          result = await this.generator.continueNovel(decision.slug, decision.novel);
          break;
        default:
          console.log('✅ 할 작업이 없습니다.');
          return;
      }

      if (result && await this.validator.validate(result)) {
        await this.storage.save(result);
        this.updateState(result);
        console.log(`✅ 성공적으로 완료: ${result.title}`);
      } else {
        console.log('❌ 검증 실패 또는 생성 실패');
      }

    } catch (error) {
      console.error('💥 오류 발생:', error.message);
      process.exit(1);
    }
  }

  updateState(result) {
    const now = new Date().toISOString();
    
    if (!this.state.novels[result.slug]) {
      this.state.novels[result.slug] = {
        title: result.title,
        status: result.status || '연재 중',
        chapterCount: 0,
        characters: result.characters || {},
        created: now,
        lastUpdate: now
      };
    }

    const novel = this.state.novels[result.slug];
    
    if (result.type === 'chapter') {
      novel.chapterCount = result.chapterNumber;
      novel.lastUpdate = now;
    } else if (result.type === 'completion') {
      novel.status = '완결';
      novel.lastUpdate = now;
    }

    this.state.lastRun = now;
    this.state.totalChaptersGenerated++;
    this.saveState();
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const roFanAI = new RoFanAI();
  roFanAI.run();
}

export { RoFanAI };