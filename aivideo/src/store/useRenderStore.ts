import { create } from 'zustand';
import { useProjectStore } from './useProjectStore';

interface RenderParams {
  mode: 'std' | 'pro';
  size: '1280x720' | '1920x1080' | '768x1344';
  seconds: '5' | '10';
}

interface RenderStore {
  renderParams: RenderParams;
  processingFragmentIds: Set<string>;
  setRenderParams: (params: Partial<RenderParams>) => void;
  startRender: (fragmentId: string) => Promise<void>;
  pollVideoStatus: (fragmentId: string, taskId: string) => void;
}

export const useRenderStore = create<RenderStore>((set, get) => ({
  renderParams: {
    mode: 'std',
    size: '1920x1080',
    seconds: '5',
  },
  processingFragmentIds: new Set(),

  setRenderParams: (params) => set((state) => ({ 
    renderParams: { ...state.renderParams, ...params } 
  })),

  startRender: async (fragmentId) => {
    const { renderParams } = get();
    
    set((state) => {
      const newIds = new Set(state.processingFragmentIds);
      newIds.add(fragmentId);
      return { processingFragmentIds: newIds };
    });

    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fragmentId, ...renderParams }),
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Start polling
      get().pollVideoStatus(fragmentId, data.taskId);
    } catch (error) {
      console.error('Start render failed:', error);
      set((state) => {
        const newIds = new Set(state.processingFragmentIds);
        newIds.delete(fragmentId);
        return { processingFragmentIds: newIds };
      });
    }
  },

  pollVideoStatus: (fragmentId, taskId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/video/status?taskId=${taskId}&fragmentId=${fragmentId}`);
        const data = await response.json();

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
          
          // Refresh project to get new videoUrl
          useProjectStore.getState().fetchProject();

          set((state) => {
            const newIds = new Set(state.processingFragmentIds);
            newIds.delete(fragmentId);
            return { processingFragmentIds: newIds };
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(interval);
        set((state) => {
          const newIds = new Set(state.processingFragmentIds);
          newIds.delete(fragmentId);
          return { processingFragmentIds: newIds };
        });
      }
    }, 5000);
  }
}));
