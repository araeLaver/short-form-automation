import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ReplicateService from './src/services/replicateService.js';

dotenv.config();

const app = express();
const PORT = 3005;
const replicateService = new ReplicateService();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 간단한 메인 페이지
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI 콘텐츠 생성기</title>
        <meta charset="utf-8">
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 50px auto; 
                padding: 20px;
                background: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #333; text-align: center; }
            textarea { 
                width: 100%; 
                height: 120px; 
                margin: 10px 0; 
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
            }
            .buttons {
                display: flex;
                gap: 20px;
                margin: 20px 0;
            }
            button { 
                flex: 1;
                padding: 15px 20px; 
                font-size: 16px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                transition: all 0.3s;
            }
            .btn-image { 
                background: #4CAF50; 
                color: white; 
            }
            .btn-image:hover { 
                background: #45a049; 
            }
            .btn-video { 
                background: #2196F3; 
                color: white; 
            }
            .btn-video:hover { 
                background: #1976D2; 
            }
            .result { 
                margin-top: 20px; 
                padding: 15px; 
                background: #f0f8ff; 
                border-radius: 5px;
                display: none;
            }
            .loading {
                text-align: center;
                color: #666;
                font-style: italic;
            }
            .error {
                background: #ffe6e6;
                color: #cc0000;
                border: 1px solid #ffcccc;
            }
            .success img, .success video {
                max-width: 100%;
                height: auto;
                border-radius: 5px;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎨 AI 콘텐츠 생성기</h1>
            <p>텍스트를 입력하면 AI가 이미지나 동영상을 만들어드립니다!</p>
            
            <textarea id="textInput" placeholder="예: 아름다운 한국의 야경, 사람들이 걷고 있는 모습, 네온사인이 빛나는 거리"></textarea>
            
            <div class="buttons">
                <button class="btn-image" onclick="generateImage()">
                    📸 이미지 생성
                </button>
                <button class="btn-video" onclick="generateVideo()">
                    🎬 동영상 생성
                </button>
            </div>
            
            <div id="result" class="result"></div>
        </div>

        <script>
            async function generateImage() {
                const text = document.getElementById('textInput').value.trim();
                if (!text) {
                    alert('내용을 입력해주세요!');
                    return;
                }
                
                const result = document.getElementById('result');
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = '🎨 이미지 생성 중... (30초~1분 소요)';
                
                try {
                    const response = await fetch('/api/generate-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: text })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        result.className = 'result success';
                        result.innerHTML = \`
                            <h3>✅ 이미지 생성 완료!</h3>
                            <img src="\${data.imageUrl}" alt="Generated Image">
                            <p><strong>프롬프트:</strong> \${text}</p>
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
                    alert('내용을 입력해주세요!');
                    return;
                }
                
                const result = document.getElementById('result');
                result.className = 'result loading';
                result.style.display = 'block';
                result.innerHTML = '🎬 동영상 생성 중... (2~3분 소요)';
                
                try {
                    const response = await fetch('/api/generate-video', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: text })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        result.className = 'result success';
                        result.innerHTML = \`
                            <h3>✅ 동영상 생성 완료!</h3>
                            <video controls>
                                <source src="\${data.videoUrl}" type="video/mp4">
                            </video>
                            <p><strong>프롬프트:</strong> \${text}</p>
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
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '텍스트를 입력해주세요'
      });
    }
    
    console.log('🎨 이미지 생성 시작:', prompt);
    
    const imageUrls = await replicateService.generateImage(prompt, {
      width: 768,
      height: 1344, // 숏폼용 9:16 비율
      numOutputs: 1
    });
    
    res.json({
      success: true,
      imageUrl: imageUrls[0],
      prompt: prompt
    });
    
  } catch (error) {
    console.error('이미지 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 동영상 생성 API
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '텍스트를 입력해주세요'
      });
    }
    
    console.log('🎬 동영상 생성 시작:', prompt);
    
    const videoUrl = await replicateService.textToVideo(prompt, {
      numFrames: 16
    });
    
    res.json({
      success: true,
      videoUrl: videoUrl,
      prompt: prompt
    });
    
  } catch (error) {
    console.error('동영상 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 서버 상태 확인
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'AI 콘텐츠 생성기 준비됨',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('🚀 간단한 AI 콘텐츠 생성기가 시작되었습니다!');
  console.log(`📡 서버 주소: http://localhost:${PORT}`);
  console.log('✨ 브라우저에서 텍스트를 입력하고 AI 콘텐츠를 생성해보세요!');
});