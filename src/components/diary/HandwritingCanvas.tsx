import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Eraser, Trash2, Download, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type OCRTemplate = 'blank' | 'diary' | 'grid' | 'lined';

interface HandwritingCanvasProps {
  onSave?: (file: File) => void;
  template?: OCRTemplate;
}

export function HandwritingCanvas({ onSave, template = 'blank' }: HandwritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#4A3228');
  const [lineWidth, setLineWidth] = useState(2);
  const [isEraser, setIsEraser] = useState(false);
  const [customColor, setCustomColor] = useState('#4A3228');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1200 });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크모드 체크
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // 화면 크기에 따라 캔버스 크기 조정
  useEffect(() => {
    const updateCanvasSize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // 모바일: 세로로 더 긴 비율
        setCanvasSize({ width: 800, height: 1400 });
      } else {
        // 데스크톱: 약간 세로로 긴 비율
        setCanvasSize({ width: 1000, height: 1400 });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // 템플릿에 따라 캔버스 배경 그리기
  const drawTemplate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasSize;

    // 기본 배경 (다크모드면 검정, 라이트모드면 흰색)
    ctx.fillStyle = isDarkMode ? '#1a1a1a' : '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 템플릿별 배경
    if (template === 'diary') {
      // 그림일기 템플릿 - 반으로 나누기
      const halfHeight = height / 2;
      const titleHeight = 70;
      const gridTop = halfHeight + titleHeight;
      const gridCols = 10;
      const gridRows = 8;
      const cellWidth = width / gridCols;
      const cellHeight = (height - gridTop) / gridRows;

      // 1. 상단 큰 네모 박스 (절반)
      ctx.strokeStyle = isDarkMode ? '#888888' : '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, width, halfHeight);

      // 2. 제목 영역
      ctx.strokeStyle = isDarkMode ? '#888888' : '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, halfHeight, width, titleHeight);
      ctx.fillStyle = isDarkMode ? '#d4d4d4' : '#000000';
      ctx.font = '32px sans-serif';
      ctx.fillText('제 목:', 30, halfHeight + 45);

      // 3. 원고지 그리드 영역
      ctx.strokeStyle = isDarkMode ? '#888888' : '#000000';
      ctx.lineWidth = 1.5;
      
      // 세로선
      for (let i = 0; i <= gridCols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellWidth, gridTop);
        ctx.lineTo(i * cellWidth, height);
        ctx.stroke();
      }
      
      // 가로선
      for (let i = 0; i <= gridRows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, gridTop + i * cellHeight);
        ctx.lineTo(width, gridTop + i * cellHeight);
        ctx.stroke();
      }
      
    } else if (template === 'lined') {
      // 줄 노트: 가로줄
      ctx.strokeStyle = isDarkMode ? '#555555' : '#D0D0D0';
      ctx.lineWidth = 1.5;
      const lineSpacing = 60;
      for (let y = lineSpacing; y < height; y += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    // 'blank'는 배경만
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    drawTemplate();
  }, [template, canvasSize, isDarkMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let x, y;

    if ('touches' in e) {
      e.preventDefault();
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let x, y;

    if ('touches' in e) {
      e.preventDefault();
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }

    ctx.strokeStyle = isEraser ? (isDarkMode ? '#1a1a1a' : '#FFFFFF') : color;
    ctx.lineWidth = isEraser ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    drawTemplate();
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob && onSave) {
        const file = new File([blob], `handwriting-${Date.now()}.png`, {
          type: 'image/png'
        });
        onSave(file);
      }
    }, 'image/png');
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `handwriting-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* 캔버스 */}
      <div className="border-2 rounded-lg overflow-hidden bg-white" style={{ borderColor: '#E6E0D6' }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="w-full touch-none"
          style={{ backgroundColor: '#FFFFFF', cursor: 'crosshair', display: 'block' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* 도구 */}
      <div className="flex flex-col gap-3">
        {/* 색상 선택 */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs" style={{ color: '#4A3228' }}>
            색상
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {[
              '#4A3228', // 다크 브라운
              '#7B8B4F', // 올리브 그린
              '#000000', // 검정
              '#EF4444', // 빨강
              '#F59E0B', // 주황
              '#FBBF24', // 노랑
              '#10B981', // 초록
              '#3B82F6', // 파랑
              '#8B5CF6', // 보라
              '#EC4899', // 핑크
            ].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
                className="w-10 h-10 rounded border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: color === c && !isEraser ? '#7B8B4F' : '#E6E0D6',
                  boxShadow: color === c && !isEraser ? '0 0 0 2px #F0F7E6' : 'none'
                }}
              />
            ))}
            
            {/* 커스텀 색상 선택 */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="w-10 h-10 rounded border-2 transition-all hover:scale-110 flex items-center justify-center"
                  style={{
                    backgroundColor: customColor,
                    borderColor: color === customColor && !isEraser ? '#7B8B4F' : '#E6E0D6',
                    boxShadow: color === customColor && !isEraser ? '0 0 0 2px #F0F7E6' : 'none'
                  }}
                >
                  <Plus className="w-4 h-4 text-white" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))' }} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" style={{ borderColor: '#E6E0D6' }}>
                <div className="space-y-2">
                  <Label className="text-xs" style={{ color: '#4A3228' }}>
                    원하는 색상 선택
                  </Label>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setColor(e.target.value);
                      setIsEraser(false);
                    }}
                    className="w-full h-32 cursor-pointer rounded border"
                    style={{ borderColor: '#E6E0D6' }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 선 굵기 */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs" style={{ color: '#4A3228' }}>
            굵기
          </Label>
          <div className="flex gap-1.5">
            {[1, 2, 4, 6].map((width) => (
              <button
                key={width}
                onClick={() => setLineWidth(width)}
                className="w-10 h-10 rounded border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: lineWidth === width ? '#7B8B4F' : '#E6E0D6',
                  backgroundColor: lineWidth === width ? '#F0F7E6' : '#FFFFFF'
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: `${width * 2}px`,
                    height: `${width * 2}px`,
                    backgroundColor: '#4A3228'
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 지우개와 전체 지우기 */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs" style={{ color: '#4A3228' }}>
            도구
          </Label>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEraser(!isEraser)}
              variant={isEraser ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              style={isEraser ? { backgroundColor: '#7B8B4F', color: '#FFFFFF' } : { borderColor: '#E6E0D6', color: '#4A3228' }}
            >
              <Eraser className="w-4 h-4 mr-1" />
              지우개
            </Button>

            <Button
              onClick={clearCanvas}
              variant="outline"
              size="sm"
              className="flex-1"
              style={{ borderColor: '#E6E0D6', color: '#4A3228' }}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              전체 지우기
            </Button>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <Button
        onClick={saveCanvas}
        className="w-full text-white"
        style={{ backgroundColor: '#7B8B4F' }}
      >
        <Download className="w-4 h-4 mr-2" />
        작성 완료
      </Button>
    </div>
  );
}