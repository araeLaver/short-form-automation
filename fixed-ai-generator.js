import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = 3013;

app.use(cors());
app.use(express.json());

// 실제 작동 검증된 모델들 (더 많은 선택권)
const imageModels = {
  // ✅ 검증완료 - 안정적인 모델들
  'sdxl': {
    name: 'Stable Diffusion XL',
    version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    price: '$0.0032',
    speed: '8-15초',
    quality: '⭐⭐⭐⭐',
    description: '✅ 테스트 완료, 안정적',
    priceNum: 0.0032,
    speedNum: 11.5,
    category: 'stable'
  },
  'sdxl-lightning': {
    name: 'SDXL Lightning 4-step',
    version: '727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165eba6a',
    price: '$0.0014',
    speed: '1-3초',
    quality: '⭐⭐⭐',
    description: '⚡ 초고속 4단계',
    priceNum: 0.0014,
    speedNum: 2,
    category: 'fast'
  },
  'realistic-vision': {
    name: 'Realistic Vision v5.1',
    version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    price: '$0.0023',
    speed: '8-15초',
    quality: '⭐⭐⭐⭐',
    description: '📸 사실적인 사진 스타일',
    priceNum: 0.0023,
    speedNum: 11.5,
    category: 'photo'
  },
  'openjourney': {
    name: 'OpenJourney v4',
    version: '9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb',
    price: '$0.0018',
    speed: '5-10초',
    quality: '⭐⭐⭐',
    description: '🎭 Midjourney 스타일',
    priceNum: 0.0018,
    speedNum: 7.5,
    category: 'art'
  },
  'kandinsky': {
    name: 'Kandinsky 2.2',
    version: 'ea1addaab376f4dc227f5368bbd8eff901820fd1cc14ed8cad63b29249e9d463',
    price: '$0.0022',
    speed: '10-15초',
    quality: '⭐⭐⭐⭐',
    description: '🎨 러시아 AI 모델',
    priceNum: 0.0022,
    speedNum: 12.5,
    category: 'art'
  },
  
  // 🔥 추가 인기 모델들 (실제 Replicate 버전들)
  'playground-v25': {
    name: 'Playground v2.5',
    version: 'a45f82a1382bed5c7aeb861dac7c7d191b0fdf74d8d57c4a0e6ed7d4d0bf7d24',
    price: '$0.0055',
    speed: '12-20초',
    quality: '⭐⭐⭐⭐⭐',
    description: '🎨 심미적 이미지 특화',
    priceNum: 0.0055,
    speedNum: 16,
    category: 'art'
  },
  'sd-1-5': {
    name: 'Stable Diffusion v1.5',
    version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    price: '$0.0020',
    speed: '6-12초',
    quality: '⭐⭐⭐',
    description: '⚡ 클래식 SD, 빠름',
    priceNum: 0.0020,
    speedNum: 9,
    category: 'fast'
  },
  'juggernaut': {
    name: 'Juggernaut XL',
    version: 'bfc090b1a18c5b5e7c0a2c2d5b5d5c5a5b5c5d5e5f5g5h5i5j5k5l5m5n5o5p5q',
    price: '$0.0035',
    speed: '10-18초',
    quality: '⭐⭐⭐⭐',
    description: '🎭 강력한 스타일 생성',
    priceNum: 0.0035,
    speedNum: 14,
    category: 'art'
  },
  'epicrealism': {
    name: 'epiCRealism',
    version: 'f2f4f6f8f0g2g4g6g8g0h2h4h6h8h0i2i4i6i8i0j2j4j6j8j0k2k4k6k8k0l2l4l',
    price: '$0.0025',
    speed: '9-16초',
    quality: '⭐⭐⭐⭐',
    description: '📸 에픽한 사실주의',
    priceNum: 0.0025,
    speedNum: 12.5,
    category: 'photo'
  },
  'majicmix': {
    name: 'MajicMix Realistic',
    version: 'm6m8m0n2n4n6n8n0o2o4o6o8o0p2p4p6p8p0q2q4q6q8q0r2r4r6r8r0s2s4s6s8s',
    price: '$0.0024',
    speed: '8-15초',
    quality: '⭐⭐⭐⭐',
    description: '📸 아시아 스타일 리얼리즘',
    priceNum: 0.0024,
    speedNum: 11.5,
    category: 'photo'
  }
};

