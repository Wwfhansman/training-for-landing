'use client';

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { FragmentWithShots } from '@/types';
import VideoPreview from '@/components/render/VideoPreview';
import RenderParams from '@/components/render/RenderParams';
import Timeline from '@/components/render/Timeline';

export default function RenderPage() {
  const { project, fetchProject, loading } = useProjectStore();
  const [selectedFragment, setSelectedFragment] = useState<FragmentWithShots | null>(null);

  useEffect(() => {
    if (!project) {
      fetchProject();
    }
  }, [project, fetchProject]);

  useEffect(() => {
    if (project?.fragments && project.fragments.length > 0 && !selectedFragment) {
      setSelectedFragment(project.fragments[0]);
    } else if (project?.fragments && selectedFragment) {
      // Keep selected fragment synchronized with project data
      const updated = project.fragments.find(f => f.id === selectedFragment.id);
      if (updated) setSelectedFragment(updated);
    }
  }, [project?.fragments, selectedFragment]);

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
        <p style={{ color: 'var(--on-surface-variant)' }}>尚未创建片段，无法进入渲染流程。</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--spacing-8)' }}>
      <div style={{ flex: 1, display: 'flex', gap: 'var(--spacing-8)', minHeight: 0 }}>
        {selectedFragment ? (
          <VideoPreview fragment={selectedFragment} />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)' }}>
            <p style={{ color: 'var(--outline)' }}>请选择一个片段进行合成</p>
          </div>
        )}
        <RenderParams />
      </div>

      <Timeline 
        fragments={project.fragments} 
        onSelect={setSelectedFragment} 
        selectedId={selectedFragment?.id || null} 
      />
    </div>
  );
}
