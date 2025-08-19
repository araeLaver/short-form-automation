// 쇼츠 전용 스크립트 생성기 - 실제 사용 가능한 시스템
class ShortsScriptGenerator {
    constructor() {
        // 실제 바이럴된 쇼츠 패턴 분석 기반
        this.viralHooks = {
            tech: [
                "이 AI 기술 하나가 모든걸 바꿀 예정입니다",
                "99%가 모르는 숨겨진 기술의 비밀",
                "3초 후 당신의 생각이 완전히 바뀝니다",
                "이게 진짜라고? 믿기지 않는 기술력",
                "전문가들이 충격받은 혁신 기술"
            ],
            business: [
                "이 방법으로 월 천만원 벌었습니다",
                "95%가 실패하는 진짜 이유",
                "부자들만 아는 돈의 비밀",
                "10분 안에 수익 구조를 바꾸세요",
                "이것만 알면 당신도 성공합니다"
            ],
            lifestyle: [
                "하루 5분으로 인생이 바뀝니다",
                "이 습관 하나가 모든걸 결정합니다",
                "성공하는 사람들의 아침 루틴",
                "당신이 몰랐던 놀라운 사실",
                "시도해보면 중독되는 방법"
            ],
            news: [
                "방금 일어난 충격적인 사건",
                "모든 언론이 주목하는 이슈",
                "이게 진짜 뉴스입니다",
                "당신이 꼭 알아야 할 소식",
                "세상을 바꿀 뉴스 속보"
            ]
        };

        this.scriptStructure = {
            hook: { duration: "0-3초", purpose: "시청자 멈추게 하기" },
            problem: { duration: "3-8초", purpose: "문제점 제시" },
            solution: { duration: "8-45초", purpose: "해결책/정보 전달" },
            cta: { duration: "45-60초", purpose: "구독/좋아요 유도" }
        };

        this.videoPromptStyles = [
            "close-up talking head, direct eye contact, dramatic lighting",
            "fast-paced montage with text overlays and transitions",
            "before and after comparison shots with split screen",
            "hands-on demonstration with clear product focus",
            "lifestyle scenes with aspirational cinematography"
        ];
    }

    // 메인 생성 함수 - 쇼츠에 바로 쓸 수 있는 스크립트
    generateShortsContent(content, options = {}) {
        const { theme = 'auto', tone = 'engaging', targetLength = 60 } = options;
        
        // 1. 콘텐츠 분석 및 테마 감지
        const detectedTheme = theme === 'auto' ? this.detectContentTheme(content) : theme;
        
        // 2. 핵심 메시지 추출
        const coreMessage = this.extractCoreMessage(content);
        
        // 3. 쇼츠 스크립트 생성
        const script = this.createShortsScript(coreMessage, detectedTheme, targetLength);
        
        // 4. AI 동영상 프롬프트 생성
        const videoPrompts = this.generateVideoPrompts(coreMessage, detectedTheme);
        
        // 5. 메타데이터 생성
        const metadata = this.generateMetadata(coreMessage, detectedTheme);
        
        return {
            script,
            videoPrompts,
            metadata,
            theme: detectedTheme,
            estimatedViralScore: this.calculateViralScore(script, detectedTheme)
        };
    }

    // 콘텐츠 테마 정확히 감지
    detectContentTheme(content) {
        const text = content.toLowerCase();
        
        const patterns = {
            tech: /ai|artificial intelligence|technology|digital|automation|robot|tech|innovation|software|앱|기술|디지털|인공지능/g,
            business: /money|business|profit|revenue|marketing|sales|startup|entrepreneur|investment|돈|사업|마케팅|수익/g,
            lifestyle: /health|fitness|lifestyle|habit|productivity|wellness|morning|routine|건강|습관|라이프스타일|생산성/g,
            news: /news|breaking|report|politics|economy|government|president|뉴스|정치|경제|사회|정부/g
        };

        let maxScore = 0;
        let detectedTheme = 'lifestyle';

        Object.entries(patterns).forEach(([theme, pattern]) => {
            const matches = (text.match(pattern) || []).length;
            if (matches > maxScore) {
                maxScore = matches;
                detectedTheme = theme;
            }
        });

        return detectedTheme;
    }

