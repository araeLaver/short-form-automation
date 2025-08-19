import ffmpeg from 'fluent-ffmpeg';
import Jimp from 'jimp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import gtts from 'gtts';
import axios from 'axios';
import cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VideoGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, 'generated-videos');
    this.tempDir = path.join(__dirname, 'temp');
    this.width = 1080;  // YouTube Shorts 9:16 비율
    this.height = 1920;
    this.fps = 30;
  }

  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  async collectRealKoreanNews() {
    try {
      console.log('📰 실제 한국 뉴스 수집 중...');
      
      // 네이버 뉴스 메인 페이지에서 주요 뉴스 수집
      const response = await axios.get('https://news.naver.com/main/main.naver?mode=LSD&mid=shm&sid1=001');
      const $ = cheerio.load(response.data);
      
      const articles = [];
      
      // 주요 뉴스 헤드라인 수집
      $('.cluster_text_headline').each((i, elem) => {
        if (i < 5) { // 상위 5개만
          const title = $(elem).text().trim();
          const link = $(elem).attr('href');
          if (title && title.length > 10) {
            articles.push({
              title: title,
              link: link,
              summary: title.length > 100 ? title.substring(0, 100) + '...' : title,
              category: '뉴스'
            });
          }
        }
      });

      if (articles.length === 0) {
        // 백업: 더미 뉴스 데이터
        return [{
          title: "AI 기술이 바꾸는 우리의 일상생활",
          summary: "인공지능 기술의 발전으로 스마트폰, 자동차, 가전제품 등 일상생활 곳곳에서 AI가 활용되고 있습니다. 특히 음성인식과 이미지 처리 기술이 크게 발전하면서 더욱 편리한 생활이 가능해졌습니다.",
          category: "기술"
        }];
      }

      console.log(`✅ ${articles.length}개 뉴스 수집 완료`);
      return articles;
    } catch (error) {
      console.error('뉴스 수집 실패:', error);
      // 백업 데이터
      return [{
        title: "최신 뉴스 업데이트",
        summary: "오늘의 주요 이슈를 간단하게 정리해드립니다. 경제, 정치, 사회 전반의 주요 소식들을 확인해보세요.",
        category: "종합"
      }];
    }
  }

  async generateTTS(text, filename) {
    return new Promise((resolve, reject) => {
      const tts = new gtts(text, 'ko');
      const audioPath = path.join(this.tempDir, filename);
      
      tts.save(audioPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`🎵 음성 파일 생성: ${filename}`);
          resolve(audioPath);
        }
      });
    });
  }

  async createNewsVideo(newsData) {
    try {
      await this.init();
      
      console.log('🎬 뉴스 비디오 생성 시작...');
      
      // 1. 스크립트 생성
      const script = this.generateNewsScript(newsData);
      
      // 2. 음성 생성
      const audioPath = await this.generateTTS(script.fullText, `news-audio-${Date.now()}.mp3`);
      
      // 3. 시각적 요소 생성
      const backgroundImages = await this.createNewsBackgrounds(newsData, script);
      
      // 4. 비디오 합성
      const videoPath = await this.composeNewsVideo(backgroundImages, audioPath, script);
      
      console.log('✅ 뉴스 비디오 생성 완료!');
      return {
        videoPath: videoPath,
        script: script,
        duration: script.estimatedDuration
      };
      
    } catch (error) {
      console.error('비디오 생성 실패:', error);
      throw error;
    }
  }

  generateNewsScript(newsData) {
    const title = newsData.title;
    const summary = newsData.summary;
    
    // 60초 이내의 스크립트 구성
    const hook = `${newsData.category} 속보입니다!`;
    const mainContent = `${title}. ${summary}`;
    const closing = "더 많은 뉴스는 구독과 좋아요 부탁드립니다!";
    
    const fullText = `${hook} ${mainContent} ${closing}`;
    
    return {
      hook: hook,
      title: title,
      mainContent: mainContent,
      closing: closing,
      fullText: fullText,
      estimatedDuration: Math.min(Math.max(fullText.length * 0.1, 15), 60), // 15-60초 사이
      scenes: [
        { text: hook, duration: 3, type: 'hook' },
        { text: title, duration: 5, type: 'title' },
        { text: summary, duration: 45, type: 'content' },
        { text: closing, duration: 7, type: 'closing' }
      ]
    };
  }

  async createNewsBackgrounds(newsData, script) {
    const backgrounds = [];
    
    for (let i = 0; i < script.scenes.length; i++) {
      const scene = script.scenes[i];
      const imagePath = path.join(this.tempDir, `bg-${i}-${Date.now()}.png`);
      
      // Jimp로 배경 이미지 생성
      const image = new Jimp(this.width, this.height, 0x000000ff);
      
      // 배경색 선택
      let bgColor;
      switch (scene.type) {
        case 'hook':
          bgColor = 0xFF6B6BFF;
          break;
        case 'title':
          bgColor = 0x667eeaFF;
          break;
        case 'content':
          bgColor = 0xf093fbFF;
          break;
        case 'closing':
          bgColor = 0x4facfeFF;
          break;
        default:
          bgColor = 0x333333FF;
      }
      
      // 단색 배경
      image.color([{ apply: 'mix', params: { color: bgColor, opacity: 1 } }]);
      
      // 간단한 그라데이션 효과
      for (let y = 0; y < this.height; y++) {
        const opacity = 1 - (y / this.height) * 0.3;
        for (let x = 0; x < this.width; x++) {
          const currentColor = image.getPixelColor(x, y);
          const newColor = Jimp.intToRGBA(currentColor);
          newColor.a = Math.floor(opacity * 255);
          image.setPixelColor(Jimp.rgbaToInt(newColor.r, newColor.g, newColor.b, newColor.a), x, y);
        }
      }
      
      // 카테고리 배지를 위한 사각형 (상단)
      if (scene.type === 'title' || scene.type === 'hook') {
        const badgeX = this.width / 2 - 150;
        const badgeY = 80;
        const badgeWidth = 300;
        const badgeHeight = 60;
        
        for (let y = badgeY; y < badgeY + badgeHeight; y++) {
          for (let x = badgeX; x < badgeX + badgeWidth; x++) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
              image.setPixelColor(0xFFFFFFCC, x, y);
            }
          }
        }
      }
      
      // 이미지 저장
      await image.writeAsync(imagePath);
      
      backgrounds.push({
        path: imagePath,
        duration: scene.duration,
        scene: scene,
        text: scene.text
      });
    }
    
    return backgrounds;
  }

  async composeNewsVideo(backgrounds, audioPath, script) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(this.outputDir, `news-video-${Date.now()}.mp4`);
      
      console.log('🎥 비디오 합성 시작...');
      
      // FFmpeg 명령어 구성
      const command = ffmpeg();
      
      // 배경 이미지들을 순서대로 추가
      backgrounds.forEach((bg, index) => {
        command.input(bg.path).loop(bg.duration);
      });
      
      // 오디오 추가
      command.input(audioPath);
      
      // 복잡한 필터로 장면 전환 효과 생성
      const filterComplex = [];
      let currentTime = 0;
      
      backgrounds.forEach((bg, index) => {
        const nextTime = currentTime + bg.duration;
        
        // 각 이미지를 비디오로 변환
        filterComplex.push(
          `[${index}:v]scale=${this.width}:${this.height}:force_original_aspect_ratio=decrease,` +
          `pad=${this.width}:${this.height}:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS,` +
          `setsar=1[v${index}]`
        );
        
        currentTime = nextTime;
      });
      
      // 비디오 연결
      const videoInputs = backgrounds.map((_, index) => `[v${index}]`).join('');
      filterComplex.push(`${videoInputs}concat=n=${backgrounds.length}:v=1:a=0[outv]`);
      
      command
        .complexFilter(filterComplex)
        .outputOptions([
          '-map', '[outv]',
          '-map', `${backgrounds.length}:a`, // 오디오 매핑
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-crf', '23',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-ar', '44100',
          '-shortest', // 오디오 길이에 맞춤
          '-movflags', '+faststart'
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg 명령어:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`진행률: ${Math.round(progress.percent || 0)}%`);
        })
        .on('end', () => {
          console.log('✅ 비디오 합성 완료!');
          // 임시 파일 정리
          this.cleanup(backgrounds.map(bg => bg.path).concat([audioPath]));
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('FFmpeg 오류:', err);
          reject(err);
        })
        .run();
    });
  }

  async cleanup(files) {
    for (const file of files) {
      try {
        await fs.unlink(file);
        console.log(`🗑️ 임시 파일 삭제: ${path.basename(file)}`);
      } catch (error) {
        // 파일이 이미 없거나 삭제할 수 없는 경우 무시
      }
    }
  }
}

export { VideoGenerator };