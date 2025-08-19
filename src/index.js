import dotenv from 'dotenv';
import cron from 'node-cron';
import { KoreaNewsCollector } from './collectors/koreaNews.js';
import { GlobalContentGenerator } from './generators/globalContent.js';
import { VideoEditor } from './editors/videoEditor.js';
import { MultiPlatformUploader } from './uploaders/multiPlatform.js';
import { logger } from './utils/logger.js';

dotenv.config();

class ShortFormAutomation {
  constructor() {
    this.koreaCollector = new KoreaNewsCollector();
    this.globalGenerator = new GlobalContentGenerator();
    this.videoEditor = new VideoEditor();
    this.uploader = new MultiPlatformUploader();
  }

  async processKoreaContent() {
    try {
      logger.info('Starting Korea content processing...');
      
      const newsData = await this.koreaCollector.collectTrendingNews();
      const script = await this.koreaCollector.generateScript(newsData);
      const videoPath = await this.videoEditor.createNewsVideo(script);
      
      await this.uploader.uploadToAllPlatforms(videoPath, {
        title: script.title,
        description: script.description,
        tags: script.tags,
        target: 'korea'
      });
      
      logger.info('Korea content processing completed');
    } catch (error) {
      logger.error('Korea content processing failed:', error);
    }
  }

  async processGlobalContent() {
    try {
      logger.info('Starting global AI content processing...');
      
      const content = await this.globalGenerator.generateAIContent();
      const videoPath = await this.videoEditor.createAIVideo(content);
      
      await this.uploader.uploadToAllPlatforms(videoPath, {
        title: content.title,
        description: content.description,
        tags: content.tags,
        target: 'global'
      });
      
      logger.info('Global content processing completed');
    } catch (error) {
      logger.error('Global content processing failed:', error);
    }
  }

  startScheduler() {
    cron.schedule(process.env.KOREA_SCHEDULE || '0 8,12,18 * * *', () => {
      this.processKoreaContent();
    });

    cron.schedule(process.env.GLOBAL_SCHEDULE || '0 10,14,20 * * *', () => {
      this.processGlobalContent();
    });

    logger.info('Scheduler started successfully');
  }
}

const app = new ShortFormAutomation();
app.startScheduler();

logger.info('Short-form automation system is running...');