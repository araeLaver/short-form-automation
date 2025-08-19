import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { SimpleVideoGenerator } from './simple-video-generator.js';
import Anthropic from '@anthropic-ai/sdk';
import replicateRoutes from './src/api/replicateRoutes.js';

const app = express();
const PORT = process.env.PORT || 3004;

// Claude API 초기화
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/videos', express.static('generated-videos'));

// Replicate API 라우터 추가
app.use(replicateRoutes);

class ShortFormServer {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'server-output');
    this.videoGenerator = new SimpleVideoGenerator();
  }

  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir('public', { recursive: true });
  }

  async collectKoreaNews() {
    try {
      // 실제 뉴스 수집 사용
      const news = await this.videoGenerator.collectRealKoreanNews();
      await this.saveData('korea-news-latest.json', news);
      return news;
    } catch (error) {
      console.error('뉴스 수집 실패:', error);
      return [];
    }
  }

  async generateGlobalContent() {
    const contentTemplates = [
      {
        id: 1,
        title: "10 Life-Changing Morning Habits",
        hook: "Transform your entire day with these simple morning routines!",
        category: "Productivity",
        estimatedViews: "2.5M",
        viralScore: 85,
        content: [
          "Wake up at 5 AM consistently",
          "Drink water immediately after waking",
          "Do 5 minutes of stretching",
          "Write down 3 daily goals"
        ]
      },
      {
        id: 2,
        title: "The Psychology of Colors in Design",
        hook: "Why red makes you buy more and blue makes you trust!",
        category: "Education",
        estimatedViews: "1.8M",
        viralScore: 78,
        content: [
          "Red creates urgency and appetite",
          "Blue builds trust and calm",
          "Green represents growth and health",
          "Yellow grabs attention and energy"
        ]
      },
      {
        id: 3,
        title: "Future Tech That Will Blow Your Mind",
        hook: "These technologies will change everything by 2030!",
        category: "Technology",
        estimatedViews: "3.2M",
        viralScore: 92,
        content: [
          "Brain-computer interfaces",
          "Quantum computing for everyone",
          "Self-healing materials",
          "Holographic displays"
        ]
      }
    ];

    const selectedContent = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
    await this.saveData('global-content-latest.json', selectedContent);
    return selectedContent;
  }

  async createVideoScript(content, type) {
    const script = {
      id: Date.now(),
      type: type,
      title: content.title,
      totalDuration: 60,
      createdAt: new Date().toISOString(),
      scenes: [
        {
          sceneNumber: 1,
          timeRange: "0-3s",
          text: content.hook || content.summary,
          visual: "강력한 훅 화면 + 제목",
          audioNote: "에너지 넘치는 톤으로 시청자 관심 끌기"
        },
        {
          sceneNumber: 2,
          timeRange: "3-8s",
          text: content.title,
          visual: "메인 제목 카드 + 브랜딩",
          audioNote: "명확하고 자신감 있는 톤"
        },
        {
          sceneNumber: 3,
          timeRange: "8-50s",
          text: content.content ? content.content.join('. ') : content.summary,
          visual: "핵심 내용 시각화 + 인포그래픽",
          audioNote: "정보 전달 중심, 적절한 페이싱"
        },
        {
          sceneNumber: 4,
          timeRange: "50-57s",
          text: "이 정보가 도움되셨다면 좋아요와 구독 부탁드려요!",
          visual: "구독 버튼 애니메이션",
          audioNote: "친근하고 감사한 톤"
        },
        {
          sceneNumber: 5,
          timeRange: "57-60s",
          text: "다음 영상도 기대해주세요!",
          visual: "채널 로고 + 다음 영상 미리보기",
          audioNote: "기대감 조성"
        }
      ],
      metadata: {
        platform: {
          youtube: {
            title: content.title.substring(0, 100),
            description: `${content.summary || content.hook}\n\n📌 타임스탬프:\n0:00 인트로\n0:08 메인 내용\n0:50 마무리`,
            hashtags: type === 'korea' ? 
              ['#한국뉴스', '#이슈', '#정보', '#숏츠', '#트렌드'] : 
              ['#LifeHacks', '#Productivity', '#Viral', '#Shorts', '#Educational'],
            category: type === 'korea' ? '뉴스 및 정치' : 'Education'
          },
          instagram: {
            caption: `${content.title}\n\n${content.summary || content.hook}\n.\n.\n.\n${type === 'korea' ? '#한국뉴스 #이슈 #정보 #릴스' : '#LifeHacks #Productivity #Reels #Viral'}`,
            hashtags: type === 'korea' ? 
              ['한국뉴스', '이슈', '정보', '릴스', '트렌드'] : 
              ['lifehacks', 'productivity', 'reels', 'viral', 'educational']
          },
          tiktok: {
            description: `${content.title} ${type === 'korea' ? '#한국뉴스 #이슈 #fyp' : '#lifehacks #productivity #fyp #viral'}`,
            hashtags: type === 'korea' ? 
              ['한국뉴스', '이슈', 'fyp', '트렌드'] : 
              ['lifehacks', 'productivity', 'fyp', 'viral']
          }
        },
        estimatedMetrics: {
          duration: '60s',
          targetViews: content.estimatedViews || '1M+',
          engagementRate: '8-12%',
          viralPotential: content.viralScore || 75
        }
      }
    };

    const fileName = `script-${type}-${script.id}.json`;
    await this.saveData(fileName, script);
    return script;
  }

  async saveData(filename, data) {
    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async getFilesList() {
    try {
      const files = await fs.readdir(this.outputDir);
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.outputDir, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            type: path.extname(file)
          };
        })
      );
      return fileDetails.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    } catch (error) {
      return [];
    }
  }
}

const shortFormServer = new ShortFormServer();

// API Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'running',
    timestamp: new Date().toISOString(),
    server: '숏폼 자동화 프로토타입 서버'
  });
});

