// 전역 변수
let isGenerating = false;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    checkServerStatus();
    loadFilesList();
    initializeFormHandlers();
    initializeExtractorHandlers();
});

// 서버 상태 확인
async function checkServerStatus() {
    const statusElement = document.getElementById('status');
    
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (data.status === 'running') {
            statusElement.innerHTML = '<i class="fas fa-circle status-dot"></i><span>서버 연결됨</span>';
            statusElement.className = 'status';
        }
    } catch (error) {
        statusElement.innerHTML = '<i class="fas fa-circle status-dot"></i><span>서버 연결 실패</span>';
        statusElement.className = 'status offline';
    }
}

// 한국 콘텐츠 생성
async function generateKoreaContent() {
    if (isGenerating) return;
    
    isGenerating = true;
    showLoading('한국 뉴스 콘텐츠 생성 중...');
    
    try {
        const response = await fetch('/api/generate/korea', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayResult(result.data, 'korea');
            showToast('✅ 한국 콘텐츠 생성 완료!', 'success');
            loadFilesList(); // 파일 목록 새로고침
        } else {
            showToast('❌ 콘텐츠 생성 실패: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error generating Korea content:', error);
        showToast('❌ 서버 오류가 발생했습니다', 'error');
    } finally {
        hideLoading();
        isGenerating = false;
    }
}

// 글로벌 콘텐츠 생성
async function generateGlobalContent() {
    if (isGenerating) return;
    
    isGenerating = true;
    showLoading('글로벌 콘텐츠 생성 중...');
    
    try {
        const response = await fetch('/api/generate/global', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayResult(result.data, 'global');
            showToast('✅ 글로벌 콘텐츠 생성 완료!', 'success');
            loadFilesList(); // 파일 목록 새로고침
        } else {
            showToast('❌ 콘텐츠 생성 실패: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error generating global content:', error);
        showToast('❌ 서버 오류가 발생했습니다', 'error');
    } finally {
        hideLoading();
        isGenerating = false;
    }
}

// 로딩 표시
function showLoading(message = '처리 중...') {
    const loadingElement = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    
    loadingElement.querySelector('span').textContent = message;
    loadingElement.style.display = 'flex';
    resultContainer.style.display = 'none';
}

// 로딩 숨김
function hideLoading() {
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'none';
}

// 결과 표시
function displayResult(data, type) {
    const resultContainer = document.getElementById('resultContainer');
    const content = data.content || data.news || data.customData;
    const script = data.script;
    
    const badgeClass = type === 'korea' ? 'badge-korea' : type === 'custom' ? 'badge-custom' : 'badge-global';
    const badgeText = type === 'korea' ? '🇰🇷 한국' : type === 'custom' ? '🎨 맞춤' : '🌍 글로벌';
    
    const viralScore = content.viralScore ? `<div class="viral-score">바이럴 점수: <strong>${content.viralScore}/100</strong></div>` : '';
    const estimatedViews = content.estimatedViews ? `<div class="estimated-views">예상 조회수: <strong>${content.estimatedViews}</strong></div>` : '';
    
    // 비디오가 생성된 경우 비디오 플레이어 추가
    const videoPlayer = data.videoUrl ? `
        <div class="info-card">
            <h4><i class="fas fa-play-circle"></i> 생성된 동영상</h4>
            <video controls style="width: 100%; max-width: 400px; border-radius: 8px;">
                <source src="${data.videoUrl}" type="video/mp4">
                브라우저에서 비디오를 지원하지 않습니다.
            </video>
            <p><strong>파일:</strong> ${data.videoUrl.split('/').pop()}</p>
            <p><strong>길이:</strong> ${data.duration || 60}초</p>
            <a href="${data.videoUrl}" download class="btn btn-secondary" style="margin-top: 10px; display: inline-block;">
                <i class="fas fa-download"></i> 다운로드
            </a>
        </div>
    ` : '';
    
    resultContainer.innerHTML = `
        <div class="result-header">
            <div>
                <div class="result-title">${content.title}</div>
                <span class="result-badge ${badgeClass}">${badgeText}</span>
            </div>
        </div>
        
        <div class="result-content">
            ${videoPlayer}
            
            <div class="info-card">
                <h4><i class="fas fa-lightbulb"></i> 콘텐츠 개요</h4>
                <p><strong>카테고리:</strong> ${content.category}</p>
                <p><strong>요약:</strong> ${content.summary || content.hook}</p>
                ${viralScore}
                ${estimatedViews}
            </div>
            
            <div class="info-card">
                <h4><i class="fas fa-film"></i> 비디오 정보</h4>
                <p><strong>총 시간:</strong> ${script.estimatedDuration}초</p>
                <p><strong>장면 수:</strong> ${script.scenes.length}개</p>
                ${script.scenes.map((scene, index) => `
                    <div class="scene-info">
                        <strong>장면 ${index + 1} (${scene.duration}초):</strong> ${scene.type === 'hook' ? '🎯 인트로' : scene.type === 'title' ? '📝 제목' : scene.type === 'content' ? '💡 내용' : '👋 마무리'}
                        <br><small>🎙️ ${scene.voiceStyle || '자연스러운 톤'}</small>
                        <br><small>📺 ${scene.visual}</small>
                        ${scene.textOverlay ? `<br><small>📝 ${scene.textOverlay}</small>` : ''}
                    </div>
                `).join('')}
                <p><strong>생성 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
            </div>
            
            <div class="info-card">
                <h4><i class="fas fa-hashtag"></i> 플랫폼별 해시태그</h4>
                <div style="margin-bottom: 10px;">
                    <strong>YouTube:</strong>
                    <div class="hashtags">
                        ${script.platformOptimized?.youtube?.hashtags?.map(tag => `<span class="hashtag">#${tag}</span>`).join('') || '해시태그 없음'}
                    </div>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Instagram:</strong>
                    <div class="hashtags">
                        ${script.platformOptimized?.instagram?.hashtags?.map(tag => `<span class="hashtag">#${tag}</span>`).join('') || '해시태그 없음'}
                    </div>
                </div>
                <div>
                    <strong>TikTok:</strong>
                    <div class="hashtags">
                        ${script.platformOptimized?.tiktok?.hashtags?.map(tag => `<span class="hashtag">#${tag}</span>`).join('') || '해시태그 없음'}
                    </div>
                </div>
            </div>
            
            <div class="info-card">
                <h4><i class="fas fa-chart-bar"></i> 예상 성과</h4>
                <p><strong>예상 조회수:</strong> ${data.estimatedViews || '1M+'}</p>
                <p><strong>참여율:</strong> 8-12%</p>
                <p><strong>바이럴 가능성:</strong> ${data.viralScore || 75}%</p>
            </div>
            
            <button class="btn btn-secondary" onclick="showScriptDetails('${script.id}', '${type}')">
                <i class="fas fa-eye"></i> 상세 스크립트 보기
            </button>
        </div>
    `;
    
    resultContainer.style.display = 'block';
}

// 파일 목록 로드
async function loadFilesList() {
    try {
        const response = await fetch('/api/files');
        const result = await response.json();
        
        const filesListElement = document.getElementById('filesList');
        
        if (result.success && result.files.length > 0) {
            filesListElement.innerHTML = result.files.map(file => `
                <div class="file-item" onclick="showFileContent('${file.name}')">
                    <div class="file-info">
                        <div class="file-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="file-details">
                            <h4>${file.name}</h4>
                            <small>${formatFileSize(file.size)} • ${formatDate(file.modified)}</small>
                        </div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
            `).join('');
        } else {
            filesListElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>생성된 파일이 없습니다</p>
                    <small>콘텐츠를 생성하면 여기에 표시됩니다</small>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading files list:', error);
    }
}

// 파일 내용 보기
async function showFileContent(filename) {
    try {
        const response = await fetch(`/api/files/${filename}`);
        const result = await response.json();
        
        if (result.success) {
            showModal(`📄 ${filename}`, JSON.stringify(result.content, null, 2));
        } else {
            showToast('❌ 파일을 읽을 수 없습니다', 'error');
        }
    } catch (error) {
        console.error('Error loading file content:', error);
        showToast('❌ 파일 로드 오류', 'error');
    }
}

// 스크립트 상세보기
function showScriptDetails(scriptId, type) {
    // 현재 표시된 결과에서 스크립트 데이터 가져오기
    const filename = `script-${type}-${scriptId}.json`;
    showFileContent(filename);
}

// 모달 표시
function showModal(title, content) {
    const modal = document.getElementById('detailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = `<div class="json-viewer">${content}</div>`;
    
    modal.style.display = 'block';
    
    // 모달 외부 클릭 시 닫기
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
}

// 모달 닫기
function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// 토스트 메시지 표시
function showToast(message, type = 'info') {
    // 간단한 토스트 구현
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 애니메이션으로 표시
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // 3초 후 제거
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 유틸리티 함수들
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
}

// 폼 핸들러 초기화
function initializeFormHandlers() {
    const contentTextarea = document.getElementById('customContent');
    const contentLengthSpan = document.getElementById('contentLength');
    
    // 텍스트 길이 카운터
    if (contentTextarea && contentLengthSpan) {
        contentTextarea.addEventListener('input', function() {
            const length = this.value.length;
            contentLengthSpan.textContent = length;
            
            // 글자 수 표시 (색상은 중성으로 유지)
            contentLengthSpan.style.color = '#6b7280';
        });
    }
}

// 프롬프트 추출기 핸들러 초기화
function initializeExtractorHandlers() {
    const rawContentTextarea = document.getElementById('rawContent');
    const rawContentLengthSpan = document.getElementById('rawContentLength');
    
    // 원본 내용 길이 카운터
    if (rawContentTextarea && rawContentLengthSpan) {
        rawContentTextarea.addEventListener('input', function() {
            const length = this.value.length;
            rawContentLengthSpan.textContent = length;
        });
    }
}

// 타겟 지역별 스타일 옵션 업데이트
function updateStyleOptions() {
    const targetRegion = document.getElementById('targetRegion').value;
    const regionDescription = document.getElementById('regionDescription');
    const toneSelect = document.getElementById('extractorTone');
    
    if (targetRegion === 'korea') {
        regionDescription.textContent = '자막, 이미지 나열, 음성/자막 중심의 정보 전달';
        
        // 대한민국 타겟용 톤 옵션
        toneSelect.innerHTML = `
            <option value="informative">정보 전달형 (명확한 설명)</option>
            <option value="educational">교육형 (step-by-step)</option>
            <option value="news">뉴스형 (팩트 중심)</option>
            <option value="tutorial">튜토리얼형 (따라하기)</option>
            <option value="review">리뷰형 (장단점 분석)</option>
        `;
    } else {
        regionDescription.textContent = '인간 심리 자극, 캐릭터 중심, 집중도 높은 감정 어필';
        
        // 해외 타겟용 톤 옵션  
        toneSelect.innerHTML = `
            <option value="dramatic">드라마틱 (감정 몰입)</option>
            <option value="mysterious">미스터리 (호기심 유발)</option>
            <option value="shocking">충격적 (강한 임팩트)</option>
            <option value="inspiring">영감적 (동기부여)</option>
            <option value="entertaining">엔터테인먼트 (재미 중심)</option>
        `;
    }
}

// 프롬프트 추출 함수
async function extractPrompt() {
    const rawContent = document.getElementById('rawContent').value.trim();
    const tone = document.getElementById('extractorTone').value;
    const length = document.getElementById('extractorLength').value;
    const targetRegion = document.getElementById('targetRegion').value;
    
    if (!rawContent) {
        showToast('❌ 내용을 입력해주세요', 'error');
        return;
    }
    
    if (rawContent.length < 20) {
        showToast('❌ 더 자세한 내용을 입력해주세요 (최소 20자)', 'error');
        return;
    }
    
    try {
        showToast('🔄 프롬프트 추출 중...', 'info');
        
        const response = await fetch('/api/extract-prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: rawContent,
                tone: tone,
                length: length,
                targetRegion: targetRegion
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayExtractedPrompt(result.data);
            showToast('✅ 프롬프트 추출 완료!', 'success');
        } else {
            showToast('❌ 프롬프트 추출 실패: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error extracting prompt:', error);
        showToast('❌ 서버 오류가 발생했습니다', 'error');
    }
}

// 추출된 프롬프트 표시
function displayExtractedPrompt(data) {
    const resultDiv = document.getElementById('extractedResult');
    const titleDiv = document.getElementById('extractedTitle');
    const contentDiv = document.getElementById('extractedContent');
    const categoryDiv = document.getElementById('extractedCategory');
    const hashtagsDiv = document.getElementById('extractedHashtags');
    
    titleDiv.textContent = data.title;
    contentDiv.textContent = data.content;
    categoryDiv.textContent = data.category;
    hashtagsDiv.textContent = data.hashtags;
    
    resultDiv.style.display = 'block';
}

// 클립보드로 복사
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('📋 클립보드에 복사되었습니다!', 'success');
    }).catch(err => {
        console.error('복사 실패:', err);
        showToast('❌ 복사에 실패했습니다', 'error');
    });
}

// 추출된 내용을 맞춤 콘텐츠 생성에 적용
function useExtractedContent() {
    const extractedTitle = document.getElementById('extractedTitle').textContent;
    const extractedContent = document.getElementById('extractedContent').textContent;
    const extractedCategory = document.getElementById('extractedCategory').textContent;
    const extractedHashtags = document.getElementById('extractedHashtags').textContent;
    
    // 맞춤 콘텐츠 폼에 값 설정
    document.getElementById('customTitle').value = extractedTitle;
    document.getElementById('customContent').value = extractedContent;
    document.getElementById('customHashtags').value = extractedHashtags;
    
    // 카테고리 선택
    const categorySelect = document.getElementById('customCategory');
    const options = Array.from(categorySelect.options);
    const matchingOption = options.find(option => option.text === extractedCategory);
    if (matchingOption) {
        categorySelect.value = matchingOption.value;
    }
    
    // 길이 업데이트
    document.getElementById('contentLength').textContent = extractedContent.length;
    
    showToast('✅ 추출된 내용이 적용되었습니다!', 'success');
    
    // 맞춤 콘텐츠 생성 섹션으로 스크롤
    document.querySelector('.custom-content-panel').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// 영어 번역 함수
async function translateToEnglish(elementId) {
    const element = document.getElementById(elementId);
    const button = event.target;
    const originalText = element.textContent;
    
    if (!originalText || originalText.trim().length === 0) {
        showToast('❌ 번역할 내용이 없습니다', 'error');
        return;
    }
    
    // 이미 영어인지 간단히 체크
    const koreanRegex = /[가-힣]/;
    if (!koreanRegex.test(originalText)) {
        showToast('ℹ️ 이미 영어 텍스트인 것 같습니다', 'info');
        return;
    }
    
    try {
        // 버튼 상태 변경
        button.textContent = '🔄 번역중...';
        button.classList.add('loading');
        
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: originalText,
                targetLanguage: 'en'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            element.textContent = result.translatedText;
            showToast('✅ 영어로 번역되었습니다!', 'success');
            
            // 버튼을 '한국어로' 변경
            button.textContent = '🇰🇷 한글';
            button.onclick = () => restoreOriginalText(elementId, originalText, button);
        } else {
            showToast('❌ 번역 실패: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('번역 오류:', error);
        showToast('❌ 번역 서비스 오류가 발생했습니다', 'error');
    } finally {
        button.classList.remove('loading');
        if (button.textContent === '🔄 번역중...') {
            button.textContent = '🌍 영어';
        }
    }
}

// 원본 텍스트 복원 함수
function restoreOriginalText(elementId, originalText, button) {
    const element = document.getElementById(elementId);
    element.textContent = originalText;
    button.textContent = '🌍 영어';
    button.onclick = () => translateToEnglish(elementId);
    showToast('✅ 한국어로 복원되었습니다!', 'success');
}

// AI 동영상 생성 프롬프트 생성
async function generateVideoPrompts() {
    const extractedTitle = document.getElementById('extractedTitle').textContent;
    const extractedContent = document.getElementById('extractedContent').textContent;
    const extractedCategory = document.getElementById('extractedCategory').textContent;
    
    if (!extractedTitle || !extractedContent) {
        showToast('❌ 먼저 프롬프트를 추출해주세요', 'error');
        return;
    }
    
    try {
        showToast('🎬 AI 동영상 프롬프트 생성 중...', 'info');
        
        const response = await fetch('/api/generate-video-prompts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: extractedTitle,
                content: extractedContent,
                category: extractedCategory,
                targetRegion: document.getElementById('targetRegion').value
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayVideoPrompts(result.data);
            showToast('✅ AI 동영상 프롬프트 생성 완료!', 'success');
        } else {
            showToast('❌ 프롬프트 생성 실패: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('비주얼 프롬프트 생성 오류:', error);
        showToast('❌ 서버 오류가 발생했습니다', 'error');
    }
}

// 비주얼 프롬프트 결과 표시
function displayVideoPrompts(data) {
    const resultDiv = document.getElementById('videoPromptsResult');
    const mainVisualDiv = document.getElementById('mainVisualPrompt');
    const shotPromptsContainer = document.getElementById('shotPromptsContainer');
    const technicalSettingsDiv = document.getElementById('technicalSettings');
    const styleGuideDiv = document.getElementById('styleGuide');
    
    // 메인 비주얼 프롬프트
    mainVisualDiv.textContent = data.mainVisualPrompt;
    
    // 샷별 프롬프트
    shotPromptsContainer.innerHTML = data.shotPrompts.map((shot, index) => `
        <div class="shot-prompt">
            <h5>Shot ${index + 1} (${shot.duration}초) - ${shot.type}</h5>
            <p><strong>비주얼:</strong> ${shot.visualPrompt}</p>
            <p><strong>카메라:</strong> ${shot.cameraAngle}</p>
            <p><strong>무드:</strong> ${shot.mood}</p>
            <button class="copy-btn" onclick="copyText('${shot.visualPrompt}')">복사</button>
        </div>
    `).join('');
    
    // 기술적 설정
    technicalSettingsDiv.textContent = data.technicalSettings;
    
    // 스타일 가이드
    styleGuideDiv.textContent = data.styleGuide;
    
    resultDiv.style.display = 'block';
}

// 텍스트 직접 복사 함수
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('📋 클립보드에 복사되었습니다!', 'success');
    }).catch(err => {
        console.error('복사 실패:', err);
        showToast('❌ 복사에 실패했습니다', 'error');
    });
}

// 맞춤 콘텐츠 생성
async function generateCustomContent(event) {
    event.preventDefault();
    
    if (isGenerating) return;
    
    // 폼 데이터 수집
    const title = document.getElementById('customTitle').value.trim();
    const content = document.getElementById('customContent').value.trim();
    const category = document.getElementById('customCategory').value;
    const duration = document.getElementById('customDuration').value;
    const hashtags = document.getElementById('customHashtags').value.trim();
    
    // 필수 필드 검증 (내용만 필수)
    if (!content) {
        showToast('❌ 내용을 입력해주세요', 'error');
        return;
    }
    
    if (content.length < 10) {
        showToast('❌ 내용을 10자 이상 입력해주세요', 'error');
        return;
    }
    
    isGenerating = true;
    showLoading('맞춤 동영상 생성 중...');
    
    try {
        const response = await fetch('/api/generate/custom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                content: content,
                category: category,
                duration: duration,
                hashtags: hashtags
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayResult(result.data, 'custom');
            showToast('✅ 맞춤 동영상 생성 완료!', 'success');
            loadFilesList(); // 파일 목록 새로고침
            
            // 폼 초기화 (선택사항)
            // document.querySelector('.custom-form').reset();
        } else {
            showToast('❌ 동영상 생성 실패: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error generating custom content:', error);
        showToast('❌ 서버 오류가 발생했습니다', 'error');
    } finally {
        hideLoading();
        isGenerating = false;
    }
}

// 키보드 이벤트 (ESC로 모달 닫기)
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});