    // 핵심 메시지 추출 - 실제 콘텐츠 기반으로
    extractCoreMessage(content) {
        // 실제 텍스트에서 핵심 내용 추출
        const cleanContent = content.replace(/\s+/g, ' ').trim();
        
        // 문장 단위로 분리
        const sentences = cleanContent.split(/[.!?]/).filter(s => s.trim().length > 10);
        
        // 실제 주요 인물, 장소, 사건 추출
        const people = cleanContent.match(/[가-힣]{2,4}(?:\s+[가-힣]{1,3})?(?:\s+(?:대통령|장관|의원|총리|차관|국무총리))/g) || [];
        const places = cleanContent.match(/[가-힣]{2,10}(?:구|시|군|도|광장|센터|청와대|국회)/g) || [];
        const dates = cleanContent.match(/\d{1,2}일|\d{1,2}월\s*\d{1,2}일|지난\s*\d{1,2}일|이날|어제|오늘/g) || [];
        const numbers = cleanContent.match(/\d+[가-힣]*|제\d+[가-힣]*/g) || [];
        
        // 가장 중요한 문장 찾기 (인물/장소/날짜가 들어간)
        let mainPoint = sentences[0] || cleanContent.substring(0, 100);
        for (const sentence of sentences) {
            if (people.some(p => sentence.includes(p)) || 
                places.some(p => sentence.includes(p)) ||
                dates.some(d => sentence.includes(d))) {
                mainPoint = sentence.trim();
                break;
            }
        }

        // 핵심 사실들 추출 (실제 내용 기반)
        const keyFacts = sentences.slice(0, 3).map(s => s.trim()).filter(s => s.length > 15);

        return {
            mainPoint: mainPoint,
            keyFacts: keyFacts.length > 0 ? keyFacts : [cleanContent.substring(0, 150)],
            numbers: numbers.slice(0, 3),
            people: people.slice(0, 2),
            places: places.slice(0, 2),
            dates: dates.slice(0, 2),
            actionItems: this.extractActionableContent(cleanContent)
        };
    }

    // 실행 가능한 내용 추출
    extractActionableContent(content) {
        const actionPatterns = [
            /([가-힣\s]+)(?:한다|했다|할 예정|예정이다|계획이다|방침이다|결정했다)/g,
            /([가-힣\s]+)(?:발표했다|밝혔다|설명했다|강조했다)/g,
            /([가-힣\s]+)(?:추진한다|시행한다|도입한다|개선한다)/g
        ];

        const actions = [];
        for (const pattern of actionPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                actions.push(...matches.slice(0, 2));
            }
        }

