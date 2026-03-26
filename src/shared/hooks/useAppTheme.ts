import { useSettingsStore } from '../../stores/settingsStore';
import { useProjectStore } from '../../stores/projectStore';
import { getTheme, ThemeColors } from '../themes';

/**
 * Hook to get the current applicable theme.
 * If there's an active project, it returns the project's theme.
 * Otherwise, it returns the user's global settings theme.
 */
export const useAppTheme = () => {
    const { theme: globalThemeName, isDark } = useSettingsStore();
    const { activeProject } = useProjectStore();

    // Determine which theme to use
    const activeThemeName = activeProject?.theme || globalThemeName;
    
    // Get the theme colors object
    const theme = getTheme(activeThemeName);

    return {
        theme,
        themeName: activeThemeName,
        isDark,
        // Helper to get raw colors for components
        colors: theme,
        isProjectTheme: !!activeProject
    };
};
