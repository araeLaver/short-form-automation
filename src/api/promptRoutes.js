import express from 'express';
import ShortsScriptGenerator from '../services/shortsScriptGenerator.js';

const router = express.Router();

const shortsGenerator = new ShortsScriptGenerator();

// 쇼츠 전용 콘텐츠 생성 API
router.post('/generate-prompts', async (req, res) => {
    try {
        const { text, theme = 'auto', tone = 'engaging', targetLength = 60 } = req.body;

        if (!text) {
            return res.status(400).json({ 
                error: '콘텐츠를 입력해주세요 (기사, URL 내용 등)' 
            });
        }

        console.log('쇼츠 스크립트 생성 요청:', { 
            textLength: text.length, 
            theme,
            targetLength
        });

        // 쇼츠용 스크립트 내용 생성
        const result = shortsGenerator.generateShortsContent(text, {
            theme,
            tone,
            targetLength
        });

        // 결과를 사용하기 쉬운 형태로 변환
        const formattedResult = {
            // AI 동영상 프롬프트
            prompts: {
                image: [], // 이미지는 사용하지 않음
                video: [
                    result.videoPrompts.main,
                    ...result.videoPrompts.broll
                ]
            },
            // 바로 사용 가능한 쇼츠 스크립트
            shortsScript: result.script,
            // 업로드용 메타데이터
            metadata: result.metadata,
            // 바이럴 예상 점수
            viralScore: result.estimatedViralScore,
            // 키워드 및 해시태그
            keywords: result.metadata.tags,
            hashtags: result.metadata.hashtags,
            // 요약 (전체 스크립트)
            summary: result.script.fullScript,
            // 대본 (시간대별 상세)
            videoScript: formatDetailedScript(result.script)
        };

        res.json({
            success: true,
            data: formattedResult
        });

    } catch (error) {
        console.error('쇼츠 콘텐츠 생성 오류:', error);
        res.status(500).json({ 
            error: '쇼츠 콘텐츠 생성 중 오류가 발생했습니다',
            details: error.message 
        });
    }
});

// 상세 스크립트 포맷팅 함수 - 깔끔하게 읽기 쉽도록 개선
function formatDetailedScript(script) {
    const sectionsText = script.mainContent.sections.map((section, index) => 
        `${index + 1}️⃣ ${section.timestamp}
💬 "${section.content}"
📺 ${section.visual}
${section.emphasis ? `⚡ 강조: ${section.emphasis}` : ''}
`).join('\n');

    return `🎬 **쇼츠 대본 (60초 완전판)**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 **${script.hook.timestamp} | 훅 (시청자 멈추게 하기)**
🎭 "${script.hook.text}"
📹 영상: ${script.hook.videoDirection}
🎤 음성: ${script.hook.voiceDirection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ **${script.problem.timestamp} | 문제 제시 (공감대 형성)**
🎭 "${script.problem.text}"
📹 영상: ${script.problem.videoDirection}  
🎤 음성: ${script.problem.voiceDirection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 **${script.mainContent.timestamp} | 핵심 내용**
${sectionsText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 **${script.cta.timestamp} | 행동 유도**
🎭 "${script.cta.text}"
📹 영상: ${script.cta.videoDirection}
🎤 음성: ${script.cta.voiceDirection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 **완성된 쇼츠 스크립트**

${script.fullScript.replace(/\n\n/g, '\n\n📌 ')}`;
}

// 양방향 번역 API
router.post('/translate', async (req, res) => {
    try {
        const { data, targetLang = 'ko' } = req.body;

        if (!data) {
            return res.status(400).json({ 
                error: '번역할 데이터가 필요합니다' 
            });
        }

        console.log(`${targetLang} 번역 요청`);

        // 번역 처리
        const translatedData = await translateContent(data, targetLang);

        res.json({
            success: true,
            data: translatedData
        });

    } catch (error) {
        console.error('번역 오류:', error);
        res.status(500).json({ 
            error: '번역 중 오류가 발생했습니다',
            details: error.message 
        });
    }
});