        return actions.length > 0 ? actions : ['관련 후속 조치가 예상됩니다'];
    }

    // 실제 콘텐츠 기반 쇼츠 스크립트 생성
    createShortsScript(coreMessage, theme, targetLength) {
        // 실제 콘텐츠에서 훅 만들기
        const realHook = this.createContentBasedHook(coreMessage, theme);

        // 60초 쇼츠 최적화 스크립트
        const script = {
            title: this.generateRelevantTitle(coreMessage, theme),
            
            // 0-3초: 실제 내용 기반 훅
            hook: {
                timestamp: "0-3초",
                text: realHook,
                videoDirection: "뉴스 헤드라인 스타일, 긴급감 있는 화면 구성",
                voiceDirection: "뉴스 앵커처럼 명확하고 신뢰감 있는 톤"
            },

            // 3-8초: 배경 설명
            problem: {
                timestamp: "3-8초", 
                text: this.createContextStatement(coreMessage),
                videoDirection: "관련 장소나 인물 이미지, 간단한 그래픽",
                voiceDirection: "설명하는 톤, 차분하면서 관심 유발"
            },

            // 8-45초: 핵심 사실들
            mainContent: {
                timestamp: "8-45초",
                sections: this.createFactualSections(coreMessage),
                videoDirection: "팩트 체크 스타일, 숫자와 데이터 강조",
                voiceDirection: "명확한 전달, 중요 부분 강조"
            },

            // 45-60초: 의미와 영향
            cta: {
                timestamp: "45-60초",
                text: this.createImpactStatement(coreMessage, theme),
                videoDirection: "결론 정리 화면, 채널 구독 유도",
                voiceDirection: "마무리 톤, 구독 유도"
            },

            // 전체 스크립트 텍스트
            fullScript: this.assembleRealScript(coreMessage, theme)
        };

        return script;
    }

    // 실제 콘텐츠 기반 훅 생성
    createContentBasedHook(coreMessage, theme) {
        if (coreMessage.people.length > 0) {
            return `${coreMessage.people[0]}의 충격적인 발표!`;
        }
        if (coreMessage.numbers.length > 0) {
            return `${coreMessage.numbers[0]}, 이 숫자의 의미는?`;
        }
        if (coreMessage.dates.length > 0) {
            return `${coreMessage.dates[0]} 무슨 일이 일어났을까?`;
        }
        return coreMessage.mainPoint.substring(0, 30) + "!";
    }

    // 배경 설명 생성
    createContextStatement(coreMessage) {
        if (coreMessage.places.length > 0 && coreMessage.dates.length > 0) {
            return `${coreMessage.dates[0]} ${coreMessage.places[0]}에서 벌어진 일입니다.`;
        }
        return "무슨 일이 일어났는지 자세히 알아보겠습니다.";
    }

    // 사실 기반 섹션들 생성
    createFactualSections(coreMessage) {
        const sections = [];
        
        coreMessage.keyFacts.forEach((fact, index) => {
            const timeStart = 8 + (index * 12);
            const timeEnd = Math.min(timeStart + 12, 45);
            
            sections.push({
                timestamp: `${timeStart}-${timeEnd}초`,
                content: fact,
                visual: this.generateRelevantVisual(fact, index),
                emphasis: coreMessage.numbers[index] || null
            });
        });

        return sections.slice(0, 3);
    }

    // 관련성 있는 비주얼 생성
    generateRelevantVisual(fact, index) {
        if (fact.includes('대통령') || fact.includes('정부')) {
            return "청와대 또는 정부청사 외관";
        }
        if (fact.includes('국회') || fact.includes('의원')) {
            return "국회의사당 또는 회의실 장면";
        }
        if (fact.includes('경제') || fact.includes('시장')) {
            return "경제 관련 그래프나 차트";
        }
        return "뉴스 스타일 정보 그래픽";
    }

    // 영향과 의미 설명
    createImpactStatement(coreMessage, theme) {
        return `이 소식이 우리에게 미칠 영향은 무엇일까요? 더 많은 뉴스는 구독 버튼을 눌러주세요!`;
    }

    // 실제 스크립트 조합
    assembleRealScript(coreMessage, theme) {
        let script = `${this.createContentBasedHook(coreMessage, theme)}\n\n`;
        script += `${this.createContextStatement(coreMessage)}\n\n`;
        script += "주요 내용:\n\n";
        
        coreMessage.keyFacts.forEach((fact, index) => {
            script += `${index + 1}. ${fact}\n\n`;
        });

        if (coreMessage.numbers.length > 0) {
            script += `🔢 주요 수치: ${coreMessage.numbers.join(', ')}\n\n`;
        }

        script += `${this.createImpactStatement(coreMessage, theme)}\n\n`;
        script += `#shorts #뉴스 #${theme}`;

        return script;
    }

    // 핵심 섹션 생성
    createMainContentSections(coreMessage, theme) {
        const sections = [];
        
        // 팩트 기반 섹션들
        coreMessage.keyFacts.forEach((fact, index) => {
            const timeStart = 8 + (index * 12);
            const timeEnd = timeStart + 12;
            
            sections.push({
                timestamp: `${timeStart}-${timeEnd}초`,
                content: this.simplifyForShorts(fact),
                visual: this.generateVisualCue(fact, index),
                emphasis: coreMessage.numbers.length > index ? coreMessage.numbers[index] : null
            });
        });

        return sections.slice(0, 3); // 최대 3개 섹션
    }

    // 쇼츠용 간결화 (한글 인코딩 안전)
    simplifyForShorts(text) {
        // 한글이 깨진 경우 원본 텍스트 그대로 사용
        if (text.includes('�') || text.match(/[\uFFFD]/)) {
            return '핵심 내용을 간단히 정리했습니다';
        }
        
        return text
            .replace(/그런데|하지만|따라서|그러므로|또한|그리고/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim()
            .substring(0, 80)
            + (text.length > 80 ? '...' : '');
    }

    // 실제 콘텐츠 기반 AI 동영상 프롬프트 생성
    generateVideoPrompts(coreMessage, theme) {
        // 콘텐츠에 맞는 메인 프롬프트
        let mainPrompt = "news anchor style delivery, professional background";
        
        if (coreMessage.people.length > 0) {
            mainPrompt = `news reporter discussing ${coreMessage.people[0]} latest developments, professional news studio setting`;
        }

        const contentBasedPrompts = {
            main: `${mainPrompt}, clear audio, 4K quality, news broadcast style`,
            
            broll: [
                this.generateLocationPrompt(coreMessage),
                this.generateDataVisualizationPrompt(coreMessage),
                this.generateContextPrompt(coreMessage, theme),
                "news-style lower third graphics, professional presentation"
            ],
            
            thumbnailPrompt: this.generateThumbnailPrompt(coreMessage, theme)
        };

        return contentBasedPrompts;
    }

    // 장소 기반 프롬프트
    generateLocationPrompt(coreMessage) {
        if (coreMessage.places.length > 0) {
            const place = coreMessage.places[0];
            if (place.includes('광화문') || place.includes('청와대')) {
                return "aerial shot of government district in Seoul, professional cinematography";
            }
            if (place.includes('국회')) {
                return "exterior shot of National Assembly building, formal government architecture";
            }
            return `establishing shot of ${place}, urban Korean cityscape, professional filming`;
        }
        return "generic Korean news location, professional news photography style";
    }

    // 데이터 시각화 프롬프트
    generateDataVisualizationPrompt(coreMessage) {
        if (coreMessage.numbers.length > 0) {
            return `animated data visualization showing numbers ${coreMessage.numbers.join(', ')}, clean infographic style, Korean news graphics`;
        }
        return "news-style data graphics, professional Korean broadcasting design";
    }

    // 컨텍스트 프롬프트
    generateContextPrompt(coreMessage, theme) {
        if (theme === 'news' && coreMessage.people.length > 0) {
            return "government official speaking at podium, formal press conference setting";
        }
        if (theme === 'business') {
            return "business district scenes, modern office buildings, economic indicators";
        }
        return "relevant news footage style, professional Korean journalism";
    }

    // 썸네일 프롬프트
    generateThumbnailPrompt(coreMessage, theme) {
        let thumbnailText = "BREAKING NEWS";
        
        if (coreMessage.people.length > 0) {
            thumbnailText = coreMessage.people[0].replace(/\s+(대통령|장관|의원|총리)/, '');
        } else if (coreMessage.numbers.length > 0) {
            thumbnailText = coreMessage.numbers[0];
        }

        return `eye-catching Korean news thumbnail, shocked expression, red BREAKING NEWS banner, "${thumbnailText}" text overlay, professional news graphics style`;
    }

    // 테마별 비주얼
    getThemeVisuals(theme) {
        const visuals = {
            tech: "high-tech environment, screens and devices, futuristic lighting",
            business: "professional office setting, success imagery, luxury items",
            lifestyle: "bright natural lighting, minimalist decor, wellness imagery",
            news: "news studio background, serious professional setting"
        };
        return visuals[theme] || visuals.lifestyle;
    }

    // 메타데이터 생성
    generateMetadata(coreMessage, theme) {
        return {
            title: this.generateRelevantTitle(coreMessage, theme),
            description: this.generateDescription(coreMessage, theme),
            tags: this.generateTags(coreMessage, theme),
            hashtags: this.generateHashtags(theme),
            bestUploadTime: this.getBestUploadTime(theme),
            estimatedCTR: this.estimateCTR(coreMessage, theme)
        };
    }

    // 설명 생성
    generateDescription(coreMessage, theme) {
        const templates = {
            tech: `🚀 ${coreMessage.mainPoint.substring(0, 50)}... 최신 기술 트렌드와 혁신적인 아이디어를 60초로 정리!`,
            business: `💰 ${coreMessage.mainPoint.substring(0, 50)}... 성공하는 사람들의 비즈니스 전략을 공개!`,
            lifestyle: `✨ ${coreMessage.mainPoint.substring(0, 50)}... 인생을 바꾸는 습관과 라이프스타일 팁!`,
            news: `📰 ${coreMessage.mainPoint.substring(0, 50)}... 놓치면 안 되는 중요한 뉴스와 이슈!`
        };
        
        const description = templates[theme] || templates.lifestyle;
        return description + "\n\n#shorts #정보 #꿀팁 #바이럴콘텐츠";
    }

    // 실제 콘텐츠 기반 제목 생성
    generateRelevantTitle(coreMessage, theme) {
        if (coreMessage.people.length > 0) {
            return `${coreMessage.people[0]} 최신 소식 (충격)`;
        }
        
        if (coreMessage.places.length > 0 && coreMessage.dates.length > 0) {
            return `${coreMessage.dates[0]} ${coreMessage.places[0]} 무슨 일?`;
        }

        if (coreMessage.numbers.length > 0) {
            return `${coreMessage.numbers[0]} 이 숫자의 진실`;
        }

        // 메인 포인트에서 핵심 키워드 추출
        const keywords = coreMessage.mainPoint.match(/[가-힣]{2,}/g) || [];
        if (keywords.length > 0) {
            return `${keywords[0]} 관련 중요 소식`;
        }

        return "놓치면 안 되는 최신 뉴스";
    }

    // 유틸리티 함수들
    calculateSentenceImportance(sentence) {
        let score = 0;
        
        // 숫자 포함 (+3점)
        if (/\d+/.test(sentence)) score += 3;
        
        // 강한 형용사 (+2점)
        if (/놀라운|충격적인|혁신적인|amazing|incredible|shocking/i.test(sentence)) score += 2;
        
        // 행동 동사 (+2점)
        if (/해야|필요|중요|방법|tip|how to/i.test(sentence)) score += 2;
        
        // 적절한 길이 (+1점)
        if (sentence.length > 20 && sentence.length < 150) score += 1;
        
        return score;
    }

    extractNumbers(text) {
        const numberMatches = text.match(/\d+(?:,\d{3})*(?:\.\d+)?(?:\s*%|percent|만원|억|천만|hundred|thousand|million|billion)?/g);
        return numberMatches ? numberMatches.slice(0, 3) : [];
    }

    createProblemStatement(mainPoint, theme) {
        const problemTemplates = {
            tech: "기술 발전이 너무 빨라서 따라가기 힘들죠?",
            business: "돈 벌기가 이렇게 어려울 줄 몰랐죠?", 
            lifestyle: "매일 똑같은 루틴에 지치셨나요?",
            news: "뉴스가 너무 많아서 뭐가 중요한지 모르겠죠?"
        };
        return problemTemplates[theme] || "이런 고민 해본 적 있으신가요?";
    }

    createCTA(theme) {
        return "이 정보가 도움됐다면 좋아요👍 구독🔔 알림설정까지! 더 많은 꿀팁이 궁금하다면 댓글로 알려주세요!";
    }

    assembleFullScript(hook, coreMessage, theme) {
        return `${hook}

${this.createProblemStatement(coreMessage.mainPoint, theme)}

핵심 포인트 3가지:

1️⃣ ${coreMessage.keyFacts[0] || '첫 번째 핵심사실'}

2️⃣ ${coreMessage.keyFacts[1] || '두 번째 핵심사실'} 

3️⃣ ${coreMessage.keyFacts[2] || '세 번째 핵심사실'}

${coreMessage.numbers.length > 0 ? `📊 주목할 수치: ${coreMessage.numbers.join(', ')}` : ''}

${this.createCTA(theme)}

#shorts #${theme} #정보`;
    }

    // 실제 콘텐츠 기반 태그 생성
    generateTags(coreMessage, theme) {
        const tags = ["shorts", "뉴스"];
        
        // 인물 기반 태그
        if (coreMessage.people.length > 0) {
            coreMessage.people.forEach(person => {
                const name = person.replace(/\s+(대통령|장관|의원|총리|차관)/g, '');
                tags.push(name);
            });
        }

        // 장소 기반 태그
        if (coreMessage.places.length > 0) {
            coreMessage.places.forEach(place => {
                tags.push(place.replace(/(구|시|군|도|광장|센터)$/g, ''));
            });
        }

        // 테마 기반 태그
        if (theme === 'news') tags.push("속보", "정치");
        if (theme === 'business') tags.push("경제", "시장");
        if (theme === 'tech') tags.push("기술", "IT");
        
        return tags.slice(0, 8);
    }

    // 실제 콘텐츠 기반 해시태그 생성
    generateHashtags(theme) {
        const baseHashtags = ["#shorts", "#뉴스"];
        
        const themeHashtags = {
            news: ["#속보", "#정치", "#사회", "#이슈"],
            business: ["#경제", "#시장", "#비즈니스", "#정책"],
            tech: ["#기술", "#IT", "#혁신", "#디지털"],
            lifestyle: ["#생활", "#정보", "#꿀팁", "#일상"]
        };
        
        const relevantHashtags = themeHashtags[theme] || themeHashtags.news;
        return [...baseHashtags, ...relevantHashtags];
    }

    getBestUploadTime(theme) {
        // 테마별 최적 업로드 시간
        const times = {
            tech: "오후 7-9시 (퇴근 후 기술 관심층)",
            business: "오전 8-10시, 오후 6-8시 (직장인 출퇴근 시간)",
            lifestyle: "오후 12-2시, 저녁 8-10시 (점심/저녁 시간)",
            news: "오전 7-9시, 오후 6-7시 (뉴스 타임)"
        };
        return times[theme] || times.lifestyle;
    }

    estimateCTR(coreMessage, theme) {
        let score = 5; // 기본 5%
        
        if (coreMessage.numbers.length > 0) score += 2;
        if (theme === 'business' || theme === 'tech') score += 1;
        if (coreMessage.mainPoint.includes('비밀') || coreMessage.mainPoint.includes('secret')) score += 3;
        
        return Math.min(score, 15); // 최대 15%
    }

    // 비주얼 큐 생성
    generateVisualCue(fact, index) {
        const visualTypes = [
            "텍스트 오버레이와 함께 화면 전환",
            "인포그래픽 애니메이션으로 데이터 표시",
            "클로즈업 샷에서 제품/개념 강조",
            "빠른 몽타주 컷으로 핵심 포인트 시각화",
            "분할 화면으로 비교 효과 연출"
        ];
        return visualTypes[index % visualTypes.length];
    }

    calculateViralScore(script, theme) {
        let score = 0;
        
        // 훅의 강도
        if (script.hook.text.includes('충격') || script.hook.text.includes('비밀')) score += 20;
        
        // 구조적 완성도
        if (script.mainContent.sections.length === 3) score += 15;
        
        // 테마별 가산점
        if (theme === 'business' || theme === 'tech') score += 10;
        
        // CTA 포함
        if (script.cta.text.includes('좋아요') && script.cta.text.includes('구독')) score += 10;
        
        return Math.min(score + 45, 100); // 기본 45점 + 가산점, 최대 100점
    }
}

export default ShortsScriptGenerator;