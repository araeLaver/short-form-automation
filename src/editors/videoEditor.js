import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import gtts from 'gtts';
import sharp from 'sharp';
import { logger } from '../utils/logger.js';

export class VideoEditor {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'data', 'videos');
    this.tempDir = path.join(process.cwd(), 'data', 'temp');
    this.templates = {
      news: {
        width: 1080,
        height: 1920,
        fps: 30,
        backgroundColor: '#1a1a1a'
      },
      ai: {
        width: 1080,
        height: 1920,
        fps: 60,
        backgroundColor: '#000000'
      }
    };
  }

  async createNewsVideo(script) {
    try {
      await this.ensureDirectories();
      
      const audioPath = await this.generateTTS(script);
      const backgroundPath = await this.createBackground('news', script);
      const subtitlesPath = await this.generateSubtitles(script);
      
      const outputPath = path.join(
        this.outputDir,
        `news_${Date.now()}.mp4`
      );

      await this.composeVideo({
        audio: audioPath,
        background: backgroundPath,
        subtitles: subtitlesPath,
        output: outputPath,
        template: 'news'
      });

      await this.cleanup([audioPath, backgroundPath, subtitlesPath]);
      
      return outputPath;
    } catch (error) {
      logger.error('Failed to create news video:', error);
      throw error;
    }
  }

  async createAIVideo(content) {
    try {
      await this.ensureDirectories();
      
      const audioPath = await this.generateAIVoiceover(content);
      const visualsPath = await this.processAIVisuals(content.visuals);
      const subtitlesPath = await this.generateMultilingualSubtitles(content);
      
      const outputPath = path.join(
        this.outputDir,
        `ai_${content.category}_${Date.now()}.mp4`
      );

      await this.composeAdvancedVideo({
        audio: audioPath,
        visuals: visualsPath,
        subtitles: subtitlesPath,
        output: outputPath,
        transitions: true,
        effects: true
      });

      await this.cleanup([audioPath, ...visualsPath, subtitlesPath]);
      
      return outputPath;
    } catch (error) {
      logger.error('Failed to create AI video:', error);
      throw error;
    }
  }

  async ensureDirectories() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  async generateTTS(script) {
    const text = `${script.hook} ${script.mainContent} ${script.closing}`;
    const outputPath = path.join(this.tempDir, `tts_${Date.now()}.mp3`);
    
    return new Promise((resolve, reject) => {
      const tts = new gtts(text, 'ko');
      tts.save(outputPath, (err) => {
        if (err) reject(err);
        else resolve(outputPath);
      });
    });
  }

  async generateAIVoiceover(content) {
    const fullScript = content.scenes.map(s => s.text).join(' ');
    const outputPath = path.join(this.tempDir, `voiceover_${Date.now()}.mp3`);
    
    return new Promise((resolve, reject) => {
      const tts = new gtts(fullScript, 'en');
      tts.save(outputPath, (err) => {
        if (err) reject(err);
        else resolve(outputPath);
      });
    });
  }

  async createBackground(template, script) {
    const config = this.templates[template];
    const outputPath = path.join(this.tempDir, `bg_${Date.now()}.png`);
    
    const titleCard = await sharp({
      create: {
        width: config.width,
        height: config.height,
        channels: 4,
        background: config.backgroundColor
      }
    })
    .composite([{
      input: Buffer.from(`
        <svg width="${config.width}" height="${config.height}">
          <text x="50%" y="50%" 
                font-family="Arial" 
                font-size="72" 
                fill="white" 
                text-anchor="middle">
            ${script.title}
          </text>
        </svg>
      `),
      top: 0,
      left: 0
    }])
    .png()
    .toFile(outputPath);
    
    return outputPath;
  }

  async processAIVisuals(visuals) {
    const processedPaths = [];
    
    if (visuals.images) {
      for (const image of visuals.images) {
        if (image.imageUrl) {
          const processedPath = await this.downloadAndProcessImage(image.imageUrl);
          processedPaths.push(processedPath);
        }
      }
    }
    
    if (visuals.videos) {
      for (const video of visuals.videos) {
        if (video.url) {
          const processedPath = await this.downloadVideo(video.url);
          processedPaths.push(processedPath);
        }
      }
    }
    
    return processedPaths;
  }

  async downloadAndProcessImage(url) {
    const outputPath = path.join(this.tempDir, `image_${Date.now()}.jpg`);
    return outputPath;
  }

  async downloadVideo(url) {
    const outputPath = path.join(this.tempDir, `video_${Date.now()}.mp4`);
    return outputPath;
  }

  async generateSubtitles(script) {
    const subtitlesPath = path.join(this.tempDir, `subtitles_${Date.now()}.srt`);
    
    const srtContent = this.createSRTContent([
      { start: 0, end: 5, text: script.hook },
      { start: 5, end: 50, text: script.mainContent },
      { start: 50, end: 60, text: script.closing }
    ]);
    
    await fs.writeFile(subtitlesPath, srtContent);
    return subtitlesPath;
  }

  async generateMultilingualSubtitles(content) {
    const subtitlesPath = path.join(this.tempDir, `subtitles_multi_${Date.now()}.srt`);
    
    const srtContent = this.createSRTContent(
      content.scenes.map((scene, index) => ({
        start: index * 10,
        end: (index + 1) * 10,
        text: scene.text
      }))
    );
    
    await fs.writeFile(subtitlesPath, srtContent);
    return subtitlesPath;
  }

  createSRTContent(subtitles) {
    return subtitles.map((sub, index) => {
      const startTime = this.formatSRTTime(sub.start);
      const endTime = this.formatSRTTime(sub.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}\n`;
    }).join('\n');
  }

  formatSRTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  async composeVideo({ audio, background, subtitles, output, template }) {
    return new Promise((resolve, reject) => {
      const config = this.templates[template];
      
      ffmpeg()
        .input(background)
        .loop(60)
        .input(audio)
        .complexFilter([
          `[0:v]scale=${config.width}:${config.height}:force_original_aspect_ratio=decrease,pad=${config.width}:${config.height}:(ow-iw)/2:(oh-ih)/2[v]`,
          `[v]subtitles=${subtitles}:force_style='FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,Outline=2,Alignment=2,MarginV=50'[vout]`
        ])
        .outputOptions([
          '-map', '[vout]',
          '-map', '1:a',
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-shortest',
          '-movflags', '+faststart'
        ])
        .output(output)
        .on('end', () => {
          logger.info(`Video created: ${output}`);
          resolve(output);
        })
        .on('error', (err) => {
          logger.error('FFmpeg error:', err);
          reject(err);
        })
        .run();
    });
  }

  async composeAdvancedVideo({ audio, visuals, subtitles, output, transitions, effects }) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      visuals.forEach(visual => {
        command.input(visual);
      });
      command.input(audio);
      
      let filterComplex = [];
      
      if (transitions) {
        filterComplex.push('fade=t=in:st=0:d=0.5');
        filterComplex.push('fade=t=out:st=59.5:d=0.5');
      }
      
      command
        .complexFilter(filterComplex.join(','))
        .outputOptions([
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-crf', '22',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-ar', '48000',
          '-shortest',
          '-movflags', '+faststart'
        ])
        .output(output)
        .on('end', () => {
          logger.info(`Advanced video created: ${output}`);
          resolve(output);
        })
        .on('error', (err) => {
          logger.error('FFmpeg error:', err);
          reject(err);
        })
        .run();
    });
  }

  async cleanup(files) {
    for (const file of files) {
      try {
        if (file) {
          await fs.unlink(file);
        }
      } catch (error) {
        logger.warn(`Failed to cleanup file ${file}:`, error);
      }
    }
  }
}