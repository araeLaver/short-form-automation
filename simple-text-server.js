import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3012;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>숏폼 콘텐츠 추출기</title>
        <meta charset="utf-8">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: #f5f5f5;
                padding: 20px;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { 
                text-align: center; 
                color: #333; 
                margin-bottom: 30px;
                font-size: 2em;
            }
            textarea { 
                width: 100%; 
                height: 200px; 
                margin: 20px 0; 
                padding: 15px;
                border: 2px solid #ddd;
                border-radius: 8px;
                font-size: 14px;
                resize: vertical;
                font-family: inherit;
            }
            .generate-btn { 
                width: 100%;
                padding: 15px; 
                font-size: 18px; 
                font-weight: bold;
                color: white;
                background: #007bff;
                border: none; 
                border-radius: 8px; 
                cursor: pointer;
                transition: all 0.3s;
                margin: 20px 0;
            }
            .generate-btn:hover { 
                background: #0056b3;
            }
            .results {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 30px;
            }
            .result-box {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #007bff;
            }
            .result-box h3 {
                color: #007bff;
                margin-bottom: 15px;
                font-size: 1.2em;
            }
            .result-content {
                background: white;
                padding: 15px;
                border-radius: 5px;
                border: 1px solid #e9ecef;
                font-family: 'Courier New', monospace;
                white-space: pre-wrap;
                font-size: 14px;
                line-height: 1.4;
                max-height: 300px;
                overflow-y: auto;
            }
            .copy-btn {
                margin-top: 10px;
                padding: 8px 16px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            .copy-btn:hover {
                background: #218838;
            }
            .loading {
                text-align: center;
                padding: 40px;
                color: #666;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📝 숏폼 콘텐츠 추출기</h1>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">
                기사나 내용을 입력하면 AI 동영상 제작에 필요한 모든 텍스트를 추출해드립니다
            </p>
            
            <textarea 
                id="contentInput" 
                placeholder="기사 전문이나 숏폼으로 만들고 싶은 내용을 입력하세요...&#10;&#10;예시:&#10;[속보] 한국 AI 기술, 세계 1위 달성&#10;한국의 인공지능 기술이 세계 최고 수준에 도달했다고 발표됐다. 한국과학기술원(KAIST) 연구팀이 개발한 새로운 AI 모델이 기존 GPT-4를 뛰어넘는 성능을 보였다. 이번 성과는 자연어 처리 분야에서 획기적인 발전으로 평가받고 있다..."
            ></textarea>
            
            <button class="generate-btn" onclick="generateContent()">
                🚀 숏폼 콘텐츠 추출하기
            </button>
            
            <div id="results" class="results" style="display: none;">
                <!-- 결과가 여기 표시됩니다 -->
            </div>
            
            <div id="loading" class="loading" style="display: none;">
                추출 중... 잠시만 기다려주세요.
            </div>
        </div>

        <script>
            async function generateContent() {
                const content = document.getElementById('contentInput').value.trim();
                if (!content) {
                    alert('내용을 입력해주세요!');
                    return;
                }
                
                if (content.length < 20) {
                    alert('더 자세한 내용을 입력해주세요 (최소 20자)');
                    return;
                }
                
                const loading = document.getElementById('loading');
                const results = document.getElementById('results');
                
                loading.style.display = 'block';
                results.style.display = 'none';
                
                try {
                    const response = await fetch('/api/extract-content', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: content })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        displayResults(data);
                    } else {
                        alert('추출 실패: ' + data.error);
                    }
                } catch (error) {
                    alert('서버 오류: ' + error.message);
                } finally {
                    loading.style.display = 'none';
                }
            }

            function displayResults(data) {
                const results = document.getElementById('results');
                results.style.display = 'grid';
                
                results.innerHTML = \`
                    <div class="result-box">
                        <h3>🎬 AI 동영상 프롬프트</h3>
                        <div class="result-content">\${data.videoPrompt}</div>
                        <button class="copy-btn" onclick="copyToClipboard('\${data.videoPrompt.replace(/'/g, "\\'")}')">복사</button>
                    </div>
                    
                    <div class="result-box">
                        <h3>🎤 음성 스크립트</h3>
                        <div class="result-content">\${data.voiceScript}</div>
                        <button class="copy-btn" onclick="copyToClipboard('\${data.voiceScript.replace(/'/g, "\\'")}')">복사</button>
                    </div>
                    
                    <div class="result-box">
                        <h3>📺 제목</h3>
                        <div class="result-content">\${data.title}</div>
                        <button class="copy-btn" onclick="copyToClipboard('\${data.title.replace(/'/g, "\\'")}')">복사</button>
                    </div>
                    
                    <div class="result-box">
                        <h3>📝 자막 (SRT 형식)</h3>
                        <div class="result-content">\${data.subtitles}</div>
                        <button class="copy-btn" onclick="copyToClipboard('\${data.subtitles.replace(/'/g, "\\'")}')">복사</button>
                    </div>
                \`;
            }

            function copyToClipboard(text) {
                navigator.clipboard.writeText(text).then(() => {
                    alert('클립보드에 복사되었습니다!');
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

// 콘텐츠 추출 API
app.post('/api/extract-content', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.length < 20) {
      return res.status(400).json({
        success: false,
        error: '내용이 너무 짧습니다'
      });
    }
    
    console.log('📝 콘텐츠 추출 시작...');
    
    // 1. 제목 추출
    const title = extractTitle(content);
    
    // 2. 음성용 스크립트 생성 (60초 분량)
    const voiceScript = generateVoiceScript(content);
    
    // 3. AI 동영상 프롬프트 생성
    const videoPrompt = generateVideoPrompt(content, title);
    
    // 4. 자막 생성 (SRT 형식)
    const subtitles = generateSubtitles(voiceScript);
    
    res.json({
      success: true,
      title: title,
      voiceScript: voiceScript,
      videoPrompt: videoPrompt,
      subtitles: subtitles,
      stats: {
        originalLength: content.length,
        scriptLength: voiceScript.length,
        estimatedDuration: Math.ceil(voiceScript.length / 4) // 대략 4글자/초
      }
    });
    
  } catch (error) {
    console.error('❌ 콘텐츠 추출 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 제목 추출
function extractTitle(content) {
  // 첫 번째 줄이나 문장에서 제목 추출
  const lines = content.split('\n').filter(line => line.trim());
  let title = lines[0].trim();
  
  // [속보], [단독] 등 태그 제거
  title = title.replace(/^\[[^\]]+\]\s*/, '');
  
  // 첫 문장 사용
  const firstSentence = content.split(/[.!?]/)[0].trim();
  if (firstSentence.length > 10 && firstSentence.length < 60) {
    title = firstSentence.replace(/^\[[^\]]+\]\s*/, '');
  }
  
  // 길이 조절
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  return title || '뉴스 속보';
}

// 음성용 스크립트 생성 (개선된 버전)
function generateVoiceScript(content) {
  let script = '';
  
  // 1. 강력한 훅 생성
  const category = detectCategory(content);
  const hook = generateHook(content, category);
  script += hook + ' ';
  
  // 2. 메인 내용을 더 자세히 처리
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 5);
  const keyPoints = extractKeyPoints(sentences);
  
  // 3. 스토리텔링 방식으로 구성
  let mainScript = '';
  
  // 배경 설명
  if (keyPoints.context) {
    mainScript += `먼저 상황을 말씀드리면, ${keyPoints.context} `;
  }
  
  // 핵심 내용
  keyPoints.main.forEach((point, index) => {
    if (index === 0) {
      mainScript += `핵심은 바로 이겁니다. ${point} `;
    } else if (index === keyPoints.main.length - 1) {
      mainScript += `마지막으로, ${point} `;
    } else {
      mainScript += `그리고 ${point} `;
    }
  });
  
  // 임팩트나 의미
  if (keyPoints.impact) {
    mainScript += `이것이 중요한 이유는 ${keyPoints.impact} `;
  }
  
  script += mainScript;
  
  // 4. 강력한 마무리
  const conclusion = generateConclusion(category, keyPoints);
  script += conclusion;
  
  // 5. 길이 조절 (400-500자로 확장 = 약 60-70초)
  if (script.length < 350) {
    script = expandScript(script, content);
  }
  
  return script;
}

// 훅 생성
function generateHook(content, category) {
  const hooks = {
    '정치': [
      '정치권에 큰 변화가 일어나고 있습니다.',
      '이번 결정이 우리 생활에 직접적인 영향을 미칠 것 같은데요.',
      '정말 놀라운 정치적 결정이 내려졌습니다.'
    ],
    '경제': [
      '여러분의 지갑에 직접 영향을 줄 중요한 소식입니다.',
      '경제 전문가들이 모두 주목하고 있는 이슈가 있습니다.',
      '투자자라면 절대 놓치면 안 될 소식을 가져왔습니다.'
    ],
    '기술': [
      'AI 기술의 놀라운 발전 소식을 전해드립니다.',
      '우리 생활을 바꿀 혁신적인 기술이 등장했습니다.',
      '테크 업계가 발칵 뒤집힌 이유를 알려드리겠습니다.'
    ],
    '사회': [
      '사회 전체가 주목하고 있는 중요한 변화가 있습니다.',
      '이 문제에 대해 모든 국민이 알아야 할 사실들이 있습니다.',
      '우리 사회의 미래를 좌우할 중요한 이슈입니다.'
    ]
  };
  
  const categoryHooks = hooks[category] || [
    '오늘 정말 중요한 소식을 가져왔습니다.',
    '이 뉴스를 보고 정말 놀랐는데요.',
    '여러분이 꼭 알아야 할 소식이 있습니다.'
  ];
  
  return categoryHooks[Math.floor(Math.random() * categoryHooks.length)];
}

// 핵심 포인트 추출
function extractKeyPoints(sentences) {
  const points = {
    context: null,
    main: [],
    impact: null
  };
  
  // 첫 2-3개 문장에서 배경 찾기
  const contextSentences = sentences.slice(0, 3);
  points.context = contextSentences.find(s => 
    s.includes('발표') || s.includes('결정') || s.includes('상황') || s.includes('배경')
  )?.trim();
  
  // 중간 문장들에서 핵심 내용 추출
  const mainSentences = sentences.slice(1, Math.min(sentences.length - 1, 6));
  points.main = mainSentences
    .filter(s => s.trim().length > 10)
    .map(s => s.trim())
    .slice(0, 3); // 최대 3개
  
  // 마지막 부분에서 영향이나 의미 찾기
  const lastSentences = sentences.slice(-3);
  points.impact = lastSentences.find(s => 
    s.includes('영향') || s.includes('전망') || s.includes('예상') || s.includes('계획')
  )?.trim();
  
  return points;
}

// 결론 생성
function generateConclusion(category, keyPoints) {
  const conclusions = {
    '정치': [
      '앞으로의 정치적 변화가 주목됩니다.',
      '이번 결정의 파급효과를 계속 지켜봐야겠습니다.',
      '국민들의 반응도 매우 궁금합니다.'
    ],
    '경제': [
      '경제에 미칠 영향을 계속 주시해야겠습니다.',
      '투자자들의 대응이 주목됩니다.',
      '시장 반응을 계속 지켜보겠습니다.'
    ],
    '기술': [
      '기술 발전의 속도가 정말 놀랍습니다.',
      '우리 생활이 어떻게 바뀔지 기대됩니다.',
      '앞으로의 기술 혁신이 더욱 궁금해집니다.'
    ]
  };
  
  const categoryConclusions = conclusions[category] || [
    '앞으로의 상황 변화를 계속 지켜보겠습니다.',
    '더 자세한 소식은 계속 전해드리겠습니다.',
    '여러분의 관심과 참여가 중요합니다.'
  ];
  
  const conclusion = categoryConclusions[Math.floor(Math.random() * categoryConclusions.length)];
  return `${conclusion} 이 영상이 도움되셨다면 좋아요와 구독 버튼을 눌러주시고, 댓글로 여러분의 생각도 들려주세요. 감사합니다!`;
}

// 스크립트 확장
function expandScript(script, originalContent) {
  if (script.length >= 400) return script;
  
  // 추가 문장들 찾기
  const additionalSentences = originalContent
    .split(/[.!?]/)
    .filter(s => s.trim().length > 10 && !script.includes(s.trim()))
    .slice(0, 2);
  
  if (additionalSentences.length > 0) {
    const insertPoint = script.lastIndexOf('앞으로의');
    if (insertPoint > -1) {
      const beforeConclusion = script.substring(0, insertPoint);
      const conclusion = script.substring(insertPoint);
      
      let addition = '또한, ';
      addition += additionalSentences.join('. ');
      addition += '. ';
      
      return beforeConclusion + addition + conclusion;
    }
  }
  
  return script;
}

// AI 동영상 프롬프트 생성
function generateVideoPrompt(content, title) {
  const category = detectCategory(content);
  
  // 플랫폼별 최적화 프롬프트 생성
  const runwayPrompt = generateRunwayPrompt(title, category, content);
  const pikaPrompt = generatePikaPrompt(title, category, content);
  const lumaPrompt = generateLumaPrompt(title, category, content);
  
  return `🎬 AI 동영상 제작 프롬프트 (플랫폼별 최적화)

📌 제목: ${title}
📂 카테고리: ${category}
⏱️ 길이: 60초 | 📱 형식: 9:16 세로

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 RUNWAY ML Gen-2 (추천 1순위)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${runwayPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ PIKA LABS (추천 2순위)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${pikaPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 LUMA DREAM MACHINE (추천 3순위)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${lumaPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 플랫폼 선택 가이드
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Runway ML Gen-2: 가장 안정적, 한국어 텍스트 지원 우수
✅ Pika Labs: 빠른 생성속도, 모션 품질 좋음
✅ Luma Dream Machine: 최신 기술, 자연스러운 움직임

💡 팁: Runway ML부터 시도해보시고, 결과가 만족스럽지 않으면 Pika Labs 사용을 권장합니다.`;
}

// Runway ML 최적화 프롬프트
function generateRunwayPrompt(title, category, content) {
  const styleMap = {
    '정치': 'Korean government building, official meeting room, professional news anchor',
    '경제': 'Korean business district, modern office, financial charts and graphs',
    '기술': 'Korean tech company, modern laboratory, futuristic digital interface',
    '사회': 'Korean urban street, community center, diverse Korean people',
    '문화': 'Korean cultural center, traditional and modern art, performance space',
    '스포츠': 'Korean stadium, sports facility, athletic competition',
    '국제': 'Korean airport, diplomatic meeting, world map with Korea highlighted'
  };

  const baseStyle = styleMap[category] || 'Korean news studio, professional broadcast setup';
  
  return `Korean news broadcast: "${title}"

Visual style: ${baseStyle}, cinematic lighting, 9:16 vertical format, professional Korean broadcast quality

Camera movement: Smooth push-in from wide to medium shot, subtle parallax effect, professional zoom

Scene composition:
- Opening: Korean news studio wide shot
- Middle: Close-up with relevant background graphics  
- Ending: Pull back to reveal full scene

Motion elements: Subtle text animations, Korean typography overlay, professional graphic transitions

Duration: 60 seconds
Quality: 4K, 30fps
Aspect ratio: 9:16 (768x1344)

Korean cultural elements: Modern Seoul backdrop, Korean text integration, professional news aesthetic

Technical specs: High contrast for mobile viewing, subtitle-safe areas, smooth motion blur`;
}

// Pika Labs 최적화 프롬프트
function generatePikaPrompt(title, category, content) {
  return `/create ${title}

Korean news style, vertical 9:16 format, professional broadcast, cinematic quality

Visual: Modern Korean news studio, professional lighting, clean graphics, ${category} themed background

Motion: Smooth camera push, subtle zoom in, professional news presentation style

Style: Photorealistic, high contrast, Korean broadcast aesthetic, mobile-optimized

Duration: Extended (60s), smooth transitions, engaging visual flow

Quality: 4K resolution, 30fps, broadcast quality

Text: Korean typography ready, subtitle friendly composition

Mood: Professional, authoritative, engaging Korean news presentation`;
}

// Luma Dream Machine 최적화 프롬프트  
function generateLumaPrompt(title, category, content) {
  return `Create professional Korean news broadcast video: "${title}"

Setting: Modern Korean news studio with city skyline backdrop
Format: Vertical 9:16 aspect ratio (768x1344)
Duration: 60 seconds

Visual elements:
- Korean news anchor desk setup
- Professional broadcast lighting
- Clean modern graphics overlay
- ${category}-specific background visuals
- Korean typography integration

Camera work:
- Start: Wide establishing shot
- Middle: Smooth push to medium shot
- End: Slow pull back to wide

Motion details:
- Subtle news graphics animation
- Professional Korean text overlay
- Smooth parallax background movement
- Natural lighting changes

Technical specs:
- 4K resolution, 30fps
- High contrast for mobile viewing
- Subtitle-safe composition
- Professional color grading
- Korean broadcast standard

Style: Photorealistic Korean news broadcast, professional, authoritative, mobile-first design`;
}

// 자막 생성 (SRT 형식)
function generateSubtitles(script) {
  const sentences = script.split(/[.!?]/).filter(s => s.trim().length > 5);
  let srt = '';
  let startTime = 0;
  
  sentences.forEach((sentence, index) => {
    const duration = Math.max(2, sentence.trim().length / 4); // 글자 수에 따른 시간
    const endTime = startTime + duration;
    
    srt += `${index + 1}
${formatTime(startTime)} --> ${formatTime(endTime)}
${sentence.trim()}

`;
    
    startTime = endTime;
  });
  
  return srt;
}

// 시간 형식 변환 (SRT 형식)
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

// 카테고리 감지
function detectCategory(content) {
  const categories = {
    '정치': ['정부', '대통령', '국회', '정치', '선거', '여당', '야당'],
    '경제': ['경제', '주식', '부동산', '금리', '기업', '투자', 'GDP'],
    '기술': ['AI', '인공지능', '기술', 'IT', '스마트폰', '디지털', '5G'],
    '사회': ['사회', '교육', '의료', '복지', '환경', '시민', '사건'],
    '문화': ['문화', '예술', '영화', '음악', 'K-pop', '드라마', '연예'],
    '스포츠': ['스포츠', '축구', '야구', '농구', '올림픽', '선수'],
    '국제': ['해외', '미국', '중국', '일본', '국제', '외교', '글로벌']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return category;
    }
  }
  
  return '일반';
}

app.listen(PORT, () => {
  console.log('📝 숏폼 콘텐츠 추출기 시작!');
  console.log(`🌐 주소: http://localhost:${PORT}`);
  console.log('✨ 텍스트만 추출 - 간단하고 빠르게!');
});