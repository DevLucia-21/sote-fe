import React from 'react';

export type NoteLength = 'whole' | 'half' | 'quarter' | 'eighth';

interface MusicalNoteProps {
  color: string;
  size?: number;
  noteLength?: NoteLength;
  needsLedgerLine?: boolean;
  stemDirection?: 'up' | 'down';
}

export function MusicalNote({ 
  color, 
  size = 40, 
  noteLength = 'quarter', 
  needsLedgerLine = false,
  stemDirection = 'up'
}: MusicalNoteProps) {
  
  // size 기반 스케일링 (기본 40 기준)
  const scale = size / 40;
  
  // 타원 설정 (notehead) - 적당한 크기
  const noteheadHeight = 15 * scale;
  const noteheadWidth = 17 * scale;
  const ellipseRx = noteheadWidth / 2;
  const ellipseRy = noteheadHeight / 2;
  
  // 기둥 설정
  const stemWidth = 2.5 * scale;
  const stemLength = 50 * scale;
  
  // SVG 크기를 기둥을 담을 수 있을 만큼 크게
  const svgHeight = stemLength + 40 * scale; // 기둥 + 여유 공간
  const svgWidth = 40 * scale;
  
  // 타원 배치 - 기둥 방향에 따라 위치 조정
  let ellipseCx: number;
  let ellipseCy: number;
  
  if (stemDirection === 'up') {
    ellipseCx = svgWidth / 2;
    ellipseCy = stemLength + 20 * scale; // 기둥이 위로 가므로 타원을 아래쪽에
  } else {
    ellipseCx = svgWidth / 2;
    ellipseCy = 20 * scale; // 기둥이 아래로 가므로 타원을 위쪽에
  }
  
  const ellipseRotation = -12; // 타원 회전 각도 - 살짝만 기울여서 귀엽게
  
  // 타원과 기둥 위치 계산
  let stemX: number;
  let stemY: number;
  
  if (stemDirection === 'up') {
    // 기둥이 위로: 타원 오른쪽에 기둥
    stemX = ellipseCx + ellipseRx - 1 * scale;
    stemY = ellipseCy - stemLength;
  } else {
    // 기둥이 아래로: 2분음표는 타원보다 더 왼쪽, 나머지는 타원 왼쪽 끝
    if (noteLength === 'half') {
      stemX = ellipseCx - ellipseRx - 1 * scale; // 2분음표는 더 왼쪽
    } else {
      stemX = ellipseCx - ellipseRx; // 4분/8분음표
    }
    stemY = ellipseCy;
  }
  
  // 보조선 위치 및 길이 계산
  const ledgerLineLength = 14 * scale;
  const ledgerLineY = stemDirection === 'down' ? ellipseCy + ellipseRy : ellipseCy;
  
  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      {/* Ledger line if needed */}
      {needsLedgerLine && (
        <line
          x1={ellipseCx - ledgerLineLength}
          y1={ledgerLineY}
          x2={ellipseCx + ledgerLineLength}
          y2={ledgerLineY}
          stroke="#4A3228"
          strokeWidth={2 * scale}
          opacity="0.28"
          strokeLinecap="round"
        />
      )}
      
      {/* Note head */}
      {noteLength === 'whole' ? (
        // Whole note - hollow oval
        <ellipse
          cx={ellipseCx}
          cy={ellipseCy}
          rx={ellipseRx}
          ry={ellipseRy}
          fill="none"
          stroke={color}
          strokeWidth={2.5 * scale}
          strokeLinejoin="round"
          transform={`rotate(${ellipseRotation} ${ellipseCx} ${ellipseCy})`}
        />
      ) : noteLength === 'half' ? (
        // Half note - hollow oval with stem
        <>
          <ellipse
            cx={ellipseCx}
            cy={ellipseCy}
            rx={ellipseRx}
            ry={ellipseRy}
            fill="none"
            stroke={color}
            strokeWidth={2.5 * scale}
            strokeLinejoin="round"
            transform={`rotate(${ellipseRotation} ${ellipseCx} ${ellipseCy})`}
          />
          <rect
            x={stemX}
            y={stemY}
            width={stemWidth}
            height={stemLength}
            fill={color}
            rx={0.75 * scale}
          />
        </>
      ) : (
        // Quarter and eighth notes - filled oval with stem
        <>
          <ellipse
            cx={ellipseCx}
            cy={ellipseCy}
            rx={ellipseRx}
            ry={ellipseRy}
            fill={color}
            stroke="none"
            transform={`rotate(${ellipseRotation} ${ellipseCx} ${ellipseCy})`}
          />
          <rect
            x={stemX}
            y={stemY}
            width={stemWidth}
            height={stemLength}
            fill={color}
            rx={0.75 * scale}
          />
          
          {/* Flag for eighth note - 길고 오른쪽으로 확장, 기둥에 붙은 부분 두껍게 */}
          {noteLength === 'eighth' && (
            <>
              {stemDirection === 'up' ? (
                <path
                  d={`M ${stemX + stemWidth} ${stemY} Q ${stemX + 18 * scale} ${stemY + 1 * scale} ${stemX + 18 * scale} ${stemY + 22 * scale} Q ${stemX + 6 * scale} ${stemY + 11 * scale} ${stemX + stemWidth} ${stemY + 16 * scale} Z`}
                  fill={color}
                  opacity="0.85"
                />
              ) : (
                <path
                  d={`M ${stemX} ${stemY + stemLength} Q ${stemX - 16 * scale} ${stemY + stemLength - 1 * scale} ${stemX - 16 * scale} ${stemY + stemLength - 22 * scale} Q ${stemX - 5 * scale} ${stemY + stemLength - 11 * scale} ${stemX} ${stemY + stemLength - 16 * scale} Z`}
                  fill={color}
                  opacity="0.85"
                />
              )}
            </>
          )}
        </>
      )}
    </svg>
  );
}

// Get note length based on content length
export function getNoteLength(contentLength: number): NoteLength {
  if (contentLength > 200) return 'whole';
  if (contentLength > 100) return 'half';
  if (contentLength > 50) return 'quarter';
  return 'eighth';
}
