export interface Project {
  id: string;
  title: string;
  script: string;
  globalStylePrompt: string;
  createdAt: Date;
  updatedAt: Date;
  fragments: Fragment[];
}

export interface Fragment {
  id: string;
  projectId: string;
  order: number;
  type: 'environmental' | 'interaction' | 'tension' | 'dialogue' | 'action' | 'general';
  content: string;
  status: string;
  videoTaskId?: string | null;
  videoUrl?: string | null;
  videoStatus: 'idle' | 'queued' | 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  shots: Shot[];
}

export interface Shot {
  id: string;
  fragmentId: string;
  order: number;
  visualPrompt: string;
  cameraAngle: string;
  mood: string;
  imageUrl?: string | null;
  imageStatus: 'idle' | 'generating' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: 'character' | 'scene';
  description: string;
  prompt: string;
  imageUrl?: string | null;
  imageStatus: 'idle' | 'generating' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export type FragmentWithShots = Fragment & { shots: Shot[] };
export type ProjectWithFragments = Project & { 
  fragments: FragmentWithShots[];
  assets: Asset[];
};
