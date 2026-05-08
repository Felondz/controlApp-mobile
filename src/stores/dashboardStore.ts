import { create } from 'zustand';
import { preferencesApi, projectsApi } from '../services/api';
import { getGraphQLClient } from '../graphql/client';

// Project interface matching API response
export interface Project {
    id: string;
    uuid: string;
    nombre: string;
    descripcion?: string;
    modules: string[];
    theme?: string;
    color?: string;
    image_url?: string;
    image_path?: string;
    icon?: string;
    isAdmin?: boolean;
}

interface ProjectsResponse {
    projects: Project[];
}

interface DashboardState {
    projects: Project[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchProjects: () => Promise<void>;
    reorderProjects: (fromIndex: number, toIndex: number) => void;
    saveProjectOrder: () => Promise<void>;
    setProjects: (projects: Project[]) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,

    fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await projectsApi.getAll();
            const projectsData = Array.isArray(response.data) ? response.data : response.data.data;
            
            // Map string ID if necessary since backend might return integer ID but frontend uses string ID
            const projects = (projectsData || []).map((p: any) => ({
                ...p,
                id: p.id ? String(p.id) : undefined
            }));

            console.log('[dashboardStore] REST Success!', projects.length, 'projects found');
            set({ projects, isLoading: false });
        } catch (error: any) {
            console.error('Error fetching projects:', error);
            set({ error: 'Failed to load projects', isLoading: false });
        }
    },

    reorderProjects: (fromIndex, toIndex) => {
        const { projects } = get();
        const newProjects = [...projects];
        const [movedProject] = newProjects.splice(fromIndex, 1);
        newProjects.splice(toIndex, 0, movedProject);
        set({ projects: newProjects });
    },

    saveProjectOrder: async () => {
        const { projects } = get();
        const projectOrder = projects.map(p => p.id);
        try {
            await preferencesApi.updateDashboard({ project_order: projectOrder });
        } catch (error) {
            console.error('Failed to save project order:', error);
        }
    },

    setProjects: (projects) => set({ projects })
}));
