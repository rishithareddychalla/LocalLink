/**
 * Theme Utility to apply dark mode and accent colors
 */

export function applyTheme(settings) {
    const { darkMode, accentColor } = settings;

    // Apply Dark Mode
    if (darkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
    }

    // Apply Accent Color CSS Variable
    // Bridge Tailwind 4 with standard CSS variables
    if (accentColor) {
        document.documentElement.style.setProperty('--accent-color', accentColor);
        // Also update the primary color if components use --color-primary
        document.documentElement.style.setProperty('--color-primary', accentColor);
    }
}

export function getSavedSettings() {
    const saved = localStorage.getItem('llr_settings');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse settings", e);
        }
    }
    return null;
}

export function saveSettings(settings) {
    localStorage.setItem('llr_settings', JSON.stringify(settings));
}
