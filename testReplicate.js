import ReplicateService from './src/services/replicateService.js';

async function testReplicate() {
  const replicate = new ReplicateService();

  // 테스트 스크립트
  const testScript = {
    title: "AI 기술의 미래",
    scenes: [
      {
        text: "AI가 우리의 일상을 바꾸고 있습니다",
        imagePrompt: "futuristic city with AI robots helping humans, ultra realistic, 8k",
        duration: 3
      },
      {
        text: "의료, 교육, 비즈니스 모든 분야에서",
        imagePrompt: "AI doctor examining patient with holographic display, modern hospital",
        duration: 3
      },
      {
        text: "더 나은 미래를 만들어갑니다",
        imagePrompt: "children learning with AI teacher in futuristic classroom, bright and optimistic",
        duration: 3
      }
    ],
    generateVideo: false // 일단 이미지만 생성
  };

  try {
    console.log('🚀 Replicate 테스트 시작...\n');
    
    // 무료/저렴한 모델로 먼저 테스트
    console.log('1️⃣ API 연결 테스트 (저렴한 모델)');
    const replicate = new ReplicateService();
    
    // 간단한 텍스트 생성 테스트 (매우 저렴)
    const testOutput = await replicate.replicate.run(
      "meta/llama-2-7b:73001d654114dad81ec65da3b834e2f691af1e1526453189b7bf36fb3f32d0f9",
      {
        input: {
          prompt: "Say hello",
          max_length: 10
        }
      }
    );
    console.log('✅ API 연결 성공:', testOutput);

    // 크레딧이 충전되면 아래 주석 해제
    /*
    // 단일 이미지 생성 테스트
    console.log('\n2️⃣ 단일 이미지 생성 테스트');
    const imageUrl = await replicate.generateImage(
      "beautiful korean street food market at night, neon lights, crowded, cinematic",
      { width: 768, height: 1344 }
    );
    console.log('생성된 이미지:', imageUrl);

    // 텍스트→비디오 테스트 (짧은 클립)
    console.log('\n3️⃣ 텍스트→비디오 생성 테스트');
    const videoUrl = await replicate.textToVideo(
      "robot walking in futuristic city, smooth animation",
      { numFrames: 16 }
    );
    console.log('생성된 비디오:', videoUrl);

    // 전체 워크플로우 테스트
    console.log('\n4️⃣ 전체 워크플로우 테스트');
    const results = await replicate.createShortFormVideo(testScript, './output/test');
    console.log('\n📊 생성 결과:', results);
    */

    console.log('\n✅ 모든 테스트 완료!');
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

// 테스트 실행
testReplicate();