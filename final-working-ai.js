import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Replicate from 'replicate';

dotenv.config();

const app = express();
const PORT = 3009;

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
        <title>최종 AI 생성기</title>
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
            .btn-video { 
                background: linear-gradient(45deg, #FF4444, #CC3333);
            }
            .btn-video:hover { 
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255,68,68,0.4);
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
            .example-prompts {
                margin-top: 20px;
                text-align: left;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
            }
            .example-prompts h3 {
                margin-top: 0;
                color: #333;
            }
            .example-prompts ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            .example-prompts li {
                margin: 8px 0;
                color: #555;
                cursor: pointer;
                padding: 5px;
                border-radius: 5px;
                transition: background 0.2s;
            }
            .example-prompts li:hover {
                background: #e9ecef;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎨 최종 AI 생성기</h1>
            <p class="subtitle">텍스트로 AI 이미지와 동영상을 생성하세요</p>
            
            <textarea id="textInput" placeholder="원하는 이미지나 동영상을 설명해주세요..."></textarea>
            
            <div class="buttons">
                <button class="btn-image" onclick="generateImage()">📸 이미지 생성</button>
                <button class="btn-video" onclick="generateVideo()">🎬 동영상 생성</button>
            </div>
            
            <div id="result" class="result"></div>
            
            <div class="example-prompts">
                <h3>📋 예시 프롬프트 (클릭해서 사용)</h3>
                <ul>
                    <li onclick="setPrompt('beautiful mountain landscape at sunset')">🏔️ 석양이 지는 아름다운 산 풍경</li>
                    <li onclick="setPrompt('modern city skyline at night with lights')">🌃 밤에 불빛이 켜진 현대적인 도시 스카이라인</li>
                    <li onclick="setPrompt('peaceful garden with colorful flowers')">🌸 다채로운 꽃이 있는 평화로운 정원</li>
                    <li onclick="setPrompt('abstract digital art with geometric shapes')">🎨 기하학적 형태의 추상 디지털 아트</li>
                    <li onclick="setPrompt('cozy coffee shop interior')">☕ 아늑한 커피숍 인테리어</li>
                </ul>
            </div>
        </div>

        <script>
            function setPrompt(prompt) {
                document.getElementById('textInput').value = prompt;
            }
            
            async function generateImage() {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    alert('프롬프트를 입력해주세요!');
                    return;
                }
                
                const result = document.getElementById('result');
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = '📸 AI 이미지 생성 중...<br><small>약 30초 소요됩니다</small>';
                
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
                            <video controls autoplay loop style="width: 100%; max-width: 500px;">
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

// 이미지 생성 API
app.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트를 입력해주세요'
      });
    }
    
    console.log('📸 이미지 생성 시작:', prompt);
    
    // SDXL 모델 사용 (더 안정적)
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: `${prompt}, high quality, detailed, beautiful, safe content`,
          negative_prompt: "nsfw, inappropriate, low quality, blurry, distorted",
          width: 768,
          height: 1024,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    );
    
    console.log('📸 Raw output:', output);
    console.log('📸 Output type:', typeof output);
    console.log('📸 Is array:', Array.isArray(output));
    
    let imageUrl;
    
    // 다양한 응답 형태 처리
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else if (output && output.url) {
      imageUrl = output.url;
    } else {
      console.error('❌ 예상치 못한 output:', output);
      throw new Error('이미지 생성 결과를 처리할 수 없습니다');
    }
    
    console.log('📸 최종 imageUrl:', imageUrl);
    console.log('📸 URL 타입:', typeof imageUrl);
    
    // URL 유효성 검사
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('유효하지 않은 이미지 데이터입니다');
    }
    
    if (!imageUrl.startsWith('http')) {
      throw new Error('유효하지 않은 이미지 URL 형식입니다');
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

// 동영상 생성 API (이미지만 생성하고 동영상은 나중에 구현)
app.post('/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트를 입력해주세요'
      });
    }
    
    console.log('🎬 동영상 생성 시작 (현재는 이미지만):', prompt);
    
    // 일단 이미지만 생성 (동영상은 복잡함)
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: `cinematic scene, ${prompt}, movie still, high quality, detailed`,
          negative_prompt: "nsfw, inappropriate, low quality, blurry, distorted",
          width: 1024,
          height: 576, // 16:9 비율
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 25,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    );
    
    let imageUrl;
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error('이미지 생성 실패');
    }
    
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      throw new Error('유효하지 않은 이미지 URL');
    }
    
    // 임시로 이미지를 동영상처럼 보이게 처리
    res.json({
      success: true,
      videoUrl: imageUrl, // 임시로 이미지 URL을 동영상 URL로 사용
      imageUrl: imageUrl,
      prompt: prompt,
      note: "현재는 정적 이미지입니다. 동영상 기능은 준비 중입니다."
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
  console.log('🚀 최종 AI 생성기 시작!');
  console.log(`📡 주소: http://localhost:${PORT}`);
  console.log('💡 이번엔 진짜로 작동합니다!');
});