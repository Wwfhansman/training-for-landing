'use client';

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import AssetCard from '@/components/assets/AssetCard';
import StyleBar from '@/components/storyboard/StyleBar';

export default function AssetsPage() {
  const { project, fetchProject, loading } = useProjectStore();
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!project) {
      fetchProject();
    }
  }, [project, fetchProject]);

  const handleGenerateAssetImage = async (assetId: string) => {
    setGeneratingIds(prev => new Set(prev).add(assetId));
    try {
      const response = await fetch('/api/assets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      // Refresh project to get new image URL
      await fetchProject();
    } catch (error: any) {
      alert(`资产图片生成失败: ${error.message}`);
    } finally {
      setGeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(assetId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--on-surface-variant)' }}>加载资产数据中...</p>
      </div>
    );
  }

  const characters = project?.assets?.filter(a => a.type === 'character') || [];
  const scenes = project?.assets?.filter(a => a.type === 'scene') || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)', height: '100%', overflowY: 'auto', paddingBottom: '40px' }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.1em' }}>
            ASSET LIBRARY
          </span>
        </div>
        <h1 style={{ fontSize: '2rem' }}>艺术资产库</h1>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--spacing-2)' }}>
          管理剧本中的核心角色与场景，确保 AI 生成的首帧图具备高度一致性。
        </p>
      </header>

      {/* Characters Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>主要角色</h2>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--outline-variant)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>{characters.length} CHARACTERS</span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 'var(--spacing-6)',
        }}>
          {characters.map(asset => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              isGenerating={generatingIds.has(asset.id)}
              onGenerate={() => handleGenerateAssetImage(asset.id)}
            />
          ))}
          {characters.length === 0 && (
            <p style={{ color: 'var(--outline)', fontSize: '0.85rem' }}>暂无角色资产。请先在剧本页运行 AI 分析。</p>
          )}
        </div>
      </section>

      {/* Scenes Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>核心场景</h2>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--outline-variant)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>{scenes.length} SCENES</span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 'var(--spacing-6)',
        }}>
          {scenes.map(asset => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              isGenerating={generatingIds.has(asset.id)}
              onGenerate={() => handleGenerateAssetImage(asset.id)}
            />
          ))}
          {scenes.length === 0 && (
            <p style={{ color: 'var(--outline)', fontSize: '0.85rem' }}>暂无场景资产。请先在剧本页运行 AI 分析。</p>
          )}
        </div>
      </section>
    </div>
  );
}
