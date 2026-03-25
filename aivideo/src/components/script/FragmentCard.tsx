'use client';

import React from 'react';
import { FragmentWithShots } from '@/types';

interface FragmentCardProps {
  fragment: FragmentWithShots;
  onAction?: () => void;
}

const FragmentCard: React.FC<FragmentCardProps> = ({ fragment, onAction }) => {
  const getTypeColor = () => {
    switch (fragment.type) {
      case 'environmental': return '#8083ff'; // 紫色
      case 'interaction': return '#ffb95f'; // 橙色
      case 'tension': return '#ffb4ab';   // 红色
      case 'dialogue': return '#c0c1ff';  // 浅紫色
      case 'action': return '#ffd700';    // 金色
      default: return 'var(--outline)';
    }
  };

  return (
    <div className="glass-panel" style={{
      borderRadius: 'var(--radius-md)',
      padding: 'var(--spacing-4)',
      display: 'flex',
      gap: 'var(--spacing-4)',
      marginBottom: 'var(--spacing-4)',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
      transition: 'var(--transition-fast)',
    }}>
      <div style={{
        width: '4px',
        backgroundColor: getTypeColor(),
        height: 'calc(100% - var(--spacing-8))',
        position: 'absolute',
        left: 0,
        top: 'var(--spacing-4)',
        borderRadius: '0 2px 2px 0'
      }} />

      <div style={{ flex: 1, paddingLeft: 'var(--spacing-2)' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'baseline',
          marginBottom: 'var(--spacing-2)'
        }}>
          <span style={{ 
            fontSize: '0.65rem', 
            fontWeight: 700, 
            color: getTypeColor(),
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            FRAGMENT {fragment.order.toString().padStart(2, '0')} / {fragment.type}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>
            {fragment.shots.length} SHOTS
          </span>
        </div>
        
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--on-surface-variant)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: 'var(--spacing-4)',
          lineHeight: '1.5'
        }}>
          {fragment.content}
        </p>

        <button 
          onClick={onAction}
          className="btn-primary"
          style={{ 
            padding: '4px 12px', 
            fontSize: '0.75rem', 
            width: '100%',
            opacity: 0.9
          }}
        >
          查看分镜
        </button>
      </div>
    </div>
  );
};

export default FragmentCard;