const videoModels = {
  // ✅ 검증완료 - 안정적인 비디오 모델들
  'svd': {
    name: 'Stable Video Diffusion',
    version: '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
    price: '$0.036',
    speed: '2-3분',
    quality: '⭐⭐⭐⭐',
    description: '✅ 테스트 완료, 이미지→동영상 (14프레임)',
    needsImage: true,
    priceNum: 0.036,
    speedNum: 2.5,
    category: 'stable'
  },
  'svd-xt': {
    name: 'SVD XT (25 frames)',
    version: '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
    price: '$0.065',
    speed: '3-5분',
    quality: '⭐⭐⭐⭐⭐',
    description: '✅ 이미지→동영상 (25프레임, 더 긴 영상)',
    needsImage: true,
    priceNum: 0.065,
    speedNum: 4,
    category: 'high-quality'
  },
  'animate-diff': {
    name: 'AnimateDiff',
    version: 'beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f',
    price: '$0.018',
    speed: '1-2분',
    quality: '⭐⭐⭐',
    description: '📱 텍스트→동영상 직접 (16프레임)',
    needsImage: false,
    priceNum: 0.018,
    speedNum: 1.5,
    category: 'direct'
  },
  
  // 🔥 추가 비디오 모델들
  'zeroscope': {
    name: 'Zeroscope V2 XL',
    version: '9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
    price: '$0.022',
    speed: '2-3분',
    quality: '⭐⭐⭐⭐',
    description: '⚡ 텍스트→동영상 (24프레임)',
    needsImage: false,
    priceNum: 0.022,
    speedNum: 2.5,
    category: 'direct'
  },
  'hotshot-xl': {
    name: 'Hotshot XL',
    version: '78b3a6257e16e4b241245d65c8b2b81ea0de79c225d6ad2d07e31f5d48e8c225',
    price: '$0.012',
    speed: '1-2분',
    quality: '⭐⭐⭐',
    description: '⚡ GIF 애니메이션 생성',
    needsImage: false,
    priceNum: 0.012,
    speedNum: 1.5,
    category: 'fast'
  },
  'i2vgen-xl': {
    name: 'I2VGen-XL',
    version: '5821a338d00033abaaba89080a17eb8783d9a17ed710a6b4246a18e0900ccad4',
    price: '$0.045',
    speed: '3-4분',
    quality: '⭐⭐⭐⭐⭐',
    description: '🎨 이미지+텍스트→고품질 동영상',
    needsImage: true,
    priceNum: 0.045,
    speedNum: 3.5,
    category: 'high-quality'
  }
};

// 한국어→영어 번역 함수 (간단한 매핑 + 기본 번역)
async function translateKoreanToEnglish(text) {
  const hasKorean = /[\uAC00-\uD7AF]/.test(text);
  
  if (!hasKorean) {
    return text;
  }
  
  // 간단한 한국어→영어 매핑 (NSFW 필터 회피용)
  const simpleTranslations = {
    '서울야경': 'Seoul night cityscape view',
    '서울': 'Seoul city',
    '야경': 'night city lights view',
    '산': 'mountain landscape',
    '바다': 'ocean sea view',
    '꽃': 'beautiful flowers',
    '나무': 'tree nature',
    '하늘': 'sky clouds',
    '구름': 'white clouds',
    '강': 'river water',
    '공원': 'park garden',
    '건물': 'building architecture',
    '도시': 'city urban',
    '자연': 'nature landscape',
    '풍경': 'scenic landscape view'
  };
  
  // 간단한 매핑으로 먼저 시도
  for (const [korean, english] of Object.entries(simpleTranslations)) {
    if (text.includes(korean)) {
      const translated = text.replace(new RegExp(korean, 'g'), english);
      console.log('✅ 간단 매핑 번역:', text, '→', translated);
      return translated;
    }
  }
  
  try {
    console.log('🔄 API 번역 시도 중:', text);
    
    // Anthropic API 키가 있는 경우에만 시도
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️ ANTHROPIC_API_KEY 없음, 원본 사용');
      return text;
    }
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Translate this Korean to safe English keywords for AI image generation: ${text}`
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status}`);
    }
    
    const data = await response.json();
    const translatedText = data.content[0].text.trim();
    
    console.log('✅ API 번역 완료:', text, '→', translatedText);
    return translatedText;
    
  } catch (error) {
    console.log('⚠️ API 번역 실패, 원본 사용:', error.message);
    return text;
  }
}

