import OpenAI from 'openai';
import Replicate from 'replicate';
import { logger } from '../utils/logger.js';

export class GlobalContentGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });
    this.contentCategories = [
      'Tech Innovation',
      'Life Hacks',
      'Science Facts',
      'Travel Destinations',
      'Food Trends',
      'Fitness Tips',
      'Art & Design',
      'Psychology Facts'
    ];
  }

  async generateAIContent() {
    try {
      const category = this.selectRandomCategory();
      const script = await this.generateViralScript(category);
      const visuals = await this.generateAIVisuals(script);
      
      return {
        ...script,
        visuals,
        category
      };
    } catch (error) {
      logger.error('Failed to generate AI content:', error);
      throw error;
    }
  }

  selectRandomCategory() {
    return this.contentCategories[Math.floor(Math.random() * this.contentCategories.length)];
  }

  async generateViralScript(category) {
    try {
      const prompt = `
        Create a viral 60-second short-form video script about ${category}.
        
        Requirements:
        - Hook viewers in first 3 seconds
        - Educational or entertaining value
        - Global appeal (culturally neutral)
        - Call to action at the end
        
        Format as JSON:
        {
          "title": "engaging title",
          "hook": "attention-grabbing opening",
          "scenes": [
            {"duration": seconds, "text": "narration", "visual": "description"}
          ],
          "closing": "call to action",
          "description": "video description for platforms",
          "tags": ["relevant", "hashtags"],
          "languages": ["en", "es", "zh"]
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Failed to generate viral script:', error);
      throw error;
    }
  }

  async generateAIVisuals(script) {
    try {
      const visuals = [];
      
      for (const scene of script.scenes.slice(0, 3)) {
        const imagePrompt = this.enhanceVisualPrompt(scene.visual);
        const image = await this.generateImage(imagePrompt);
        
        visuals.push({
          sceneIndex: script.scenes.indexOf(scene),
          imageUrl: image,
          duration: scene.duration
        });
      }

      const videoClips = await this.generateVideoClips(script);
      
      return {
        images: visuals,
        videos: videoClips
      };
    } catch (error) {
      logger.error('Failed to generate AI visuals:', error);
      return { images: [], videos: [] };
    }
  }

  enhanceVisualPrompt(description) {
    return `${description}, high quality, trending on artstation, cinematic lighting, 8k resolution, photorealistic`;
  }

  async generateImage(prompt) {
    try {
      const output = await this.replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: prompt,
            negative_prompt: "low quality, blurry, distorted",
            width: 1080,
            height: 1920,
            num_inference_steps: 30
          }
        }
      );
      
      return output[0];
    } catch (error) {
      logger.error('Failed to generate image:', error);
      return null;
    }
  }

  async generateVideoClips(script) {
    try {
      const videoPrompt = `${script.title}: ${script.hook}`;
      
      const output = await this.replicate.run(
        "lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f",
        {
          input: {
            prompt: videoPrompt,
            num_frames: 16,
            num_inference_steps: 25,
            guidance_scale: 7.5
          }
        }
      );

      return [{
        url: output,
        duration: 3,
        type: 'intro'
      }];
    } catch (error) {
      logger.error('Failed to generate video clips:', error);
      return [];
    }
  }

  async generateMultilingualSubtitles(script) {
    const subtitles = {};
    
    for (const lang of script.languages) {
      try {
        const translation = await this.translateScript(script, lang);
        subtitles[lang] = this.formatSubtitles(translation);
      } catch (error) {
        logger.error(`Failed to generate ${lang} subtitles:`, error);
      }
    }
    
    return subtitles;
  }

  async translateScript(script, targetLang) {
    const prompt = `
      Translate the following video script to ${targetLang}:
      ${JSON.stringify(script.scenes)}
      
      Keep the timing and structure identical.
      Return as JSON array with same format.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.choices[0].message.content);
  }

  formatSubtitles(scenes) {
    let currentTime = 0;
    return scenes.map(scene => {
      const subtitle = {
        start: currentTime,
        end: currentTime + scene.duration,
        text: scene.text
      };
      currentTime += scene.duration;
      return subtitle;
    });
  }
}