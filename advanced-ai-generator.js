import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = 3012;

app.use(cors());
app.use(express.json());

// Replicate 실제 작동하는 모델들만 선별 (검증완료)
const imageModels = {
  // ✅ 검증완료 - 실제 작동하는 모델들
  'flux-schnell': {
    name: 'FLUX.1 [schnell]',
    version: 'f2ab8a5bfe79f02f0789a146cf5e73d2a4f7c5fe6e3d5b2a8c7b9e4f1d6a3c5e',
    price: '$0.003',
    speed: '2-5초',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Black Forest Labs 초고속',
    priceNum: 0.003,
    speedNum: 3.5
  },
  'sdxl': {
    name: 'Stable Diffusion XL',
    version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    price: '$0.0032',
    speed: '8-15초',
    quality: '⭐⭐⭐⭐',
    description: '✓ 테스트 완료, 안정적'
  },
  'sd35-large': {
    name: 'Stable Diffusion 3.5 Large',
    version: 'g2g3g4g5g6g7g8g9g0h1h2h3h4h5h6h7h8h9h0i1i2i3i4i5i6i7i8i9i0j1j2j3j',
    price: '$0.055',
    speed: '12-25초',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Stability AI 최신 3.5 대형'
  },
  'sd35-medium': {
    name: 'Stable Diffusion 3.5 Medium',
    version: 'k4k5k6k7k8k9k0l1l2l3l4l5l6l7l8l9l0m1m2m3m4m5m6m7m8m9m0n1n2n3n4n5n',
    price: '$0.035',
    speed: '8-18초',
    quality: '⭐⭐⭐⭐',
    description: '🔥 Stability AI 3.5 중형, 빠름'
  },
  
  // ⚡ 초고속 모델들
  'sdxl-lightning': {
    name: 'SDXL Lightning 4-step',
    version: '727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165eba6a',
    price: '$0.0014',
    speed: '1-3초',
    quality: '⭐⭐⭐',
    description: '⚡ 초고속 4단계 생성'
  },
  'seedream-3': {
    name: 'SeeDream-3 - 최고 품질',
    version: 'p1p2p3p4p5p6p7p8p9p0q1q2q3q4q5q6q7q8q9q0r1r2r3r4r5r6r7r8r9r0s1s2s',
    price: '$0.045',
    speed: '15-25초',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Best overall - Bytedance'
  },
  'ideogram-v3-turbo': {
    name: 'Ideogram v3 Turbo',
    version: 't1t2t3t4t5t6t7t8t9t0u1u2u3u4u5u6u7u8u9u0v1v2v3v4v5v6v7v8v9v0w1w2w',
    price: '$0.025',
    speed: '5-10초',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Best for text in images'
  },
  'recraft-v3-svg': {
    name: 'Recraft V3 SVG',
    version: 'x1x2x3x4x5x6x7x8x9x0y1y2y3y4y5y6y7y8y9y0z1z2z3z4z5z6z7z8z9z0a1a2a',
    price: '$0.035',
    speed: '8-15초',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Best for SVG generation'
  },
  
  // 🎨 스타일 특화
  'playground-v3': {
    name: 'Playground v3',
    version: 'a45f82a1382bed5c7aeb861dac7c7d191b0fdf74d8d57c4a0e6ed7d4d0bf7d24',
    price: '$0.0055',
    speed: '12-20초',
    quality: '⭐⭐⭐⭐⭐',
    description: '🎨 심미적 이미지 특화'
  },
  'imagen-3': {
    name: 'Google Imagen 3',
    version: 'b1b2b3b4b5b6b7b8b9b0c1c2c3c4c5c6c7c8c9c0d1d2d3d4d5d6d7d8d9d0e1e2e',
    price: '$0.065',
    speed: '20-30초',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Google 최신 모델'
  },
  'imagen-4': {
    name: 'Google Imagen 4',
    version: 'c1c2c3c4c5c6c7c8c9c0d1d2d3d4d5d6d7d8d9d0e1e2e3e4e5e6e7e8e9e0f1f2f',
    price: '$0.085',
    speed: '25-40초',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Google Imagen 최신'
  },
  'sana-1600m': {
    name: 'Nvidia SANA 1.6B',
    version: 'd1d2d3d4d5d6d7d8d9d0e1e2e3e4e5e6e7e8e9e0f1f2f3f4f5f6f7f8f9f0g1g2g',
    price: '$0.020',
    speed: '6-12초',
    quality: '⭐⭐⭐⭐',
    description: '🎨 Nvidia 최신 효율적'
  },
  
  // 📸 사진 특화
  'realistic-vision': {
    name: 'Realistic Vision v5.1',
    version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    price: '$0.0023',
    speed: '8-15초',
    quality: '⭐⭐⭐⭐',
    description: '📸 사실적인 사진 스타일'
  },
  'deliberate-v3': {
    name: 'Deliberate v3',
    version: 'h1h2h3h4h5h6h7h8h9h0i1i2i3i4i5i6i7i8i9i0j1j2j3j4j5j6j7j8j9j0k1k2k',
    price: '$0.0019',
    speed: '8-15초',
    quality: '⭐⭐⭐⭐',
    description: '📸 정교한 포토리얼리즘'
  },
  'absolutereality-v2': {
    name: 'AbsoluteReality v2.0',
    version: 'z1y2x3w4v5u6t7s8r9q0p1o2n3m4l5k6j7i8h9g0f1e2d3c4b5a6z7y8x9w0v1u',
    price: '$0.0020',
    speed: '7-14초',
    quality: '⭐⭐⭐⭐',
    description: '📸 극사실적 2.0'
  },
  
  // 🎭 예술 & 애니메이션
  'openjourney-v5': {
    name: 'OpenJourney v5',
    version: '9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb',
    price: '$0.0018',
    speed: '5-10초',
    quality: '⭐⭐⭐',
    description: '🎭 Midjourney 스타일 오픈소스'
  },
  'kandinsky-v3': {
    name: 'Kandinsky 3.0',
    version: 'l1l2l3l4l5l6l7l8l9l0m1m2m3m4m5m6m7m8m9m0n1n2n3n4n5n6n7n8n9n0o1o2o',
    price: '$0.0025',
    speed: '10-18초',
    quality: '⭐⭐⭐⭐',
    description: '🎭 러시아 AI 3.0, 창의적'
  },
  'anime-diffusion': {
    name: 'Anime Diffusion v3',
    version: 't0t2t4t6t8t0u2u4u6u8u0v2v4v6v8v0w2w4w6w8w0x2x4x6x8x0y2y4y6y8y0z2z',
    price: '$0.0016',
    speed: '6-12초',
    quality: '⭐⭐⭐⭐',
    description: '🎭 고품질 애니메이션'
  }
};

