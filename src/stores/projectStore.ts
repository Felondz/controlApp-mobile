import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Proyecto {
    id: number;
    nombre: string;
    descripcion?: string;
    modules?: string[];
    theme?: string;
    image_url?: string;
    created_at?: string;
    updated_at?: string;
}

interface ProjectState {
    activeProject: Proyecto | null;
    isLoading: boolean;
    
    setActiveProject: (project: Proyecto) => Promise<void>;
    clearActiveProject: () => Promise<void>;
    loadActiveProject: () => Promise<void>;
}

const ACTIVE_PROJECT_KEY = 'active_project';

export const useProjectStore = create<ProjectState>((set, get) => ({
    activeProject: null,
    isLoading: true,

    setActiveProject: async (project: Proyecto) => {
        try {
            await AsyncStorage.setItem(ACTIVE_PROJECT_KEY, JSON.stringify(project));
            set({ activeProject: project });
        } catch (error) {
            console.error('Error saving active project:', error);
        }
    },

    clearActiveProject: async () => {
        try {
            await AsyncStorage.removeItem(ACTIVE_PROJECT_KEY);
            set({ activeProject: null });
        } catch (error) {
            console.error('Error clearing active project:', error);
        }
    },

    loadActiveProject: async () => {
        set({ isLoading: true });
        try {
            const stored = await AsyncStorage.getItem(ACTIVE_PROJECT_KEY);
            if (stored) {
                const project = JSON.parse(stored) as Proyecto;
                set({ activeProject: project, isLoading: false });
            } else {
                set({ activeProject: null, isLoading: false });
            }
        } catch (error) {
            console.error('Error loading active project:', error);
            set({ isLoading: false });
        }
    },
}));

export default useProjectStore;