app.post('/api/generate/korea', async (req, res) => {
  try {
    console.log('🇰🇷 한국 콘텐츠 생성 시작...');
    const news = await shortFormServer.collectKoreaNews();
    if (news.length > 0) {
      // 실제 비디오 생성!
      const videoResult = await shortFormServer.videoGenerator.createNewsVideo(news[0]);
      
      const videoUrl = `/videos/${path.basename(videoResult.videoPath)}`;
      
      res.json({
        success: true,
        data: {
          news: news[0],
          videoUrl: videoUrl,
          videoPath: videoResult.videoPath,
          script: videoResult.script,
          duration: videoResult.duration
        },
        message: '한국 뉴스 동영상 생성 완료!'
      });
    } else {
      res.json({
        success: false,
        message: '뉴스 수집에 실패했습니다'
      });
    }
  } catch (error) {
    console.error('한국 콘텐츠 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/generate/global', async (req, res) => {
  try {
    console.log('🌍 글로벌 콘텐츠 생성 시작...');
    const content = await shortFormServer.generateGlobalContent();
    
    // 글로벌 콘텐츠를 customData 형식으로 변환
    const customData = {
      title: content.title,
      content: content.content.join('\n\n'),
      category: content.category,
      hashtags: `#${content.category} #Viral #Shorts #Educational #LifeHacks`
    };
    
    // 실제 비디오 생성!
    const videoResult = await shortFormServer.videoGenerator.createCustomVideo(customData);
    
    const videoUrl = `/videos/${path.basename(videoResult.videoPath)}`;
    
    res.json({
      success: true,
      data: {
        content: content,
        videoUrl: videoUrl,
        videoPath: videoResult.videoPath,
        script: videoResult.script,
        duration: videoResult.duration,
        estimatedViews: content.estimatedViews,
        viralScore: content.viralScore
      },
      message: '글로벌 콘텐츠 동영상 생성 완료!'
    });
  } catch (error) {
    console.error('글로벌 콘텐츠 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/generate/custom', async (req, res) => {
  try {
    console.log('🎨 사용자 맞춤 콘텐츠 생성 시작...');
    console.log('받은 데이터:', req.body);
    const { title, content, category, duration, hashtags } = req.body;
    
    // 입력값 검증 (내용만 필수)
    if (!content) {
      return res.status(400).json({
        success: false,
        error: '내용은 필수입니다.'
      });
    }

    if (content.length < 10) {
      return res.status(400).json({
        success: false,
        error: '내용을 10자 이상 입력해주세요.'
      });
    }
    
    const customData = {
      title: title ? title.trim() : '',
      content: content.trim(),
      category: category || '기타',
      duration: duration || 'auto',
      hashtags: hashtags || ''
    };
    
    // 실제 맞춤 비디오 생성!
    console.log('비디오 생성기 호출 중...', customData);
    const videoResult = await shortFormServer.videoGenerator.createCustomVideo(customData);
    console.log('비디오 생성 결과:', videoResult);
    
    const videoUrl = `/videos/${path.basename(videoResult.videoPath)}`;
    
    res.json({
      success: true,
      data: {
        customData: customData,
        videoUrl: videoUrl,
        videoPath: videoResult.videoPath,
        script: videoResult.script,
        duration: videoResult.duration,
        videoInfo: videoResult.videoInfo,
        isCustom: true
      },
      message: '사용자 맞춤 동영상 생성 완료!'
    });
    
  } catch (error) {
    console.error('맞춤 콘텐츠 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/files', async (req, res) => {
  try {
    const files = await shortFormServer.getFilesList();
    res.json({
      success: true,
      files: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/files/:filename', async (req, res) => {
  try {
    const filePath = path.join(shortFormServer.outputDir, req.params.filename);
    const content = await fs.readFile(filePath, 'utf8');
    res.json({
      success: true,
      content: JSON.parse(content)
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: '파일을 찾을 수 없습니다'
    });
  }
});

// 프롬프트 추출 API
app.post('/api/extract-prompt', async (req, res) => {
  try {
    console.log('🧠 프롬프트 추출 요청 처리 중...');
    const { content, tone, length, targetRegion = 'korea' } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: '내용이 필요합니다.'
      });
    }
    
    if (content.length < 20) {
      return res.status(400).json({
        success: false,
        error: '더 자세한 내용을 입력해주세요 (최소 20자)'
      });
    }
    
    // Claude AI 기반 프롬프트 추출
    const extractedData = await extractPromptWithClaude(content, tone, length, targetRegion);
    
    res.json({
      success: true,
      data: extractedData,
      message: '프롬프트 추출 완료!'
    });
    
  } catch (error) {
    console.error('프롬프트 추출 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Claude AI 기반 프롬프트 추출 함수
async function extractPromptWithClaude(content, tone, length, targetRegion) {
  try {
    // 타겟별 톤 설명
    const koreanToneDescriptions = {
      'informative': '정보 전달형 - 명확하고 정확한 정보 제공, 자막과 이미지로 설명',
      'educational': '교육형 - 단계별 설명, 따라하기 쉬운 구조',
      'news': '뉴스형 - 팩트 중심, 객관적 전달, 핵심 요점 정리',
      'tutorial': '튜토리얼형 - 실용적 가이드, step-by-step 진행',
      'review': '리뷰형 - 장단점 분석, 비교 검토, 결론 제시'
    };
    
    const globalToneDescriptions = {
      'dramatic': '드라마틱 - 강한 감정 몰입, 극적 전개, 스토리텔링 중심',
      'mysterious': '미스터리 - 호기심과 궁금증 유발, 점진적 공개',
      'shocking': '충격적 - 강한 임팩트, 놀라운 반전, 시선 집중',
      'inspiring': '영감적 - 동기부여, 감동적 메시지, 희망적 결말',
      'entertaining': '엔터테인먼트 - 재미와 유머, 캐릭터 중심, 즐거운 분위기'
    };
    
    const toneDescriptions = targetRegion === 'korea' ? koreanToneDescriptions : globalToneDescriptions;
    
    const lengthDescriptions = {
      'short': '30초 이하 - 핵심만 간략하게 (약 150자)',
      'medium': '30-60초 - 적당한 길이 (약 300자)',
      'long': '60초 이상 - 자세하게 설명 (약 500자 이상)'
    };

    let prompt;
    
    if (targetRegion === 'korea') {
      // 대한민국 타겟: 정보전달, 자막/이미지 중심
      prompt = `다음 내용을 바탕으로 대한민국 시청자를 위한 정보전달형 숏폼 콘텐츠를 생성해주세요.

원본 내용:
${content}

대한민국 타겟 특화 요구사항:
- 톤앤매너: ${toneDescriptions[tone]}
- 영상 길이: ${lengthDescriptions[length]}
- 스타일: 자막과 이미지 나열 중심의 정보 전달
- 구성: 요점 정리 → 상세 설명 → 핵심 요약
- 음성: 명확한 한국어 나레이션과 자막 동시 제공

다음 형식으로 JSON을 반환해주세요:
{
  "title": "정보성 제목 (클릭 유도보다는 명확한 정보 전달)",
  "content": "체계적이고 논리적인 정보 전달 콘텐츠",
  "category": "적합한 카테고리",
  "hashtags": "한국어 해시태그 위주 (정보성, 실용성 강조)",
  "hook": "핵심 정보를 요약한 첫 문장",
  "keywords": ["검색 친화적 한국어 키워드들"],
  "subtitlePoints": ["화면에 표시할 핵심 요점들 (3-5개)"],
  "imageSequence": ["필요한 이미지/그래픽 설명들"],
  "voiceScript": "자막과 함께 읽을 음성 스크립트"
}`;
      
    } else {
      // 해외 타겟: 감정어필, 캐릭터/심리자극 중심
      prompt = `Create engaging short-form content for international audiences focusing on psychological appeal and character-driven storytelling.

Original content:
${content}

International target requirements:
- Tone: ${toneDescriptions[tone]}
- Length: ${lengthDescriptions[length]}
- Style: Character-focused, psychologically engaging, high visual impact
- Structure: Hook → Emotional journey → Powerful conclusion
- Focus: Visual storytelling over text, universal emotions

Return JSON in this format:
{
  "title": "Attention-grabbing title that triggers curiosity/emotion",
  "content": "Character-driven narrative with strong emotional arc",
  "category": "Appropriate category",
  "hashtags": "Viral-focused English hashtags",
  "hook": "Powerful opening that immediately captures attention",
  "keywords": ["Viral-potential English keywords"],
  "characterProfile": "Main character or persona for the video",
  "emotionalJourney": ["Key emotional beats throughout the video"],
  "visualHooks": ["Strong visual elements that demand attention"],
  "psychologicalTriggers": ["Human psychology elements being activated"]
}`;
    }

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Claude 응답 파싱
    const responseText = message.content[0].text;
    console.log('Claude 응답:', responseText);
    
    // JSON 파싱 시도
    let extractedData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON 형식을 찾을 수 없음');
      }
    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError);
      // 파싱 실패 시 백업 방식 사용
      return extractPromptFromContent(content, tone, length);
    }

    // 메타데이터 추가
    extractedData.tone = tone;
    extractedData.length = length;
    extractedData.metadata = {
      aiGenerated: true,
      model: 'claude-3-haiku',
      extractedKeywords: extractedData.keywords || [],
      estimatedDuration: estimateDuration(extractedData.content, length),
      hookStyle: extractedData.hook,
      closingStyle: '좋아요와 구독 부탁드려요!'
    };

    return extractedData;

  } catch (error) {
    console.error('Claude API 오류:', error);
    // API 실패 시 기존 룰 기반 방식으로 폴백
    return extractPromptFromContent(content, tone, length);
  }
}

// 기존 룰 기반 프롬프트 추출 함수 (백업용)
function extractPromptFromContent(content, tone, length) {
  // 내용에서 핵심 키워드 추출
  const keywords = extractKeywords(content);
  const category = detectCategory(content, keywords);
  
  // 톤에 따른 제목 생성
  const titlePrefixes = {
    'informative': ['알아두면 유용한', '꼭 알아야 할', '완전 정리:', '총정리:'],
    'exciting': ['대박!', '놀라운', '믿을 수 없는', '충격적인', '진짜 대단한'],
    'friendly': ['쉽게 알아보는', '함께 배워보는', '재미있게 알아보는', '친근하게 설명하는'],
    'professional': ['전문가가 알려주는', '정확한 정보:', '신뢰할 수 있는', '검증된'],
    'trendy': ['요즘 핫한', 'MZ가 주목하는', '트렌드:', '지금 뜨고 있는', '바이럴 중인']
  };
  
  const closingPhrases = {
    'informative': '더 많은 정보가 궁금하다면 좋아요와 구독!',
    'exciting': '대박이지? 좋아요 눌러서 더 놀라운 이야기 받아보자!',
    'friendly': '도움됐다면 좋아요! 더 재미있는 이야기는 구독으로!',
    'professional': '신뢰할 수 있는 정보를 더 원한다면 구독해주세요',
    'trendy': '이런 트렌드 더 보고 싶다면 좋아요 구독 ㄱㄱ!'
  };
  
  // 길이에 따른 내용 조절
  let processedContent = content;
  if (length === 'short') {
    // 30초 이하 - 핵심만 간략하게
    processedContent = summarizeContent(content, 150);
  } else if (length === 'medium') {
    // 30-60초 - 적당한 길이
    processedContent = summarizeContent(content, 300);
  } else {
    // 60초 이상 - 자세하게
    processedContent = content.length > 500 ? content : expandContent(content);
  }
  
  // 제목 생성
  const prefix = titlePrefixes[tone][Math.floor(Math.random() * titlePrefixes[tone].length)];
  const title = generateTitle(content, category, prefix, keywords);
  
  // 해시태그 생성
  const hashtags = generateHashtags(category, keywords, tone);
  
  // 최종 콘텐츠 구성
  const hook = generateHook(tone, category);
  const closing = closingPhrases[tone];
  const finalContent = `${hook} ${processedContent} ${closing}`;
  
  return {
    title: title,
    content: finalContent,
    category: category,
    hashtags: hashtags,
    tone: tone,
    length: length,
    metadata: {
      extractedKeywords: keywords,
      estimatedDuration: estimateDuration(finalContent, length),
      hookStyle: hook,
      closingStyle: closing
    }
  };
}

// 키워드 추출 함수
function extractKeywords(content) {
  // 한글 키워드 추출 로직
  const commonWords = ['이', '그', '저', '및', '등', '의', '가', '을', '를', '에', '에서', '으로', '로', '과', '와', '도', '만', '까지', '부터', '하고', '하지만', '그러나', '그리고', '또한', '또는', '입니다', '습니다', '있습니다', '됩니다', '합니다'];
  
  const words = content
    .replace(/[^\w\s가-힣]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 2 && !commonWords.includes(word))
    .map(word => word.toLowerCase());
  
  // 빈도수 계산
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // 상위 키워드 반환
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

// 카테고리 감지 함수
function detectCategory(content, keywords) {
  const categoryKeywords = {
    '기술': ['AI', '인공지능', '기술', '디지털', '스마트폰', '컴퓨터', '인터넷', '앱', '프로그램', '소프트웨어', '하드웨어'],
    '교육': ['학습', '공부', '교육', '학교', '대학', '시험', '책', '강의', '배우', '가르치', '지식'],
    '라이프스타일': ['일상', '생활', '라이프', '습관', '루틴', '취미', '여가', '집', '인테리어', '패션'],
    '비즈니스': ['비즈니스', '사업', '회사', '경영', '마케팅', '투자', '창업', '직장', '업무', '성공'],
    '건강': ['건강', '운동', '다이어트', '의료', '병원', '약', '치료', '예방', '영양', '식단'],
    '요리': ['요리', '레시피', '음식', '맛', '재료', '조리', '식당', '맛집', '먹', '쿠킹'],
    '여행': ['여행', '관광', '휴가', '해외', '국내', '여행지', '호텔', '항공', '티켓', '관광지'],
    '엔터테인먼트': ['영화', '드라마', '음악', '게임', '연예인', '재미', '오락', '엔터', '방송', '유튜브']
  };
  
  const contentLower = content.toLowerCase();
  let bestCategory = '기타';
  let maxScore = 0;
  
  Object.entries(categoryKeywords).forEach(([category, categoryWords]) => {
    let score = 0;
    categoryWords.forEach(word => {
      if (contentLower.includes(word.toLowerCase())) {
        score += 2;
      }
    });
    keywords.forEach(keyword => {
      if (categoryWords.some(word => word.toLowerCase().includes(keyword) || keyword.includes(word.toLowerCase()))) {
        score += 1;
      }
    });
    
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  });
  
  return bestCategory;
}

// 제목 생성 함수
function generateTitle(content, category, prefix, keywords) {
  const firstSentence = content.split(/[.!?]/)[0].trim();
  const mainKeyword = keywords[0] || category;
  
  let title;
  if (firstSentence.length > 10 && firstSentence.length < 40) {
    title = `${prefix} ${firstSentence}`;
  } else {
    title = `${prefix} ${mainKeyword} 이야기`;
  }
  
  // 제목 길이 조절 (50자 이내)
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  return title;
}

// 훅 생성 함수
function generateHook(tone, category) {
  const hooks = {
    'informative': [
      '이거 정말 유용해요!',
      '꼭 알아두세요!',
      '이것만 알면 됩니다!',
      '정말 중요한 정보예요!'
    ],
    'exciting': [
      '와 이거 진짜 대박!',
      '믿을 수 없어요!',
      '이거 보고 깜짝 놀랐어요!',
      '진짜 미쳤다 이거!'
    ],
    'friendly': [
      '안녕하세요 여러분!',
      '오늘은 재미있는 이야기가 있어요!',
      '같이 알아볼까요?',
      '여러분 이거 아세요?'
    ],
    'professional': [
      '전문가가 알려드립니다.',
      '정확한 정보를 전해드려요.',
      '신뢰할 수 있는 내용입니다.',
      '검증된 정보입니다.'
    ],
    'trendy': [
      '요즘 이거 진짜 핫해요!',
      'MZ들 사이에서 난리예요!',
      '지금 가장 뜨고 있는 이야기!',
      '이거 모르면 아웃이에요!'
    ]
  };
  
  const toneHooks = hooks[tone] || hooks['informative'];
  return toneHooks[Math.floor(Math.random() * toneHooks.length)];
}

// 해시태그 생성 함수
function generateHashtags(category, keywords, tone) {
  const baseHashtags = {
    '기술': ['#기술', '#IT', '#혁신', '#미래'],
    '교육': ['#교육', '#학습', '#지식', '#공부'],
    '라이프스타일': ['#라이프스타일', '#일상', '#꿀팁', '#생활'],
    '비즈니스': ['#비즈니스', '#성공', '#창업', '#투자'],
    '건강': ['#건강', '#웰빙', '#운동', '#다이어트'],
    '요리': ['#요리', '#레시피', '#음식', '#쿠킹'],
    '여행': ['#여행', '#관광', '#휴가', '#여행지'],
    '엔터테인먼트': ['#엔터', '#재미', '#웃음', '#즐거움']
  };
  
  const toneHashtags = {
    'exciting': ['#대박', '#놀라운', '#충격'],
    'trendy': ['#핫이슈', '#트렌드', '#바이럴'],
    'informative': ['#정보', '#유용한', '#알아두기'],
    'friendly': ['#친근한', '#쉬운설명', '#함께'],
    'professional': ['#전문가', '#신뢰할수있는', '#검증된']
  };
  
  let hashtags = [...(baseHashtags[category] || ['#정보'])];
  hashtags.push(...(toneHashtags[tone] || []));
  
  // 키워드 기반 해시태그 추가
  keywords.slice(0, 2).forEach(keyword => {
    hashtags.push(`#${keyword}`);
  });
  
  // 공통 해시태그 추가
  hashtags.push('#숏츠', '#유튜브', '#꿀팁');
  
  return hashtags.slice(0, 10).join(' ');
}

// 내용 요약 함수
function summarizeContent(content, maxLength) {
  if (content.length <= maxLength) return content;
  
  const sentences = content.split(/[.!?]/);
  let summary = '';
  
  for (const sentence of sentences) {
    if ((summary + sentence).length <= maxLength - 10) {
      summary += sentence.trim() + '. ';
    } else {
      break;
    }
  }
  
  return summary.trim() || content.substring(0, maxLength - 3) + '...';
}

// 내용 확장 함수
function expandContent(content) {
  // 간단한 내용 확장 로직
  const expansions = [
    '이 내용을 더 자세히 살펴보면, ',
    '또한 중요한 점은 ',
    '추가로 알아두면 좋은 것은 ',
    '실제로 많은 사람들이 ',
    '전문가들은 이에 대해 '
  ];
  
  const randomExpansion = expansions[Math.floor(Math.random() * expansions.length)];
  return content + ' ' + randomExpansion + '더 많은 정보와 팁들이 있다는 것입니다.';
}

// 예상 영상 길이 계산
function estimateDuration(content, lengthPreference) {
  const baseSpeed = 0.12; // 초당 글자 수
  const calculatedDuration = content.length * baseSpeed;
  
  switch (lengthPreference) {
    case 'short':
      return Math.min(Math.max(calculatedDuration, 15), 30);
    case 'medium':
      return Math.min(Math.max(calculatedDuration, 30), 60);
    case 'long':
      return Math.min(Math.max(calculatedDuration, 60), 90);
    default:
      return Math.min(Math.max(calculatedDuration, 20), 60);
  }
}

// 번역 API
app.post('/api/translate', async (req, res) => {
  try {
    console.log('🌍 번역 요청 처리 중...');
    const { text, targetLanguage = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: '번역할 텍스트가 필요합니다.'
      });
    }
    
    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: '텍스트가 너무 깁니다 (최대 5000자)'
      });
    }
    
    // Claude AI 기반 번역
    const translatedText = await translateWithClaude(text, targetLanguage);
    
    res.json({
      success: true,
      translatedText: translatedText,
      originalText: text,
      targetLanguage: targetLanguage,
      message: '번역 완료!'
    });
    
  } catch (error) {
    console.error('번역 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Claude AI 기반 번역 함수
async function translateWithClaude(text, targetLanguage) {
  try {
    const languageNames = {
      'en': '영어',
      'ko': '한국어',
      'ja': '일본어',
      'zh': '중국어',
      'fr': '프랑스어',
      'es': '스페인어',
      'de': '독일어'
    };

    const targetLanguageName = languageNames[targetLanguage] || '영어';

    const prompt = `다음 텍스트를 ${targetLanguageName}로 자연스럽게 번역해주세요. 숏폼 동영상 콘텐츠의 특성을 고려해서 해당 언어 사용자들이 선호하는 표현과 문화에 맞게 번역해주세요.

원문:
${text}

번역 요구사항:
1. ${targetLanguageName} 원어민이 자연스럽게 느낄 수 있는 표현 사용
2. 숏폼 콘텐츠(유튜브 쇼츠, 틱톡, 인스타 릴스)에 적합한 톤 유지
3. 감정과 뉘앙스도 함께 전달
4. 번역문만 반환 (설명이나 주석 없이)

번역문:`;

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const translatedText = message.content[0].text.trim();
    console.log('Claude 번역 결과:', translatedText);
    
    return translatedText;

  } catch (error) {
    console.error('Claude 번역 API 오류:', error);
    // API 실패 시 기존 룰 기반 방식으로 폴백
    return translateWithRules(text, targetLanguage);
  }
}

// 기존 룰 기반 번역 함수 (백업용)
function translateWithRules(text, targetLanguage) {
  if (targetLanguage !== 'en') {
    return text; // 영어 외 다른 언어는 원본 반환
  }
  
  // 한국어 -> 영어 번역 사전
  const translationDict = {
    // 일반 단어들
    '안녕하세요': 'Hello',
    '여러분': 'everyone',
    '오늘은': 'Today',
    '이거': 'this',
    '정말': 'really',
    '대박': 'amazing',
    '놀라운': 'amazing',
    '믿을 수 없는': 'unbelievable',
    '충격적인': 'shocking',
    '진짜': 'really',
    '대단한': 'incredible',
    '쉽게': 'easily',
    '알아보는': 'learn about',
    '함께': 'together',
    '배워보는': 'learning',
    '재미있게': 'fun',
    '친근하게': 'friendly',
    '설명하는': 'explaining',
    '전문가가': 'experts',
    '알려주는': 'tell you',
    '정확한': 'accurate',
    '정보': 'information',
    '신뢰할 수 있는': 'reliable',
    '검증된': 'verified',
    '요즘': 'these days',
    '핫한': 'hot',
    '주목하는': 'paying attention to',
    '트렌드': 'trend',
    '지금': 'now',
    '뜨고 있는': 'trending',
    '바이럴': 'viral',
    '중인': 'going',
    
    // 카테고리 관련
    '기술': 'Technology',
    '교육': 'Education',
    '라이프스타일': 'Lifestyle',
    '비즈니스': 'Business',
    '건강': 'Health',
    '요리': 'Cooking',
    '여행': 'Travel',
    '엔터테인먼트': 'Entertainment',
    
    // 동작/행위
    '알아두면': 'Good to know',
    '유용한': 'useful',
    '꼭 알아야 할': 'Must know',
    '완전 정리': 'Complete guide',
    '총정리': 'Summary',
    '이야기': 'story',
    '내용': 'content',
    '방법': 'method',
    '팁': 'tips',
    '비법': 'secret',
    '가이드': 'guide',
    
    // 마무리 문구
    '좋아요': 'like',
    '구독': 'subscribe',
    '도움됐다면': 'If this helped',
    '더 많은': 'more',
    '궁금하다면': 'if you want to know',
    '부탁드립니다': 'please',
    '부탁드려요': 'please',
    
    // 감탄사/반응
    '와': 'Wow',
    '이거 보고': 'seeing this',
    '깜짝 놀랐어요': 'I was surprised',
    '미쳤다': 'crazy',
    '같이': 'together',
    '알아볼까요': "let's find out",
    '아세요': 'do you know',
    '모르면': "if you don't know",
    '아웃이에요': "you're out",
    
    // 해시태그 관련
    '숏츠': 'Shorts',
    '유튜브': 'YouTube',
    '꿀팁': 'LifeHacks',
    '일상': 'Daily',
    '생활': 'Life',
    '혁신': 'Innovation',
    '미래': 'Future',
    '학습': 'Learning',
    '지식': 'Knowledge',
    '공부': 'Study',
    '성공': 'Success',
    '창업': 'Startup',
    '투자': 'Investment',
    '웰빙': 'Wellness',
    '운동': 'Exercise',
    '다이어트': 'Diet',
    '레시피': 'Recipe',
    '음식': 'Food',
    '쿠킹': 'Cooking',
    '관광': 'Tourism',
    '휴가': 'Vacation',
    '여행지': 'Travel destination',
    '재미': 'Fun',
    '웃음': 'Laughter',
    '즐거움': 'Joy'
  };
  
  // 텍스트를 단어별로 분리하고 번역
  let translatedText = text;
  
  // 정확한 매칭부터 시도 (긴 구문 우선)
  const sortedKeys = Object.keys(translationDict).sort((a, b) => b.length - a.length);
  
  for (const korean of sortedKeys) {
    const english = translationDict[korean];
    const regex = new RegExp(korean, 'g');
    translatedText = translatedText.replace(regex, english);
  }
  
  // AI 스타일 문장 구조 개선
  translatedText = improveEnglishStructure(translatedText);
  
  return translatedText;
}

// 영어 문장 구조 개선 함수
function improveEnglishStructure(text) {
  // 기본적인 문장 구조 개선
  let improved = text;
  
  // 일반적인 패턴 개선
  improved = improved.replace(/really amazing/g, 'absolutely amazing');
  improved = improved.replace(/really useful/g, 'incredibly useful');
  improved = improved.replace(/Good to know useful/g, 'Useful to know');
  improved = improved.replace(/Must know amazing/g, 'Amazing things you must know');
  improved = improved.replace(/Technology story/g, 'Tech insights');
  improved = improved.replace(/Education story/g, 'Educational content');
  improved = improved.replace(/Business story/g, 'Business insights');
  improved = improved.replace(/Health story/g, 'Health tips');
  improved = improved.replace(/Lifestyle story/g, 'Lifestyle tips');
  improved = improved.replace(/Cooking story/g, 'Cooking guide');
  improved = improved.replace(/Travel story/g, 'Travel guide');
  
  // 문장 시작 개선
  improved = improved.replace(/^really/i, 'This is really');
  improved = improved.replace(/^amazing/i, 'This is amazing');
  improved = improved.replace(/^Wow amazing/i, 'Wow! This is amazing');
  
  // 마무리 개선
  improved = improved.replace(/like subscribe please/g, 'please like and subscribe');
  improved = improved.replace(/If this helped like/g, 'If this helped, please like');
  improved = improved.replace(/more information if you want to know like subscribe/g, 'for more information, please like and subscribe');
  
  // 첫 글자 대문자 처리
  improved = improved.charAt(0).toUpperCase() + improved.slice(1);
  
  return improved;
}

// AI 동영상 프롬프트 생성 API
app.post('/api/generate-video-prompts', async (req, res) => {
  try {
    console.log('🎬 AI 동영상 프롬프트 생성 요청 처리 중...');
    const { title, content, category, targetRegion = 'korea' } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: '제목과 내용이 필요합니다.'
      });
    }
    
    // Claude AI로 비주얼 프롬프트 생성
    const videoPrompts = await generateVisualPromptsWithClaude(title, content, category, targetRegion);
    
    res.json({
      success: true,
      data: videoPrompts,
      message: 'AI 동영상 프롬프트 생성 완료!'
    });
    
  } catch (error) {
    console.error('AI 동영상 프롬프트 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Claude AI 기반 비주얼 프롬프트 생성
async function generateVisualPromptsWithClaude(title, content, category, targetRegion) {
  try {
    // 대한민국 타겟용 스타일 (정보전달 중심)
    const koreanVisualStyles = {
      '기술': 'clean infographic style, text overlays, data visualization, Korean UI elements, clear charts and diagrams',
      '교육': 'educational infographics, step-by-step visual guides, Korean textbooks style, clear bullet points',
      '라이프스타일': 'Korean home interior, lifestyle infographics, practical tips visualization, clean Korean typography',
      '비즈니스': 'Korean corporate presentation style, professional charts, business infographics, clean layouts',
      '건강': 'health information graphics, Korean medical style, clear instruction diagrams, safety guidelines',
      '요리': 'Korean cooking tutorial style, recipe infographics, ingredient lists, step-by-step cooking process',
      '여행': 'Korean travel guides, location information overlays, map graphics, travel tips visualization',
      '엔터테인먼트': 'Korean entertainment show style, subtitle-heavy, variety show graphics, information pop-ups'
    };
    
    // 해외 타겟용 스타일 (감정어필 중심)
    const globalVisualStyles = {
      '기술': 'cinematic tech thriller, dramatic lighting, character interaction with technology, emotional tech journey',
      '교육': 'inspiring learning journey, character transformation, motivational storytelling, breakthrough moments',
      '라이프스타일': 'aspirational lifestyle, character-driven narrative, emotional transformation, relatable struggles',
      '비즈니스': 'success story narrative, entrepreneur journey, dramatic business moments, character development',
      '건강': 'fitness transformation story, inspiring health journey, character overcoming challenges, victory moments',
      '요리': 'emotional cooking story, family connections through food, cultural food journey, taste reactions',
      '여행': 'adventure storytelling, cultural discovery, emotional travel moments, character growth through travel',
      '엔터테인먼트': 'high-energy entertainment, character interactions, comedic timing, dramatic reveals'
    };

    const visualStyles = targetRegion === 'korea' ? koreanVisualStyles : globalVisualStyles;
    const visualStyle = visualStyles[category] || (targetRegion === 'korea' ? 'clean informational graphics with Korean text' : 'character-driven narrative with emotional appeal');

    let prompt;
    
    if (targetRegion === 'korea') {
      // 대한민국 타겟: 자막/이미지/정보전달 중심
      prompt = `Create professional AI video generation prompts for Korean audience focusing on informational content delivery.

Title: ${title}
Content: ${content}
Category: ${category}
Target: Korean audience (information-focused)

Generate JSON response:
{
  "mainVisualPrompt": "Main visual prompt for subtitle-heavy, information-delivery video style",
  "shotPrompts": [
    {
      "type": "info_intro",
      "duration": 5,
      "visualPrompt": "Clear information title card with Korean text overlays",
      "cameraAngle": "Static centered composition",
      "mood": "Professional, informative",
      "subtitleContent": "Main title and key points display"
    },
    {
      "type": "content_delivery",
      "duration": 45,
      "visualPrompt": "Image sequence with text overlays explaining content",
      "cameraAngle": "Clean cuts between informational slides",
      "mood": "Educational, clear",
      "subtitleContent": "Detailed information with bullet points"
    },
    {
      "type": "summary_outro",
      "duration": 10,
      "visualPrompt": "Summary screen with key takeaways",
      "cameraAngle": "Static conclusion card",
      "mood": "Conclusive, helpful",
      "subtitleContent": "Summary points and call-to-action"
    }
  ],
  "technicalSettings": "9:16 vertical, 4K, 30fps, optimized for subtitle readability",
  "styleGuide": "${visualStyle}, Korean typography, clear information hierarchy",
  "audioApproach": "Clear Korean narration with subtitle synchronization",
  "textOverlays": ["Key information points to display as subtitles"],
  "imageSequence": ["Required images/graphics for information delivery"]
}

Requirements:
1. Focus on ${visualStyle}
2. Optimize for Korean subtitle readability
3. Information-first approach over entertainment
4. Clear, educational visual progression
5. Professional Korean content standards`;
      
    } else {
      // 해외 타겟: 캐릭터/감정/심리자극 중심
      prompt = `Create compelling AI video generation prompts for international audience focusing on psychological engagement and character-driven storytelling.

Title: ${title}
Content: ${content}
Category: ${category}
Target: International audience (emotion-focused)

Generate JSON response:
{
  "mainVisualPrompt": "Character-driven visual narrative with strong emotional appeal",
  "shotPrompts": [
    {
      "type": "emotional_hook",
      "duration": 3,
      "visualPrompt": "Powerful opening with character or situation that immediately grabs attention",
      "cameraAngle": "Dynamic close-up or dramatic reveal",
      "mood": "Intriguing, emotionally charged",
      "psychologicalTrigger": "Curiosity gap or emotional hook"
    },
    {
      "type": "story_development",
      "duration": 50,
      "visualPrompt": "Character journey with emotional ups and downs",
      "cameraAngle": "Varied angles following character emotions",
      "mood": "Emotionally engaging progression",
      "psychologicalTrigger": "Empathy, relatability, tension"
    },
    {
      "type": "powerful_conclusion",
      "duration": 7,
      "visualPrompt": "Satisfying resolution or thought-provoking ending",
      "cameraAngle": "Impactful final shot",
      "mood": "Memorable, emotionally satisfying",
      "psychologicalTrigger": "Resolution, inspiration, or curiosity for more"
    }
  ],
  "technicalSettings": "9:16 vertical, 4K, 30fps, cinematic quality",
  "styleGuide": "${visualStyle}, emotionally resonant visuals, universal appeal",
  "characterElements": ["Main character traits and emotional journey"],
  "psychologicalHooks": ["Human psychology triggers used"],
  "emotionalBeats": ["Key emotional moments throughout video"],
  "universalThemes": ["Themes that resonate across cultures"]
}

Requirements:
1. Emphasize ${visualStyle}
2. Focus on character and emotion over information
3. Use universal human psychology
4. Create viral-potential emotional content
5. Minimize text, maximize visual storytelling`;
    }

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].text;
    console.log('Claude 비주얼 프롬프트 응답:', responseText);
    
    // JSON 파싱
    let videoPrompts;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        videoPrompts = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON 형식을 찾을 수 없음');
      }
    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError);
      // 파싱 실패 시 기본 프롬프트 반환
      videoPrompts = generateDefaultVideoPrompts(title, content, category, targetRegion);
    }

    return videoPrompts;

  } catch (error) {
    console.error('Claude 비주얼 프롬프트 API 오류:', error);
    // API 실패 시 기본 프롬프트 반환
    return generateDefaultVideoPrompts(title, content, category, targetRegion);
  }
}

// 기본 비주얼 프롬프트 생성 (백업용)
function generateDefaultVideoPrompts(title, content, category, targetRegion = 'korea') {
  if (targetRegion === 'korea') {
    // 대한민국 타겟: 정보전달 중심
    const koreanStyles = {
      '기술': 'clean tech infographics, Korean UI elements, data charts',
      '교육': 'educational graphics, Korean textbook style, clear diagrams',
      '라이프스타일': 'Korean home setting, lifestyle tips graphics, practical information',
      '비즈니스': 'Korean corporate style, professional charts, business graphics',
      '건강': 'health information graphics, medical diagrams, safety guides',
      '요리': 'Korean cooking tutorial, recipe graphics, ingredient lists',
      '여행': 'Korean travel guide style, location graphics, travel information',
      '엔터테인먼트': 'Korean variety show style, subtitle graphics, entertainment info'
    };

    const style = koreanStyles[category] || 'clean informational graphics with Korean text';

    return {
      mainVisualPrompt: `Korean informational video style, ${style}, subtitle-heavy format, clear information delivery, 9:16 vertical`,
      shotPrompts: [
        {
          type: "info_intro",
          duration: 5,
          visualPrompt: `Korean title card with clear text overlays, ${style}, professional information display`,
          cameraAngle: "Static centered composition for text readability",
          mood: "Professional, informative, trustworthy",
          subtitleContent: "Main title and key information points"
        },
        {
          type: "content_delivery",
          duration: 45,
          visualPrompt: `Information sequence with Korean subtitles, ${style}, educational graphics and text overlays`,
          cameraAngle: "Clean cuts between information slides",
          mood: "Educational, clear, systematic",
          subtitleContent: "Detailed information with bullet points and explanations"
        },
        {
          type: "summary_outro",
          duration: 10,
          visualPrompt: `Korean summary screen with key takeaways, ${style}, conclusion graphics`,
          cameraAngle: "Static conclusion composition",
          mood: "Conclusive, helpful, actionable",
          subtitleContent: "Summary points and call-to-action"
        }
      ],
      technicalSettings: "9:16 aspect ratio, 4K resolution, 30fps, optimized for Korean subtitle readability",
      styleGuide: `Korean information delivery style, ${style}, clear typography hierarchy, professional presentation`,
      audioApproach: "Clear Korean narration synchronized with subtitles",
      textOverlays: ["Key information points", "Step-by-step explanations", "Summary points"],
      imageSequence: ["Title graphics", "Information slides", "Summary visuals"]
    };
    
  } else {
    // 해외 타겟: 감정어필 중심
    const globalStyles = {
      '기술': 'cinematic tech thriller, character tech journey, emotional discovery',
      '교육': 'inspiring transformation story, character learning journey, breakthrough moments',
      '라이프스타일': 'aspirational lifestyle narrative, character transformation, relatable journey',
      '비즈니스': 'success story with character, entrepreneur journey, dramatic business moments',
      '건강': 'fitness transformation story, inspiring health journey, character overcoming obstacles',
      '요리': 'emotional cooking story, cultural food journey, family connections through food',
      '여행': 'adventure narrative, cultural discovery story, emotional travel moments',
      '엔터테인먼트': 'high-energy character interactions, comedic moments, dramatic entertainment'
    };

    const style = globalStyles[category] || 'character-driven emotional narrative';

    return {
      mainVisualPrompt: `International viral-style video, ${style}, character-focused storytelling, emotional engagement, cinematic 9:16 vertical`,
      shotPrompts: [
        {
          type: "emotional_hook",
          duration: 3,
          visualPrompt: `Powerful character-driven opening, ${style}, dramatic lighting, immediate emotional connection`,
          cameraAngle: "Dynamic close-up or dramatic reveal shot",
          mood: "Intriguing, emotionally charged, attention-grabbing",
          psychologicalTrigger: "Curiosity gap and emotional hook"
        },
        {
          type: "story_development",
          duration: 50,
          visualPrompt: `Character emotional journey, ${style}, visual storytelling, relatable struggles and growth`,
          cameraAngle: "Varied angles following character emotions and story beats",
          mood: "Emotionally engaging, relatable, inspiring progression",
          psychologicalTrigger: "Empathy, relatability, emotional investment"
        },
        {
          type: "powerful_conclusion",
          duration: 7,
          visualPrompt: `Satisfying emotional resolution, ${style}, inspiring or thought-provoking ending`,
          cameraAngle: "Impactful final shot with emotional weight",
          mood: "Memorable, emotionally satisfying, inspiring",
          psychologicalTrigger: "Resolution, inspiration, desire for more content"
        }
      ],
      technicalSettings: "9:16 aspect ratio, 4K resolution, 30fps, cinematic quality for viral potential",
      styleGuide: `International viral content style, ${style}, emotionally resonant visuals, universal appeal`,
      characterElements: ["Relatable main character", "Clear emotional arc", "Universal struggles"],
      psychologicalHooks: ["Curiosity gaps", "Emotional triggers", "Social proof"],
      emotionalBeats: ["Opening intrigue", "Character development", "Satisfying resolution"],
      universalThemes: ["Human connection", "Personal growth", "Overcoming challenges"]
    };
  }
}

// Initialize server
shortFormServer.init().then(() => {
  app.listen(PORT, () => {
    console.log('🚀 숏폼 자동화 서버가 시작되었습니다!');
    console.log(`📡 서버 주소: http://localhost:${PORT}`);
    console.log('✨ 웹 인터페이스에서 콘텐츠를 생성해보세요!');
  });
}).catch(console.error);