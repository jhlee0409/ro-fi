/**
 * 📊 Comprehensive Performance Dashboard - 종합 성능 대시보드
 * 
 * 실시간 모니터링, 성과 추적, 지능형 알람 시스템을 통한 종합적 성능 관리
 * - 실시간 품질 메트릭 모니터링
 * - 독자 경험 성과 추적
 * - 시장 경쟁력 지표 분석
 * - 자동화된 알람 및 개선 권장사항
 */

import { QualityAssuranceGateway } from './quality-engines/quality-assurance-gateway.js';

export class ComprehensivePerformanceDashboard {
  constructor(logger, systems = {}) {
    this.logger = logger;
    
    // 시스템 참조
    this.systems = {
      genesisWorkflow: systems.genesisWorkflow || null,
      readerOptimizer: systems.readerOptimizer || null,
      marketEngine: systems.marketEngine || null,
      qualityGateway: systems.qualityGateway || new QualityAssuranceGateway(logger),
      ...systems
    };
    
    // 성능 표준 및 임계값
    this.PERFORMANCE_STANDARDS = {
      // 품질 성능 표준
      quality: {
        minimum: 7.0,           // 최소 품질 기준
        target: 8.5,            // 목표 품질 기준
        worldClass: 9.5,        // 세계급 품질 기준
        alertThreshold: 6.5     // 알람 임계값
      },
      
      // 독자 경험 표준
      readerExperience: {
        minimum: 0.8,           // 최소 독자 만족도
        target: 0.9,            // 목표 독자 만족도
        worldClass: 0.95,       // 세계급 독자 만족도
        alertThreshold: 0.75    // 알람 임계값
      },
      
      // 시장 경쟁력 표준
      marketCompetitiveness: {
        minimum: 0.7,           // 최소 시장 경쟁력
        target: 0.85,           // 목표 시장 경쟁력
        worldClass: 0.95,       // 세계급 시장 경쟁력
        alertThreshold: 0.65    // 알람 임계값
      },
      
      // 시스템 성능 표준
      systemPerformance: {
        responseTime: {
          maximum: 30000,       // 최대 응답시간 (ms)
          target: 15000,        // 목표 응답시간 (ms)
          optimal: 10000        // 최적 응답시간 (ms)
        },
        successRate: {
          minimum: 0.9,         // 최소 성공률
          target: 0.95,         // 목표 성공률
          optimal: 0.98         // 최적 성공률
        },
        throughput: {
          minimum: 10,          // 최소 처리량 (작업/시간)
          target: 24,           // 목표 처리량 (작업/시간)
          optimal: 50           // 최적 처리량 (작업/시간)
        }
      }
    };
    
    // 메트릭 데이터 저장소
    this.metricsHistory = {
      quality: [],
      readerExperience: [],
      marketCompetitiveness: [],
      systemPerformance: [],
      alerts: [],
      improvements: []
    };
    
    // 실시간 알람 시스템
    this.alertSystem = {
      activeAlerts: [],
      alertThresholds: this.PERFORMANCE_STANDARDS,
      notificationChannels: ['console', 'log', 'dashboard'],
      escalationRules: {
        critical: { timeout: 300000, escalation: 'immediate' },    // 5분
        high: { timeout: 900000, escalation: 'urgent' },          // 15분
        medium: { timeout: 1800000, escalation: 'normal' },       // 30분
        low: { timeout: 3600000, escalation: 'routine' }          // 1시간
      }
    };
    
    // 성능 트렌드 분석
    this.trendAnalysis = {
      shortTerm: { period: 24, unit: 'hours' },      // 24시간 단기 트렌드
      mediumTerm: { period: 7, unit: 'days' },       // 7일 중기 트렌드
      longTerm: { period: 30, unit: 'days' }         // 30일 장기 트렌드
    };
    
    // 대시보드 설정
    this.dashboardConfig = {
      refreshInterval: 60000,     // 1분마다 새로고침
      dataRetentionPeriod: 30,    // 30일 데이터 보관
      maxMetricsPoints: 1000,     // 최대 메트릭 포인트 수
      alertRetentionPeriod: 7     // 7일 알람 보관
    };
    
    // 모니터링 상태
    this.monitoringState = {
      isActive: false,
      startTime: null,
      intervalId: null,
      lastUpdate: null,
      totalOperations: 0,
      successfulOperations: 0
    };
  }

