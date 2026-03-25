'use client';

import React from 'react';
import { Asset } from '@/types';

interface AssetCardProps {
  asset: Asset;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onGenerate, isGenerating }) => {
  return (
    <div className="glass-panel" style={{
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--surface-container-low)',
      transition: 'var(--transition-normal)',
    }}>
      {/* Image Area */}
      <div style={{
        aspectRatio: '1/1',
        backgroundColor: 'var(--surface-container-lowest)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid var(--outline-variant)'
      }}>
        {asset.imageUrl ? (
          <img 
            src={asset.imageUrl} 
            alt={asset.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : isGenerating ? (
          <div className="spinner" style={{
            width: 24,
            height: 24,
            border: '2px solid rgba(192, 193, 255, 0.1)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : asset.imageStatus === 'failed' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-1)', color: 'var(--error)' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span style={{ fontSize: '0.65rem' }}>生成失败</span>
          </div>
        ) : (
          <div style={{ color: 'var(--outline)', fontSize: '2rem', opacity: 0.3 }}>
            {asset.type === 'character' ? '👤' : '🏞️'}
          </div>
        )}
      </div>

      {/* Info Area */}
      <div style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{asset.name}</h3>
          <span style={{ 
            fontSize: '0.65rem', 
            padding: '2px 6px', 
            borderRadius: '4px', 
            backgroundColor: asset.type === 'character' ? 'var(--primary-container)' : 'var(--tertiary-container)',
            color: asset.type === 'character' ? 'var(--on-primary-container)' : 'var(--on-tertiary-container)',
            textTransform: 'uppercase'
          }}>
            {asset.type}
          </span>
        </div>

        <p style={{ 
          fontSize: '0.75rem', 
          color: 'var(--on-surface-variant)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.25em'
        }}>
          {asset.description}
        </p>

        <div style={{
          fontSize: '0.7rem',
          backgroundColor: 'var(--surface-container-high)',
          padding: '6px',
          borderRadius: '4px',
          color: 'var(--primary)',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {asset.prompt}
        </div>

        <button 
          className={asset.imageUrl ? "btn-secondary" : "btn-ai"}
          onClick={onGenerate}
          disabled={isGenerating}
          style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}
        >
          {asset.imageUrl ? '重新生成参考图' : '生成参考图'}
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

export default AssetCard;
