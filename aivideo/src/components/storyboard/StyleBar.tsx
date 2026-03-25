'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';

const StyleBar: React.FC = () => {
  const { project, updateProject } = useProjectStore();
  const [localStyle, setLocalStyle] = useState(project?.globalStylePrompt || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleApply = async () => {
    setIsSaving(true);
    await updateProject({ globalStylePrompt: localStyle });
    setIsSaving(false);
  };

  const stylePresets = [
    { name: '默认', value: '' },
    { name: '4K 真人', value: 'Photorealistic, 8k, highly detailed skin, natural lighting, shot on 35mm lens, realistic textures' },
    { name: '史诗电影', value: 'Cinematic lighting, epic scale, shallow depth of field, professional color grading, masterpiece, 8k' },
    { name: '赛博朋克', value: 'Cyberpunk aesthetic, neon lighting, high contrast, futuristic city, detailed mechanical parts' },
    { name: '水墨国风', value: 'Chinese ink wash painting style, artistic conception, elegant brushwork, black and white with subtle colors' },
    { name: '极简插画', value: 'Minimalist illustration, flat design, clean lines, bold colors, modern aesthetic' },
    { name: '吉卜力感', value: 'Studio Ghibli style, hand-drawn texture, lush environments, nostalgic atmosphere, vibrant colors' },
  ];

  const handleSelectPreset = (val: string) => {
    setLocalStyle(val);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-4)',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      padding: '4px 12px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--outline-variant)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--tertiary)', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
        </svg>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em' }}>STYLE</span>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-1)', overflowX: 'auto' }} className="no-scrollbar">
        {stylePresets.map(preset => (
          <button
            key={preset.name}
            onClick={() => handleSelectPreset(preset.value)}
            style={{
              padding: '2px 8px',
              fontSize: '0.65rem',
              borderRadius: '6px',
              backgroundColor: localStyle === preset.value ? 'var(--primary)' : 'transparent',
              color: localStyle === preset.value ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              border: 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--outline-variant)' }} />

      <div style={{ width: '120px' }}>
        <input 
          type="text" 
          value={localStyle}
          onChange={(e) => setLocalStyle(e.target.value)}
          placeholder="自定义..."
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--on-surface)',
            fontSize: '0.75rem',
            outline: 'none',
          }}
        />
      </div>

      <button 
        className="btn-ai" 
        onClick={handleApply}
        disabled={isSaving}
        style={{ padding: '2px 8px', fontSize: '0.65rem', borderRadius: '6px' }}
      >
        {isSaving ? '...' : 'Apply'}
      </button>
    </div>
  );
};

export default StyleBar;