// 양방향 번역 함수
async function translateContent(data, targetLang = 'ko') {
    try {
        return {
            prompts: {
                image: data.prompts?.image?.map(prompt => translatePrompt(prompt, targetLang, 'image')) || getDefaultPrompts(targetLang, 'image'),
                video: data.prompts?.video?.map(prompt => translatePrompt(prompt, targetLang, 'video')) || getDefaultPrompts(targetLang, 'video')
            },
            keywords: data.keywords?.map(k => translateKeyword(k, targetLang)) || getDefaultKeywords(targetLang),
            hashtags: [
                ...(data.hashtags || []),
                "#AI아트", "#디지털아트", "#창작", "#트렌딩", "#바이럴"
            ],
            summary: translateSummary(data.summary, targetLang),
            videoScript: translateVideoScript(data.videoScript, targetLang),
            shareableLinks: {
                description: data.shareableLinks?.description ? `${data.shareableLinks.description} - AI 생성 콘텐츠` : "AI 생성 창작 콘텐츠",
                suggestedTitle: data.shareableLinks?.suggestedTitle ? translateTitle(data.shareableLinks.suggestedTitle) : "놀라운 AI 콘텐츠 생성"
            }
        };
    } catch (error) {
        console.error('번역 처리 오류:', error);
        return {
            prompts: {
                image: ["드라마틱한 조명의 시네마틱 장면"],
                video: ["부드러운 카메라 움직임"]
            },
            keywords: ["AI", "콘텐츠"],
            hashtags: ["#AI아트"],
            summary: "AI 생성 콘텐츠",
            videoScript: "🔥 놀라운 콘텐츠!",
            shareableLinks: {
                description: "AI 창작",
                suggestedTitle: "AI 작품"
            }
        };
    }
}

// 양방향 번역 헬퍼 함수들
function translatePrompt(prompt, targetLang, type) {
    if (targetLang === 'en') {
        return translateToEnglish(prompt, type);
    }
    return translateToKorean(prompt, type);
}

function translateToEnglish(prompt, type) {
    // 한국어 -> 영어 번역
    const koToEn = {
        '초현실적인': 'hyperrealistic',
        '디지털 페인팅': 'digital painting',
        '선명한 포커스': 'sharp focus',
        '매우 세밀한': 'highly detailed',
        '전문 조명': 'professional lighting',
        '영화적 구도': 'cinematic composition',
        '수상작': 'award winning',
        '사진술': 'photography',
        '컨셉 아트': 'concept art',
        '걸작': 'masterpiece',
        '드라마틱한 조명': 'dramatic lighting',
        '사실적인': 'photorealistic',
        '스튜디오 사진': 'studio photography',
        '부드러운 카메라': 'smooth camera',
        '움직임': 'movement',
        '시네마틱': 'cinematic',
        '다이나믹한': 'dynamic'
    };
    
    let translated = prompt;
    Object.entries(koToEn).forEach(([kor, eng]) => {
        translated = translated.replace(new RegExp(kor, 'gi'), eng);
    });
    
    return translated;
}

function translateToKorean(prompt, type) {
    const translations = {
        'hyperrealistic': '초현실적인',
        'digital painting': '디지털 페인팅',
        'sharp focus': '선명한 포커스',
        'highly detailed': '매우 세밀한',
        'professional lighting': '전문 조명',
        'cinematic composition': '영화적 구도',
        'award winning': '수상작',
        'photography': '사진술',
        'concept art': '컨셉 아트',
        'masterpiece': '걸작',
        'dramatic lighting': '드라마틱한 조명',
        'photorealistic': '사실적인',
        'studio photography': '스튜디오 사진'
    };
    
    let translated = prompt;
    Object.entries(translations).forEach(([eng, kor]) => {
        translated = translated.replace(new RegExp(eng, 'gi'), kor);
    });
    
    return translated;
}

function translateImagePrompt_legacy(prompt) {
    const translations = {
        'smooth camera': '부드러운 카메라',
        'movement': '움직임',
        'cinematic': '시네마틱',
        'dynamic': '다이나믹한',
        'tracking shot': '트래킹 샷',
        'professional cinematography': '전문 촬영 기법',
        'time-lapse': '타임랩스',
        'smooth transitions': '부드러운 전환',
        'aerial footage': '항공 촬영',
        'documentary style': '다큐멘터리 스타일'
    };
    
    let translated = prompt;
    Object.entries(translations).forEach(([eng, kor]) => {
        translated = translated.replace(new RegExp(eng, 'gi'), kor);
    });
    
    return translated;
}

