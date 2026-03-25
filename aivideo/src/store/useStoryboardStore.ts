import { create } from 'zustand';
import { Shot } from '@/types';
import { useProjectStore } from './useProjectStore';

interface StoryboardStore {
  generatingImageIds: Set<string>;
  generateImage: (shotId: string, visualPrompt: string, globalStylePrompt?: string) => Promise<void>;
  updateShotLocal: (shotId: string, data: Partial<Shot>) => void;
}

export const useStoryboardStore = create<StoryboardStore>((set, get) => ({
  generatingImageIds: new Set(),

  generateImage: async (shotId, visualPrompt, globalStylePrompt) => {
    set((state) => {
      const newIds = new Set(state.generatingImageIds);
      newIds.add(shotId);
      return { generatingImageIds: newIds };
    });

    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shotId, visualPrompt, globalStylePrompt }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // Update project store with successful image
      const project = useProjectStore.getState().project;
      if (project) {
        const newFragments = project.fragments.map(f => ({
          ...f,
          shots: f.shots.map(s => s.id === shotId ? { ...s, ...data } : s)
        }));
        useProjectStore.setState({ project: { ...project, fragments: newFragments } });
      }
    } catch (error: any) {
      console.error('Generate image failed:', error);
      // Update shot state to 'failed' locally
      get().updateShotLocal(shotId, { imageStatus: 'failed' });
      alert(`图片生成失败：${error.message}`);
    } finally {
      set((state) => {
        const newIds = new Set(state.generatingImageIds);
        newIds.delete(shotId);
        return { generatingImageIds: newIds };
      });
    }
  },

  updateShotLocal: (shotId, data) => {
    const project = useProjectStore.getState().project;
    if (project) {
      const newFragments = project.fragments.map(f => ({
        ...f,
        shots: f.shots.map(s => s.id === shotId ? { ...s, ...data } : s)
      }));
      useProjectStore.setState({ project: { ...project, fragments: newFragments } });
    }
  }
}));
