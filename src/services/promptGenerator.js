import Anthropic from '@anthropic-ai/sdk';

class PromptGenerator {
    constructor() {
        // API 키 확인
        if (!process.env.ANTHROPIC_API_KEY) {
            console.warn('ANTHROPIC_API_KEY not found in environment');
        }
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
    }

    async generatePrompts(text, options = {}) {
        const { 
            type = 'both', // 'image', 'video', or 'both'
            count = 3 
        } = options;

        console.log('API Key 확인:', process.env.ANTHROPIC_API_KEY ? '설정됨' : '없음');

        const systemPrompt = `You are an expert AI content prompt engineer specialized in creating prompts for image and video generation AI models like Stable Diffusion, DALL-E, Midjourney, and AnimateDiff.

Your task is to analyze the given text (article, script, or summary) and generate:
1. Multiple creative prompts for AI image/video generation (${count} high-quality versions in English)
2. Relevant keywords and hashtags for content discovery and SEO
3. A brief summary of the content
4. Generated script/content for short-form videos
5. Shareable links and references

Guidelines for prompts:
- Focus on visual elements, mood, style, and composition
- Include artistic style references ("cinematic", "photorealistic", "hyperrealistic", "digital art", "concept art")
- Add technical details ("8K resolution", "highly detailed", "professional photography", "dramatic lighting")
- Keep prompts concise but highly descriptive (20-50 words each)
- For videos, include motion, camera angles, and temporal elements
- Make prompts optimized for trending AI art styles

Guidelines for keywords:
- Extract main topics and themes
- Include trending hashtags format (#hashtag)
- Add relevant industry/category terms
- Include viral and engagement keywords
- Keep keywords short and searchable

Output format must be valid JSON:
{
    "prompts": {
        "image": ["prompt1", "prompt2", ...],
        "video": ["prompt1", "prompt2", ...]
    },
    "keywords": ["keyword1", "keyword2", ...],
    "hashtags": ["#hashtag1", "#hashtag2", ...],
    "summary": "brief engaging summary",
    "videoScript": "engaging short-form video script with hooks and call-to-actions",
    "shareableLinks": {
        "description": "Brief description for sharing",
        "suggestedTitle": "Catchy title for social media"
    }
}`;

        try {
            console.log('Claude API 호출 시작...');
            const message = await this.anthropic.messages.create({
                model: 'claude-3-haiku-20240307',
                max_tokens: 2000,
                temperature: 0.7,
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: `Please analyze this text and generate ${count} creative prompts and keywords for AI content generation:\n\n${text}`
                }]
            });
            console.log('Claude API 응답 받음');

            const response = message.content[0].text;
            
