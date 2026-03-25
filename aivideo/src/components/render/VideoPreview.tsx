'use client';

import React from 'react';
import { FragmentWithShots } from '@/types';
import { useRenderStore } from '@/store/useRenderStore';

interface VideoPreviewProps {
  fragment: FragmentWithShots;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ fragment }) => {
  const { processingFragmentIds, startRender } = useRenderStore();
  const isProcessing = processingFragmentIds.has(fragment.id) || fragment.videoStatus === 'queued' || fragment.videoStatus === 'in_progress';

  return (
    <div className="glass-panel" style={{
      flex: 1,
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--surface-container-lowest)',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-4) var(--spacing-6)',
        borderBottom: '1px solid var(--outline-variant)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em' }}>
             VIDEO SYNTHESIS
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
            片段 {fragment.order.toString().padStart(2, '0')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            backgroundColor: fragment.videoStatus === 'completed' ? '#4CAF50' : isProcessing ? 'var(--tertiary)' : 'var(--outline)' 
          }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
            {fragment.videoStatus === 'completed' ? 'READY FOR PLAYBACK' : isProcessing ? 'SYNTHESIZING...' : 'READY FOR INFERENCE'}
          </span>
        </div>
      </div>

      {/* Viewport */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: '#000'
      }}>
        {isProcessing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-6)' }}>
            <div className="spinner" style={{
              width: 48,
              height: 48,
              border: '4px solid rgba(192, 193, 255, 0.1)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', color: 'var(--on-surface)', marginBottom: '8px' }}>
                正在为您合成 {useRenderStore.getState().renderParams.seconds}s 有声漫剧片段
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', opacity: 0.6 }}>
                使用 Kling v3.0 Omni 渲染引擎 (包含 AI 配音)
              </p>
            </div>
          </div>
        ) : fragment.videoUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video 
              src={fragment.videoUrl} 
              controls 
              style={{ maxWidth: '100%', maxHeight: '100%', width: '100%', height: 'auto', borderRadius: 'var(--radius-lg)' }}
              autoPlay
              loop
            />
            <button 
              onClick={() => startRender(fragment.id)}
              className="btn-secondary"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                borderRadius: 'var(--radius-sm)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
              重新合成
            </button>
          </div>
        ) : fragment.videoStatus === 'failed' ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
            <div style={{ color: 'var(--error)', marginBottom: 'var(--spacing-4)', fontSize: '2rem' }}>⚠️</div>
            <p style={{ color: 'var(--on-surface)', marginBottom: 'var(--spacing-6)' }}>视频合成失败，由于资源繁忙或内容校验未通过</p>
            <button 
              onClick={() => startRender(fragment.id)}
              className="btn-ai"
              style={{ padding: '8px 20px' }}
            >
              重试合成
            </button>
          </div>
        ) : fragment.shots?.[0]?.imageUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
            <img 
              src={fragment.shots[0].imageUrl} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', opacity: 0.4 }} 
              alt="Preview" 
            />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <button 
                  className="btn-ai" 
                  onClick={() => startRender(fragment.id)}
                  style={{ padding: '12px 24px', fontSize: '1rem' }}
                >
                  开始合成视频
               </button>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--outline)', textAlign: 'center' }}>
             <p>此片段尚未生成分镜图，请先前往分镜页面</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div style={{
        padding: 'var(--spacing-4) var(--spacing-6)',
        borderTop: '1px solid var(--outline-variant)',
        fontSize: '0.75rem',
        color: 'var(--on-surface-variant)',
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.01)'
      }}>
        <span>ENCODER: KLING_V3_CORE</span>
        <span style={{ fontFamily: 'monospace' }}>00:00:15:00 / 00:00:15:00</span>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VideoPreview;
