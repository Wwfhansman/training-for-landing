import { create } from 'zustand';
import { FragmentWithShots } from '@/types';
import { useProjectStore } from './useProjectStore';

interface ScriptStore {
  isAnalyzing: boolean;
  analysisError: string | null;
  analyzeScript: (scriptText: string) => Promise<void>;
}

export const useScriptStore = create<ScriptStore>((set) => ({
  isAnalyzing: false,
  analysisError: null,

  analyzeScript: async (scriptText: string) => {
    const projectId = useProjectStore.getState().project?.id;
    if (!projectId) return;

    set({ isAnalyzing: true, analysisError: null });
    try {
      const response = await fetch('/api/script/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptText, projectId }),
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      // Update the project store with new fragments
      const project = useProjectStore.getState().project;
      if (project) {
        useProjectStore.setState({ 
          project: { 
            ...project, 
            script: scriptText,
            fragments: data.fragments 
          } 
        });
      }
      
      set({ isAnalyzing: false });
    } catch (error: any) {
      set({ isAnalyzing: false, analysisError: error.message });
    }
  },
}));