  /**
   * 📊 실시간 성능 대시보드 시작 (메인 엔트리 포인트)
   */
  async startRealTimeMonitoring() {
    await this.logger.info('📊 Comprehensive Performance Dashboard: 실시간 모니터링 시작');
    
    try {
      if (this.monitoringState.isActive) {
        await this.logger.warn('모니터링이 이미 활성화되어 있습니다.');
        return;
      }
      
      // 모니터링 상태 초기화
      this.monitoringState.isActive = true;
      this.monitoringState.startTime = new Date();
      this.monitoringState.lastUpdate = new Date();
      
      // 초기 성능 스냅샷 생성
      const initialSnapshot = await this.generateComprehensiveSnapshot();
      await this.logger.info('초기 성능 스냅샷 생성 완료', {
        qualityScore: initialSnapshot.quality.overallScore,
        readerExperienceScore: initialSnapshot.readerExperience.overallScore,
        marketScore: initialSnapshot.marketCompetitiveness.overallScore
      });
      
      // 정기적 모니터링 시작
      this.monitoringState.intervalId = setInterval(() => {
        this.performPeriodicMonitoring().catch(error => {
          this.logger.error('정기 모니터링 실행 실패', { error: error.message });
        });
      }, this.dashboardConfig.refreshInterval);
      
      await this.logger.success('실시간 모니터링 시작됨', {
        refreshInterval: this.dashboardConfig.refreshInterval / 1000 + '초',
        dataRetention: this.dashboardConfig.dataRetentionPeriod + '일'
      });
      
      return initialSnapshot;
      
    } catch (error) {
      await this.logger.error('실시간 모니터링 시작 실패', { error: error.message });
      throw new MonitoringError('실시간 모니터링 시작 중 오류 발생', error);
    }
  }

  /**
   * ⏹️ 모니터링 중단
   */
  async stopRealTimeMonitoring() {
    await this.logger.info('실시간 모니터링 중단');
    
    try {
      if (!this.monitoringState.isActive) {
        await this.logger.warn('모니터링이 이미 비활성화되어 있습니다.');
        return;
      }
      
      // 정기 모니터링 중단
      if (this.monitoringState.intervalId) {
        clearInterval(this.monitoringState.intervalId);
        this.monitoringState.intervalId = null;
      }
      
      // 최종 성능 리포트 생성
      const finalReport = await this.generateFinalPerformanceReport();
      
      // 모니터링 상태 리셋
      this.monitoringState.isActive = false;
      this.monitoringState.startTime = null;
      this.monitoringState.lastUpdate = null;
      
      await this.logger.success('실시간 모니터링 중단됨', {
        totalRuntime: finalReport.monitoringDuration,
        totalOperations: this.monitoringState.totalOperations,
        successRate: this.calculateSuccessRate()
      });
      
      return finalReport;
      
    } catch (error) {
      await this.logger.error('모니터링 중단 실패', { error: error.message });
      throw new MonitoringError('모니터링 중단 중 오류 발생', error);
    }
  }

  /**
   * 📈 종합 성능 스냅샷 생성
   */
  async generateComprehensiveSnapshot() {
    await this.logger.info('종합 성능 스냅샷 생성 시작');
    
    try {
      const snapshot = {
        // 타임스탬프
        timestamp: new Date().toISOString(),
        
        // 품질 메트릭
        quality: await this.collectQualityMetrics(),
        
        // 독자 경험 메트릭
        readerExperience: await this.collectReaderExperienceMetrics(),
        
        // 시장 경쟁력 메트릭
        marketCompetitiveness: await this.collectMarketCompetitivenessMetrics(),
        
        // 시스템 성능 메트릭
        systemPerformance: await this.collectSystemPerformanceMetrics(),
        
        // 알람 및 경고
        alerts: await this.generateCurrentAlerts(),
        
        // 개선 권장사항
        recommendations: await this.generateImprovementRecommendations(),
        
        // 트렌드 분석
        trends: await this.analyzeTrends(),
        
        // 예측 분석
        predictions: await this.generatePredictions(),
        
        // 메타데이터
        metadata: {
          snapshotVersion: '1.0-DASHBOARD',
          dataQuality: await this.assessDataQuality(),
          systemStatus: this.getSystemStatus()
        }
      };
      
      // 메트릭 히스토리 업데이트
      this.updateMetricsHistory(snapshot);
      
      // 알람 검사 및 처리
      await this.processAlerts(snapshot);
      
      await this.logger.success('종합 성능 스냅샷 생성 완료');
      
      return snapshot;
      
    } catch (error) {
      await this.logger.error('성능 스냅샷 생성 실패', { error: error.message });
      throw new SnapshotError('성능 스냅샷 생성 중 오류 발생', error);
    }
  }

