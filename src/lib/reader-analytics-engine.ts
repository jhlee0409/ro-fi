import type { ReaderMetrics } from './types/index.ts';

export interface ReaderBehavior {
  readingSpeed: number; // words per minute
  sessionDuration: number; // minutes
  dropoffPoints: number[]; // chapter numbers where readers drop off
  completionRate: number; // percentage of readers who finish
  engagementScore: number; // 0-100 scale
}

export interface ContentPerformance {
  _novel: string;
  chapter: number;
  views: number;
  uniqueReaders: number;
  averageReadTime: number;
  bounceRate: number;
  shareCount: number;
  bookmarkCount: number;
}

export interface ReaderSegment {
  type: 'new' | 'regular' | 'binge' | 'casual';
  characteristics: string[];
  preferences: string[];
  retentionRate: number;
}

/**
 * 독자 분석 엔진
 * 독자 행동, 선호도, 참여도를 분석하여 콘텐츠 최적화 인사이트 제공
 */
export class ReaderAnalyticsEngine {
  private performanceData: ContentPerformance[] = [];
  private readerSegments: Map<string, ReaderSegment> = new Map();
  private trendingThemes: string[] = [];

  constructor() {
    this.initializeSegments();
  }

  /**
   * 독자 세그먼트 초기화
   */
  private initializeSegments(): void {
    this.readerSegments.set('new', {
      type: 'new',
      characteristics: ['첫 방문', '짧은 세션', '높은 이탈률'],
      preferences: ['임팩트 있는 시작', '명확한 장르', '쉬운 문체'],
      retentionRate: 0.3,
    });

    this.readerSegments.set('regular', {
      type: 'regular',
      characteristics: ['정기 방문', '중간 세션', '안정적 참여'],
      preferences: ['일관된 업데이트', '캐릭터 발전', '예측 가능한 품질'],
      retentionRate: 0.7,
    });

    this.readerSegments.set('binge', {
      type: 'binge',
      characteristics: ['긴 세션', '연속 읽기', '높은 참여도'],
      preferences: ['클리프행어', '빠른 전개', '감정적 몰입'],
      retentionRate: 0.9,
    });

    this.readerSegments.set('casual', {
      type: 'casual',
      characteristics: ['불규칙 방문', '가변 세션', '선택적 참여'],
      preferences: ['독립적 에피소드', '가벼운 내용', '접근성'],
      retentionRate: 0.5,
    });
  }

  /**
   * 콘텐츠 성과 분석
   */
  analyzeContentPerformance(_novel: string, chapter?: number): {
    overallScore: number;
    metrics: ReaderMetrics;
    insights: string[];
    recommendations: string[];
  } {
    const relevantData = this.performanceData.filter(data => {
      return data._novel === _novel && (chapter ? data.chapter === chapter : true);
    });

    if (relevantData.length === 0) {
      return this.getDefaultAnalysis();
    }

    // 메트릭 계산
    const avgViews = relevantData.reduce((sum, data) => sum + data.views, 0) / relevantData.length;
    const avgReadTime = relevantData.reduce((sum, data) => sum + data.averageReadTime, 0) / relevantData.length;
    const avgBounceRate = relevantData.reduce((sum, data) => sum + data.bounceRate, 0) / relevantData.length;
    const totalShares = relevantData.reduce((sum, data) => sum + data.shareCount, 0);
    const _totalBookmarks = relevantData.reduce((sum, data) => sum + data.bookmarkCount, 0);

    const engagementScore = this.calculateEngagementScore(avgViews, avgReadTime, avgBounceRate, totalShares);
    const retentionRate = Math.max(0, 1 - avgBounceRate);
    const completionRate = this.estimateCompletionRate(avgReadTime, avgBounceRate);

    const metrics: ReaderMetrics = {
      engagementScore,
      retentionRate,
      averageReadingTime: avgReadTime,
      completionRate,
    };

    const overallScore = this.calculateOverallScore(metrics);
    const insights = this.generateInsights(metrics, relevantData);
    const recommendations = this.generateRecommendations(metrics, _novel);

    return {
      overallScore,
      metrics,
      insights,
      recommendations,
    };
  }

  /**
   * 참여도 점수 계산
   */
  private calculateEngagementScore(views: number, readTime: number, bounceRate: number, shares: number): number {
    const viewScore = Math.min(views / 1000 * 20, 30); // 최대 30점
    const timeScore = Math.min(readTime / 10 * 25, 25); // 최대 25점 (10분 기준)
    const bounceScore = Math.max(0, (1 - bounceRate) * 30); // 최대 30점
    const shareScore = Math.min(shares / 10 * 15, 15); // 최대 15점

    return Math.round(viewScore + timeScore + bounceScore + shareScore);
  }

  /**
   * 완료율 추정
   */
  private estimateCompletionRate(avgReadTime: number, bounceRate: number): number {
    // 독서 시간과 이탈률을 기반으로 완료율 추정
    const timeWeight = Math.min(avgReadTime / 15, 1); // 15분을 100%로 가정
    const bounceWeight = 1 - bounceRate;
    
    return Math.max(0, (timeWeight * 0.7 + bounceWeight * 0.3));
  }

  /**
   * 전체 점수 계산
   */
  private calculateOverallScore(metrics: ReaderMetrics): number {
    return Math.round(
      metrics.engagementScore * 0.4 +
      metrics.retentionRate * 100 * 0.3 +
      metrics.completionRate * 100 * 0.3
    );
  }

