import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Replicate from 'replicate';

dotenv.config();

const app = express();
const PORT = 3008;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.use(cors());
app.use(express.json());

// 메인 페이지
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>실제 작동하는 AI 생성기</title>
        <meta charset="utf-8">
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 50px auto; 
                padding: 20px;
                text-align: center;
            }
            h1 { color: #333; }
            textarea { 
                width: 100%; 
                height: 100px; 
                margin: 20px 0; 
                padding: 15px;
                border: 2px solid #ddd;
                border-radius: 10px;
                font-size: 16px;
            }
            .buttons {
                display: flex;
                gap: 20px;
                justify-content: center;
                margin: 20px 0;
            }
            button { 
                padding: 15px 30px; 
                font-size: 18px; 
                border: none; 
                border-radius: 10px; 
                cursor: pointer;
                color: white;
            }
            .btn-image { background: #4CAF50; }
            .btn-video { background: #FF4444; }
            button:hover { opacity: 0.8; }
            .result { 
                margin-top: 30px; 
                padding: 20px; 
                background: #f9f9f9; 
                border-radius: 10px;
                display: none;
            }
            .loading { color: #666; }
            .error { color: #cc0000; background: #ffe6e6; }
            .success img, .success video { 
                max-width: 100%; 
                height: auto; 
                border-radius: 10px; 
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <h1>🎨 실제 작동하는 AI 생성기</h1>
        <p>텍스트를 입력하면 AI가 이미지와 동영상을 만들어드립니다</p>
        
        <textarea id="textInput" placeholder="예: 아름다운 도시 풍경, 자연 속 꽃밭, 구름이 떠있는 하늘, 산과 나무"></textarea>
        
        <div class="buttons">
            <button class="btn-image" onclick="generateImage()">📸 이미지 생성</button>
            <button class="btn-video" onclick="generateVideo()">🎬 동영상 생성</button>
        </div>
        
        <div id="result" class="result"></div>

        <script>
            async function generateImage() {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    alert('텍스트를 입력해주세요!');
                    return;
                }
                
                const result = document.getElementById('result');
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = '📸 AI 이미지 생성 중... (30초 소요)';
                
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
                            <img src="\${data.imageUrl}" alt="AI Generated Image">
                            <p><strong>프롬프트:</strong> \${text}</p>
                            <p><a href="\${data.imageUrl}" target="_blank">새 창에서 보기</a></p>
                        \`;
                    } else {
                        result.className = 'result error';
                        result.innerHTML = \`❌ 오류: \${data.error}\`;
                    }
                } catch (error) {
                    result.className = 'result error';
                    result.innerHTML = \`❌ 오류: \${error.message}\`;
                }
            }
            
            async function generateVideo() {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    alert('텍스트를 입력해주세요!');
                    return;
                }
                
                const result = document.getElementById('result');
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = '🎬 AI 동영상 생성 중... (3-5분 소요)<br>※ 실제 동영상이 생성됩니다';
                
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
                            <video controls autoplay>
                                <source src="\${data.videoUrl}" type="video/mp4">
                            </video>
                            <p><strong>프롬프트:</strong> \${text}</p>
                            <p><a href="\${data.videoUrl}" target="_blank">새 창에서 보기</a></p>
                        \`;
                    } else {
                        result.className = 'result error';
                        result.innerHTML = \`❌ 오류: \${data.error}\`;
                    }
                } catch (error) {
                    result.className = 'result error';
                    result.innerHTML = \`❌ 오류: \${error.message}\`;
                }
            }
        </script>
    </body>
    </html>
  `);
});

// 이미지 생성 API
app.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '텍스트를 입력해주세요'
      });
    }
    
    console.log('📸 이미지 생성 시작:', prompt);
    
    // 안전한 프롬프트로 변환
    const safePrompt = `beautiful landscape, ${prompt}, digital art, high quality, safe content`;
    
    const output = await replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt: safePrompt,
          width: 768,
          height: 1024,
          num_outputs: 1,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          scheduler: "K_EULER"
        }
      }
    );
    
    console.log('📸 이미지 생성 완료:', output);
    console.log('📸 이미지 타입:', typeof output);
    
    // ReadableStream 처리
    let imageUrl;
    if (output && typeof output === 'object' && output.constructor.name === 'ReadableStream') {
      // ReadableStream을 텍스트로 읽기
      const reader = output.getReader();
      const decoder = new TextDecoder();
      let result = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
      }
      
      try {
        const parsed = JSON.parse(result);
        imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch {
        imageUrl = result.trim();
      }
    } else if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error('이미지 URL을 찾을 수 없습니다');
    }
    
    console.log('📸 최종 이미지 URL:', imageUrl);
    
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      throw new Error('유효하지 않은 이미지 URL입니다');
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

// 동영상 생성 API
app.post('/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '텍스트를 입력해주세요'
      });
    }
    
    console.log('🎬 동영상 생성 시작:', prompt);
    
    // 먼저 이미지 생성
    console.log('🎨 1단계: 이미지 생성 중...');
    const safePromptVideo = `beautiful cinematic scene, ${prompt}, movie scene, safe content, digital art`;
    
    const imageOutput = await replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt: safePromptVideo,
          width: 1024,
          height: 576,
          num_outputs: 1,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          scheduler: "K_EULER"
        }
      }
    );
    
    const imageUrl = Array.isArray(imageOutput) ? imageOutput[0] : imageOutput;
    console.log('🎨 이미지 생성 완료:', imageUrl);
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('이미지 생성에 실패했습니다');
    }
    
    // 이미지를 동영상으로 변환
    console.log('🎬 2단계: 동영상 변환 중...');
    const videoOutput = await replicate.run(
      "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
      {
        input: {
          input_image: imageUrl,
          video_length: "14_frames_with_svd",
          fps: 6,
          motion_bucket_id: 127,
          cond_aug: 0.02,
          decoding_t: 7,
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    );
    
    console.log('🎬 동영상 생성 완료:', videoOutput);
    
    let videoUrl;
    if (Array.isArray(videoOutput)) {
      videoUrl = videoOutput[0];
    } else if (typeof videoOutput === 'string') {
      videoUrl = videoOutput;
    } else {
      throw new Error('동영상 URL을 찾을 수 없습니다');
    }
    
    if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.startsWith('http')) {
      throw new Error('유효하지 않은 동영상 URL입니다');
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
  console.log('🚀 실제 작동하는 AI 생성기 시작!');
  console.log(`📡 주소: http://localhost:${PORT}`);
  console.log('💡 이제 진짜로 이미지와 동영상이 생성됩니다!');
});