function translateKeyword(keyword, targetLang = 'ko') {
    if (targetLang === 'en') {
        return translateKeywordToEnglish(keyword);
    }
    return translateKeywordToKorean(keyword);
}

function translateKeywordToEnglish(keyword) {
    const koToEn = {
        '기술': 'technology',
        '디지털': 'digital',
        '혁신': 'innovation',
        '창작': 'creative',
        '콘텐츠': 'content',
        '아트': 'art',
        '디자인': 'design',
        '미래': 'future',
        '현대적인': 'modern',
        '비즈니스': 'business'
    };
    
    return koToEn[keyword] || keyword;
}

function translateKeywordToKorean(keyword) {
    const keywordMap = {
        'technology': '기술',
        'digital': '디지털',
        'innovation': '혁신',
        'creative': '창작',
        'content': '콘텐츠',
        'art': '아트',
        'design': '디자인',
        'future': '미래',
        'modern': '현대적인',
        'business': '비즈니스'
    };
    
    return keywordMap[keyword.toLowerCase()] || keyword;
}

function getDefaultPrompts(targetLang, type) {
    if (targetLang === 'en') {
        return type === 'image' ? 
            ["Hyperrealistic 8K photography with dramatic cinematic lighting", "Award winning digital art masterpiece, trending on artstation"] :
            ["Smooth cinematic camera movement with professional color grading", "Dynamic tracking shot with film-quality cinematography"];
    }
    return type === 'image' ? 
        ["드라마틱한 조명의 초현실적 8K 사진", "아트스테이션 트렌딩 디지털 아트 걸작"] :
        ["전문 컴러 그레이딩의 부드러운 시네마틱 카메라 움직임", "필름 품질 촬영 기법의 다이나믹한 트래킹 샷"];
}

function getDefaultKeywords(targetLang) {
    return targetLang === 'en' ? 
        ["AI", "content", "creative", "digital", "innovation"] :
        ["AI", "콘텐츠", "창작", "디지털", "혁신"];
}

function translateSummary(summary, targetLang = 'ko') {
    if (!summary) return "AI를 활용한 창의적 콘텐츠에 대한 내용입니다.";
    return summary.length > 100 ? summary.substring(0, 100) + "... (AI 생성 콘텐츠)" : summary + " - AI 생성 콘텐츠";
}

function translateVideoScript(script, targetLang = 'ko') {
    if (!script) return "🔥 놀라운 콘텐츠를 확인해보세요!\n\n💡 구독과 좋아요 부탁드려요!";
    
    const koreanScript = script
        .replace(/Hook:/gi, '🎯 훅:')
        .replace(/Main:/gi, '📝 메인:')
        .replace(/CTA:/gi, '📢 행동유도:')
        .replace(/Like and subscribe/gi, '좋아요와 구독')
        .replace(/Comment below/gi, '댓글로 알려주세요');
    
    return koreanScript;
}

function translateTitle(title, targetLang = 'ko') {
    const titleMap = {
        'AMAZING': '놀라운',
        'INCREDIBLE': '믿을 수 없는',
        'MIND-BLOWING': '충격적인',
        'REVEALED': '공개',
        'SECRETS': '비밀',
        'TRUTH': '진실',
        'EVERYTHING': '모든 것'
    };
    
    let translated = title;
    Object.entries(titleMap).forEach(([eng, kor]) => {
        translated = translated.replace(new RegExp(eng, 'gi'), kor);
    });
    
    return translated + ' 🚀';
}

// URL에서 콘텐츠 추출 API
router.post('/extract-from-url', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ 
                error: 'URL이 필요합니다' 
            });
        }

        console.log('URL 콘텐츠 추출 요청:', url);

        // URL 유효성 검사
        let validUrl;
        try {
            validUrl = new URL(url);
        } catch (error) {
            return res.status(400).json({
                error: '올바른 URL 형식이 아닙니다'
            });
        }

        // URL에서 콘텐츠 추출
        const extractedContent = await extractContentFromUrl(validUrl.href);

        res.json({
            success: true,
            data: {
                url: validUrl.href,
                title: extractedContent.title,
                content: extractedContent.content,
                summary: extractedContent.summary
            }
        });

    } catch (error) {
        console.error('URL 추출 오류:', error);
        res.status(500).json({ 
            error: 'URL에서 콘텐츠를 가져오는 중 오류가 발생했습니다',
            details: error.message 
        });
    }
});

