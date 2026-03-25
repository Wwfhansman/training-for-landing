'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '@/store/useProjectStore';

const ScriptEditor: React.FC = () => {
  const { project, updateProject } = useProjectStore();
  const [localText, setLocalText] = useState(project?.script || '');

  useEffect(() => {
    if (project?.script && !localText) {
      setLocalText(project.script);
    }
  }, [project?.script]);

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localText !== project?.script) {
        updateProject({ script: localText });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [localText, project?.script, updateProject]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--surface-container-low)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--outline-variant)'
    }}>
      <div style={{
        padding: 'var(--spacing-4) var(--spacing-6)',
        borderBottom: '1px solid var(--outline-variant)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--surface-container)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            SCRIPT EDITOR
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>
            {localText.length} 字
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            backgroundColor: localText === project?.script ? 'var(--primary)' : 'var(--tertiary)' 
          }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>
            {localText === project?.script ? '已保存' : '正在输入...'}
          </span>
        </div>
      </div>
      
      <textarea
        value={localText}
        onChange={handleChange}
        placeholder="在这里输入或粘贴剧本内容... \n\n[场景线例：室内，实验室，深夜]\n角 色 名：台词内容..."
        style={{
          flex: 1,
          padding: 'var(--spacing-8)',
          backgroundColor: 'transparent',
          color: 'var(--on-surface)',
          border: 'none',
          resize: 'none',
          outline: 'none',
          fontFamily: 'var(--font-body)',
          fontSize: '1rem',
          lineHeight: '1.8',
          letterSpacing: '0.01em',
        }}
      />
    </div>
  );
};

export default ScriptEditor;
