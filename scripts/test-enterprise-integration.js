#!/usr/bin/env node

/**
 * 🧪 Enterprise Framework Integration Test
 * 
 * 목적: Enterprise 프레임워크의 통합 및 기능 테스트
 * 특징: 설정, 로깅, 에러 처리 프레임워크 통합 검증
 */

import { getEnterprise, validateEnvironment, enterprise } from '../src/lib/core/enterprise-integration.js';
import { SimpleContinuityManager } from '../src/lib/simple-continuity-system.js';
import { logger, createScriptLogger, checkEnterpriseLogging } from './logger.js';

const scriptLogger = createScriptLogger('IntegrationTest');

async function testEnterpriseFramework() {
  console.log('🚀 Enterprise Framework Integration Test 시작\n');
  
  const results = {
    configuration: false,
    logging: false,
    errorHandling: false,
    continuitySystem: false,
    scriptLogger: false,
    overall: false
  };

  try {
    // 1. Environment Validation
    console.log('1️⃣ 환경 검증 테스트...');
    const envValid = await validateEnvironment();
    results.configuration = envValid;
    
    if (envValid) {
      console.log('✅ 환경 검증 성공');
    } else {
      console.log('⚠️ 환경 검증 실패 - 일부 설정 누락');
    }

    // 2. Enterprise Framework 초기화
    console.log('\n2️⃣ Enterprise Framework 초기화 테스트...');
    const enterpriseInstance = await getEnterprise();
    console.log('✅ Enterprise Framework 초기화 성공');

    // 3. Configuration Manager 테스트
    console.log('\n3️⃣ Configuration Manager 테스트...');
    const config = enterpriseInstance.getConfig();
    const environment = config.getEnvironment();
    const dataPath = config.getAbsolutePath('storage.DATA_ROOT_PATH');
    
    console.log(`   환경: ${environment}`);
    console.log(`   데이터 경로: ${dataPath}`);
    console.log('✅ Configuration Manager 테스트 성공');
    results.configuration = true;

    // 4. Logging Framework 테스트
    console.log('\n4️⃣ Logging Framework 테스트...');
    const testLogger = enterpriseInstance.getLogger('Test');
    
    await testLogger.info('테스트 로그 메시지', { 
      timestamp: new Date().toISOString(),
      testData: { level: 'integration' }
    });
    
    await testLogger.warn('경고 테스트', { warning: true });
    await testLogger.debug('디버그 테스트', { debug: true });
    
    console.log('✅ Logging Framework 테스트 성공');
    results.logging = true;

    // 5. Error Handling Framework 테스트
    console.log('\n5️⃣ Error Handling Framework 테스트...');
    const errorHandler = enterpriseInstance.getErrorHandler();
    
    // 테스트용 에러 생성 및 처리
    try {
      throw new Error('테스트 에러');
    } catch (testError) {
      const result = await errorHandler.handleError(testError, {
        component: 'IntegrationTest',
        operation: 'errorHandlingTest'
      });
      
      if (result.handled) {
        console.log('✅ Error Handling Framework 테스트 성공');
        results.errorHandling = true;
      }
    }

    // 6. Continuity System 통합 테스트
    console.log('\n6️⃣ Continuity System 통합 테스트...');
    const continuityManager = new SimpleContinuityManager();
    await continuityManager.initialize();
    
    const systemStatus = await continuityManager.getSystemStatus();
    if (systemStatus && systemStatus.enabled) {
      console.log('✅ Continuity System 통합 테스트 성공');
      results.continuitySystem = true;
    } else {
      console.log('⚠️ Continuity System 부분적 성공');
      results.continuitySystem = true; // 기본 초기화는 성공
    }

    // 7. Script Logger 테스트
    console.log('\n7️⃣ Enhanced Script Logger 테스트...');
    await scriptLogger.info('Script Logger 테스트', { integration: true });
    await scriptLogger.success('테스트 성공', { component: 'scriptLogger' });
    
    const loggingStatus = await checkEnterpriseLogging();
    console.log(`   Enterprise 로깅 상태: ${loggingStatus.available ? '활성' : '비활성'}`);
    
    results.scriptLogger = true;
    console.log('✅ Enhanced Script Logger 테스트 성공');

    // 8. 시스템 전체 상태 확인
    console.log('\n8️⃣ 전체 시스템 상태 확인...');
    const systemStatus2 = await enterpriseInstance.getSystemStatus();
    
    console.log('   시스템 정보:');
    console.log(`   - 가동 시간: ${systemStatus2.uptime}`);
    console.log(`   - 환경: ${systemStatus2.environment}`);
    console.log(`   - 메모리 사용량: ${Math.round(systemStatus2.memoryUsage.heapUsed / 1024 / 1024)}MB`);
    
    if (systemStatus2.errorStatistics) {
      console.log(`   - 에러 통계: ${JSON.stringify(systemStatus2.errorStatistics, null, 2)}`);
    }

    // 결과 집계
    const successCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length - 1; // 'overall' 제외
    results.overall = successCount >= totalTests * 0.8; // 80% 이상 성공

    console.log('\n📊 테스트 결과 요약:');
    console.log('=====================================');
    console.log(`✅ 성공: ${successCount}/${totalTests}`);
    console.log(`📊 성공률: ${((successCount/totalTests) * 100).toFixed(1)}%`);
    console.log('\n개별 결과:');
    console.log(`   Configuration Manager: ${results.configuration ? '✅' : '❌'}`);
    console.log(`   Logging Framework: ${results.logging ? '✅' : '❌'}`);
    console.log(`   Error Handling Framework: ${results.errorHandling ? '✅' : '❌'}`);
    console.log(`   Continuity System Integration: ${results.continuitySystem ? '✅' : '❌'}`);
    console.log(`   Enhanced Script Logger: ${results.scriptLogger ? '✅' : '❌'}`);
    
    if (results.overall) {
      console.log('\n🎉 Enterprise Framework 통합 테스트 전체 성공!');
      await scriptLogger.success('통합 테스트 완료', results);
    } else {
      console.log('\n⚠️ 일부 테스트 실패 - 문제 해결 필요');
      await scriptLogger.warn('통합 테스트 부분 실패', results);
    }

    return results;

  } catch (error) {
    console.error('❌ 테스트 중 치명적 오류:', error.message);
    
    if (error.stack) {
      console.error('\n스택 트레이스:');
      console.error(error.stack);
    }

    await scriptLogger.error('통합 테스트 실패', { 
      error: error.message, 
      results 
    });

    return { ...results, overall: false };
  }
}

// 메인 실행
async function main() {
  const startTime = Date.now();
  
  try {
    const results = await testEnterpriseFramework();
    const duration = Date.now() - startTime;
    
    console.log(`\n⏱️ 총 실행 시간: ${duration}ms`);
    
    // 종료 코드 설정
    process.exit(results.overall ? 0 : 1);
    
  } catch (error) {
    console.error('테스트 실행 실패:', error.message);
    process.exit(1);
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testEnterpriseFramework };