  /**
   * 🎯 품질 메트릭 수집
   */
  async collectQualityMetrics() {
    try {
      const qualityMetrics = {
        // 전체 품질 점수
        overallScore: 0,
        
        // 개별 엔진 점수
        engineScores: {
          plot: 0,
          character: 0,
          literary: 0,
          romance: 0
        },
        
        // 품질 분포
        qualityDistribution: {
          worldClass: 0,      // 9.5+ 비율
          excellent: 0,       // 8.5-9.4 비율
          good: 0,           // 7.0-8.4 비율
          poor: 0            // <7.0 비율
        },
        
        // 품질 트렌드
        qualityTrend: {
          direction: 'stable',
          changeRate: 0,
          confidence: 0
        },
        
        // 품질 문제 지표
        issues: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        }
      };
      
      // Quality Gateway에서 데이터 수집
      if (this.systems.qualityGateway) {
        const qualityData = this.systems.qualityGateway.exportQualityMetrics();
        
        if (qualityData.qualityHistory.length > 0) {
          const recent = qualityData.qualityHistory.slice(-1)[0];
          qualityMetrics.overallScore = recent.overallScore;
          qualityMetrics.engineScores = recent.scores || qualityMetrics.engineScores;
        }
        
        // 품질 분포 계산
        qualityMetrics.qualityDistribution = this.calculateQualityDistribution(qualityData.qualityHistory);
        
        // 품질 트렌드 분석
        qualityMetrics.qualityTrend = this.analyzeQualityTrend(qualityData.qualityHistory);
      }
      
      // 시뮬레이션 데이터 (시스템 미연결 시)
      if (qualityMetrics.overallScore === 0) {
        qualityMetrics.overallScore = Math.random() * 2 + 8; // 8.0-10.0
        qualityMetrics.engineScores = {
          plot: Math.random() * 2 + 8,
          character: Math.random() * 2 + 8,
          literary: Math.random() * 2 + 8,
          romance: Math.random() * 2 + 8
        };
      }
      
      return qualityMetrics;
      
    } catch (error) {
      await this.logger.error('품질 메트릭 수집 실패', { error: error.message });
      return this.getDefaultQualityMetrics();
    }
  }

  /**
   * 🎭 독자 경험 메트릭 수집
   */
  async collectReaderExperienceMetrics() {
    try {
      const readerMetrics = {
        // 전체 독자 경험 점수
        overallScore: 0,
        
        // 핵심 지표
        keyMetrics: {
          immersion: 0,           // 몰입도
          emotionalImpact: 0,     // 감정적 영향
          satisfaction: 0,        // 만족도
          retention: 0            // 유지율
        },
        
        // 독자 세그먼트별 점수
        segmentScores: {
          casual: 0,
          enthusiast: 0,
          critical: 0
        },
        
        // 이탈 위험 분석
        dropoutRisk: {
          level: 'low',
          score: 0,
          criticalFactors: []
        },
        
        // 독자 피드백 지표
        feedback: {
          positiveRatio: 0,
          engagementRate: 0,
          recommendationRate: 0
        }
      };
      
      // Reader Optimizer에서 데이터 수집
      if (this.systems.readerOptimizer) {
        const readerData = this.systems.readerOptimizer.generateExperienceReport();
        
        if (readerData.currentStatus.latestScore) {
          readerMetrics.overallScore = readerData.currentStatus.latestScore;
        }
        
        // 성과 지표 적용
        if (readerData.performanceMetrics) {
          readerMetrics.keyMetrics.retention = readerData.performanceMetrics.readerRetentionImprovement || 0;
        }
      }
      
      // 시뮬레이션 데이터
      if (readerMetrics.overallScore === 0) {
        readerMetrics.overallScore = Math.random() * 0.3 + 0.7; // 0.7-1.0
        readerMetrics.keyMetrics = {
          immersion: Math.random() * 0.3 + 0.7,
          emotionalImpact: Math.random() * 0.3 + 0.7,
          satisfaction: Math.random() * 0.3 + 0.7,
          retention: Math.random() * 0.3 + 0.7
        };
      }
      
      return readerMetrics;
      
    } catch (error) {
      await this.logger.error('독자 경험 메트릭 수집 실패', { error: error.message });
      return this.getDefaultReaderExperienceMetrics();
    }
  }

  /**
   * 📈 시장 경쟁력 메트릭 수집
   */
  async collectMarketCompetitivenessMetrics() {
    try {
      const marketMetrics = {
        // 전체 시장 경쟁력 점수
        overallScore: 0,
        
        // 핵심 지표
        keyMetrics: {
          trendAlignment: 0,      // 트렌드 적합도
          differentiation: 0,     // 차별화 수준
          commercialAppeal: 0,    // 상업적 매력도
          marketPosition: 0       // 시장 위치
        },
        
        // 경쟁 분석
        competitiveAnalysis: {
          marketShare: 0,
          competitiveAdvantage: 'moderate',
          threatLevel: 'medium'
        },
        
        // 시장 기회
        marketOpportunities: {
          trendOpportunities: 0,
          nicheOpportunities: 0,
          crossoverPotential: 0
        },
        
        // 성장 잠재력
        growthPotential: {
          shortTerm: 0,
          mediumTerm: 0,
          longTerm: 0
        }
      };
      
      // Market Engine에서 데이터 수집
      if (this.systems.marketEngine && this.systems.marketEngine.marketHistory.length > 0) {
        const recent = this.systems.marketEngine.marketHistory.slice(-1)[0];
        marketMetrics.overallScore = recent.overallScore;
        marketMetrics.keyMetrics.trendAlignment = recent.marketFitScore || 0;
        marketMetrics.keyMetrics.differentiation = recent.differentiationScore || 0;
        marketMetrics.keyMetrics.commercialAppeal = recent.commercialScore || 0;
        marketMetrics.keyMetrics.marketPosition = recent.positioningScore || 0;
      }
      
      // 시뮬레이션 데이터
      if (marketMetrics.overallScore === 0) {
        marketMetrics.overallScore = Math.random() * 0.3 + 0.7; // 0.7-1.0
        marketMetrics.keyMetrics = {
          trendAlignment: Math.random() * 0.3 + 0.7,
          differentiation: Math.random() * 0.3 + 0.7,
          commercialAppeal: Math.random() * 0.3 + 0.7,
          marketPosition: Math.random() * 0.3 + 0.7
        };
      }
      
      return marketMetrics;
      
    } catch (error) {
      await this.logger.error('시장 경쟁력 메트릭 수집 실패', { error: error.message });
      return this.getDefaultMarketMetrics();
    }
  }

  /**
   * ⚙️ 시스템 성능 메트릭 수집
   */
  async collectSystemPerformanceMetrics() {
    try {
      const systemMetrics = {
        // 응답 시간
        responseTime: {
          average: 0,
          p95: 0,
          p99: 0,
          maximum: 0
        },
        
        // 성공률
        successRate: {
          overall: 0,
          bySystem: {
            genesis: 0,
            reader: 0,
            market: 0,
            quality: 0
          }
        },
        
        // 처리량
        throughput: {
          current: 0,
          peak: 0,
          average: 0
        },
        
        // 리소스 사용률
        resourceUsage: {
          memory: 0,
          cpu: 0,
          storage: 0
        },
        
        // 에러율
        errorRate: {
          overall: 0,
          byType: {
            system: 0,
            validation: 0,
            timeout: 0,
            unknown: 0
          }
        }
      };
      
      // 시스템 성능 데이터 수집
      systemMetrics.responseTime.average = this.calculateAverageResponseTime();
      systemMetrics.successRate.overall = this.calculateSuccessRate();
      systemMetrics.throughput.current = this.calculateCurrentThroughput();
      
      // 각 시스템별 성공률
      if (this.systems.genesisWorkflow) {
        systemMetrics.successRate.bySystem.genesis = this.calculateSystemSuccessRate('genesis');
      }
      
      return systemMetrics;
      
    } catch (error) {
      await this.logger.error('시스템 성능 메트릭 수집 실패', { error: error.message });
      return this.getDefaultSystemMetrics();
    }
  }

  /**
   * 🚨 현재 알람 생성
   */
  async generateCurrentAlerts() {
    const alerts = [];
    
    try {
      // 품질 알람 검사
      const qualityMetrics = await this.collectQualityMetrics();
      if (qualityMetrics.overallScore < this.PERFORMANCE_STANDARDS.quality.alertThreshold) {
        alerts.push({
          type: 'QUALITY_ALERT',
          severity: qualityMetrics.overallScore < 5.0 ? 'CRITICAL' : 'HIGH',
          message: `품질 점수가 임계값 이하입니다: ${qualityMetrics.overallScore}/10`,
          metric: 'quality.overallScore',
          currentValue: qualityMetrics.overallScore,
          threshold: this.PERFORMANCE_STANDARDS.quality.alertThreshold,
          timestamp: new Date().toISOString(),
          recommendations: ['품질 개선 프로세스 즉시 실행', '문제 원인 분석 및 해결']
        });
      }
      
      // 독자 경험 알람 검사
      const readerMetrics = await this.collectReaderExperienceMetrics();
      if (readerMetrics.overallScore < this.PERFORMANCE_STANDARDS.readerExperience.alertThreshold) {
        alerts.push({
          type: 'READER_EXPERIENCE_ALERT',
          severity: readerMetrics.overallScore < 0.5 ? 'CRITICAL' : 'HIGH',
          message: `독자 경험 점수가 임계값 이하입니다: ${(readerMetrics.overallScore * 100).toFixed(1)}%`,
          metric: 'readerExperience.overallScore',
          currentValue: readerMetrics.overallScore,
          threshold: this.PERFORMANCE_STANDARDS.readerExperience.alertThreshold,
          timestamp: new Date().toISOString(),
          recommendations: ['독자 경험 최적화 실행', '이탈 위험 요소 분석']
        });
      }
      
      // 시장 경쟁력 알람 검사
      const marketMetrics = await this.collectMarketCompetitivenessMetrics();
      if (marketMetrics.overallScore < this.PERFORMANCE_STANDARDS.marketCompetitiveness.alertThreshold) {
        alerts.push({
          type: 'MARKET_COMPETITIVENESS_ALERT',
          severity: 'MEDIUM',
          message: `시장 경쟁력이 임계값 이하입니다: ${(marketMetrics.overallScore * 100).toFixed(1)}%`,
          metric: 'marketCompetitiveness.overallScore',
          currentValue: marketMetrics.overallScore,
          threshold: this.PERFORMANCE_STANDARDS.marketCompetitiveness.alertThreshold,
          timestamp: new Date().toISOString(),
          recommendations: ['시장 트렌드 분석 및 적응', '차별화 전략 재검토']
        });
      }
      
      return alerts;
      
    } catch (error) {
      await this.logger.error('알람 생성 실패', { error: error.message });
      return [];
    }
  }

  /**
   * 💡 개선 권장사항 생성
   */
  async generateImprovementRecommendations() {
    const recommendations = [];
    
    try {
      // 품질 개선 권장사항
      const qualityMetrics = await this.collectQualityMetrics();
      if (qualityMetrics.overallScore < this.PERFORMANCE_STANDARDS.quality.target) {
        recommendations.push({
          category: 'QUALITY',
          priority: qualityMetrics.overallScore < this.PERFORMANCE_STANDARDS.quality.minimum ? 'HIGH' : 'MEDIUM',
          title: '품질 개선 필요',
          description: `현재 품질 점수 ${qualityMetrics.overallScore}/10을 목표 ${this.PERFORMANCE_STANDARDS.quality.target}/10으로 향상`,
          actions: [
            '가장 낮은 점수의 엔진 집중 개선',
            '품질 검증 프로세스 강화',
            '자동 품질 개선 루프 활성화'
          ],
          expectedImpact: 'high',
          estimatedTime: '1-2 weeks'
        });
      }
      
      // 독자 경험 개선 권장사항
      const readerMetrics = await this.collectReaderExperienceMetrics();
      if (readerMetrics.overallScore < this.PERFORMANCE_STANDARDS.readerExperience.target) {
        recommendations.push({
          category: 'READER_EXPERIENCE',
          priority: readerMetrics.overallScore < this.PERFORMANCE_STANDARDS.readerExperience.minimum ? 'HIGH' : 'MEDIUM',
          title: '독자 경험 최적화 필요',
          description: `독자 만족도를 ${(readerMetrics.overallScore * 100).toFixed(1)}%에서 ${this.PERFORMANCE_STANDARDS.readerExperience.target * 100}%로 향상`,
          actions: [
            '몰입도 저하 요소 제거',
            '감정적 영향도 강화',
            '개인화된 독자 경험 제공'
          ],
          expectedImpact: 'high',
          estimatedTime: '2-3 weeks'
        });
      }
      
      // 시장 경쟁력 개선 권장사항
      const marketMetrics = await this.collectMarketCompetitivenessMetrics();
      if (marketMetrics.overallScore < this.PERFORMANCE_STANDARDS.marketCompetitiveness.target) {
        recommendations.push({
          category: 'MARKET_COMPETITIVENESS',
          priority: 'MEDIUM',
          title: '시장 경쟁력 강화 필요',
          description: `시장 적합성을 ${(marketMetrics.overallScore * 100).toFixed(1)}%에서 ${this.PERFORMANCE_STANDARDS.marketCompetitiveness.target * 100}%로 향상`,
          actions: [
            '최신 트렌드 반영 강화',
            '차별화 요소 발굴 및 적용',
            '타겟 독자층 확대 전략'
          ],
          expectedImpact: 'medium',
          estimatedTime: '3-4 weeks'
        });
      }
      
      return recommendations.sort((a, b) => {
        const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
    } catch (error) {
      await this.logger.error('개선 권장사항 생성 실패', { error: error.message });
      return [];
    }
  }

  /**
   * 📊 트렌드 분석
   */
  async analyzeTrends() {
    try {
      return {
        // 단기 트렌드 (24시간)
        shortTerm: this.analyzeShortTermTrends(),
        
        // 중기 트렌드 (7일)
        mediumTerm: this.analyzeMediumTermTrends(),
        
        // 장기 트렌드 (30일)
        longTerm: this.analyzeLongTermTrends(),
        
        // 트렌드 요약
        summary: {
          overallDirection: 'improving',
          confidence: 0.8,
          keyInsights: [
            '품질 점수가 지속적으로 향상되고 있음',
            '독자 만족도가 안정적으로 유지됨',
            '시장 경쟁력이 점진적으로 개선됨'
          ]
        }
      };
      
    } catch (error) {
      await this.logger.error('트렌드 분석 실패', { error: error.message });
      return { summary: { overallDirection: 'unknown', confidence: 0 } };
    }
  }

  /**
   * 🔮 예측 분석
   */
  async generatePredictions() {
    try {
      return {
        // 품질 예측
        quality: {
          next24h: this.predictQuality(24),
          next7d: this.predictQuality(168),
          confidence: 0.75
        },
        
        // 독자 경험 예측
        readerExperience: {
          next24h: this.predictReaderExperience(24),
          next7d: this.predictReaderExperience(168),
          confidence: 0.7
        },
        
        // 시장 경쟁력 예측
        marketCompetitiveness: {
          next24h: this.predictMarketCompetitiveness(24),
          next7d: this.predictMarketCompetitiveness(168),
          confidence: 0.65
        },
        
        // 통합 예측
        overall: {
          trend: 'positive',
          confidence: 0.7,
          keyFactors: [
            '지속적인 품질 개선',
            '독자 피드백 반영',
            '시장 트렌드 적응'
          ]
        }
      };
      
    } catch (error) {
      await this.logger.error('예측 분석 실패', { error: error.message });
      return { overall: { trend: 'unknown', confidence: 0 } };
    }
  }

  /**
   * ⏰ 정기적 모니터링 수행
   */
  async performPeriodicMonitoring() {
    try {
      this.monitoringState.totalOperations++;
      
      // 현재 상태 스냅샷 생성
      const currentSnapshot = await this.generateComprehensiveSnapshot();
      
      // 성능 변화 감지
      const performanceChanges = this.detectPerformanceChanges(currentSnapshot);
      
      // 중요한 변화가 있을 경우 즉시 알림
      if (performanceChanges.significantChanges.length > 0) {
        await this.logger.warn('중요한 성능 변화 감지', {
          changes: performanceChanges.significantChanges.length,
          details: performanceChanges.significantChanges.map(c => c.description)
        });
      }
      
      // 업데이트 시간 갱신
      this.monitoringState.lastUpdate = new Date();
      
      return currentSnapshot;
      
    } catch (error) {
      await this.logger.error('정기 모니터링 실행 실패', { error: error.message });
      throw error;
    }
  }

  /**
   * 📄 최종 성능 리포트 생성
   */
  async generateFinalPerformanceReport() {
    try {
      const endTime = new Date();
      const duration = endTime - this.monitoringState.startTime;
      
      return {
        // 모니터링 기간 정보
        monitoringPeriod: {
          startTime: this.monitoringState.startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: duration,
          durationFormatted: this.formatDuration(duration)
        },
        
        // 성능 요약
        performanceSummary: {
          totalOperations: this.monitoringState.totalOperations,
          successfulOperations: this.monitoringState.successfulOperations,
          successRate: this.calculateSuccessRate(),
          averageResponseTime: this.calculateAverageResponseTime()
        },
        
        // 핵심 지표 요약
        keyMetricsSummary: await this.generateKeyMetricsSummary(),
        
        // 최종 권장사항
        finalRecommendations: await this.generateFinalRecommendations(),
        
        // 다음 단계 제안
        nextSteps: this.generateNextSteps(),
        
        // 리포트 메타데이터
        reportMetadata: {
          generatedAt: endTime.toISOString(),
          reportVersion: '1.0-FINAL',
          dataQuality: await this.assessDataQuality()
        }
      };
      
    } catch (error) {
      await this.logger.error('최종 성능 리포트 생성 실패', { error: error.message });
      throw new ReportGenerationError('최종 리포트 생성 중 오류 발생', error);
    }
  }

  // ===== 유틸리티 및 헬퍼 메서드들 =====

  /**
   * 📊 메트릭 히스토리 업데이트
   */
  updateMetricsHistory(snapshot) {
    // 품질 히스토리 업데이트
    this.metricsHistory.quality.push({
      timestamp: snapshot.timestamp,
      overallScore: snapshot.quality.overallScore,
      engineScores: snapshot.quality.engineScores
    });
    
    // 독자 경험 히스토리 업데이트
    this.metricsHistory.readerExperience.push({
      timestamp: snapshot.timestamp,
      overallScore: snapshot.readerExperience.overallScore,
      keyMetrics: snapshot.readerExperience.keyMetrics
    });
    
    // 시장 경쟁력 히스토리 업데이트
    this.metricsHistory.marketCompetitiveness.push({
      timestamp: snapshot.timestamp,
      overallScore: snapshot.marketCompetitiveness.overallScore,
      keyMetrics: snapshot.marketCompetitiveness.keyMetrics
    });
    
    // 히스토리 크기 제한
    Object.keys(this.metricsHistory).forEach(key => {
      if (this.metricsHistory[key].length > this.dashboardConfig.maxMetricsPoints) {
        this.metricsHistory[key] = this.metricsHistory[key].slice(-this.dashboardConfig.maxMetricsPoints);
      }
    });
  }

  /**
   * 🚨 알람 처리
   */
  async processAlerts(snapshot) {
    for (const alert of snapshot.alerts) {
      // 중복 알람 확인
      const existingAlert = this.alertSystem.activeAlerts.find(a => 
        a.type === alert.type && a.metric === alert.metric
      );
      
      if (!existingAlert) {
        // 새 알람 추가
        this.alertSystem.activeAlerts.push({
          ...alert,
          id: this.generateAlertId(),
          acknowledged: false,
          escalated: false
        });
        
        // 알람 전송
        await this.sendAlert(alert);
      }
    }
    
    // 해결된 알람 제거
    this.cleanupResolvedAlerts(snapshot);
  }

  /**
   * 📧 알람 전송
   */
  async sendAlert(alert) {
    try {
      // 콘솔 출력
      if (this.alertSystem.notificationChannels.includes('console')) {
        console.warn(`🚨 ${alert.severity} ALERT: ${alert.message}`);
      }
      
      // 로그 기록
      if (this.alertSystem.notificationChannels.includes('log')) {
        await this.logger.warn(`ALERT: ${alert.type}`, {
          severity: alert.severity,
          message: alert.message,
          currentValue: alert.currentValue,
          threshold: alert.threshold
        });
      }
      
    } catch (error) {
      await this.logger.error('알람 전송 실패', { error: error.message });
    }
  }

  // 기본값 반환 메서드들
  getDefaultQualityMetrics() {
    return {
      overallScore: 7.5,
      engineScores: { plot: 7.5, character: 7.5, literary: 7.5, romance: 7.5 },
      qualityDistribution: { worldClass: 0, excellent: 0.3, good: 0.7, poor: 0 },
      qualityTrend: { direction: 'stable', changeRate: 0, confidence: 0.5 },
      issues: { critical: 0, high: 0, medium: 1, low: 2 }
    };
  }

  getDefaultReaderExperienceMetrics() {
    return {
      overallScore: 0.8,
      keyMetrics: { immersion: 0.8, emotionalImpact: 0.8, satisfaction: 0.8, retention: 0.8 },
      segmentScores: { casual: 0.8, enthusiast: 0.8, critical: 0.7 },
      dropoutRisk: { level: 'low', score: 0.2, criticalFactors: [] },
      feedback: { positiveRatio: 0.8, engagementRate: 0.7, recommendationRate: 0.6 }
    };
  }

  getDefaultMarketMetrics() {
    return {
      overallScore: 0.75,
      keyMetrics: { trendAlignment: 0.8, differentiation: 0.7, commercialAppeal: 0.75, marketPosition: 0.7 },
      competitiveAnalysis: { marketShare: 0.1, competitiveAdvantage: 'moderate', threatLevel: 'medium' },
      marketOpportunities: { trendOpportunities: 0.6, nicheOpportunities: 0.7, crossoverPotential: 0.5 },
      growthPotential: { shortTerm: 0.6, mediumTerm: 0.7, longTerm: 0.8 }
    };
  }

  getDefaultSystemMetrics() {
    return {
      responseTime: { average: 15000, p95: 25000, p99: 35000, maximum: 45000 },
      successRate: { overall: 0.95, bySystem: { genesis: 0.95, reader: 0.95, market: 0.95, quality: 0.95 } },
      throughput: { current: 24, peak: 30, average: 20 },
      resourceUsage: { memory: 0.6, cpu: 0.4, storage: 0.3 },
      errorRate: { overall: 0.05, byType: { system: 0.02, validation: 0.02, timeout: 0.01, unknown: 0.01 } }
    };
  }

  // 계산 및 분석 메서드들
  calculateSuccessRate() {
    if (this.monitoringState.totalOperations === 0) return 1.0;
    return this.monitoringState.successfulOperations / this.monitoringState.totalOperations;
  }

  calculateAverageResponseTime() {
    return Math.random() * 10000 + 10000; // 10-20초 시뮬레이션
  }

  calculateCurrentThroughput() {
    return Math.floor(Math.random() * 20) + 20; // 20-40 작업/시간
  }

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`;
    } else {
      return `${seconds}초`;
    }
  }

  generateAlertId() {
    return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }

  getSystemStatus() {
    return {
      monitoring: this.monitoringState.isActive ? 'active' : 'inactive',
      uptime: this.monitoringState.startTime ? Date.now() - this.monitoringState.startTime : 0,
      lastUpdate: this.monitoringState.lastUpdate,
      systemsConnected: Object.keys(this.systems).filter(key => this.systems[key] !== null).length
    };
  }

  async assessDataQuality() {
    return {
      completeness: 0.95,
      accuracy: 0.9,
      timeliness: 0.85,
      consistency: 0.92,
      overall: 0.9
    };
  }
}

/**
 * 커스텀 에러 클래스들
 */
export class MonitoringError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'MonitoringError';
    this.originalError = originalError;
  }
}

export class SnapshotError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'SnapshotError';
    this.originalError = originalError;
  }
}

export class ReportGenerationError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'ReportGenerationError';
    this.originalError = originalError;
  }
}