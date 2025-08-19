import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ReplicateService from './src/services/replicateService.js';
import { promises as fs } from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3007;
const replicateService = new ReplicateService();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
// output 폴더를 videos로 서빙
app.use('/videos', express.static(path.join(process.cwd(), 'output')));
// 다운로드 엔드포인트
app.use('/download', express.static(path.join(process.cwd(), 'output')));

// 메인 페이지
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>숏폼 동영상 자동 생성기</title>
        <meta charset="utf-8">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                max-width: 600px;
                width: 100%;
            }
            h1 { 
                text-align: center; 
                color: #333; 
                margin-bottom: 10px;
                font-size: 2.5em;
            }
            .subtitle {
                text-align: center;
                color: #666;
                margin-bottom: 30px;
                font-size: 1.1em;
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
                border-color: #667eea;
            }
            .generate-btn { 
                width: 100%;
                padding: 20px; 
                font-size: 18px; 
                font-weight: bold;
                color: white;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none; 
                border-radius: 10px; 
                cursor: pointer;
                transition: all 0.3s;
                margin: 20px 0;
            }
            .generate-btn:hover { 
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
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
                max-width: 400px;
                height: auto;
                border-radius: 10px;
                margin-top: 15px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
            .spinner {
                border: 3px solid #f3f3f3;
                border-top: 3px solid #667eea;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: spin 1s linear infinite;
                display: inline-block;
                margin-right: 10px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎬</h1>
            <h1>숏폼 동영상 생성기</h1>
            <p class="subtitle">기사 내용을 붙여넣으면 자동으로 숏폼 동영상을 만들어드립니다</p>
            
            <textarea 
                id="articleInput" 
                placeholder="여기에 기사 전문을 붙여넣으세요...&#10;&#10;예시:&#10;[속보] 한국 AI 기술, 세계 1위 달성&#10;한국의 인공지능 기술이 세계 최고 수준에 도달했다고 발표됐다. 한국과학기술원(KAIST) 연구팀이 개발한 새로운 AI 모델이 기존 GPT-4를 뛰어넘는 성능을 보였다. 이번 성과는 자연어 처리 분야에서 획기적인 발전으로 평가받고 있다..."
            ></textarea>
            
            <button class="generate-btn" onclick="generateShortForm()">
                📹 숏폼 동영상 생성하기
            </button>
            
            <div id="result" class="result"></div>
        </div>

        <script>
            async function generateShortForm() {
                const article = document.getElementById('articleInput').value.trim();
                if (!article) {
                    alert('기사 내용을 입력해주세요!');
                    return;
                }
                
                if (article.length < 50) {
                    alert('더 자세한 기사 내용을 입력해주세요 (최소 50자)');
                    return;
                }
                
                const button = document.querySelector('.generate-btn');
                const result = document.getElementById('result');
                
                button.disabled = true;
                button.textContent = '생성 중...';
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = '<div class="spinner"></div>숏폼 동영상 생성 중... (2-3분 소요됩니다)';
                
                try {
                    const response = await fetch('/api/create-shortform', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ article: article })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        result.className = 'result success';
                        result.innerHTML = \`
                            <h3>✅ 숏폼 동영상 생성 완료!</h3>
                            <video controls style="width: 100%; max-width: 300px; height: auto;">
                                <source src="\${data.videoUrl}" type="video/mp4">
                                동영상을 재생할 수 없습니다.
                            </video>
                            <div style="margin-top: 15px;">
                                <p><strong>제목:</strong> \${data.title}</p>
                                <p><strong>길이:</strong> \${data.duration}초</p>
                                <a href="\${data.downloadUrl}" download="\${data.filename.replace('.json', '.mp4')}" 
                                   style="display: inline-block; margin-top: 10px; padding: 10px 20px; 
                                          background: #4CAF50; color: white; text-decoration: none; 
                                          border-radius: 5px;">
                                    📥 동영상 다운로드
                                </a>
                            </div>
                        \`;
                    } else {
                        result.className = 'result error';
                        result.innerHTML = \`❌ 오류 발생: \${data.error}\`;
                    }
                } catch (error) {
                    result.className = 'result error';
                    result.innerHTML = \`❌ 서버 오류: \${error.message}\`;
                } finally {
                    button.disabled = false;
                    button.textContent = '📹 숏폼 동영상 생성하기';
                }
            }
        </script>
    </body>
    </html>
  `);
});