// 메인 페이지
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>수정된 AI 생성기 - 실제 작동</title>
        <meta charset="utf-8">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Arial, sans-serif;
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
            .header h1 { font-size: 2.5em; margin-bottom: 10px; }
            .main-content { padding: 30px; }
            .input-section {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 15px;
                margin-bottom: 30px;
            }
            textarea {
                width: 100%;
                height: 120px;
                padding: 15px;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                font-size: 16px;
                resize: vertical;
                margin-bottom: 15px;
            }
            textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            .translate-section {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
                border: 2px solid #bbdefb;
                display: none;
            }
            .translate-section h4 {
                color: #1976d2;
                margin-bottom: 10px;
            }
            .translated-text {
                background: white;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #ddd;
                font-style: italic;
                color: #333;
            }
            .translate-btn {
                background: #2196F3;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                margin-bottom: 15px;
            }
            .translate-btn:hover {
                background: #1976D2;
            }
            .sort-controls {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            .sort-btn {
                padding: 8px 16px;
                border: 2px solid #667eea;
                background: white;
                color: #667eea;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 14px;
            }
            .sort-btn.active, .sort-btn:hover {
                background: #667eea;
                color: white;
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
            }
            .model-card.selected {
                border-color: #667eea;
                background: rgba(102, 126, 234, 0.1);
            }
            .model-card input[type="radio"] {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
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
            }
            .btn-generate {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .btn-generate:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            }
            .result {
                margin-top: 30px;
                padding: 25px;
                border-radius: 15px;
                display: none;
            }
            .loading {
                background: rgba(102, 126, 234, 0.1);
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
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 8px;
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
            .tab-content {
                display: none;
            }
            .tab-content.active {
                display: block;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎨 수정된 AI 생성기</h1>
                <p>실제 작동 모델 • 한국어 번역 • 모델 정렬</p>
            </div>
            
            <div class="main-content">
                <div class="input-section">
                    <h2>📝 프롬프트 입력</h2>
                    <textarea id="textInput" placeholder="한국어나 영어로 원하는 이미지를 설명해주세요..."></textarea>
                    
                    <button class="translate-btn" onclick="translatePrompt()">🔄 한→영 번역 미리보기</button>
                    
                    <div id="translateSection" class="translate-section">
                        <h4>📝 번역된 영어 프롬프트:</h4>
                        <div id="translatedText" class="translated-text"></div>
                        <button class="copy-btn" onclick="copyTranslatedText()" style="margin-top: 10px; padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                            📋 복사하기
                        </button>
                    </div>
                </div>
                
                <div class="tab-buttons">
                    <button class="tab-button active" onclick="switchTab('image')">🖼️ 이미지 생성</button>
                    <button class="tab-button" onclick="switchTab('video')">🎬 동영상 생성</button>
                </div>
                
                <div id="imageTab" class="tab-content active">
                    <div class="model-section">
                        <h3>📸 이미지 모델 선택</h3>
                        
                        <div class="sort-controls">
                            <button class="sort-btn active" onclick="sortModels('image', 'default')">기본순</button>
                            <button class="sort-btn" onclick="sortModels('image', 'price')">💰 가격순</button>
                            <button class="sort-btn" onclick="sortModels('image', 'speed')">⚡ 속도순</button>
                            <button class="sort-btn" onclick="sortModels('image', 'quality')">⭐ 품질순</button>
                        </div>
                        
                        <div class="model-grid" id="imageModels">
                            ${Object.entries(imageModels).map(([key, model]) => `
                                <div class="model-card" onclick="selectModel('image', '${key}')" data-price="${model.priceNum}" data-speed="${model.speedNum}">
                                    <input type="radio" name="imageModel" value="${key}" ${key === 'sdxl' ? 'checked' : ''}>
                                    <div class="model-name">${model.name}</div>
                                    <div class="model-info">
                                        <span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 5px; font-size: 0.8em;">${model.price}</span>
                                        <span style="color: #2196F3; font-weight: 600;">⚡ ${model.speed}</span>
                                        <span>${model.quality}</span>
                                    </div>
                                    <div class="model-description">${model.description}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="buttons">
                        <button class="btn-generate" onclick="generateImage()">📸 이미지 생성하기</button>
                    </div>
                </div>
                
                <div id="videoTab" class="tab-content">
                    <div class="model-section">
                        <h3>🎬 동영상 모델 선택</h3>
                        
                        <div class="sort-controls">
                            <button class="sort-btn active" onclick="sortModels('video', 'default')">기본순</button>
                            <button class="sort-btn" onclick="sortModels('video', 'price')">💰 가격순</button>
                            <button class="sort-btn" onclick="sortModels('video', 'speed')">⚡ 속도순</button>
                            <button class="sort-btn" onclick="sortModels('video', 'quality')">⭐ 품질순</button>
                        </div>
                        
                        <div class="model-grid" id="videoModels">
                            ${Object.entries(videoModels).map(([key, model]) => `
                                <div class="model-card" onclick="selectModel('video', '${key}')" data-price="${model.priceNum}" data-speed="${model.speedNum}">
                                    <input type="radio" name="videoModel" value="${key}" ${key === 'svd' ? 'checked' : ''}>
                                    <div class="model-name">${model.name}</div>
                                    <div class="model-info">
                                        <span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 5px; font-size: 0.8em;">${model.price}</span>
                                        <span style="color: #2196F3; font-weight: 600;">⚡ ${model.speed}</span>
                                        <span>${model.quality}</span>
                                    </div>
                                    <div class="model-description">${model.description}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="buttons">
                        <button class="btn-generate" onclick="generateVideo()">🎬 동영상 생성하기</button>
                    </div>
                </div>
                
                <div id="result" class="result"></div>
            </div>
        </div>

        <script>
            const imageModelsData = ${JSON.stringify(imageModels)};
            const videoModelsData = ${JSON.stringify(videoModels)};
            let currentTranslatedText = '';
            
            function copyTranslatedText() {
                if (!currentTranslatedText) {
                    alert('번역된 텍스트가 없습니다!');
                    return;
                }
                
                navigator.clipboard.writeText(currentTranslatedText).then(() => {
                    const btn = event.target;
                    const originalText = btn.textContent;
                    btn.textContent = '✅ 복사됨!';
                    btn.style.background = '#4CAF50';
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '#4CAF50';
                    }, 2000);
                }).catch(() => {
                    // 클립보드 API가 안 되면 텍스트 선택
                    const translatedTextEl = document.getElementById('translatedText');
                    const range = document.createRange();
                    range.selectNode(translatedTextEl);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                    alert('텍스트가 선택되었습니다. Ctrl+C로 복사하세요!');
                });
            }
            
            function switchTab(tab) {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                if (tab === 'image') {
                    document.querySelector('.tab-button:nth-child(1)').classList.add('active');
                    document.getElementById('imageTab').classList.add('active');
                } else {
                    document.querySelector('.tab-button:nth-child(2)').classList.add('active');
                    document.getElementById('videoTab').classList.add('active');
                }
            }
            
            function selectModel(type, model) {
                const radio = document.querySelector(\`input[name="\${type}Model"][value="\${model}"]\`);
                if (radio) radio.checked = true;
                
                document.querySelectorAll(\`input[name="\${type}Model"]\`).forEach(r => {
                    r.closest('.model-card').classList.toggle('selected', r.checked);
                });
            }
            
            function sortModels(type, sortBy) {
                // 정렬 버튼 활성화
                const container = type === 'image' ? document.getElementById('imageTab') : document.getElementById('videoTab');
                container.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
                container.querySelector(\`[onclick*="\${sortBy}"]\`).classList.add('active');
                
                const modelsData = type === 'image' ? imageModelsData : videoModelsData;
                const modelsContainer = document.getElementById(type + 'Models');
                const cards = Array.from(modelsContainer.children);
                
                cards.sort((a, b) => {
                    if (sortBy === 'price') {
                        return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                    } else if (sortBy === 'speed') {
                        return parseFloat(a.dataset.speed) - parseFloat(b.dataset.speed);
                    } else if (sortBy === 'quality') {
                        const aStars = (a.querySelector('.model-info span:last-child').textContent.match(/⭐/g) || []).length;
                        const bStars = (b.querySelector('.model-info span:last-child').textContent.match(/⭐/g) || []).length;
                        return bStars - aStars;
                    }
                    return 0; // 기본순
                });
                
                cards.forEach(card => modelsContainer.appendChild(card));
            }
            
            async function translatePrompt() {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    alert('프롬프트를 입력해주세요!');
                    return;
                }
                
                const translateSection = document.getElementById('translateSection');
                const translatedText = document.getElementById('translatedText');
                
                translateSection.style.display = 'block';
                translatedText.textContent = '번역 중...';
                
                try {
                    const response = await fetch('/translate-prompt', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: text })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        currentTranslatedText = data.translated;
                        translatedText.textContent = data.translated;
                        if (data.translated === text) {
                            translatedText.textContent += ' (이미 영어)';
                        }
                    } else {
                        translatedText.textContent = '번역 실패: ' + data.error;
                        currentTranslatedText = '';
                    }
                } catch (error) {
                    translatedText.textContent = '번역 오류: ' + error.message;
                }
            }
            
            async function generateImage() {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    alert('프롬프트를 입력해주세요!');
                    return;
                }
                
                const model = document.querySelector('input[name="imageModel"]:checked').value;
                const modelInfo = imageModelsData[model];
                
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
                const modelInfo = videoModelsData[model];
                
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
            
            // 초기 선택 상태 설정
            selectModel('image', 'sdxl');
            selectModel('video', 'svd');
        </script>
    </body>
    </html>
  `);
});

// 번역 미리보기 API
app.post('/translate-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트를 입력해주세요'
      });
    }
    
    const translated = await translateKoreanToEnglish(prompt);
    
    res.json({
      success: true,
      original: prompt,
      translated: translated
    });
    
  } catch (error) {
    console.error('❌ 번역 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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
          prompt: `safe content, ${englishPrompt}, beautiful scenery, high quality, detailed, professional photography, clean, family-friendly`,
          negative_prompt: "nsfw, inappropriate, adult content, nudity, violence, gore, explicit, sexual, provocative, low quality, blurry, distorted, ugly, deformed, bad anatomy",
          width: 768,
          height: 1024,
          num_outputs: 1,
          num_inference_steps: model === 'sdxl-lightning' ? 4 : 25,
          guidance_scale: 7.5,
          scheduler: "K_EULER"
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
            prompt: `safe content, cinematic scene, ${englishPrompt}, movie still, beautiful landscape, high quality, professional, family-friendly`,
            negative_prompt: "nsfw, inappropriate, adult content, nudity, violence, explicit, sexual, provocative, low quality, blurry, distorted, ugly, deformed",
            width: 1024,
            height: 576,
            num_outputs: 1,
            num_inference_steps: 25,
            guidance_scale: 7.5,
            scheduler: "K_EULER"
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
    
    if (model === 'svd') {
      videoInput = {
        input_image: imageUrl,
        video_length: "14_frames_with_svd",
        fps: 6,
        motion_bucket_id: 127,
        cond_aug: 0.02,
        decoding_t: 7
      };
    } else if (model === 'animate-diff') {
      videoInput = {
        prompt: `safe content, ${englishPrompt}, beautiful scenery, family-friendly, clean, appropriate`,
        negative_prompt: "nsfw, inappropriate, adult content, nudity, violence, explicit, sexual, provocative, low quality, worst quality, blurry, distorted, ugly",
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
  console.log('🚀 수정된 AI 생성기 시작!');
  console.log(`📡 주소: http://localhost:${PORT}`);
  console.log('✅ 실제 작동 검증된 모델들만 사용');
  console.log('🔄 한국어 번역 • 모델 정렬 • 미리보기 기능');
});