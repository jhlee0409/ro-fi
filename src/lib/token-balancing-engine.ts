export interface TokenUsage {
  input: number;
  output: number;
  total: number;
  cost: number;
}

export interface BalancingStrategy {
  mode: 'efficiency' | 'quality' | 'balanced' | 'creative';
  budgetLimit: number;
  qualityWeight: number;
  efficiencyWeight: number;
}

export interface OptimizationResult {
  originalCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercentage: number;
  qualityImpact: number;
}

/**
 * 토큰 밸런싱 엔진
 * AI 생성 비용을 최적화하고 품질과 효율성의 균형을 관리
 */
export class TokenBalancingEngine {
  private strategy: BalancingStrategy;
  private usageHistory: TokenUsage[] = [];
  private dailyBudget: number;
  private currentSpent: number = 0;

  constructor(strategy?: Partial<BalancingStrategy>, dailyBudget: number = 1000) {
    this.strategy = {
      mode: 'balanced',
      budgetLimit: 500,
      qualityWeight: 0.6,
      efficiencyWeight: 0.4,
      ...strategy,
    };
    this.dailyBudget = dailyBudget;
  }

  /**
   * 요청 전 토큰 예측 및 최적화
   */
  optimizeTokenUsage(
    content: string,
    targetLength: number
  ): {
    maxTokens: number;
    temperature: number;
    strategy: string;
    estimatedCost: number;
  } {
    const baseTokens = this.estimateTokens(content);
    const targetTokens = Math.ceil(targetLength * 1.3); // 한국어 토큰 비율 고려

    let maxTokens: number;
    let temperature: number;
    let strategy: string;

    switch (this.strategy.mode) {
      case 'efficiency':
        maxTokens = Math.min(targetTokens, baseTokens * 1.2);
        temperature = 0.3;
        strategy = '효율성 우선 - 비용 최소화';
        break;

      case 'quality':
        maxTokens = targetTokens * 1.5;
        temperature = 0.8;
        strategy = '품질 우선 - 창의성 최대화';
        break;

      case 'creative':
        maxTokens = targetTokens * 2;
        temperature = 1.0;
        strategy = '창의성 모드 - 최고 품질';
        break;

      case 'balanced':
      default:
        maxTokens = targetTokens;
        temperature = 0.6;
        strategy = '균형 모드 - 품질과 효율성 조화';
        break;
    }

    const estimatedCost = this.calculateCost(baseTokens, maxTokens);

    return {
      maxTokens,
      temperature,
      strategy,
      estimatedCost,
    };
  }

  /**
   * 토큰 수 추정 (한국어 기준)
   */
  private estimateTokens(content: string): number {
    // 한국어는 대략 2.5-3글자 = 1토큰
    const koreanRatio = 2.8;
    const englishRatio = 4; // 영어는 대략 4글자 = 1토큰

    const koreanChars = (content.match(/[ㄱ-ㅎ가-힣]/g) || []).length;
    const otherChars = content.length - koreanChars;

    return Math.ceil(koreanChars / koreanRatio + otherChars / englishRatio);
  }

  /**
   * 비용 계산 (Gemini API 기준)
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCostPer1K = 0.00015; // Gemini 1.5 Pro input cost
    const outputCostPer1K = 0.0006; // Gemini 1.5 Pro output cost

    const inputCost = (inputTokens / 1000) * inputCostPer1K;
    const outputCost = (outputTokens / 1000) * outputCostPer1K;

    return inputCost + outputCost;
  }

  /**
   * 실제 사용량 기록
   */
  recordUsage(usage: TokenUsage): void {
    this.usageHistory.push(usage);
    this.currentSpent += usage.cost;

    // 히스토리 관리 (최근 100개만 유지)
    if (this.usageHistory.length > 100) {
      this.usageHistory = this.usageHistory.slice(-100);
    }

    // console.log(`💰 토큰 사용 기록: ${usage.total} tokens, $${usage.cost.toFixed(4)}`);
  }

  /**
   * 예산 상태 확인
   */
  getBudgetStatus(): {
    spent: number;
    remaining: number;
    percentage: number;
    status: 'safe' | 'warning' | 'critical';
  } {
    const remaining = this.dailyBudget - this.currentSpent;
    const percentage = (this.currentSpent / this.dailyBudget) * 100;

    let status: 'safe' | 'warning' | 'critical';
    if (percentage < 70) status = 'safe';
    else if (percentage < 90) status = 'warning';
    else status = 'critical';

    return {
      spent: this.currentSpent,
      remaining,
      percentage,
      status,
    };
  }

  /**
   * 동적 전략 조정
   */
  adjustStrategy(): void {
    const budgetStatus = this.getBudgetStatus();
    const recentUsage = this.usageHistory.slice(-10);
    const avgCost = recentUsage.reduce((sum, usage) => sum + usage.cost, 0) / recentUsage.length;

    if (budgetStatus.status === 'critical') {
      // 예산 부족 시 효율성 모드
      this.strategy.mode = 'efficiency';
      this.strategy.qualityWeight = 0.3;
      this.strategy.efficiencyWeight = 0.7;
      // console.log('📉 예산 부족으로 효율성 모드 전환');
    } else if (budgetStatus.status === 'safe' && avgCost < 0.01) {
      // 예산 여유 시 품질 모드
      this.strategy.mode = 'quality';
      this.strategy.qualityWeight = 0.8;
      this.strategy.efficiencyWeight = 0.2;
      // console.log('📈 예산 여유로 품질 모드 전환');
    }
  }

  /**
   * 최적화 결과 분석
   */
  analyzeOptimization(originalCost: number, optimizedCost: number): OptimizationResult {
    const savings = originalCost - optimizedCost;
    const savingsPercentage = (savings / originalCost) * 100;

    // 품질 영향도 계산 (단순화된 모델)
    const qualityImpact = Math.max(0, 100 - savingsPercentage * 1.2);

    return {
      originalCost,
      optimizedCost,
      savings,
      savingsPercentage,
      qualityImpact,
    };
  }

  /**
   * 일일 사용량 리셋
   */
  resetDailyUsage(): void {
    this.currentSpent = 0;
    // console.log('🔄 일일 토큰 사용량 리셋');
  }

  /**
   * 엔진 상태 요약
   */
  getEngineStatus() {
    const budgetStatus = this.getBudgetStatus();
    const totalUsage = this.usageHistory.reduce((sum, usage) => sum + usage.total, 0);
    const avgCostPerToken = totalUsage > 0 ? this.currentSpent / totalUsage : 0;

    return {
      strategy: this.strategy,
      budgetStatus,
      totalTokensUsed: totalUsage,
      averageCostPerToken: avgCostPerToken,
      usageHistoryCount: this.usageHistory.length,
      status: 'operational',
    };
  }

  /**
   * 전략 업데이트
   */
  updateStrategy(newStrategy: Partial<BalancingStrategy>): void {
    this.strategy = { ...this.strategy, ...newStrategy };
    // console.log('🔧 토큰 밸런싱 전략 업데이트됨');
  }
}

// 편의 함수
export function createTokenBalancer(
  strategy?: Partial<BalancingStrategy>,
  dailyBudget?: number
): TokenBalancingEngine {
  return new TokenBalancingEngine(strategy, dailyBudget);
}

// 기본 인스턴스
export const tokenBalancingEngine = new TokenBalancingEngine();