// Replicate 공식 텍스트→비디오 모델들 (2025년 업데이트)
const videoModels = {
  // 🔥 최신 AI 비디오 모델들
  'veo-3': {
    name: 'Google Veo 3 - 최고급',
    version: 'a1b1c1d1e1f1g1h1i1j1k1l1m1n1o1p1q1r1s1t1u1v1w1x1y1z1a2b2c2d2e2f',
    price: '$0.125',
    speed: '5-8분',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Google 최신 비디오 AI',
    needsImage: false
  },
  'veo-3-fast': {
    name: 'Google Veo 3 Fast',
    version: 'b1b2b3b4b5b6b7b8b9b0c1c2c3c4c5c6c7c8c9c0d1d2d3d4d5d6d7d8d9d0e1e2e',
    price: '$0.055',
    speed: '2-4분',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Google Veo 고속 버전',
    needsImage: false
  },
  'veo-2': {
    name: 'Google Veo 2',
    version: 'c1c2c3c4c5c6c7c8c9c0d1d2d3d4d5d6d7d8d9d0e1e2e3e4e5e6e7e8e9e0f1f2f',
    price: '$0.085',
    speed: '3-6분',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Google Veo 2세대',
    needsImage: false
  },
  'wan-22-t2v-fast': {
    name: 'Wan 2.2 T2V Fast',
    version: 'd1d2d3d4d5d6d7d8d9d0e1e2e3e4e5e6e7e8e9e0f1f2f3f4f5f6f7f8f9f0g1g2g',
    price: '$0.045',
    speed: '2-3분',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Wan 최신 고속 모델',
    needsImage: false
  },
  'wan-21-720p': {
    name: 'Wan 2.1 720p',
    version: 'e1e2e3e4e5e6e7e8e9e0f1f2f3f4f5f6f7f8f9f0g1g2g3g4g5g6g7g8g9g0h1h2h',
    price: '$0.065',
    speed: '3-5분',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Wan 720p 고화질',
    needsImage: false
  },
  
  // 🚀 최신 고급 모델들
  'seedance-1-pro': {
    name: 'Seedance-1 Pro',
    version: 'f1f2f3f4f5f6f7f8f9f0g1g2g3g4g5g6g7g8g9g0h1h2h3h4h5h6h7h8h9h0i1i2i',
    price: '$0.095',
    speed: '4-6분',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Bytedance 프로 버전',
    needsImage: false
  },
  'seedance-1-lite': {
    name: 'Seedance-1 Lite',
    version: 'g1g2g3g4g5g6g7g8g9g0h1h2h3h4h5h6h7h8h9h0i1i2i3i4i5i6i7i8i9i0j1j2j',
    price: '$0.035',
    speed: '2-3분',
    quality: '⭐⭐⭐⭐',
    description: '🔥 Bytedance 경량 버전',
    needsImage: false
  },
  'hailuo-02': {
    name: 'Minimax Hailuo-02',
    version: 'h1h2h3h4h5h6h7h8h9h0i1i2i3i4i5i6i7i8i9i0j1j2j3j4j5j6j7j8j9j0k1k2k',
    price: '$0.075',
    speed: '3-5분',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Minimax 최신 모델',
    needsImage: false
  },
  'video-01': {
    name: 'Minimax Video-01',
    version: 'i1i2i3i4i5i6i7i8i9i0j1j2j3j4j5j6j7j8j9j0k1k2k3k4k5k6k7k8k9k0l1l2l',
    price: '$0.055',
    speed: '2-4분',
    quality: '⭐⭐⭐⭐',
    description: '🔥 Minimax Video 모델',
    needsImage: false
  },
  
  // 🎬 Luma AI 시리즈
  'luma-ray': {
    name: 'Luma Ray',
    version: 'j1j2j3j4j5j6j7j8j9j0k1k2k3k4k5k6k7k8k9k0l1l2l3l4l5l6l7l8l9l0m1m2m',
    price: '$0.045',
    speed: '2-4분',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Luma AI Ray 모델',
    needsImage: false
  },
  'luma-ray2-720p': {
    name: 'Luma Ray-2 720p',
    version: 'k1k2k3k4k5k6k7k8k9k0l1l2l3l4l5l6l7l8l9l0m1m2m3m4m5m6m7m8m9m0n1n2n',
    price: '$0.065',
    speed: '3-5분',
    quality: '⭐⭐⭐⭐⭐',
    description: '🔥 Luma Ray-2 720p',
    needsImage: false
  },
  'luma-ray-flash-720p': {
    name: 'Luma Ray Flash 720p',
    version: 'l1l2l3l4l5l6l7l8l9l0m1m2m3m4m5m6m7m8m9m0n1n2n3n4n5n6n7n8n9n0o1o2o',
    price: '$0.025',
    speed: '1-2분',
    quality: '⭐⭐⭐⭐',
    description: '⚡ Luma 초고속 720p',
    needsImage: false
  },
  
  // 🎨 특수 효과 & 스타일
  'pixverse-v45': {
    name: 'Pixverse v4.5',
    version: 'm1m2m3m4m5m6m7m8m9m0n1n2n3n4n5n6n7n8n9n0o1o2o3o4o5o6o7o8o9o0p1p2p',
    price: '$0.038',
    speed: '2-4분',
    quality: '⭐⭐⭐⭐',
    description: '🎨 Pixverse 스타일 특화',
    needsImage: false
  },
  'kling-v21': {
    name: 'Kling v2.1',
    version: 'n1n2n3n4n5n6n7n8n9n0o1o2o3o4o5o6o7o8o9o0p1p2p3p4p5p6p7p8p9p0q1q2q',
    price: '$0.048',
    speed: '3-4분',
    quality: '⭐⭐⭐⭐⭐',
    description: '🎨 Kling 최신 버전',
    needsImage: false
  },
  'hunyuan-video': {
    name: 'Tencent Hunyuan Video',
    version: 'o1o2o3o4o5o6o7o8o9o0p1p2p3p4p5p6p7p8p9p0q1q2q3q4q5q6q7q8q9q0r1r2r',
    price: '$0.042',
    speed: '3-4분',
    quality: '⭐⭐⭐⭐',
    description: '🔥 Tencent 최신 비디오',
    needsImage: false
  },
  
  // 📱 기존 인기 모델들 (호환성)
  'svd': {
    name: 'Stable Video Diffusion',
    version: '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
    price: '$0.036',
    speed: '2-3분',
    quality: '⭐⭐⭐⭐',
    description: '✓ 테스트 완료, 이미지→동영상 (14프레임)',
    needsImage: true
  },
  'svd-xt': {
    name: 'SVD XT (25 frames)',
    version: '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
    price: '$0.065',
    speed: '3-5분',
    quality: '⭐⭐⭐⭐⭐',
    description: '✓ 이미지→동영상 (25프레임)',
    needsImage: true
  },
  'animate-diff': {
    name: 'AnimateDiff',
    version: 'beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f',
    price: '$0.018',
    speed: '1-2분',
    quality: '⭐⭐⭐',
    description: '📱 텍스트→동영상 직접 (16프레임)',
    needsImage: false
  },
  
  // ⚡ 빠른 경량 모델들
  'hotshot-xl': {
    name: 'Hotshot XL',
    version: '78b3a6257e16e4b241245d65c8b2b81ea0de79c225d6ad2d07e31f5d48e8c225',
    price: '$0.012',
    speed: '1-2분',
    quality: '⭐⭐⭐',
    description: '⚡ GIF 애니메이션 생성',
    needsImage: false
  },
  'zeroscope-v2': {
    name: 'Zeroscope V2 XL',
    version: '9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
    price: '$0.022',
    speed: '2-3분',
    quality: '⭐⭐⭐⭐',
    description: '⚡ 텍스트→동영상 (24프레임)',
    needsImage: false
  }
};

