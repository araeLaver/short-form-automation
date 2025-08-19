import Replicate from 'replicate';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import path from 'path';
import axios from 'axios';

dotenv.config();

class ReplicateService {
  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  // 이미지 생성 (Stable Diffusion)
  async generateImage(prompt, options = {}) {
    try {
      console.log('🎨 이미지 생성 시작:', prompt);
      
      const output = await this.replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: prompt,
            negative_prompt: options.negativePrompt || "low quality, blurry, distorted",
            width: options.width || 768,
            height: options.height || 1344, // 9:16 비율 (숏폼)
            num_outputs: options.numOutputs || 1,
            scheduler: "K_EULER",
            num_inference_steps: 25,
            guidance_scale: 7.5,
            seed: options.seed || Math.floor(Math.random() * 1000000)
          }
        }
      );

      console.log('✅ 이미지 생성 완료');
      return output;
    } catch (error) {
      console.error('❌ 이미지 생성 실패:', error);
      throw error;
    }
  }

  // 비디오 생성 (Stable Video Diffusion)
  async generateVideo(imageUrl, options = {}) {
    try {
      console.log('🎬 비디오 생성 시작');
      
      const output = await this.replicate.run(
        "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
        {
          input: {
            input_image: imageUrl,
            video_length: "14_frames", // 14 또는 25 프레임
            fps: options.fps || 6,
            motion_bucket_id: options.motionIntensity || 127, // 1-255 (모션 강도)
            cond_aug: 0.02,
            decoding_t: 7,
            seed: options.seed || Math.floor(Math.random() * 1000000)
          }
        }
      );

      console.log('✅ 비디오 생성 완료');
      return output;
    } catch (error) {
      console.error('❌ 비디오 생성 실패:', error);
      throw error;
    }
  }

  // AnimateDiff로 텍스트→비디오
  async textToVideo(prompt, options = {}) {
    try {
      console.log('🎞️ 텍스트→비디오 생성 시작:', prompt);
      
      const output = await this.replicate.run(
        "lucataco/animate-diff:beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f",
        {
          input: {
            prompt: prompt,
            negative_prompt: options.negativePrompt || "low quality, worst quality, blurry",
            num_frames: options.numFrames || 16,
            num_inference_steps: options.steps || 25,
            guidance_scale: 7.5,
            seed: options.seed || Math.floor(Math.random() * 1000000)
          }
        }
      );

      console.log('✅ 텍스트→비디오 생성 완료');
      console.log('🔍 출력 형태:', typeof output, output);
      
      // output이 배열이면 첫 번째 요소 반환
      if (Array.isArray(output) && output.length > 0) {
        return output[0];
      }
      
      return output;
    } catch (error) {
      console.error('❌ 텍스트→비디오 생성 실패:', error);
      throw error;
    }
  }

  // 파일 다운로드 헬퍼
  async downloadFile(url, outputPath) {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
      });

      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });

      const writer = createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('❌ 파일 다운로드 실패:', error);
      throw error;
    }
  }

  // 워크플로우: 스크립트→이미지→비디오
  async createShortFormVideo(script, outputDir = './output') {
    try {
      const results = {
        images: [],
        videos: [],
        finalVideo: null
      };

      // 1. 각 씬에 대한 이미지 생성
      for (let i = 0; i < script.scenes.length; i++) {
        const scene = script.scenes[i];
        console.log(`\n📸 씬 ${i + 1}/${script.scenes.length} 이미지 생성 중...`);
        
        const imageUrls = await this.generateImage(scene.imagePrompt, {
          width: 768,
          height: 1344,
          numOutputs: 1
        });

        const imagePath = path.join(outputDir, `scene_${i + 1}.png`);
        await this.downloadFile(imageUrls[0], imagePath);
        
        results.images.push({
          scene: i + 1,
          url: imageUrls[0],
          localPath: imagePath
        });
      }

      // 2. 이미지를 비디오로 변환 (선택적)
      if (script.generateVideo) {
        for (let i = 0; i < results.images.length; i++) {
          console.log(`\n🎬 씬 ${i + 1}/${results.images.length} 비디오 생성 중...`);
          
          const videoUrl = await this.generateVideo(results.images[i].url, {
            fps: 6,
            motionIntensity: 100
          });

          const videoPath = path.join(outputDir, `scene_${i + 1}.mp4`);
          await this.downloadFile(videoUrl, videoPath);
          
          results.videos.push({
            scene: i + 1,
            url: videoUrl,
            localPath: videoPath
          });
        }
      }

      console.log('\n✨ 숏폼 비디오 생성 완료!');
      return results;
    } catch (error) {
      console.error('❌ 숏폼 비디오 생성 실패:', error);
      throw error;
    }
  }
}

export default ReplicateService;