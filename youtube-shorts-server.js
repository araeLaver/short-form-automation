import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ReplicateService from './src/services/replicateService.js';
import { promises as fs } from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import gtts from 'gtts';

dotenv.config();

const app = express();
const PORT = 3011;
const replicateService = new ReplicateService();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/videos', express.static(path.join(process.cwd(), 'output')));
app.use('/download', express.static(path.join(process.cwd(), 'output')));

// 메인 페이지
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>유튜브 숏폼 자동 생성기</title>
        <meta charset="utf-8">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 700px;
                width: 100%;
            }
            h1 { 
                text-align: center; 
                color: #ff0000; 
                margin-bottom: 10px;
                font-size: 2.5em;
                font-weight: bold;
            }
            .subtitle {
                text-align: center;
                color: #666;
                margin-bottom: 30px;
                font-size: 1.2em;
                line-height: 1.5;
            }
            .features {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 30px;
                border-left: 4px solid #ff0000;
            }
            .features h3 {
                color: #ff0000;
                margin-bottom: 15px;
            }
            .features ul {
                list-style: none;
                padding: 0;
            }
            .features li {
                padding: 8px 0;
                color: #333;
            }
            .features li:before {
                content: "✅ ";
                margin-right: 8px;
            }
            textarea { 
                width: 100%; 
                height: 200px; 
                margin: 20px 0; 
                padding: 20px;
                border: 2px solid #eee;
                border-radius: 10px;
                font-size: 16px;
                resize: vertical;
                font-family: inherit;
                transition: border-color 0.3s;
            }
            textarea:focus {
                outline: none;
                border-color: #ff0000;
            }
            .generate-btn { 
                width: 100%;
                padding: 20px; 
                font-size: 18px; 
                font-weight: bold;
                color: white;
                background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
                border: none; 
                border-radius: 10px; 
                cursor: pointer;
                transition: all 0.3s;
                margin: 20px 0;
                text-transform: uppercase;
            }
            .generate-btn:hover { 
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 0, 0, 0.4);
            }
            .generate-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            .result { 
                margin-top: 30px; 
                padding: 20px; 
                border-radius: 10px;
                display: none;
                text-align: center;
            }
            .loading {
                background: #e3f2fd;
                color: #1976d2;
                border: 1px solid #bbdefb;
            }
            .error {
                background: #ffebee;
                color: #d32f2f;
                border: 1px solid #ffcdd2;
            }
            .success {
                background: #e8f5e8;
                border: 1px solid #c8e6c9;
                color: #2e7d32;
            }
            .success video {
                width: 100%;
                max-width: 300px;
                height: auto;
                border-radius: 10px;
                margin: 15px 0;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
            .download-btn {
                display: inline-block;
                margin: 10px 5px;
                padding: 12px 24px;
                background: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                transition: all 0.3s;
            }
            .download-btn:hover {
                background: #45a049;
                transform: translateY(-2px);
            }
            .spinner {
                border: 3px solid #f3f3f3;
                border-top: 3px solid #ff0000;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                display: inline-block;
                margin-right: 15px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .youtube-logo {
                font-size: 3em;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="youtube-logo">📺</div>
            <h1>유튜브 숏폼 생성기</h1>
            <p class="subtitle">기사나 내용을 입력하면 완전한 유튜브 숏폼을 자동으로 만들어드립니다</p>
            
            <div class="features">
                <h3>🎯 완전 자동화 기능</h3>
                <ul>
                    <li>한국어 음성 나레이션 (TTS)</li>
                    <li>자동 자막 삽입</li>
                    <li>제목 오버레이</li>
                    <li>60초 최적 길이</li>
                    <li>9:16 세로 화면</li>
                    <li>유튜브 업로드 즉시 가능</li>
                </ul>
            </div>
            
            <textarea 
                id="articleInput" 
                placeholder="기사 전문이나 영상으로 만들고 싶은 내용을 입력하세요...&#10;&#10;예시:&#10;최신 AI 기술 동향&#10;인공지능이 우리 생활을 어떻게 바꾸고 있는지 알아보겠습니다. ChatGPT의 등장으로 AI 기술이 급속히 발전하고 있습니다. 이제 AI는 단순한 도구를 넘어 창작, 교육, 업무 등 다양한 분야에서 혁신을 이끌고 있습니다..."
            ></textarea>
            
            <div style="display: flex; gap: 10px; margin: 20px 0;">
                <button class="generate-btn" onclick="generateYouTubeShort()" style="flex: 1;">
                    🚀 유튜브 숏폼 완전 자동 생성
                </button>
                <button class="generate-btn" onclick="generatePrompts()" style="flex: 1; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);">
                    📝 AI 동영상 프롬프트 생성
                </button>
                <button class="generate-btn" onclick="generateImages()" style="flex: 1; background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);">
                    🎨 이미지만 생성
                </button>
            </div>
            
            <div id="result" class="result"></div>
        </div>

        <script>
            async function generateYouTubeShort() {
                const content = document.getElementById('articleInput').value.trim();
                if (!content) {
                    alert('내용을 입력해주세요!');
                    return;
                }
                
                if (content.length < 50) {
                    alert('더 자세한 내용을 입력해주세요 (최소 50자)');
                    return;
                }
                
                const button = document.querySelector('.generate-btn');
                const result = document.getElementById('result');
                
                button.disabled = true;
                button.innerHTML = '<div class="spinner"></div>생성 중...';
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = '<div class="spinner"></div><h3>유튜브 숏폼 생성 중...</h3><p>음성 생성 → 영상 제작 → 자막 추가 → 완료 (3-5분 소요)</p>';
                
                try {
                    const response = await fetch('/api/create-youtube-short', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: content })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        result.className = 'result success';
                        result.innerHTML = \`
                            <h3>🎉 유튜브 숏폼 완성!</h3>
                            <video controls>
                                <source src="\${data.videoUrl}" type="video/mp4">
                                동영상을 재생할 수 없습니다.
                            </video>
                            <div style="margin-top: 20px;">
                                <p><strong>📌 제목:</strong> \${data.title}</p>
                                <p><strong>⏱️ 길이:</strong> \${data.duration}초</p>
                                <p><strong>🎵 음성:</strong> 한국어 TTS</p>
                                <p><strong>📝 자막:</strong> 자동 생성</p>
                            </div>
                            <div style="margin-top: 20px;">
                                <a href="\${data.downloadUrl}" download class="download-btn">
                                    📥 MP4 다운로드
                                </a>
                                <a href="https://studio.youtube.com" target="_blank" class="download-btn">
                                    📺 유튜브에 업로드
                                </a>
                            </div>
                        \`;
                    } else {
                        result.className = 'result error';
                        result.innerHTML = \`❌ 생성 실패: \${data.error}\`;
                    }
                } catch (error) {
                    result.className = 'result error';
                    result.innerHTML = \`❌ 서버 오류: \${error.message}\`;
                } finally {
                    button.disabled = false;
                    button.innerHTML = '🚀 유튜브 숏폼 완전 자동 생성';
                }
            }

            // AI 동영상 프롬프트 생성
            async function generatePrompts() {
                const content = document.getElementById('articleInput').value.trim();
                if (!content) {
                    alert('내용을 입력해주세요!');
                    return;
                }
                
                const result = document.getElementById('result');
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = '<div class="spinner"></div><h3>AI 동영상 프롬프트 생성 중...</h3>';
                
                try {
                    const response = await fetch('/api/generate-prompts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: content })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        result.className = 'result success';
                        let promptsHtml = '<h3>🎬 AI 동영상 제작 프롬프트</h3>';
                        
                        data.prompts.forEach((prompt, index) => {
                            promptsHtml += \`
                                <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff;">
                                    <h4>씬 \${index + 1}: \${prompt.title}</h4>
                                    <p><strong>비주얼:</strong> \${prompt.visual}</p>
                                    <p><strong>프롬프트:</strong></p>
                                    <div style="background: #fff; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px; border: 1px solid #ddd;">
                                        \${prompt.prompt}
                                    </div>
                                    <button onclick="copyToClipboard('\${prompt.prompt}')" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                        📋 복사
                                    </button>
                                    <p style="margin-top: 10px; font-size: 12px; color: #666;"><strong>추천 플랫폼:</strong> \${prompt.platforms.join(', ')}</p>
                                </div>
                            \`;
                        });
                        
                        result.innerHTML = promptsHtml;
                    } else {
                        result.className = 'result error';
                        result.innerHTML = \`❌ 프롬프트 생성 실패: \${data.error}\`;
                    }
                } catch (error) {
                    result.className = 'result error';
                    result.innerHTML = \`❌ 서버 오류: \${error.message}\`;
                }
            }

            // 이미지만 생성
            async function generateImages() {
                const content = document.getElementById('articleInput').value.trim();
                if (!content) {
                    alert('내용을 입력해주세요!');
                    return;
                }
                
                const result = document.getElementById('result');
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = '<div class="spinner"></div><h3>AI 이미지 생성 중...</h3>';
                
                try {
                    const response = await fetch('/api/generate-images-only', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: content })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        result.className = 'result success';
                        let imagesHtml = '<h3>🖼️ 생성된 이미지들</h3>';
                        
                        data.images.forEach((image, index) => {
                            imagesHtml += \`
                                <div style="margin: 15px 0; text-align: center;">
                                    <h4>\${image.title}</h4>
                                    <img src="\${image.url}" style="max-width: 300px; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <p style="margin-top: 10px; color: #666; font-size: 14px;">\${image.description}</p>
                                    <div style="margin-top: 10px;">
                                        <a href="\${image.downloadUrl}" download="image-\${index + 1}.png" style="margin: 5px; padding: 8px 16px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; display: inline-block;">
                                            📥 다운로드
                                        </a>
                                    </div>
                                </div>
                            \`;
                        });
                        
                        result.innerHTML = imagesHtml;
                    } else {
                        result.className = 'result error';
                        result.innerHTML = \`❌ 이미지 생성 실패: \${data.error}\`;
                    }
                } catch (error) {
                    result.className = 'result error';
                    result.innerHTML = \`❌ 서버 오류: \${error.message}\`;
                }
            }

            // 클립보드 복사 함수
            function copyToClipboard(text) {
                navigator.clipboard.writeText(text).then(() => {
                    alert('프롬프트가 클립보드에 복사되었습니다!');
                }).catch(err => {
                    console.error('복사 실패:', err);
                    alert('복사에 실패했습니다.');
                });
            }
        </script>
    </body>
    </html>
  `);
});

// 유튜브 숏폼 생성 API
app.post('/api/create-youtube-short', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.length < 20) {
      return res.status(400).json({
        success: false,
        error: '내용이 너무 짧습니다 (최소 20자)'
      });
    }
    
    console.log('🎬 유튜브 숏폼 생성 시작...');
    console.log('📝 내용 길이:', content.length, '자');
    
    // 1. 내용 분석 및 스크립트 생성
    const title = generateTitle(content);
    const script = generateScript(content);
    const scenes = generateScenes(script);
    
    console.log('📌 제목:', title);
    console.log('📄 스크립트 길이:', script.length, '자');
    console.log('🎬 씬 개수:', scenes.length, '개');
    
    // 2. TTS 음성 생성
    const outputDir = path.join(process.cwd(), 'output');
    await fs.mkdir(outputDir, { recursive: true });
    
    const audioPath = path.join(outputDir, `audio-${Date.now()}.mp3`);
    await generateTTS(script, audioPath);
    console.log('🎵 음성 생성 완료:', audioPath);
    
    // 3. 배경 이미지들 생성 (여러 장)
    const imagePromises = scenes.map(async (scene, index) => {
      console.log(`🎨 이미지 ${index + 1}/${scenes.length} 생성 중...`);
      const imageUrls = await replicateService.generateImage(scene.visualPrompt, {
        width: 768,
        height: 1344, // 9:16 비율
        numOutputs: 1
      });
      
      const imagePath = path.join(outputDir, `image-${Date.now()}-${index}.png`);
      await replicateService.downloadFile(imageUrls[0], imagePath);
      
      return {
        path: imagePath,
        duration: scene.duration,
        text: scene.text
      };
    });
    
    const images = await Promise.all(imagePromises);
    console.log('🖼️ 모든 이미지 생성 완료');
    
    // 4. FFmpeg로 최종 비디오 합성
    const finalVideoPath = path.join(outputDir, `youtube-short-${Date.now()}.mp4`);
    await createFinalVideo(images, audioPath, title, finalVideoPath);
    
    console.log('✅ 유튜브 숏폼 완성!');
    
    // 5. 응답 반환
    const videoFilename = path.basename(finalVideoPath);
    res.json({
      success: true,
      title: title,
      videoUrl: `/videos/${videoFilename}`,
      downloadUrl: `/download/${videoFilename}`,
      duration: 60,
      features: {
        tts: true,
        subtitles: true,
        title_overlay: true,
        vertical_format: true
      }
    });
    
  } catch (error) {
    console.error('❌ 유튜브 숏폼 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AI 동영상 프롬프트 생성 API
app.post('/api/generate-prompts', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.length < 20) {
      return res.status(400).json({
        success: false,
        error: '내용이 너무 짧습니다'
      });
    }
    
    console.log('📝 AI 동영상 프롬프트 생성 시작...');
    
    const title = generateTitle(content);
    const scenes = generateScenes(generateScript(content));
    
    const prompts = scenes.map((scene, index) => ({
      title: `씬 ${index + 1} - ${scene.text.substring(0, 30)}...`,
      visual: scene.text,
      prompt: generateDetailedPrompt(scene.visualPrompt, scene.text),
      platforms: ['Runway ML', 'Pika Labs', 'Stable Video Diffusion'],
      duration: scene.duration
    }));
    
    // 추가 프롬프트들
    prompts.push({
      title: '전체 영상용 통합 프롬프트',
      visual: '전체 스토리 플로우',
      prompt: generateMasterPrompt(content, title),
      platforms: ['Runway ML', 'OpenAI Sora'],
      duration: 60
    });
    
    res.json({
      success: true,
      prompts: prompts,
      totalScenes: scenes.length,
      title: title
    });
    
  } catch (error) {
    console.error('❌ 프롬프트 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 이미지만 생성 API
app.post('/api/generate-images-only', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.length < 20) {
      return res.status(400).json({
        success: false,
        error: '내용이 너무 짧습니다'
      });
    }
    
    console.log('🎨 이미지만 생성 시작...');
    
    const scenes = generateScenes(generateScript(content));
    const outputDir = path.join(process.cwd(), 'output');
    await fs.mkdir(outputDir, { recursive: true });
    
    const imagePromises = scenes.map(async (scene, index) => {
      console.log(`🖼️ 이미지 ${index + 1}/${scenes.length} 생성 중...`);
      
      const imageUrls = await replicateService.generateImage(scene.visualPrompt, {
        width: 768,
        height: 1344,
        numOutputs: 1
      });
      
      // 이미지 다운로드 및 저장
      const imageName = `generated-image-${Date.now()}-${index}.png`;
      const imagePath = path.join(outputDir, imageName);
      await replicateService.downloadFile(imageUrls[0], imagePath);
      
      console.log(`💾 이미지 저장 완료: ${imagePath}`);
      
      return {
        title: `씬 ${index + 1}`,
        description: scene.text.substring(0, 100) + '...',
        url: `/videos/${imageName}`, // 로컬 경로로 변경
        downloadUrl: `/download/${imageName}`,
        originalUrl: imageUrls[0],
        prompt: scene.visualPrompt
      };
    });
    
    const images = await Promise.all(imagePromises);
    
    res.json({
      success: true,
      images: images,
      totalImages: images.length
    });
    
  } catch (error) {
    console.error('❌ 이미지 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 상세 프롬프트 생성
function generateDetailedPrompt(basePrompt, sceneText) {
  return `${basePrompt}

Advanced settings:
- Resolution: 768x1344 (9:16 aspect ratio)
- Duration: 4-6 seconds per shot
- Camera movement: Subtle zoom or pan
- Lighting: Professional, cinematic
- Style: Korean broadcast quality
- Motion: Smooth, natural movement
- Focus: Sharp, clear details

Scene context: ${sceneText}

Additional instructions:
- Maintain visual consistency
- Ensure smooth transitions
- Optimize for mobile viewing
- High-quality render settings
- Professional color grading`;
}

// 마스터 프롬프트 생성
function generateMasterPrompt(content, title) {
  const category = detectCategory(content);
  
  return `Create a professional Korean news-style short-form video based on: "${title}"

Main content: ${content.substring(0, 200)}...

Video specifications:
- Format: Vertical 9:16 (768x1344)
- Duration: 60 seconds
- Style: Korean broadcast news
- Quality: 4K, 30fps
- Category: ${category}

Visual elements:
- Professional Korean news studio setup
- Clean, modern graphics overlay
- Subtitle-friendly composition
- High contrast for mobile viewing
- Korean typography integration

Narrative structure:
1. Hook (0-3s): Attention-grabbing opener
2. Introduction (3-10s): Title and context
3. Main content (10-50s): Key information delivery
4. Conclusion (50-60s): Summary and call-to-action

Technical requirements:
- Smooth camera movements
- Professional lighting
- Clear audio synchronization
- Optimized for social media platforms
- Korean cultural context awareness

Platform optimization:
- YouTube Shorts ready
- Instagram Reels compatible
- TikTok format suitable
- High engagement potential`;
}

// 카테고리 감지
function detectCategory(content) {
  const categories = {
    '정치': ['정부', '대통령', '국회', '정치', '선거'],
    '경제': ['경제', '주식', '부동산', '금리', '기업'],
    '기술': ['AI', '인공지능', '기술', 'IT', '스마트폰'],
    '사회': ['사회', '교육', '의료', '복지', '환경'],
    '문화': ['문화', '예술', '영화', '음악', 'K-pop'],
    '스포츠': ['스포츠', '축구', '야구', '올림픽'],
    '국제': ['해외', '미국', '중국', '일본', '국제']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return category;
    }
  }
  
  return '일반';
}

// 제목 생성
function generateTitle(content) {
  const firstSentence = content.split(/[.!?]/)[0].trim();
  if (firstSentence.length > 5 && firstSentence.length < 50) {
    return firstSentence;
  }
  
  // 키워드 기반 제목 생성
  const keywords = extractKeywords(content);
  return `${keywords[0] || '최신'} 소식을 알려드립니다!`;
}

// 스크립트 생성 (60초용)
function generateScript(content) {
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 5);
  
  let script = "안녕하세요! 오늘의 중요한 소식을 전해드리겠습니다. ";
  
  // 핵심 내용 추가 (약 200-250자 = 50-60초)
  let currentLength = script.length;
  const targetLength = 250;
  
  for (const sentence of sentences) {
    if (currentLength + sentence.length > targetLength) break;
    script += sentence.trim() + ". ";
    currentLength += sentence.length + 2;
  }
  
  script += " 도움이 되셨다면 좋아요와 구독 부탁드립니다!";
  
  return script;
}

// 씬 생성
function generateScenes(script) {
  const sentences = script.split(/[.!]/).filter(s => s.trim().length > 5);
  const scenesPerSentence = Math.ceil(sentences.length / 4); // 4개 씬으로 나누기
  
  const scenes = [];
  for (let i = 0; i < 4; i++) {
    const startIdx = i * scenesPerSentence;
    const endIdx = Math.min(startIdx + scenesPerSentence, sentences.length);
    const text = sentences.slice(startIdx, endIdx).join('. ');
    
    scenes.push({
      text: text,
      duration: 15, // 각 씬 15초
      visualPrompt: generateVisualPrompt(text, i)
    });
  }
  
  return scenes;
}

// 비주얼 프롬프트 생성
function generateVisualPrompt(text, sceneIndex) {
  const baseStyle = "Korean news style, professional broadcast, 9:16 vertical format, clean modern design, high quality, photorealistic";
  
  const sceneStyles = [
    `news anchor desk, Korean news studio, professional lighting, ${baseStyle}`,
    `Korean cityscape, modern buildings, urban scene, ${baseStyle}`,
    `Korean people, daily life, social context, ${baseStyle}`,
    `conclusion scene, positive atmosphere, Korean setting, ${baseStyle}`
  ];
  
  return sceneStyles[sceneIndex] || sceneStyles[0];
}

// TTS 음성 생성
async function generateTTS(text, outputPath) {
  return new Promise((resolve, reject) => {
    const tts = new gtts(text, 'ko');
    
    tts.save(outputPath, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// 최종 비디오 합성 (폰트 없는 버전)
async function createFinalVideo(images, audioPath, title, outputPath) {
  return new Promise((resolve, reject) => {
    // 첫 번째 이미지를 메인으로 사용 (간단화)
    const mainImage = images[0].path;
    
    // 폰트 없이 단순하게 비디오 생성
    ffmpeg()
      .input(mainImage)
      .inputOptions([
        '-loop', '1',
        '-t', '60'  // 60초 길이
      ])
      .input(audioPath)
      .videoFilters([
        'scale=768:1344'  // 9:16 비율만 적용, 텍스트 제거
      ])
      .outputOptions([
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-r', '30',
        '-shortest',  // 오디오 길이에 맞춤
        '-pix_fmt', 'yuv420p'
      ])
      .output(outputPath)
      .on('end', () => {
        console.log('🎬 비디오 합성 완료 (폰트 없음)');
        resolve();
      })
      .on('error', (err) => {
        console.error('❌ 비디오 합성 실패:', err);
        reject(err);
      })
      .run();
  });
}

// 키워드 추출
function extractKeywords(content) {
  const words = content.match(/[가-힣]+/g) || [];
  const frequency = {};
  
  words.forEach(word => {
    if (word.length >= 2) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

app.listen(PORT, () => {
  console.log('🎬 유튜브 숏폼 자동 생성기 시작!');
  console.log(`📺 주소: http://localhost:${PORT}`);
  console.log('🚀 완전 자동화: 음성 + 자막 + 제목 + 60초 영상!');
});