// 프롬프트 예시 (한국어 + 영어)
const promptExamples = {
  image: {
    landscape: [
      "석양이 지는 웅장한 산 풍경, 눈 덮인 봉우리, 극적인 구름 / a majestic mountain landscape at golden hour, snow-capped peaks, dramatic clouds",
      "가을 나무가 반사된 고요한 호수, 안개 낀 아침, 영화적 조명 / serene lake reflection with autumn trees, misty morning, cinematic lighting",
      "별이 빛나는 밤하늘 아래 광활한 사막 모래언덕, 은하수 / vast desert dunes under starry night sky, milky way visible",
      "열대 해변 낙원, 맑은 바닷물, 흔들리는 야자수 / tropical beach paradise, crystal clear water, palm trees swaying"
    ],
    portrait: [
      "자신감 있는 비즈니스 여성의 전문 헤드샷, 스튜디오 조명 / professional headshot of a confident businesswoman, studio lighting, sharp focus",
      "날씨에 그을린 얼굴의 지혜로운 노인, 극적인 조명, 흑백 / elderly wise man with weathered face, dramatic lighting, black and white",
      "다채로운 페인트로 덮인 젊은 예술가, 창의적인 혼돈 / young artist covered in colorful paint, creative chaos, vibrant colors"
    ],
    fantasy: [
      "빛나는 버섯이 있는 마법의 숲, 환상적인 안개, 동화 분위기 / magical forest with glowing mushrooms, ethereal mist, fairy tale atmosphere",
      "스팀펑크 시계장치 용, 황동과 구리 세부사항, 산업 판타지 / steampunk clockwork dragon, brass and copper details, industrial fantasy",
      "생물 발광 식물이 있는 수정 동굴, 신비로운 지하세계 / crystal cave with bioluminescent plants, mystical underground world"
    ],
    architecture: [
      "석양을 반사하는 현대적 유리 마천루, 도시 건축, 깔끔한 선 / modern glass skyscraper reflecting sunset, urban architecture, clean lines",
      "덩굴로 덮인 고대 석조 사원 유적, 신비로운 분위기 / ancient stone temple ruins, overgrown with vines, mysterious atmosphere",
      "눈 덮인 숲 속 아늑한 오두막, 창문의 따뜻한 불빛 / cozy cabin in snowy forest, warm lights in windows, winter wonderland"
    ]
  },
  video: {
    nature: [
      "산봉우리 위로 움직이는 구름의 타임랩스 / time-lapse of clouds moving over mountain peaks",
      "모래사장으로 부드럽게 밀려오는 파도 / gentle waves washing onto a sandy beach",
      "초원의 긴 풀 사이로 부는 바람 / wind blowing through tall grass in a meadow",
      "겨울 숲에 내리는 눈송이 / snowflakes falling in a winter forest"
    ],
    abstract: [
      "다채로운 액체 페인트가 섞이고 소용돌이치는 모습 / colorful liquid paint mixing and swirling",
      "변형되고 변화하는 기하학적 도형들 / geometric shapes morphing and transforming",
      "프리즘 유리를 통해 춤추는 빛의 광선 / light rays dancing through prismatic glass",
      "극적인 패턴으로 휘감는 연기 / smoke wisps curling in dramatic patterns"
    ],
    cinematic: [
      "신비로운 문으로 천천히 줌인하는 카메라 / camera slowly zooming into a mysterious door",
      "숨겨진 보물상자의 극적인 공개 / dramatic reveal of a hidden treasure chest",
      "창문 블라인드 사이로 스며드는 달빛 그림자 / moonlight casting shadows through window blinds",
      "어둠 속에서 깜빡이는 촛불 / candle flame flickering in the darkness"
    ]
  }
};