// URL에서 콘텐츠 추출 함수
async function extractContentFromUrl(url) {
    try {
        // fetch를 사용하여 웹페이지 가져오기 (한글 인코딩 처리)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // 한글 인코딩을 위해 buffer로 받고 적절히 디코딩
        const buffer = await response.arrayBuffer();
        const decoder = new TextDecoder('utf-8');
        let html = decoder.decode(buffer);
        
        // UTF-8이 깨진 경우 EUC-KR로 시도
        if (html.includes('\uFFFD') || html.includes('ﾟ')) {
            const eucKrDecoder = new TextDecoder('euc-kr');
            html = eucKrDecoder.decode(buffer);
        }
        
        // 간단한 HTML 파싱으로 콘텐츠 추출
        const content = extractTextFromHtml(html);
        
        return {
            title: extractTitle(html),
            content: content,
            summary: generateQuickSummary(content)
        };

    } catch (error) {
        console.error('콘텐츠 추출 실패:', error);
        
        // 실패시 유용한 안내 메시지와 함께 기본 콘텐츠 반환
        const errorMsg = error.name === 'AbortError' ? 
            '⏰ 요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.' :
            error.message.includes('404') ?
            '🔍 페이지를 찾을 수 없습니다 (404). URL을 다시 확인해주세요.' :
            error.message.includes('403') ?
            '🚫 접근이 거부되었습니다 (403). 이 사이트는 봇 접근을 차단합니다.' :
            `❌ ${error.message}`;
            
        return {
            title: '콘텐츠 추출 실패',
            content: `${errorMsg}

🔧 해결 방법:
1. URL이 올바른지 확인해주세요
2. 뉴스 기사나 블로그 포스트 URL을 사용해보세요
3. https:// 가 포함된 전체 URL을 입력해주세요
4. 다른 사이트의 URL로 시도해보세요

💡 또는 아래 텍스트 입력 탭에서 직접 내용을 붙여넣으실 수 있습니다.`,
            summary: '콘텐츠 추출에 실패했습니다. 수동으로 텍스트를 입력해주세요.'
        };
    }
}

