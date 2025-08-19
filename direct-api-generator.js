import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = 3011;

app.use(cors());
app.use(express.json());

// 메인 페이지
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>직접 API AI 생성기</title>
        <meta charset="utf-8">
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 50px auto; 
                padding: 20px;
                text-align: center;
                background: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            h1 { color: #333; margin-bottom: 10px; }
            .subtitle { color: #666; margin-bottom: 30px; }
            textarea { 
                width: 100%; 
                height: 120px; 
                margin: 20px 0; 
                padding: 15px;
                border: 2px solid #ddd;
                border-radius: 10px;
                font-size: 16px;
                resize: vertical;
            }
            .buttons {
                display: flex;
                gap: 20px;
                justify-content: center;
                margin: 30px 0;
            }
            button { 
                padding: 18px 35px; 
                font-size: 18px; 
                border: none; 
                border-radius: 12px; 
                cursor: pointer;
                color: white;
                font-weight: bold;
                transition: all 0.3s;
            }
            .btn-image { 
                background: linear-gradient(45deg, #4CAF50, #45a049);
            }
            .btn-image:hover { 
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(76,175,80,0.4);
            }
            .result { 
                margin-top: 30px; 
                padding: 25px; 
                border-radius: 12px;
                display: none;
                text-align: left;
            }
            .loading { 
                background: #e3f2fd; 
                color: #1976d2; 
                border: 2px solid #bbdefb;
                text-align: center;
            }
            .error { 
                background: #ffebee; 
                color: #c62828; 
                border: 2px solid #ffcdd2;
            }
            .success { 
                background: #e8f5e8; 
                border: 2px solid #c8e6c9;
            }
            .success img, .success video { 
                max-width: 100%; 
                height: auto; 
                border-radius: 10px; 
                margin: 15px 0;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            .download-link {
                display: inline-block;
                margin-top: 10px;
                padding: 10px 20px;
                background: #2196F3;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
            }
            .download-link:hover {
                background: #1976D2;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎨 직접 API AI 생성기</h1>
            <p class="subtitle">ReadableStream 문제 해결을 위해 직접 HTTP API 호출</p>
            
            <textarea id="textInput" placeholder="원하는 이미지를 설명해주세요..."></textarea>
            
            <div class="buttons">
                <button class="btn-image" onclick="generateImage()">📸 이미지 생성</button>
                <button class="btn-video" onclick="generateVideo()" style="background: linear-gradient(45deg, #FF4444, #CC3333);">🎬 동영상 생성</button>
            </div>
            
            <div id="result" class="result"></div>
        </div>

        <script>
            async function generateImage() {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    alert('프롬프트를 입력해주세요!');
                    return;
                }
                
                const result = document.getElementById('result');
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = '📸 AI 이미지 생성 중...<br><small>직접 API 호출로 처리 중...</small>';
                
                try {
                    const response = await fetch('/generate-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: text })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        result.className = 'result success';
                        result.innerHTML = \`
                            <h3>✅ 이미지 생성 완료!</h3>
                            <img src="\${data.imageUrl}" alt="AI Generated Image" loading="lazy">
                            <div style="margin-top: 15px;">
                                <strong>프롬프트:</strong> \${text}
                            </div>
                            <a href="\${data.imageUrl}" target="_blank" class="download-link">🔗 새 창에서 보기</a>
                        \`;
                    } else {
                        result.className = 'result error';
                        result.innerHTML = \`❌ <strong>오류:</strong> \${data.error}\`;
                    }
                } catch (error) {
                    result.className = 'result error';
                    result.innerHTML = \`❌ <strong>네트워크 오류:</strong> \${error.message}\`;
                }
            }
            
            async function generateVideo() {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    alert('프롬프트를 입력해주세요!');
                    return;
                }
                
                const result = document.getElementById('result');
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = '🎬 AI 동영상 생성 중...<br><small>1단계: 이미지 생성 (30초)</small><br><small>2단계: 동영상 변환 (2-3분)</small>';
                
                try {
                    const response = await fetch('/generate-video', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: text })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        result.className = 'result success';
                        result.innerHTML = \`
                            <h3>✅ 동영상 생성 완료!</h3>
                            <video controls autoplay loop style="width: 100%; max-width: 600px;">
                                <source src="\${data.videoUrl}" type="video/mp4">
                                브라우저가 동영상을 지원하지 않습니다.
                            </video>
                            <div style="margin-top: 15px;">
                                <strong>프롬프트:</strong> \${text}
                            </div>
                            <a href="\${data.videoUrl}" target="_blank" class="download-link">🔗 새 창에서 보기</a>
                        \`;
                    } else {
                        result.className = 'result error';
                        result.innerHTML = \`❌ <strong>오류:</strong> \${data.error}\`;
                    }
                } catch (error) {
                    result.className = 'result error';
                    result.innerHTML = \`❌ <strong>네트워크 오류:</strong> \${error.message}\`;
                }
            }
        </script>
    </body>
    </html>
  `);
});

// 직접 HTTP API로 이미지 생성
app.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트를 입력해주세요'
      });
    }
    
    console.log('📸 직접 API로 이미지 생성 시작:', prompt);
    
    // Replicate API에 직접 HTTP 요청
    const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          prompt: `landscape photography, ${prompt}, natural scenery, realistic, high quality, detailed, no people, no characters`,
          negative_prompt: "people, person, human, character, anime, cartoon, manga, nsfw, inappropriate, low quality, blurry, distorted, face, portrait",
          width: 768,
          height: 1024,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000)
        }
      })
    });
    
    if (!predictionResponse.ok) {
      const errorData = await predictionResponse.json();
      throw new Error(`API 오류: ${errorData.detail || predictionResponse.statusText}`);
    }
    
    const prediction = await predictionResponse.json();
    console.log('📸 Prediction 생성됨:', prediction.id);
    
    // 결과 대기
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 최대 5분 대기
    
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5초 대기
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error('상태 확인 실패');
      }
      
      result = await statusResponse.json();
      attempts++;
      
      console.log(`📸 상태 확인 ${attempts}/${maxAttempts}: ${result.status}`);
    }
    
    if (result.status === 'failed') {
      throw new Error(`이미지 생성 실패: ${result.error || '알 수 없는 오류'}`);
    }
    
    if (result.status !== 'succeeded') {
      throw new Error('이미지 생성 시간 초과');
    }
    
    console.log('📸 최종 결과:', result.output);
    
    // 결과 처리
    let imageUrl;
    if (Array.isArray(result.output) && result.output.length > 0) {
      imageUrl = result.output[0];
    } else if (typeof result.output === 'string') {
      imageUrl = result.output;
    } else {
      throw new Error('출력 형식을 인식할 수 없습니다');
    }
    
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      throw new Error('유효하지 않은 이미지 URL');
    }
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt
    });
    
  } catch (error) {
    console.error('❌ 이미지 생성 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 직접 HTTP API로 동영상 생성 (2단계: 이미지→동영상)
app.post('/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트를 입력해주세요'
      });
    }
    
    console.log('🎬 동영상 생성 시작:', prompt);
    
    // 1단계: 먼저 이미지 생성
    console.log('🎨 1단계: 이미지 생성 중...');
    const imageResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          prompt: `cinematic scene, ${prompt}, movie still, landscape photography, high quality, detailed, no people`,
          negative_prompt: "people, person, human, character, anime, cartoon, nsfw, low quality",
          width: 1024,
          height: 576, // 16:9 비율
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000)
        }
      })
    });
    
    if (!imageResponse.ok) {
      const errorData = await imageResponse.json();
      throw new Error(`이미지 생성 API 오류: ${errorData.detail || imageResponse.statusText}`);
    }
    
    const imagePrediction = await imageResponse.json();
    console.log('🎨 이미지 Prediction 생성됨:', imagePrediction.id);
    
    // 이미지 생성 대기
    let imageResult = imagePrediction;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (imageResult.status !== 'succeeded' && imageResult.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${imagePrediction.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error('이미지 상태 확인 실패');
      }
      
      imageResult = await statusResponse.json();
      attempts++;
      
      console.log(`🎨 이미지 상태 ${attempts}/${maxAttempts}: ${imageResult.status}`);
    }
    
    if (imageResult.status === 'failed') {
      throw new Error(`이미지 생성 실패: ${imageResult.error || '알 수 없는 오류'}`);
    }
    
    if (imageResult.status !== 'succeeded') {
      throw new Error('이미지 생성 시간 초과');
    }
    
    let imageUrl;
    if (Array.isArray(imageResult.output) && imageResult.output.length > 0) {
      imageUrl = imageResult.output[0];
    } else if (typeof imageResult.output === 'string') {
      imageUrl = imageResult.output;
    } else {
      throw new Error('이미지 URL을 찾을 수 없습니다');
    }
    
    console.log('🎨 이미지 생성 완료:', imageUrl);
    
    // 2단계: 이미지를 동영상으로 변환
    console.log('🎬 2단계: 동영상 변환 중...');
    const videoResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
        input: {
          input_image: imageUrl,
          video_length: "14_frames_with_svd",
          fps: 6,
          motion_bucket_id: 127,
          cond_aug: 0.02,
          decoding_t: 7,
          seed: Math.floor(Math.random() * 1000000)
        }
      })
    });
    
    if (!videoResponse.ok) {
      const errorData = await videoResponse.json();
      throw new Error(`동영상 생성 API 오류: ${errorData.detail || videoResponse.statusText}`);
    }
    
    const videoPrediction = await videoResponse.json();
    console.log('🎬 동영상 Prediction 생성됨:', videoPrediction.id);
    
    // 동영상 생성 대기
    let videoResult = videoPrediction;
    attempts = 0;
    const videoMaxAttempts = 60; // 동영상은 더 오래 걸림
    
    while (videoResult.status !== 'succeeded' && videoResult.status !== 'failed' && attempts < videoMaxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5초 대기
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${videoPrediction.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error('동영상 상태 확인 실패');
      }
      
      videoResult = await statusResponse.json();
      attempts++;
      
      console.log(`🎬 동영상 상태 ${attempts}/${videoMaxAttempts}: ${videoResult.status}`);
    }
    
    if (videoResult.status === 'failed') {
      throw new Error(`동영상 생성 실패: ${videoResult.error || '알 수 없는 오류'}`);
    }
    
    if (videoResult.status !== 'succeeded') {
      throw new Error('동영상 생성 시간 초과');
    }
    
    console.log('🎬 동영상 생성 결과:', videoResult.output);
    
    let videoUrl;
    if (Array.isArray(videoResult.output) && videoResult.output.length > 0) {
      videoUrl = videoResult.output[0];
    } else if (typeof videoResult.output === 'string') {
      videoUrl = videoResult.output;
    } else {
      throw new Error('동영상 URL을 찾을 수 없습니다');
    }
    
    if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.startsWith('http')) {
      throw new Error('유효하지 않은 동영상 URL');
    }
    
    res.json({
      success: true,
      videoUrl: videoUrl,
      imageUrl: imageUrl,
      prompt: prompt
    });
    
  } catch (error) {
    console.error('❌ 동영상 생성 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log('🚀 직접 API AI 생성기 시작!');
  console.log(`📡 주소: http://localhost:${PORT}`);
  console.log('💡 직접 HTTP API 호출로 ReadableStream 문제 해결 시도');
});