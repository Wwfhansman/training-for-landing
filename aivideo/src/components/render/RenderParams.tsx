'use client';

import React from 'react';
import { useRenderStore } from '@/store/useRenderStore';

const RenderParams: React.FC = () => {
  const { renderParams, setRenderParams } = useRenderStore();

  return (
    <div className="glass-panel" style={{
      width: '300px',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--spacing-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-8)',
      backgroundColor: 'var(--surface-container-low)'
    }}>
      <h2 style={{ fontSize: '0.85rem', fontWeight: 700, borderBottom: '1px solid var(--outline-variant)', paddingBottom: 'var(--spacing-4)' }}>
        INFERENCE PARAMETERS
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {/* Mode Select */}
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 'var(--spacing-4)' }}>
            Generation Mode
          </label>
          <div style={{ display: 'flex', padding: 4, backgroundColor: 'var(--surface-container-highest)', borderRadius: 'var(--radius-md)' }}>
            <button 
              onClick={() => setRenderParams({ mode: 'std' })}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: renderParams.mode === 'std' ? 'var(--primary)' : 'transparent',
                color: renderParams.mode === 'std' ? 'var(--surface)' : 'var(--on-surface-variant)',
                fontWeight: renderParams.mode === 'std' ? 600 : 400,
                transition: 'var(--transition-fast)'
              }}
            >
              STD (Fast)
            </button>
            <button 
              onClick={() => setRenderParams({ mode: 'pro' })}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: renderParams.mode === 'pro' ? 'var(--primary)' : 'transparent',
                color: renderParams.mode === 'pro' ? 'var(--surface)' : 'var(--on-surface-variant)',
                fontWeight: renderParams.mode === 'pro' ? 600 : 400,
                transition: 'var(--transition-fast)'
              }}
            >
              PRO (High)
            </button>
          </div>
        </div>

         {/* Duration Select */}
         <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 'var(--spacing-4)' }}>
            Output Duration
          </label>
          <div style={{ display: 'flex', padding: 4, backgroundColor: 'var(--surface-container-highest)', borderRadius: 'var(--radius-md)' }}>
            <button 
              onClick={() => setRenderParams({ seconds: '5' })}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: renderParams.seconds === '5' ? 'var(--on-surface)' : 'transparent',
                color: renderParams.seconds === '5' ? 'var(--surface)' : 'var(--on-surface-variant)',
                fontWeight: renderParams.seconds === '5' ? 600 : 400,
                transition: 'var(--transition-fast)'
              }}
            >
              5 Seconds
            </button>
            <button 
              onClick={() => setRenderParams({ seconds: '10' })}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: renderParams.seconds === '10' ? 'var(--on-surface)' : 'transparent',
                color: renderParams.seconds === '10' ? 'var(--surface)' : 'var(--on-surface-variant)',
                fontWeight: renderParams.seconds === '10' ? 600 : 400,
                transition: 'var(--transition-fast)'
              }}
            >
              10 Seconds
            </button>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 'var(--spacing-4)' }}>
            Video Resolution
          </label>
          <select 
            value={renderParams.size}
            onChange={(e) => setRenderParams({ size: e.target.value as any })}
            style={{
              width: '100%',
              backgroundColor: 'var(--surface-container-highest)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '10px',
              color: 'var(--on-surface)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="1920x1080">1920x1080 (Cinema)</option>
            <option value="1280x720">1280x720 (Standard)</option>
            <option value="768x1344">768x1344 (Portrait)</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 'auto', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(192, 193, 255, 0.05)', border: '1px solid rgba(192, 193, 255, 0.1)' }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--primary)', lineHeight: '1.5' }}>
          💡 Tip: Pro mode provides better temporal consistency but consumes more creative credits.
        </p>
      </div>
    </div>
  );
};

export default RenderParams;
