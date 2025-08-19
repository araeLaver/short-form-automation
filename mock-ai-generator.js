import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3010;

app.use(cors());
app.use(express.json());

// 메인 페이지
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>작동하는 AI 생성기 (데모)</title>
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
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
            }
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
            <h1>🎨 작동하는 AI 생성기</h1>
            <p class="subtitle">텍스트로 AI 이미지와 동영상을 생성하세요</p>
            
            <div class="warning">
                ⚠️ <strong>현재 데모 버전입니다</strong><br>
                Replicate API ReadableStream 이슈로 인해 샘플 이미지를 표시합니다.<br>
                인터페이스와 기능은 정상 작동하며, API 문제 해결 후 실제 AI 생성이 가능합니다.
            </div>
            
            <textarea id="textInput" placeholder="원하는 이미지나 동영상을 설명해주세요..."></textarea>
            
            <div class="buttons">
                <button class="btn-image" onclick="generateImage()">📸 이미지 생성 (데모)</button>
                <button class="btn-video" onclick="generateVideo()">🎬 동영상 생성 (데모)</button>
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
                result.innerHTML = '📸 AI 이미지 생성 중...<br><small>데모 이미지를 불러오는 중...</small>';
                
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
                            <h3>✅ 이미지 생성 완료! (데모)</h3>
                            <img src="\${data.imageUrl}" alt="Sample AI Generated Image" loading="lazy">
                            <div style="margin-top: 15px;">
                                <strong>프롬프트:</strong> \${text}
                            </div>
                            <div style="margin-top: 10px; padding: 10px; background: #e8f4f8; border-radius: 5px; font-size: 14px;">
                                💡 <strong>노트:</strong> 현재는 샘플 이미지입니다. 실제 AI 생성 기능은 API 문제 해결 후 활성화됩니다.
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
                result.innerHTML = '🎬 AI 동영상 생성 중...<br><small>데모 동영상을 불러오는 중...</small>';
                
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
                            <h3>✅ 동영상 생성 완료! (데모)</h3>
                            <video controls autoplay loop style="width: 100%; max-width: 500px;">
                                <source src="\${data.videoUrl}" type="video/mp4">
                                브라우저가 동영상을 지원하지 않습니다.
                            </video>
                            <div style="margin-top: 15px;">
                                <strong>프롬프트:</strong> \${text}
                            </div>
                            <div style="margin-top: 10px; padding: 10px; background: #e8f4f8; border-radius: 5px; font-size: 14px;">
                                💡 <strong>노트:</strong> 현재는 샘플 동영상입니다. 실제 AI 생성 기능은 API 문제 해결 후 활성화됩니다.
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

// Mock 이미지 생성 API
app.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트를 입력해주세요'
      });
    }
    
    console.log('📸 Mock 이미지 생성:', prompt);
    
    // 실제 생성하는 것처럼 약간의 지연
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 샘플 이미지 (Unsplash에서 가져온 고품질 이미지)
    const sampleImages = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=768&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=768&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=768&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=768&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=768&h=1024&fit=crop'
    ];
    
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    
    res.json({
      success: true,
      imageUrl: randomImage,
      prompt: prompt,
      note: "샘플 이미지입니다. 실제 AI 생성은 API 문제 해결 후 가능합니다."
    });
    
  } catch (error) {
    console.error('❌ Mock 이미지 생성 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mock 동영상 생성 API
app.post('/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '프롬프트를 입력해주세요'
      });
    }
    
    console.log('🎬 Mock 동영상 생성:', prompt);
    
    // 실제 생성하는 것처럼 더 긴 지연
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // 샘플 동영상 (작은 MP4 파일들)
    const sampleVideos = [
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
    ];
    
    const randomVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
    
    res.json({
      success: true,
      videoUrl: randomVideo,
      prompt: prompt,
      note: "샘플 동영상입니다. 실제 AI 생성은 API 문제 해결 후 가능합니다."
    });
    
  } catch (error) {
    console.error('❌ Mock 동영상 생성 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log('🚀 Mock AI 생성기 시작!');
  console.log(`📡 주소: http://localhost:${PORT}`);
  console.log('💡 현재는 데모 버전입니다. API 문제 해결 후 실제 AI 생성 가능합니다.');
  console.log('💰 API 비용 절약을 위해 샘플 이미지/동영상을 사용합니다.');
});