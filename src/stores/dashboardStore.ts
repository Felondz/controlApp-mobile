import { create } from 'zustand';
import { preferencesApi, projectsApi, financeApi, tasksApi, inventoryApi, operationsApi } from '../services/api';

// Widget definition interface
// Project interface matching API response
export interface Project {
    id: number;
    nombre: string;
    descripcion?: string;
    modules: string[]; // ['finance', 'tasks']
    theme?: string;
    color?: string;
    image_url?: string;
    icon?: string;
    isAdmin?: boolean;
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
            // Assuming the API returns an array of projects in 'data' or directly
            // Adjust based on actual API response structure (usually { data: [...] })
            const projects = Array.isArray(response.data) ? response.data : response.data.data;

            set({ projects: projects || [], isLoading: false });
        } catch (error) {
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