            // Try to parse JSON from response
            let jsonStart = response.indexOf('{');
            let jsonEnd = response.lastIndexOf('}') + 1;
            
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
                const jsonStr = response.substring(jsonStart, jsonEnd);
                return JSON.parse(jsonStr);
            }
            
            // Fallback if JSON parsing fails
            return {
                prompts: {
                    image: ["Could not generate image prompts"],
                    video: ["Could not generate video prompts"]
                },
                keywords: ["content", "AI", "generated"],
                hashtags: ["#AI", "#content", "#generated"],
                summary: "Could not generate summary",
                videoScript: "Could not generate video script",
                shareableLinks: {
                    description: "AI-generated content",
                    suggestedTitle: "Check out this AI content"
                }
            };
        } catch (error) {
            console.error('프롬프트 생성 상세 오류:', {
                message: error.message,
                status: error.status,
                type: error.type,
                details: error
            });
            
            // 고품질 기본 프롬프트 생성
            return this.generateHighQualityPrompts(text, count);
        }
    }

    // 고품질 프롬프트 생성 (API 없이)
    generateHighQualityPrompts(text, count = 3) {
        // 텍스트에서 주요 키워드 추출
        const keywords = this.extractKeywords(text);
        const theme = this.detectTheme(text);
        
        // 스타일 프리셋
        const imageStyles = [
            "hyperrealistic digital painting, artstation hq, sharp focus, 8k uhd, highly detailed, professional lighting, cinematic composition",
            "award winning photography, professional color grading, soft shadows, clean sharp focus, film grain, National Geographic photo, 85mm lens",
            "concept art masterpiece, trending on artstation, golden ratio composition, dramatic lighting, ultra detailed, painted by greg rutkowski",
            "photorealistic render, octane render, unreal engine 5, ray tracing, volumetric lighting, atmospheric perspective, 8k resolution",
            "studio photography, product shot style, minimalist composition, soft box lighting, professional retouching, commercial quality"
        ];
        
        const videoStyles = [
            "smooth camera dolly movement, cinematic color grading, 24fps, motion blur, depth of field, professional cinematography",
            "dynamic tracking shot, steadicam movement, cinematic lighting, film look, anamorphic lens, blockbuster movie style",
            "time-lapse photography, smooth transitions, day to night cycle, hyperlapse technique, stabilized footage, 4k quality",
            "aerial drone footage, sweeping landscape shots, golden hour lighting, smooth gimbal movements, cinematic reveal",
            "handheld documentary style, natural lighting, authentic movement, cinema verite, observational camera work"
        ];
        
        // 주제별 프롬프트 생성
        const imagePrompts = [];
        const videoPrompts = [];
        
        for (let i = 0; i < count; i++) {
            const style = imageStyles[i % imageStyles.length];
            const videoStyle = videoStyles[i % videoStyles.length];
            
            // 이미지 프롬프트
            if (theme === 'tech') {
                imagePrompts.push(`futuristic ${keywords.join(' ')} visualization, holographic interface, neon lights, cyberpunk aesthetic, ${style}`);
            } else if (theme === 'nature') {
                imagePrompts.push(`breathtaking ${keywords.join(' ')} landscape, natural beauty, environmental photography, ${style}`);
            } else if (theme === 'business') {
                imagePrompts.push(`professional ${keywords.join(' ')} concept, modern office environment, corporate aesthetic, ${style}`);
            } else {
                imagePrompts.push(`${keywords.join(' ')}, creative visualization, artistic interpretation, ${style}`);
            }
            
            // 비디오 프롬프트
            videoPrompts.push(`${keywords.join(' ')} scene, ${videoStyle}, seamless loop, perfect timing`);
        }
        
        // 해시태그 생성
        const hashtags = [
            ...keywords.map(k => `#${k.replace(/\s+/g, '')}`.substring(0, 20)),
            '#AIart', '#digitalart', '#creative', '#trending', '#viral'
        ].slice(0, 10);
        
        // 비디오 스크립트 생성
        const videoScript = this.generateVideoScript(text, keywords);
        
        return {
            prompts: {
                image: imagePrompts,
                video: videoPrompts
            },
            keywords: keywords,
            hashtags: hashtags,
            summary: this.generateSummary(text),
            videoScript: videoScript,
            shareableLinks: {
                description: `${keywords.slice(0, 3).join(', ')} - AI Generated Content`,
                suggestedTitle: this.generateTitle(keywords)
            }
        };
    }
    
    // 키워드 추출
    extractKeywords(text) {
        // 불용어 제거
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were'];
        
        // 단어 추출 및 정제
        const words = text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word));
        
        // 빈도수 계산
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        
        // 상위 키워드 추출
        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([word]) => word);
    }
    
    // 주제 감지
    detectTheme(text) {
        const techWords = ['technology', 'digital', 'ai', 'computer', 'software', 'internet', 'data', 'innovation'];
        const natureWords = ['nature', 'environment', 'forest', 'ocean', 'mountain', 'wildlife', 'earth', 'climate'];
        const businessWords = ['business', 'company', 'market', 'economy', 'finance', 'investment', 'startup', 'corporate'];
        
        const lowerText = text.toLowerCase();
        
        const techCount = techWords.filter(word => lowerText.includes(word)).length;
        const natureCount = natureWords.filter(word => lowerText.includes(word)).length;
        const businessCount = businessWords.filter(word => lowerText.includes(word)).length;
        
        if (techCount > natureCount && techCount > businessCount) return 'tech';
        if (natureCount > techCount && natureCount > businessCount) return 'nature';
        if (businessCount > techCount && businessCount > natureCount) return 'business';
        return 'general';
    }
    
    // 비디오 스크립트 생성
    generateVideoScript(text, keywords) {
        const hook = `🔥 ${keywords[0].toUpperCase()} REVEALED! What you need to know RIGHT NOW...`;
        const main = text.substring(0, 200).replace(/\n/g, ' ');
        const cta = `💡 Want more ${keywords[0]} content? Hit that subscribe button and ring the bell! Drop a comment below with your thoughts!`;
        
        return `HOOK (0-3s):\n${hook}\n\nMAIN CONTENT (3-50s):\n${main}...\n\nCALL TO ACTION (50-60s):\n${cta}\n\n#shorts #${keywords.join(' #')}`;
    }
    
    // 요약 생성
    generateSummary(text) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        return sentences.slice(0, 2).join(' ').substring(0, 200) || text.substring(0, 200) + '...';
    }
    
    // 제목 생성
    generateTitle(keywords) {
        const templates = [
            `${keywords[0]} THAT WILL BLOW YOUR MIND 🤯`,
            `The TRUTH About ${keywords[0]} Nobody Tells You`,
            `${keywords[0]} in 2025: Everything You Need to Know`,
            `Why ${keywords[0]} is CHANGING EVERYTHING`,
            `${keywords[0]} Secrets REVEALED`,
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }
    
    // 이미지 프롬프트 최적화 (Stable Diffusion용)
    optimizeForImage(prompt) {
        const imageModifiers = [
            'highly detailed',
            '8K resolution',
            'professional photography',
            'dramatic lighting',
            'sharp focus',
            'artstation',
            'concept art'
        ];
        
        // 랜덤하게 2-3개 수식어 추가
        const selectedModifiers = imageModifiers
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 2) + 2);
        
        return `${prompt}, ${selectedModifiers.join(', ')}`;
    }

    // 비디오 프롬프트 최적화 (AnimateDiff용)
    optimizeForVideo(prompt) {
        const videoModifiers = [
            'smooth motion',
            'cinematic movement',
            'dynamic camera',
            'fluid animation',
            'seamless loop',
            'natural motion blur'
        ];
        
        const selectedModifiers = videoModifiers
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
        
        return `${prompt}, ${selectedModifiers.join(', ')}`;
    }
}

export default PromptGenerator;