// 숏폼 동영상 생성 API
app.post('/api/create-shortform', async (req, res) => {
  try {
    const { article } = req.body;
    
    if (!article || article.length < 20) {
      return res.status(400).json({
        success: false,
        error: '기사 내용이 너무 짧습니다 (최소 20자)'
      });
    }
    
    console.log('📰 기사 → 숏폼 동영상 생성 시작...');
    console.log('기사 길이:', article.length, '자');
    
    // 1. 기사에서 핵심 내용 추출
    const title = extractTitle(article);
    const keyPoints = extractKeyPoints(article);
    const summary = article.length > 300 ? article.substring(0, 300) + '...' : article;
    
    console.log('📝 추출된 제목:', title);
    console.log('🔑 핵심 포인트:', keyPoints);
    
    // 2. 숏폼용 비주얼 프롬프트 생성
    const visualPrompt = generateVisualPrompt(title, keyPoints, article);
    console.log('🎨 비주얼 프롬프트:', visualPrompt);
    
    // 3. AI로 동영상 생성
    const videoUrl = await replicateService.textToVideo(visualPrompt, {
      numFrames: 25, // 더 긴 동영상
      steps: 30
    });
    
    // 4. 동영상 다운로드 및 저장
    const outputDir = path.join(process.cwd(), 'output');
    await fs.mkdir(outputDir, { recursive: true });
    
    const videoFilename = `shortform-${Date.now()}.mp4`;
    const videoPath = path.join(outputDir, videoFilename);
    
    console.log('📥 동영상 다운로드 중...', videoUrl);
    await replicateService.downloadFile(videoUrl, videoPath);
    console.log('💾 동영상 저장 완료:', videoPath);
    
    const result = {
      title: title,
      summary: summary,
      keyPoints: keyPoints,
      videoUrl: `/videos/${videoFilename}`, // 로컬 경로로 변경
      originalVideoUrl: videoUrl, // 원본 Replicate URL
      localVideoPath: videoPath,
      visualPrompt: visualPrompt,
      duration: 4, // 대략적인 길이
      timestamp: new Date().toISOString()
    };
    
    // 5. 결과 저장
    const filename = `shortform-${Date.now()}.json`;
    await fs.writeFile(
      path.join(outputDir, filename), 
      JSON.stringify(result, null, 2)
    );
    
    console.log('✅ 숏폼 동영상 생성 완료!');
    
    res.json({
      success: true,
      title: result.title,
      videoUrl: result.videoUrl,
      duration: result.duration,
      filename: filename,
      downloadUrl: `/download/${videoFilename}` // 다운로드 링크 추가
    });
    
  } catch (error) {
    console.error('❌ 숏폼 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 기사에서 제목 추출
function extractTitle(article) {
  const lines = article.split('\n').filter(line => line.trim());
  
  // 첫 번째 줄이 제목일 가능성이 높음
  let title = lines[0].trim();
  
  // [속보], [단독] 등의 태그 제거
  title = title.replace(/^\[[^\]]+\]\s*/, '');
  
  // 너무 길면 자르기
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  return title || '뉴스 속보';
}

// 핵심 포인트 추출
function extractKeyPoints(article) {
  const sentences = article.split(/[.!?]/).filter(s => s.trim().length > 10);
  
  // 첫 3개 문장을 핵심 포인트로
  return sentences.slice(0, 3).map(s => s.trim());
}

// 숏폼용 비주얼 프롬프트 생성
function generateVisualPrompt(title, keyPoints, article) {
  // 기사 내용 기반으로 카테고리 판단
  const category = detectNewsCategory(article);
  
  const categoryStyles = {
    'politics': 'Korean government building, serious news atmosphere, professional broadcast style',
    'economy': 'Korean business district, stock market graphics, economic indicators',
    'technology': 'modern Korean tech company, futuristic cityscape, innovation concept',
    'society': 'Korean daily life, urban scenes, social issues visualization',
    'sports': 'Korean sports venue, athletic action, competitive spirit',
    'entertainment': 'Korean entertainment industry, K-pop concept, celebrity culture',
    'international': 'global news concept, world map, international relations',
    'default': 'Korean news studio, professional broadcast, information delivery'
  };
  
  const style = categoryStyles[category] || categoryStyles['default'];
  
  // 숏폼에 최적화된 프롬프트
  const prompt = `Korean news short-form video style, ${style}, 
  9:16 vertical format, dynamic text overlays, 
  professional broadcast quality, clear visual storytelling,
  engaging for social media, modern Korean design,
  subtitle-friendly composition, high contrast colors,
  news graphics, information-focused, cinematic lighting`;
  
  return prompt;
}

// 뉴스 카테고리 감지
function detectNewsCategory(article) {
  const categoryKeywords = {
    'politics': ['정부', '대통령', '국회', '정치', '선거', '정책', '여당', '야당'],
    'economy': ['경제', '주식', '시장', '기업', '투자', '금리', '부동산', 'GDP'],
    'technology': ['기술', 'AI', '인공지능', 'IT', '스마트', '디지털', '로봇', '5G'],
    'society': ['사회', '교육', '의료', '복지', '사건', '사고', '시민'],
    'sports': ['스포츠', '축구', '야구', '농구', '올림픽', '월드컵', '선수'],
    'entertainment': ['연예', '배우', '가수', 'K-pop', '드라마', '영화', '문화'],
    'international': ['해외', '미국', '중국', '일본', '국제', '외교', '글로벌']
  };
  
  const articleLower = article.toLowerCase();
  let bestCategory = 'default';
  let maxScore = 0;
  
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      if (articleLower.includes(keyword)) score += 1;
    });
    
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  });
  
  return bestCategory;
}

app.listen(PORT, () => {
  console.log('🚀 숏폼 동영상 자동 생성기 시작!');
  console.log(`📡 주소: http://localhost:${PORT}`);
  console.log('📰 기사 붙여넣기 → 숏폼 동영상 완성!');
});