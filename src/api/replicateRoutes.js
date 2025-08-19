import express from 'express';
import ReplicateService from '../services/replicateService.js';

const router = express.Router();
const replicateService = new ReplicateService();

// Replicate 이미지 생성 API
router.post('/api/replicate/generate-image', async (req, res) => {
  try {
    console.log('🎨 Replicate 이미지 생성 요청...');
    const { prompt, width = 768, height = 1344, negativePrompt, seed } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트가 필요합니다.'
      });
    }
    
    const imageUrls = await replicateService.generateImage(prompt, {
      width,
      height,
      negativePrompt,
      seed,
      numOutputs: 1
    });
    
    res.json({
      success: true,
      data: {
        imageUrl: imageUrls[0],
        prompt: prompt,
        dimensions: `${width}x${height}`,
        model: 'stable-diffusion-xl'
      },
      message: '이미지 생성 완료!'
    });
    
  } catch (error) {
    console.error('Replicate 이미지 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Replicate 비디오 생성 API (이미지에서)
router.post('/api/replicate/generate-video', async (req, res) => {
  try {
    console.log('🎬 Replicate 비디오 생성 요청...');
    const { imageUrl, fps = 6, motionIntensity = 127, seed } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: '이미지 URL이 필요합니다.'
      });
    }
    
    const videoUrl = await replicateService.generateVideo(imageUrl, {
      fps,
      motionIntensity,
      seed
    });
    
    res.json({
      success: true,
      data: {
        videoUrl: videoUrl,
        sourceImage: imageUrl,
        fps: fps,
        model: 'stable-video-diffusion'
      },
      message: '비디오 생성 완료!'
    });
    
  } catch (error) {
    console.error('Replicate 비디오 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Replicate 텍스트→비디오 API
router.post('/api/replicate/text-to-video', async (req, res) => {
  try {
    console.log('🎞️ Replicate 텍스트→비디오 생성 요청...');
    const { prompt, negativePrompt, numFrames = 16, steps = 25, seed } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트가 필요합니다.'
      });
    }
    
    const videoUrl = await replicateService.textToVideo(prompt, {
      negativePrompt,
      numFrames,
      steps,
      seed
    });
    
    res.json({
      success: true,
      data: {
        videoUrl: videoUrl,
        prompt: prompt,
        frames: numFrames,
        model: 'animate-diff'
      },
      message: '텍스트→비디오 생성 완료!'
    });
    
  } catch (error) {
    console.error('Replicate 텍스트→비디오 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Replicate 전체 워크플로우 API
router.post('/api/replicate/create-shortform', async (req, res) => {
  try {
    console.log('📹 Replicate 숏폼 생성 워크플로우 시작...');
    const { script, generateVideo = false } = req.body;
    
    if (!script || !script.scenes || script.scenes.length === 0) {
      return res.status(400).json({
        success: false,
        error: '스크립트와 씬 정보가 필요합니다.'
      });
    }
    
    // 각 씬에 imagePrompt가 있는지 확인
    for (let i = 0; i < script.scenes.length; i++) {
      if (!script.scenes[i].imagePrompt) {
        return res.status(400).json({
          success: false,
          error: `씬 ${i + 1}에 imagePrompt가 없습니다.`
        });
      }
    }
    
    script.generateVideo = generateVideo;
    const results = await replicateService.createShortFormVideo(script, './output/replicate');
    
    res.json({
      success: true,
      data: results,
      message: '숏폼 콘텐츠 생성 완료!'
    });
    
  } catch (error) {
    console.error('Replicate 숏폼 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Replicate 모델 상태 확인 API
router.get('/api/replicate/status', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'ready',
        availableModels: [
          'stable-diffusion-xl',
          'stable-video-diffusion',
          'animate-diff'
        ],
        apiConnected: true
      },
      message: 'Replicate 서비스 준비됨'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;