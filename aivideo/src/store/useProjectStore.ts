import { create } from 'zustand';
import { ProjectWithFragments } from '@/types';

interface ProjectStore {
  project: ProjectWithFragments | null;
  loading: boolean;
  error: string | null;
  fetchProject: () => Promise<void>;
  updateProject: (data: Partial<ProjectWithFragments>) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: null,
  loading: false,
  error: null,

  fetchProject: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/project');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      // Ensure assets is always an array
      set({ project: { ...data, assets: data.assets || [] }, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateProject: async (data: Partial<ProjectWithFragments>) => {
    const { project } = get();
    if (!project) return;

    try {
      const response = await fetch('/api/project', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: project.id }),
      });
      const updatedProject = await response.json();
      if (updatedProject.error) throw new Error(updatedProject.error);
      set({ project: updatedProject });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
