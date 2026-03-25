'use client';

import React, { useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import ScriptEditor from '@/components/script/ScriptEditor';
import FragmentPanel from '@/components/script/FragmentPanel';

export default function ScriptPage() {
  const { fetchProject, loading, error } = useProjectStore();

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--on-surface-variant)' }}>加载项目数据中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--error)' }}>
        <p>错误: {error}</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '7fr 5fr',
      gap: 'var(--spacing-8)',
      height: '100%',
      maxHeight: '100%',
      overflow: 'hidden'
    }}>
      <div style={{ height: '100%', minHeight: 0 }}>
        <ScriptEditor />
      </div>
      <div style={{ height: '100%', minHeight: 0 }}>
        <FragmentPanel />
      </div>
    </div>
  );
}
