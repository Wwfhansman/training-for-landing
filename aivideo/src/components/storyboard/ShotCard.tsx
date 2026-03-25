'use client';

import React from 'react';
import { Shot } from '@/types';
import { useStoryboardStore } from '@/store/useStoryboardStore';
import { useProjectStore } from '@/store/useProjectStore';

interface ShotCardProps {
  shot: Shot;
}

const ShotCard: React.FC<ShotCardProps> = ({ shot }) => {
  const { generateImage, updateShotLocal, generatingImageIds } = useStoryboardStore();
  const { project, updateProject } = useProjectStore();
  const isGenerating = generatingImageIds.has(shot.id) || shot.imageStatus === 'generating';

  const handleGenerate = () => {
    generateImage(shot.id, shot.visualPrompt, project?.globalStylePrompt);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateShotLocal(shot.id, { visualPrompt: e.target.value });
  };

  return (
    <div className="glass-panel" style={{
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--surface-container-low)',
      transition: 'var(--transition-normal)',
      width: '100%',
    }}>
      {/* Image Area */}
      <div style={{
        aspectRatio: '16/9',
        backgroundColor: 'var(--surface-container-lowest)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid var(--outline-variant)'
      }}>
        {shot.imageUrl ? (
          <img 
            src={shot.imageUrl} 
            alt={shot.visualPrompt} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : isGenerating ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div className="spinner" style={{
              width: 32,
              height: 32,
              border: '3px solid rgba(192, 193, 255, 0.1)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>生成中...</span>
          </div>
        ) : shot.imageStatus === 'failed' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--error)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>生成失败</span>
            <button 
              onClick={handleGenerate}
              style={{ padding: '2px 8px', fontSize: '0.65rem', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderRadius: '4px', backgroundColor: 'var(--surface-container-high)' }}
            >
              重试
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--outline)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>EMPTY CANVAS</span>
          </div>
        )}

        <div style={{
          position: 'absolute',
          top: 'var(--spacing-2)',
          left: 'var(--spacing-2)',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.65rem',
          fontWeight: 700,
          color: 'white',
          backdropFilter: 'blur(4px)'
        }}>
          SHOT {shot.order.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Info Area */}
      <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <div>
          <label style={{ 
            fontSize: '0.65rem', 
            fontWeight: 700, 
            color: 'var(--on-surface-variant)', 
            display: 'block', 
            marginBottom: '4px',
            letterSpacing: '0.05em' 
          }}>
            VISUAL PROMPT
          </label>
          <textarea
            value={shot.visualPrompt}
            onChange={handlePromptChange}
            style={{
              width: '100%',
              backgroundColor: 'var(--surface-container-high)',
              border: '1px solid var(--outline-variant)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px',
              color: 'var(--on-surface)',
              fontSize: '0.85rem',
              resize: 'none',
              height: '60px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <button 
          className={shot.imageUrl ? "" : "btn-ai"}
          onClick={handleGenerate}
          disabled={isGenerating}
          style={shot.imageUrl ? {
            width: '100%',
            padding: '8px',
            backgroundColor: 'var(--surface-container-highest)',
            color: 'var(--on-surface)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            border: '1px solid var(--outline-variant)',
            opacity: isGenerating ? 0.5 : 1
          } : {
            width: '100%',
            padding: '8px',
            fontSize: '0.85rem',
            opacity: isGenerating ? 0.5 : 1
          }}
        >
          {shot.imageUrl ? '🔄 重新生成首帧' : '⚡ 生成首帧'}
        </button>
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ShotCard;
