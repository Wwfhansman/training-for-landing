'use client';

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useSearchParams, useRouter } from 'next/navigation';
import ShotCard from '@/components/storyboard/ShotCard';

export default function StoryboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { project, fetchProject, loading } = useProjectStore();
  const [currentFragmentId, setCurrentFragmentId] = useState<string | null>(searchParams.get('fragmentId'));

  useEffect(() => {
    if (!project) {
      fetchProject();
    }
  }, [project, fetchProject]);

  useEffect(() => {
    const fid = searchParams.get('fragmentId');
    if (fid) setCurrentFragmentId(fid);
  }, [searchParams]);

  const currentFragment = project?.fragments?.find(f => f.id === currentFragmentId) || project?.fragments?.[0];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--on-surface-variant)' }}>加载项目数据中...</p>
      </div>
    );
  }

  if (!project || !project.fragments || project.fragments.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'var(--spacing-6)' }}>
        <p style={{ color: 'var(--on-surface-variant)' }}>尚未创建片段，请先到剧本页面进行分析。</p>
        <button className="btn-primary" onClick={() => router.push('/script')}>前往剧本编辑</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--spacing-8)', overflow: 'hidden' }}>
      {/* Left Sidebar: Fragment List */}
      <div className="glass-panel" style={{ 
        width: '200px', 
        height: '100%', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        padding: 'var(--spacing-4)',
        gap: 'var(--spacing-1)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ 
          fontSize: '0.7rem', 
          fontWeight: 700, 
          color: 'var(--tertiary)', 
          marginBottom: 'var(--spacing-4)',
          letterSpacing: '0.1em'
        }}>
          FRAGMENTS ({project.fragments.length})
        </div>
        {project.fragments.map(f => (
          <button 
            key={f.id}
            onClick={() => setCurrentFragmentId(f.id)}
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              fontSize: '0.85rem',
              textAlign: 'left',
              borderRadius: 'var(--radius-md)',
              backgroundColor: currentFragment?.id === f.id ? 'var(--primary)' : 'transparent',
              color: currentFragment?.id === f.id ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)'
            }}
          >
            <span style={{ opacity: 0.5, fontWeight: 700 }}>{f.order.toString().padStart(2, '0')}</span>
            <span>片段内容</span>
          </button>
        ))}
      </div>

      {/* Right Content: Shot Grid */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 'var(--spacing-4)' }} className="no-scrollbar">
        {/* Header Section */}
        <div style={{ marginBottom: 'var(--spacing-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.1em' }}>
                PROJECT: {project.title}
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }}>
              片段 {currentFragment?.order.toString().padStart(2, '0')}
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', maxWidth: '600px', lineHeight: 1.6 }}>
              {currentFragment?.content}
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--tertiary)', 
              fontWeight: 600, 
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              justifyContent: 'flex-end'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
              AI SYNCED
            </div>
            <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
              {currentFragment?.shots.length || 0} Shot Components
            </div>
          </div>
        </div>

        {/* Shot Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 'var(--spacing-8)',
          paddingBottom: '100px'
        }}>
          {currentFragment?.shots.map((shot) => (
            <ShotCard key={shot.id} shot={shot} />
          ))}
        </div>
      </div>
    </div>
  );
}