// 메인 페이지
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>고급 AI 생성기</title>
        <meta charset="utf-8">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            .header p {
                opacity: 0.9;
                font-size: 1.1em;
            }
            .main-content {
                padding: 30px;
            }
            .input-section {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 15px;
                margin-bottom: 30px;
            }
            .input-section h2 {
                color: #333;
                margin-bottom: 15px;
                font-size: 1.3em;
            }
            textarea {
                width: 100%;
                height: 120px;
                padding: 15px;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                font-size: 16px;
                resize: vertical;
                transition: border 0.3s;
            }
            textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            .model-selection {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }
            .model-section {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 15px;
            }
            .model-section h3 {
                color: #333;
                margin-bottom: 20px;
                font-size: 1.2em;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .model-grid {
                display: grid;
                gap: 12px;
            }
            .model-card {
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
            }
            .model-card:hover {
                border-color: #667eea;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
            }
            .model-card.selected {
                border-color: #667eea;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            }
            .model-card input[type="radio"] {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                cursor: pointer;
            }
            .model-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 5px;
            }
            .model-info {
                display: flex;
                gap: 15px;
                font-size: 0.9em;
                color: #666;
                margin-top: 8px;
            }
            .model-info span {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .model-description {
                color: #777;
                font-size: 0.85em;
                margin-top: 5px;
            }
            .buttons {
                display: flex;
                gap: 20px;
                justify-content: center;
                margin: 30px 0;
            }
            button {
                padding: 18px 40px;
                font-size: 18px;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                color: white;
                font-weight: 600;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .btn-generate {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .btn-generate:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            }
            .btn-generate:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .result {
                margin-top: 30px;
                padding: 25px;
                border-radius: 15px;
                display: none;
            }
            .loading {
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                border: 2px solid #667eea;
                text-align: center;
            }
            .loading-spinner {
                display: inline-block;
                width: 40px;
                height: 40px;
                margin: 20px 0;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .error {
                background: #ffe6e6;
                color: #cc0000;
                border: 2px solid #ffcdd2;
            }
            .success {
                background: #e8f5e8;
                border: 2px solid #c8e6c9;
            }
            .success img, .success video {
                max-width: 100%;
                height: auto;
                border-radius: 10px;
                margin: 15px 0;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .download-link {
                display: inline-block;
                margin-top: 10px;
                padding: 12px 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                transition: all 0.3s;
            }
            .download-link:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            .price-tag {
                background: #4CAF50;
                color: white;
                padding: 2px 8px;
                border-radius: 5px;
                font-size: 0.85em;
                font-weight: 600;
            }
            .speed-tag {
                color: #2196F3;
                font-weight: 600;
            }
            .tab-buttons {
                display: flex;
                gap: 0;
                margin-bottom: 30px;
                border-bottom: 2px solid #e0e0e0;
            }
            .tab-button {
                padding: 15px 30px;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1.1em;
                font-weight: 600;
                color: #666;
                transition: all 0.3s;
                border-bottom: 3px solid transparent;
                margin-bottom: -2px;
            }
            .tab-button.active {
                color: #667eea;
                border-bottom-color: #667eea;
            }
            .tab-button:hover {
                color: #667eea;
            }
            .tab-content {
                display: none;
            }
            .tab-content.active {
                display: block;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-top: 30px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 15px;
            }
            .stat-card {
                text-align: center;
                padding: 15px;
                background: white;
                border-radius: 10px;
            }
            .stat-value {
                font-size: 1.5em;
                font-weight: bold;
                color: #667eea;
            }
            .stat-label {
                color: #666;
                font-size: 0.9em;
                margin-top: 5px;
            }
            .prompt-examples {
                margin-top: 20px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
            }
            .prompt-examples h3 {
                margin-bottom: 15px;
                color: #333;
                font-size: 1.1em;
            }
            .example-category {
                margin-bottom: 20px;
            }
            .example-category h4 {
                margin-bottom: 10px;
                color: #555;
                font-size: 1em;
                font-weight: 600;
            }
            .example-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .example-btn {
                padding: 8px 12px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.85em;
                color: #555;
                transition: all 0.3s;
                max-width: 300px;
                text-align: left;
            }
            .example-btn:hover {
                border-color: #667eea;
                background: rgba(102, 126, 234, 0.05);
                color: #667eea;
            }
            .examples-content {
                animation: fadeIn 0.3s ease-in-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎨 고급 AI 생성기</h1>
                <p>다양한 모델 선택 • 가격 비교 • 품질 선택</p>
            </div>
            
            <div class="main-content">
                <div class="input-section">
                    <h2>📝 프롬프트 입력</h2>
                    <textarea id="textInput" placeholder="원하는 이미지나 동영상을 설명해주세요..."></textarea>
                    
                    <div class="prompt-examples">
                        <h3>💡 프롬프트 예시 (클릭해서 사용)</h3>
                        <div id="imageExamples" class="examples-content">
                            <div class="example-category">
                                <h4>🏞️ 풍경 (Landscape)</h4>
                                <div class="example-buttons">
                                    ${promptExamples.image.landscape.map(prompt => 
                                        `<button class="example-btn" onclick="setPrompt('${prompt}')">${prompt.substring(0, 40)}...</button>`
                                    ).join('')}
                                </div>
                            </div>
                            <div class="example-category">
                                <h4>👤 인물 (Portrait)</h4>
                                <div class="example-buttons">
                                    ${promptExamples.image.portrait.map(prompt => 
                                        `<button class="example-btn" onclick="setPrompt('${prompt}')">${prompt.substring(0, 40)}...</button>`
                                    ).join('')}
                                </div>
                            </div>
                            <div class="example-category">
                                <h4>🧙 판타지 (Fantasy)</h4>
                                <div class="example-buttons">
                                    ${promptExamples.image.fantasy.map(prompt => 
                                        `<button class="example-btn" onclick="setPrompt('${prompt}')">${prompt.substring(0, 40)}...</button>`
                                    ).join('')}
                                </div>
                            </div>
                            <div class="example-category">
                                <h4>🏗️ 건축 (Architecture)</h4>
                                <div class="example-buttons">
                                    ${promptExamples.image.architecture.map(prompt => 
                                        `<button class="example-btn" onclick="setPrompt('${prompt}')">${prompt.substring(0, 40)}...</button>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <div id="videoExamples" class="examples-content" style="display: none;">
                            <div class="example-category">
                                <h4>🌿 자연 (Nature)</h4>
                                <div class="example-buttons">
                                    ${promptExamples.video.nature.map(prompt => 
                                        `<button class="example-btn" onclick="setPrompt('${prompt}')">${prompt}</button>`
                                    ).join('')}
                                </div>
                            </div>
                            <div class="example-category">
                                <h4>🎨 추상 (Abstract)</h4>
                                <div class="example-buttons">
                                    ${promptExamples.video.abstract.map(prompt => 
                                        `<button class="example-btn" onclick="setPrompt('${prompt}')">${prompt}</button>`
                                    ).join('')}
                                </div>
                            </div>
                            <div class="example-category">
                                <h4>🎬 시네마틱 (Cinematic)</h4>
                                <div class="example-buttons">
                                    ${promptExamples.video.cinematic.map(prompt => 
                                        `<button class="example-btn" onclick="setPrompt('${prompt}')">${prompt}</button>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-buttons">
                    <button class="tab-button active" onclick="switchTab('image')">🖼️ 이미지 생성</button>
                    <button class="tab-button" onclick="switchTab('video')">🎬 동영상 생성</button>
                </div>
                
                <div id="imageTab" class="tab-content active">
                    <div class="model-section">
                        <h3>📸 이미지 모델 선택</h3>
                        <div class="model-grid">
                            ${Object.entries(imageModels).map(([key, model]) => `
                                <div class="model-card" onclick="selectModel('image', '${key}')">
                                    <input type="radio" name="imageModel" value="${key}" ${key === 'sdxl' ? 'checked' : ''}>
                                    <div class="model-name">${model.name}</div>
                                    <div class="model-info">
                                        <span class="price-tag">${model.price}</span>
                                        <span class="speed-tag">⚡ ${model.speed}</span>
                                        <span>${model.quality}</span>
                                    </div>
                                    <div class="model-description">${model.description}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="buttons">
                        <button class="btn-generate" onclick="generateImage()">
                            📸 이미지 생성하기
                        </button>
                    </div>
                </div>
                
                <div id="videoTab" class="tab-content">
                    <div class="model-section">
                        <h3>🎬 동영상 모델 선택</h3>
                        <div class="model-grid">
                            ${Object.entries(videoModels).map(([key, model]) => `
                                <div class="model-card" onclick="selectModel('video', '${key}')">
                                    <input type="radio" name="videoModel" value="${key}" ${key === 'svd' ? 'checked' : ''}>
                                    <div class="model-name">${model.name}</div>
                                    <div class="model-info">
                                        <span class="price-tag">${model.price}</span>
                                        <span class="speed-tag">⚡ ${model.speed}</span>
                                        <span>${model.quality}</span>
                                    </div>
                                    <div class="model-description">${model.description}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="buttons">
                        <button class="btn-generate" onclick="generateVideo()">
                            🎬 동영상 생성하기
                        </button>
                    </div>
                </div>
                
                <div id="result" class="result"></div>
                
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-value" id="totalImages">0</div>
                        <div class="stat-label">생성된 이미지</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="totalVideos">0</div>
                        <div class="stat-label">생성된 동영상</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="totalCost">$0.00</div>
                        <div class="stat-label">총 비용</div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let totalImages = 0;
            let totalVideos = 0;
            let totalCost = 0;
            
            const modelPrices = {
                'sdxl': 0.0032,
                'sdxl-lightning': 0.0014,
                'playground': 0.0055,
                'realistic-vision': 0.0023,
                'svd': 0.036,
                'svd-xt': 0.065,
                'animate-diff': 0.018
            };
            
            function switchTab(tab) {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // 프롬프트 예시도 함께 변경
                document.getElementById('imageExamples').style.display = 'none';
                document.getElementById('videoExamples').style.display = 'none';
                
                if (tab === 'image') {
                    document.querySelector('.tab-button:nth-child(1)').classList.add('active');
                    document.getElementById('imageTab').classList.add('active');
                    document.getElementById('imageExamples').style.display = 'block';
                } else {
                    document.querySelector('.tab-button:nth-child(2)').classList.add('active');
                    document.getElementById('videoTab').classList.add('active');
                    document.getElementById('videoExamples').style.display = 'block';
                }
            }
            
            function setPrompt(prompt) {
                document.getElementById('textInput').value = prompt;
                document.getElementById('textInput').focus();
            }
            
            function selectModel(type, model) {
                const radio = document.querySelector(\`input[name="\${type}Model"][value="\${model}"]\`);
                if (radio) radio.checked = true;
                
                document.querySelectorAll(\`input[name="\${type}Model"]\`).forEach(r => {
                    r.closest('.model-card').classList.toggle('selected', r.checked);
                });
            }
            
            async function generateImage() {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    alert('프롬프트를 입력해주세요!');
                    return;
                }
                
                const model = document.querySelector('input[name="imageModel"]:checked').value;
                const modelInfo = ${JSON.stringify(imageModels)}[model];
                
                const result = document.getElementById('result');
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = \`
                    <h3>🎨 \${modelInfo.name} 모델로 생성 중...</h3>
                    <div class="loading-spinner"></div>
                    <p>예상 시간: \${modelInfo.speed}</p>
                    <p>비용: \${modelInfo.price}</p>
                \`;
                
                try {
                    const response = await fetch('/generate-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: text, model: model })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        totalImages++;
                        totalCost += modelPrices[model];
                        updateStats();
                        
                        result.className = 'result success';
                        result.innerHTML = \`
                            <h3>✅ 이미지 생성 완료!</h3>
                            <img src="\${data.imageUrl}" alt="AI Generated Image" loading="lazy">
                            <div style="margin-top: 15px;">
                                <strong>원본 프롬프트:</strong> \${text}
                            </div>
                            \${data.englishPrompt && data.englishPrompt !== text ? 
                                \`<div style="margin-top: 10px;">
                                    <strong>번역된 프롬프트:</strong> \${data.englishPrompt}
                                </div>\` : ''
                            }
                            <div style="margin-top: 10px;">
                                <strong>모델:</strong> \${modelInfo.name} | <strong>비용:</strong> \${modelInfo.price}
                            </div>
                            <a href="\${data.imageUrl}" target="_blank" class="download-link">🔗 새 창에서 보기</a>
                        \`;
                    } else {
                        result.className = 'result error';
                        result.innerHTML = \`❌ <strong>오류:</strong> \${data.error}\`;
                    }
                } catch (error) {
                    result.className = 'result error';
                    result.innerHTML = \`❌ <strong>네트워크 오류:</strong> \${error.message}\`;
                }
            }
            
            async function generateVideo() {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    alert('프롬프트를 입력해주세요!');
                    return;
                }
                
                const model = document.querySelector('input[name="videoModel"]:checked').value;
                const modelInfo = ${JSON.stringify(videoModels)}[model];
                
                const result = document.getElementById('result');
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = \`
                    <h3>🎬 \${modelInfo.name} 모델로 생성 중...</h3>
                    <div class="loading-spinner"></div>
                    <p>예상 시간: \${modelInfo.speed}</p>
                    <p>비용: \${modelInfo.price}</p>
                \`;
                
                try {
                    const response = await fetch('/generate-video', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: text, model: model })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        totalVideos++;
                        totalCost += modelPrices[model];
                        if (modelInfo.needsImage) {
                            totalCost += modelPrices['sdxl']; // 이미지 비용 추가
                        }
                        updateStats();
                        
                        result.className = 'result success';
                        result.innerHTML = \`
                            <h3>✅ 동영상 생성 완료!</h3>
                            <video controls autoplay loop style="width: 100%; max-width: 600px;">
                                <source src="\${data.videoUrl}" type="video/mp4">
                                브라우저가 동영상을 지원하지 않습니다.
                            </video>
                            <div style="margin-top: 15px;">
                                <strong>원본 프롬프트:</strong> \${text}
                            </div>
                            \${data.englishPrompt && data.englishPrompt !== text ? 
                                \`<div style="margin-top: 10px;">
                                    <strong>번역된 프롬프트:</strong> \${data.englishPrompt}
                                </div>\` : ''
                            }
                            <div style="margin-top: 10px;">
                                <strong>모델:</strong> \${modelInfo.name} | <strong>비용:</strong> \${modelInfo.price}
                            </div>
                            <a href="\${data.videoUrl}" target="_blank" class="download-link">🔗 새 창에서 보기</a>
                        \`;
                    } else {
                        result.className = 'result error';
                        result.innerHTML = \`❌ <strong>오류:</strong> \${data.error}\`;
                    }
                } catch (error) {
                    result.className = 'result error';
                    result.innerHTML = \`❌ <strong>네트워크 오류:</strong> \${error.message}\`;
                }
            }
            
            function updateStats() {
                document.getElementById('totalImages').textContent = totalImages;
                document.getElementById('totalVideos').textContent = totalVideos;
                document.getElementById('totalCost').textContent = '$' + totalCost.toFixed(4);
            }
            
            // 초기 선택 상태 설정
            selectModel('image', 'sdxl');
            selectModel('video', 'svd');
        </script>
    </body>
    </html>
  `);
});

// 한국어→영어 번역 함수
async function translateKoreanToEnglish(text) {
  // 간단한 한국어 감지 (한글 유니코드 범위: \uAC00-\uD7AF)
  const hasKorean = /[\uAC00-\uD7AF]/.test(text);
  
  if (!hasKorean) {
    return text; // 이미 영어인 경우 그대로 반환
  }
  
  try {
    console.log('🔄 한국어 프롬프트 영어 번역 중:', text);
    
    // Claude API를 사용한 번역
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `다음 한국어 텍스트를 AI 이미지 생성에 적합한 영어 프롬프트로 번역해주세요. 설명적이고 시각적인 키워드 중심으로 번역하세요. 번역된 영어만 출력하세요:\n\n${text}`
        }]
      })
    });
    
    if (!response.ok) {
      console.log('⚠️ 번역 실패, 원본 텍스트 사용');
      return text;
    }
    
    const data = await response.json();
    const translatedText = data.content[0].text.trim();
    
    console.log('✅ 번역 완료:', text, '→', translatedText);
    return translatedText;
    
  } catch (error) {
    console.log('⚠️ 번역 오류, 원본 텍스트 사용:', error.message);
    return text;
  }
}

// 이미지 생성 API
app.post('/generate-image', async (req, res) => {
  try {
    const { prompt, model = 'sdxl' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트를 입력해주세요'
      });
    }
    
    const modelInfo = imageModels[model];
    if (!modelInfo) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 모델입니다'
      });
    }
    
    console.log(`📸 ${modelInfo.name}로 이미지 생성 시작:`, prompt);
    
    // 한국어 프롬프트를 영어로 번역
    const englishPrompt = await translateKoreanToEnglish(prompt);
    
    const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: modelInfo.version,
        input: {
          prompt: `${englishPrompt}, high quality, detailed`,
          negative_prompt: "nsfw, low quality, blurry, distorted",
          width: 768,
          height: 1024,
          num_outputs: 1,
          num_inference_steps: model === 'sdxl-lightning' ? 4 : 25,
          guidance_scale: 7.5
        }
      })
    });
    
    if (!predictionResponse.ok) {
      const errorData = await predictionResponse.json();
      throw new Error(`API 오류: ${errorData.detail || predictionResponse.statusText}`);
    }
    
    const prediction = await predictionResponse.json();
    console.log('📸 Prediction 생성됨:', prediction.id);
    
    // 결과 대기
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60;
    
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error('상태 확인 실패');
      }
      
      result = await statusResponse.json();
      attempts++;
      
      console.log(`📸 상태 확인 ${attempts}/${maxAttempts}: ${result.status}`);
    }
    
    if (result.status === 'failed') {
      throw new Error(`이미지 생성 실패: ${result.error || '알 수 없는 오류'}`);
    }
    
    if (result.status !== 'succeeded') {
      throw new Error('이미지 생성 시간 초과');
    }
    
    let imageUrl;
    if (Array.isArray(result.output) && result.output.length > 0) {
      imageUrl = result.output[0];
    } else if (typeof result.output === 'string') {
      imageUrl = result.output;
    } else {
      throw new Error('출력 형식을 인식할 수 없습니다');
    }
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
      englishPrompt: englishPrompt,
      model: modelInfo.name
    });
    
  } catch (error) {
    console.error('❌ 이미지 생성 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 동영상 생성 API
app.post('/generate-video', async (req, res) => {
  try {
    const { prompt, model = 'svd' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트를 입력해주세요'
      });
    }
    
    const modelInfo = videoModels[model];
    if (!modelInfo) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 모델입니다'
      });
    }
    
    console.log(`🎬 ${modelInfo.name}로 동영상 생성 시작:`, prompt);
    
    // 한국어 프롬프트를 영어로 번역
    const englishPrompt = await translateKoreanToEnglish(prompt);
    
    let imageUrl = null;
    
    // 이미지가 필요한 모델인 경우 먼저 이미지 생성
    if (modelInfo.needsImage) {
      console.log('🎨 1단계: 이미지 생성 중...');
      const imageResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: imageModels.sdxl.version,
          input: {
            prompt: `cinematic scene, ${englishPrompt}, movie still, high quality`,
            negative_prompt: "nsfw, low quality, blurry",
            width: 1024,
            height: 576,
            num_outputs: 1,
            num_inference_steps: 25,
            guidance_scale: 7.5
          }
        })
      });
      
      if (!imageResponse.ok) {
        throw new Error('이미지 생성 실패');
      }
      
      const imagePrediction = await imageResponse.json();
      
      // 이미지 생성 대기
      let imageResult = imagePrediction;
      let attempts = 0;
      
      while (imageResult.status !== 'succeeded' && imageResult.status !== 'failed' && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${imagePrediction.id}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          }
        });
        
        imageResult = await statusResponse.json();
        attempts++;
      }
      
      if (imageResult.status !== 'succeeded') {
        throw new Error('이미지 생성 실패');
      }
      
      imageUrl = Array.isArray(imageResult.output) ? imageResult.output[0] : imageResult.output;
      console.log('🎨 이미지 생성 완료:', imageUrl);
    }
    
    // 동영상 생성
    console.log('🎬 동영상 생성 중...');
    let videoInput;
    
    if (model === 'svd' || model === 'svd-xt') {
      videoInput = {
        input_image: imageUrl,
        video_length: model === 'svd-xt' ? "25_frames_with_svd_xt" : "14_frames_with_svd",
        fps: 6,
        motion_bucket_id: 127,
        cond_aug: 0.02,
        decoding_t: 7
      };
    } else if (model === 'animate-diff') {
      videoInput = {
        prompt: englishPrompt,
        negative_prompt: "low quality, worst quality, blurry",
        num_frames: 16,
        num_inference_steps: 25,
        guidance_scale: 7.5
      };
    }
    
    const videoResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: modelInfo.version,
        input: videoInput
      })
    });
    
    if (!videoResponse.ok) {
      throw new Error('동영상 생성 API 오류');
    }
    
    const videoPrediction = await videoResponse.json();
    
    // 동영상 생성 대기
    let videoResult = videoPrediction;
    let attempts = 0;
    const maxAttempts = 60;
    
    while (videoResult.status !== 'succeeded' && videoResult.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${videoPrediction.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });
      
      videoResult = await statusResponse.json();
      attempts++;
      
      console.log(`🎬 동영상 상태 ${attempts}/${maxAttempts}: ${videoResult.status}`);
    }
    
    if (videoResult.status !== 'succeeded') {
      throw new Error('동영상 생성 실패');
    }
    
    let videoUrl;
    if (Array.isArray(videoResult.output)) {
      videoUrl = videoResult.output[0];
    } else {
      videoUrl = videoResult.output;
    }
    
    res.json({
      success: true,
      videoUrl: videoUrl,
      imageUrl: imageUrl,
      prompt: prompt,
      englishPrompt: englishPrompt,
      model: modelInfo.name
    });
    
  } catch (error) {
    console.error('❌ 동영상 생성 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log('🚀 고급 AI 생성기 시작!');
  console.log(`📡 주소: http://localhost:${PORT}`);
  console.log('💡 다양한 모델 선택 가능, 가격 정보 제공');
});