// HTML에서 텍스트 추출 (완전 개선된 버전)
function extractTextFromHtml(html) {
    try {
        // 메인 콘텐츠 추출을 위한 더 정교한 파싱
        let cleanedHtml = html;
        
        // 1단계: 불필요한 태그 완전 제거
        cleanedHtml = cleanedHtml
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
            .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
            .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
            .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
            .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '');

        // 2단계: 광고, 사이드바 등 제거 (더 포괄적)
        cleanedHtml = cleanedHtml
            .replace(/<div[^>]*(?:class|id)=["'][^"']*(?:ad|advertisement|banner|sidebar|menu|nav|comment|social|share|related|recommend)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
            .replace(/<section[^>]*(?:class|id)=["'][^"']*(?:ad|advertisement|banner|sidebar|menu|nav|comment|social|share|related|recommend)[^"']*["'][^>]*>[\s\S]*?<\/section>/gi, '');

        // 3단계: 메인 콘텐츠 영역 찾기 (article, main, content 등)
        let mainContent = '';
        const contentSelectors = [
            /<article[^>]*>([\s\S]*?)<\/article>/gi,
            /<main[^>]*>([\s\S]*?)<\/main>/gi,
            /<div[^>]*(?:class|id)=["'][^"']*(?:content|article|post|story|body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
            /<section[^>]*(?:class|id)=["'][^"']*(?:content|article|post|story|body)[^"']*["'][^>]*>([\s\S]*?)<\/section>/gi
        ];

        for (const selector of contentSelectors) {
            const matches = cleanedHtml.match(selector);
            if (matches && matches.length > 0) {
                mainContent = matches.map(match => match.replace(selector, '$1')).join('\n\n');
                if (mainContent.length > 200) break; // 충분한 내용이 있으면 사용
            }
        }

        // 메인 콘텐츠를 찾지 못했으면 전체에서 추출
        if (!mainContent || mainContent.length < 200) {
            mainContent = cleanedHtml;
        }

        // 4단계: 텍스트 추출 및 정리
        let text = mainContent
            // 블록 레벨 요소들을 문단으로 변환
            .replace(/<\/?(h[1-6]|div|section|article|p|li|blockquote)[^>]*>/gi, '\n\n')
            .replace(/<br[^>]*>/gi, '\n')
            // 나머지 HTML 태그 제거
            .replace(/<[^>]+>/g, ' ')
            // HTML 엔티티 디코딩
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/&ldquo;/g, '"')
            .replace(/&rdquo;/g, '"')
            .replace(/&lsquo;/g, "'")
            .replace(/&rsquo;/g, "'")
            .replace(/&mdash;/g, '—')
            .replace(/&ndash;/g, '–')
            .replace(/&hellip;/g, '…')
            .replace(/&#\d+;/g, ' ')
            .replace(/&[a-zA-Z]+;/g, ' ');

        // 5단계: 문단 정리 및 포맷팅
        const paragraphs = text
            .split(/\n+/)
            .map(para => para.trim())
            .filter(para => para.length > 20) // 너무 짧은 문단 제거
            .filter(para => {
                // 네비게이션, 메뉴, 광고성 텍스트 제거
                const skipPatterns = [
                    /^(메뉴|menu|nav|navigation|홈|home|login|로그인|회원가입|subscribe|구독)/i,
                    /^(광고|ad|advertisement|sponsored|후원|제공)/i,
                    /^(관련기사|related|더보기|more|next|이전|previous)/i,
                    /^(댓글|comment|공유|share|좋아요|like)/i,
                    /^[\s\d\-\|\.]+$/, // 숫자, 기호만 있는 줄
                    /^.{1,5}$/  // 너무 짧은 텍스트
                ];
                return !skipPatterns.some(pattern => pattern.test(para));
            })
            .slice(0, 15); // 최대 15개 문단

        // 6단계: 최종 텍스트 조합
        let finalText = paragraphs.join('\n\n')
            .replace(/\s+/g, ' ') // 연속된 공백 정리
            .replace(/\n\s+/g, '\n') // 줄 시작 공백 제거
            .trim();

        // 품질 검증
        if (finalText.length < 100) {
            return '🚨 추출된 콘텐츠가 너무 짧습니다.\n\n💡 팁: 뉴스 기사나 블로그 포스트 URL을 사용해보세요.\n다른 URL을 시도하거나 직접 텍스트를 입력해주세요.';
        }

        // 적절한 길이로 조정
        if (finalText.length > 3000) {
            const sentences = finalText.match(/[^.!?]+[.!?]+/g) || [];
            if (sentences.length > 5) {
                finalText = sentences.slice(0, Math.max(5, Math.floor(sentences.length * 0.7))).join(' ') + '\n\n[기사가 길어서 핵심 내용만 표시됩니다]';
            } else {
                finalText = finalText.substring(0, 3000) + '\n\n[내용이 길어서 일부만 표시됩니다]';
            }
        }

        return finalText;

    } catch (error) {
        console.error('HTML 파싱 오류:', error);
        return '❌ 콘텐츠를 파싱하는 중 오류가 발생했습니다.\n\n다른 URL을 시도하거나 직접 텍스트를 입력해주세요.';
    }
}

// HTML에서 제목 추출
function extractTitle(html) {
    // title 태그에서 제목 추출
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim();
    }

    // h1 태그에서 제목 추출 시도
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match && h1Match[1]) {
        return h1Match[1].trim();
    }

    // og:title 메타 태그에서 추출 시도
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
        return ogTitleMatch[1].trim();
    }

    return '제목을 찾을 수 없습니다';
}

// 빠른 요약 생성
function generateQuickSummary(content) {
    if (!content || content.length < 50) {
        return '요약할 콘텐츠가 부족합니다.';
    }

    // 첫 번째 문단이나 처음 200자 정도를 요약으로 사용
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    if (sentences.length === 0) {
        return content.substring(0, 200) + '...';
    }

    // 첫 2-3개 문장을 요약으로 사용
    const summary = sentences.slice(0, Math.min(3, sentences.length)).join('. ').trim();
    
    return summary.length > 300 ? summary.substring(0, 300) + '...' : summary + '.';
}

export default router;