  /**
   * 인사이트 생성
   */
  private generateInsights(metrics: ReaderMetrics, data: ContentPerformance[]): string[] {
    const insights: string[] = [];

    // 참여도 분석
    if (metrics.engagementScore > 80) {
      insights.push('🔥 매우 높은 독자 참여도 - 현재 접근법 유지');
    } else if (metrics.engagementScore < 50) {
      insights.push('⚠️ 낮은 독자 참여도 - 콘텐츠 개선 필요');
    }

    // 완료율 분석
    if (metrics.completionRate > 0.8) {
      insights.push('✅  높은 완료율 - 독자들이 끝까지 읽고 있음');
    } else if (metrics.completionRate < 0.4) {
      insights.push('📉 낮은 완료율 - 중간에 포기하는 독자 많음');
    }

    // 독서 시간 분석
    if (metrics.averageReadingTime > 12) {
      insights.push('📚 긴 독서 시간 - 몰입도 높은 콘텐츠');
    } else if (metrics.averageReadingTime < 5) {
      insights.push('⏱️ 짧은 독서 시간 - 흥미 유발 필요');
    }

    // 트렌드 분석
    if (data.length > 5) {
      const recentChapters = data.slice(-3);
      const olderChapters = data.slice(0, -3);
      const recentAvg = recentChapters.reduce((sum, ch) => sum + ch.views, 0) / recentChapters.length;
      const olderAvg = olderChapters.reduce((sum, ch) => sum + ch.views, 0) / olderChapters.length;

      if (recentAvg > olderAvg * 1.2) {
        insights.push('📈 독자 수 증가 트렌드 - 인기 상승 중');
      } else if (recentAvg < olderAvg * 0.8) {
        insights.push('📉 독자 수 감소 트렌드 - 관심도 하락');
      }
    }

    return insights;
  }

  /**
   * 추천사항 생성
   */
  private generateRecommendations(metrics: ReaderMetrics, _novel: string): string[] {
    const recommendations: string[] = [];

    // 참여도 기반 추천
    if (metrics.engagementScore < 60) {
      recommendations.push('대화와 액션 시퀀스 비율 늘리기');
      recommendations.push('감정적 클라이맥스 강화');
      recommendations.push('클리프행어 활용');
    }

    // 완료율 기반 추천
    if (metrics.completionRate < 0.5) {
      recommendations.push('챕터 길이 조정 (3,500-4,500자 권장)');
      recommendations.push('예측 불가능한 플롯 트위스트 추가');
      recommendations.push('캐릭터 간 갈등 심화');
    }

    // 독서 시간 기반 추천
    if (metrics.averageReadingTime < 6) {
      recommendations.push('첫 문단에 강력한 훅 배치');
      recommendations.push('시각적 묘사 강화');
      recommendations.push('독자 호기심 자극하는 미스터리 요소 추가');
    }

    // 기본 추천사항
    if (recommendations.length === 0) {
      recommendations.push('현재 품질 수준 유지');
      recommendations.push('독자 피드백 적극 수집');
      recommendations.push('새로운 스토리텔링 기법 실험');
    }

    return recommendations;
  }

  /**
   * 기본 분석 결과 (데이터 없을 때)
   */
  private getDefaultAnalysis() {
    return {
      overallScore: 65,
      metrics: {
        engagementScore: 65,
        retentionRate: 0.6,
        averageReadingTime: 8,
        completionRate: 0.6,
      },
      insights: ['📊 데이터 부족으로 추정치 사용', '🎯 더 많은 데이터 수집 필요'],
      recommendations: ['독자 분석 시스템 구축', '기본적인 품질 기준 준수', '정기적인 피드백 수집'],
    };
  }

  /**
   * 성과 데이터 추가
   */
  addPerformanceData(data: ContentPerformance): void {
    this.performanceData.push(data);
    
    // 데이터 정리 (최근 1000개만 유지)
    if (this.performanceData.length > 1000) {
      this.performanceData = this.performanceData.slice(-1000);
    }
  }

  /**
   * 독자 세그먼트 분석
   */
  analyzeReaderSegments(_novel: string): Map<string, number> {
    const segmentDistribution = new Map<string, number>();
    
    // 실제 구현에서는 독자 행동 데이터를 기반으로 세그먼트 분류
    // 여기서는 시뮬레이션된 분포 사용
    segmentDistribution.set('new', 0.25);
    segmentDistribution.set('regular', 0.35);
    segmentDistribution.set('binge', 0.20);
    segmentDistribution.set('casual', 0.20);

    return segmentDistribution;
  }

  /**
   * 트렌딩 테마 업데이트
   */
  updateTrendingThemes(themes: string[]): void {
    this.trendingThemes = themes;
    // console.log('📊 트렌딩 테마 업데이트됨:', themes.join(', '));
  }

  /**
   * 엔진 상태 확인
   */
  getEngineStatus() {
    return {
      totalPerformanceRecords: this.performanceData.length,
      readerSegments: Array.from(this.readerSegments.keys()),
      trendingThemes: this.trendingThemes,
      status: 'operational',
    };
  }
}

// 편의 함수
export function createReaderAnalytics(): ReaderAnalyticsEngine {
  return new ReaderAnalyticsEngine();
}

// 기본 인스턴스
export const readerAnalyticsEngine = new ReaderAnalyticsEngine();