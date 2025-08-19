import { google } from 'googleapis';
import { IgApiClient } from 'instagram-private-api';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

export class MultiPlatformUploader {
  constructor() {
    this.platforms = {
      youtube: this.initYouTube(),
      instagram: this.initInstagram(),
      tiktok: this.initTikTok()
    };
  }

  initYouTube() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      'http://localhost:3000/oauth2callback'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
    });

    return google.youtube({
      version: 'v3',
      auth: oauth2Client
    });
  }

  initInstagram() {
    const ig = new IgApiClient();
    ig.state.generateDevice(process.env.INSTAGRAM_USERNAME);
    return ig;
  }

  initTikTok() {
    return {
      sessionId: process.env.TIKTOK_SESSION_ID
    };
  }

  async uploadToAllPlatforms(videoPath, metadata) {
    const results = {
      youtube: { success: false, url: null },
      instagram: { success: false, url: null },
      tiktok: { success: false, url: null }
    };

    const uploadPromises = [
      this.uploadToYouTube(videoPath, metadata).then(url => {
        results.youtube = { success: true, url };
      }).catch(error => {
        logger.error('YouTube upload failed:', error);
      }),

      this.uploadToInstagram(videoPath, metadata).then(url => {
        results.instagram = { success: true, url };
      }).catch(error => {
        logger.error('Instagram upload failed:', error);
      }),

      this.uploadToTikTok(videoPath, metadata).then(url => {
        results.tiktok = { success: true, url };
      }).catch(error => {
        logger.error('TikTok upload failed:', error);
      })
    ];

    await Promise.allSettled(uploadPromises);
    
    logger.info('Upload results:', results);
    return results;
  }

  async uploadToYouTube(videoPath, metadata) {
    try {
      const fileSize = (await fs.stat(videoPath)).size;
      const videoStream = await fs.readFile(videoPath);

      const response = await this.platforms.youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: this.truncateTitle(metadata.title, 100),
            description: this.formatDescription(metadata, 'youtube'),
            tags: this.formatTags(metadata.tags, 'youtube'),
            categoryId: '24',
            defaultLanguage: metadata.target === 'korea' ? 'ko' : 'en',
            defaultAudioLanguage: metadata.target === 'korea' ? 'ko' : 'en'
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
            embeddable: true,
            publicStatsViewable: true
          }
        },
        media: {
          body: videoStream
        }
      });

      const videoId = response.data.id;
      const videoUrl = `https://youtube.com/shorts/${videoId}`;
      
      logger.info(`YouTube upload successful: ${videoUrl}`);
      return videoUrl;
    } catch (error) {
      logger.error('YouTube upload error:', error);
      throw error;
    }
  }

  async uploadToInstagram(videoPath, metadata) {
    try {
      await this.platforms.instagram.account.login(
        process.env.INSTAGRAM_USERNAME,
        process.env.INSTAGRAM_PASSWORD
      );

      const videoBuffer = await fs.readFile(videoPath);
      const coverPath = await this.extractThumbnail(videoPath);
      const coverBuffer = await fs.readFile(coverPath);

      const publishResult = await this.platforms.instagram.publish.video({
        video: videoBuffer,
        coverImage: coverBuffer,
        caption: this.formatCaption(metadata, 'instagram'),
        usertags: {
          in: []
        }
      });

      const mediaId = publishResult.media.id;
      const mediaUrl = `https://www.instagram.com/reel/${mediaId}`;
      
      logger.info(`Instagram upload successful: ${mediaUrl}`);
      
      await fs.unlink(coverPath);
      return mediaUrl;
    } catch (error) {
      logger.error('Instagram upload error:', error);
      throw error;
    }
  }

  async uploadToTikTok(videoPath, metadata) {
    try {
      logger.info('TikTok upload simulation (API integration required)');
      
      const formattedMetadata = {
        title: this.truncateTitle(metadata.title, 150),
        caption: this.formatCaption(metadata, 'tiktok'),
        hashtags: this.formatHashtags(metadata.tags, 'tiktok'),
        privacy: 'public',
        allowComments: true,
        allowDuet: true,
        allowStitch: true
      };

      logger.info('TikTok metadata prepared:', formattedMetadata);
      
      return 'https://www.tiktok.com/@username/video/1234567890';
    } catch (error) {
      logger.error('TikTok upload error:', error);
      throw error;
    }
  }

  async extractThumbnail(videoPath) {
    const thumbnailPath = path.join(
      path.dirname(videoPath),
      `thumb_${Date.now()}.jpg`
    );
    
    return new Promise((resolve, reject) => {
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['00:00:01'],
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size: '1080x1920'
        })
        .on('end', () => resolve(thumbnailPath))
        .on('error', reject);
    });
  }

  truncateTitle(title, maxLength) {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  }

  formatDescription(metadata, platform) {
    const baseDescription = metadata.description || '';
    const hashtags = this.formatHashtags(metadata.tags, platform);
    
    const descriptions = {
      youtube: `${baseDescription}\n\n${hashtags}\n\n#Shorts`,
      instagram: `${baseDescription}\n.\n.\n.\n${hashtags}`,
      tiktok: `${baseDescription} ${hashtags}`
    };
    
    return descriptions[platform] || baseDescription;
  }

  formatCaption(metadata, platform) {
    const title = metadata.title || '';
    const description = metadata.description || '';
    const hashtags = this.formatHashtags(metadata.tags, platform);
    
    const captions = {
      instagram: `${title}\n\n${description}\n.\n.\n.\n${hashtags}`,
      tiktok: `${title} ${hashtags}`
    };
    
    return captions[platform] || title;
  }

  formatTags(tags, platform) {
    if (!tags || !Array.isArray(tags)) return [];
    
    const platformLimits = {
      youtube: 500,
      instagram: 30,
      tiktok: 100
    };
    
    const limit = platformLimits[platform] || 30;
    return tags.slice(0, Math.min(tags.length, limit));
  }

  formatHashtags(tags, platform) {
    if (!tags || !Array.isArray(tags)) return '';
    
    const hashtagLimits = {
      youtube: 15,
      instagram: 30,
      tiktok: 10
    };
    
    const limit = hashtagLimits[platform] || 10;
    const selectedTags = tags.slice(0, limit);
    
    return selectedTags
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      .join(' ');
  }

  async validateVideo(videoPath) {
    try {
      const stats = await fs.stat(videoPath);
      const maxSize = 500 * 1024 * 1024;
      
      if (stats.size > maxSize) {
        throw new Error(`Video file too large: ${stats.size} bytes (max: ${maxSize})`);
      }
      
      return true;
    } catch (error) {
      logger.error('Video validation failed:', error);
      throw error;
    }
  }
}