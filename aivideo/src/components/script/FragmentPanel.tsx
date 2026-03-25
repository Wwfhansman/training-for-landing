'use client';

import React from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useScriptStore } from '@/store/useScriptStore';
import FragmentCard from './FragmentCard';
import { useRouter } from 'next/navigation';

const FragmentPanel: React.FC = () => {
  const router = useRouter();
  const { project } = useProjectStore();
  const { isAnalyzing, analyzeScript, analysisError } = useScriptStore();

  const handleAnalyze = async () => {
    if (project?.script) {
      await analyzeScript(project.script);
    }
  };

  const handleGoToStoryboard = (fragmentId: string) => {
    router.push(`/storyboard?fragmentId=${fragmentId}`);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: 'var(--spacing-6)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <h2 style={{ fontSize: '0.9rem', color: 'var(--on-surface)' }}>AI 智能片段划分</h2>
          <span style={{ 
            fontSize: '0.65rem', 
            backgroundColor: 'var(--surface-container-highest)', 
            padding: '2px 6px', 
            borderRadius: 'var(--radius-sm)',
            color: 'var(--tertiary)'
          }}>
            SMART ANALYSIS
          </span>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingRight: 'var(--spacing-2)'
      }}>
        {project?.fragments && project.fragments.length > 0 ? (
          project.fragments.map((fragment) => (
            <FragmentCard 
              key={fragment.id} 
              fragment={fragment} 
              onAction={() => handleGoToStoryboard(fragment.id)}
            />
          ))
        ) : (
          <div style={{
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--outline)',
            border: '1px dashed var(--outline-variant)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-8)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-4)' }}>
              尚未划分片段
            </p>
            <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>
              点击下方按钮开始 AI 分析
            </p>
          </div>
        )}
      </div>

      <div style={{
        paddingTop: 'var(--spacing-4)',
        borderTop: '1px solid var(--outline-variant)'
      }}>
        {analysisError && (
          <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginBottom: 'var(--spacing-4)' }}>
            错误: {analysisError}
          </p>
        )}
        <button
          className="btn-ai"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !project?.script}
          style={{
            width: '100%',
            opacity: isAnalyzing || !project?.script ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-2)',
            padding: 'var(--spacing-4)'
          }}
        >
          {isAnalyzing ? (
            <>
              <div className="spinner" style={{
                width: 14,
                height: 14,
                border: '2px solid rgba(0,0,0,0.1)',
                borderTopColor: 'var(--surface)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span>AI 分析中...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
              <span>重新运行 AI 片段识别</span>
            </>
          )}
        </button>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default FragmentPanel;
