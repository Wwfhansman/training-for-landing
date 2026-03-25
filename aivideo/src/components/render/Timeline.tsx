'use client';

import React from 'react';
import { FragmentWithShots } from '@/types';
import { useRenderStore } from '@/store/useRenderStore';

interface TimelineProps {
  fragments: FragmentWithShots[];
  onSelect: (fragment: FragmentWithShots) => void;
  selectedId: string | null;
}

const Timeline: React.FC<TimelineProps> = ({ fragments, onSelect, selectedId }) => {
  const { processingFragmentIds } = useRenderStore();

  return (
    <div className="glass-panel" style={{
      height: '140px',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--spacing-4) var(--spacing-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-4)',
      backgroundColor: 'var(--surface-container-low)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'baseline',
        borderBottom: '1px solid var(--outline-variant)',
        paddingBottom: '4px'
      }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>SEQUENCE TIMELINE</h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--outline)', fontFamily: 'monospace' }}>
          00:00:15:00 / 00:00:24:00
        </span>
      </div>

      <div style={{ 
        flex: 1, 
        display: 'flex', 
        gap: 'var(--spacing-4)', 
        overflowX: 'auto',
        alignItems: 'center',
        paddingBottom: '8px'
      }}>
        {fragments.map((f) => {
          const isProcessing = processingFragmentIds.has(f.id);
          const isSelected = selectedId === f.id;
          
          return (
            <div 
              key={f.id}
              onClick={() => onSelect(f)}
              style={{
                flexShrink: 0,
                width: '120px',
                height: '67.5px', // 16:9
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                backgroundColor: 'var(--surface-container-lowest)',
                transition: 'var(--transition-fast)'
              }}
            >
              {f.shots?.[0]?.imageUrl ? (
                <img 
                  src={f.shots[0].imageUrl} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: f.videoUrl ? 1 : 0.4 }} 
                  alt="" 
                />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--surface-container-highest)' }} />
              )}
              
              <div style={{
                position: 'absolute',
                top: 2,
                left: 4,
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'white',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)'
              }}>
                P{f.order}
              </div>

              {isProcessing && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(192, 193, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(2px)'
                }}>
                  <div className="spinner" style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                </div>
              )}

              {f.videoUrl && !isProcessing && (
                <div style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 4,
                  color: '#4CAF50'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Timeline;
