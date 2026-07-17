// Hugo Blox appearance chooser with Light, Dark, and System preferences.
(() => {
  const storageKey = 'wc-color-theme';
  const modes = ['system', 'light', 'dark'];
  const modeLabels = {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  };
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

  const storedMode = () => {
    try {
      const value = localStorage.getItem(storageKey);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (_) {
      return null;
    }
  };

  const initialMode = () => storedMode() || 'system';

  const themeIconPaths = {
    system: '<rect x="2" y="3" width="20" height="14" rx="2"></rect><path d="M8 21h8M12 17v4"></path>',
    light: '<circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>',
    dark: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
  };

  const createThemeOptionIcon = (mode) => {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.classList.add('theme-selector-option-icon');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '2');
    icon.setAttribute('stroke-linecap', 'round');
    icon.setAttribute('stroke-linejoin', 'round');
    icon.setAttribute('aria-hidden', 'true');
    icon.setAttribute('focusable', 'false');
    icon.innerHTML = themeIconPaths[mode];
    return icon;
  };

  const persistMode = (mode) => {
    try {
      if (mode === 'system') localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, mode);
    } catch (_) {
      // The preference still works for this page if storage is unavailable.
    }
  };

  const applyResolvedTheme = (mode) => {
    const useDark = mode === 'dark' || (mode === 'system' && systemTheme.matches);
    useDark ? window.hbb.setDarkTheme() : window.hbb.setLightTheme();
  };

  const announceThemeChange = (mode) => {
    document.dispatchEvent(new CustomEvent('hbThemeChange', {
      detail: {
        mode,
        isDarkTheme: () => document.documentElement.classList.contains('dark'),
      },
    }));
  };

  document.addEventListener('DOMContentLoaded', () => {
    const toggles = Array.from(document.querySelectorAll('.theme-toggle'));
    if (!toggles.length) return;

    let currentMode = initialMode();

    const syncControls = () => {
      const effectiveTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      toggles.forEach((toggle) => {
        toggle.dataset.theme = effectiveTheme;
        toggle.dataset.themeMode = currentMode;
        toggle.setAttribute('aria-label', `Choose appearance. Current: ${modeLabels[currentMode]}.`);
        toggle.title = `Appearance: ${modeLabels[currentMode]}`;
        toggle.themeSelectorMenu?.querySelectorAll('[data-theme-choice]').forEach((option) => {
          option.setAttribute('aria-checked', String(option.dataset.themeChoice === currentMode));
        });
      });
    };

    const setMode = (mode, persist = true) => {
      if (!modes.includes(mode)) return;
      currentMode = mode;
      if (persist) persistMode(mode);
      applyResolvedTheme(mode);
      syncControls();
      announceThemeChange(mode);
    };

    const closeMenus = (except = null) => {
      toggles.forEach((toggle) => {
        if (toggle === except || !toggle.themeSelectorMenu) return;
        toggle.themeSelectorMenu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      });
    };

    toggles.forEach((toggle, index) => {
      const host = toggle.parentElement;
      if (!host) return;

      host.classList.add('theme-selector-host');
      toggle.type = 'button';
      toggle.setAttribute('aria-haspopup', 'menu');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelectorAll('svg').forEach((icon) => {
        icon.setAttribute('aria-hidden', 'true');
        icon.setAttribute('focusable', 'false');
        if (icon.id === 'sun') icon.dataset.themeIcon = 'light';
        if (icon.id === 'moon') icon.dataset.themeIcon = 'dark';
      });

      const systemIcon = document.createElement('span');
      systemIcon.className = 'theme-mode-icon-system';
      systemIcon.dataset.themeIcon = 'system';
      systemIcon.setAttribute('aria-hidden', 'true');
      systemIcon.append(document.createElement('span'));
      toggle.append(systemIcon);

      const menu = document.createElement('div');
      menu.id = `theme-selector-menu-${index + 1}`;
      menu.className = 'theme-selector-menu';
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-label', 'Appearance');
      menu.setAttribute('aria-orientation', 'vertical');
      menu.hidden = true;

      const choices = [
        { mode: 'system', label: 'System', description: 'Follow device' },
        { mode: 'light', label: 'Light', description: 'Always light' },
        { mode: 'dark', label: 'Dark', description: 'Always dark' },
      ];

      choices.forEach((choice) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'theme-selector-option';
        option.dataset.themeChoice = choice.mode;
        option.setAttribute('role', 'menuitemradio');

        const label = document.createElement('span');
        label.textContent = choice.label;
        const description = document.createElement('small');
        description.textContent = choice.description;
        option.append(createThemeOptionIcon(choice.mode), label, description);

        option.addEventListener('click', (event) => {
          event.stopPropagation();
          setMode(choice.mode);
          menu.hidden = true;
          toggle.setAttribute('aria-expanded', 'false');
          toggle.focus();
        });
        menu.append(option);
      });

      menu.addEventListener('keydown', (event) => {
        const options = Array.from(menu.querySelectorAll('[data-theme-choice]'));
        const activeIndex = options.indexOf(document.activeElement);
        let nextIndex = null;

        if (event.key === 'ArrowDown') nextIndex = (activeIndex + 1) % options.length;
        if (event.key === 'ArrowUp') nextIndex = (activeIndex - 1 + options.length) % options.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = options.length - 1;

        if (nextIndex !== null) {
          event.preventDefault();
          options[nextIndex].focus();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          menu.hidden = true;
          toggle.setAttribute('aria-expanded', 'false');
          toggle.focus();
        } else if (event.key === 'Tab') {
          menu.hidden = true;
          toggle.setAttribute('aria-expanded', 'false');
        }
      });

      toggle.setAttribute('aria-controls', menu.id);
      toggle.themeSelectorMenu = menu;
      host.append(menu);

      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const willOpen = menu.hidden;
        closeMenus(willOpen ? toggle : null);
        menu.hidden = !willOpen;
        toggle.setAttribute('aria-expanded', String(willOpen));
        if (willOpen) {
          menu.querySelector(`[data-theme-choice="${currentMode}"]`)?.focus();
        }
      });
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.theme-selector-host')) closeMenus();
    });

    const handleSystemThemeChange = () => {
      if (currentMode !== 'system') return;
      applyResolvedTheme('system');
      syncControls();
      announceThemeChange('system');
    };
    if (typeof systemTheme.addEventListener === 'function') {
      systemTheme.addEventListener('change', handleSystemThemeChange);
    } else {
      systemTheme.addListener(handleSystemThemeChange);
    }

    window.addEventListener('storage', (event) => {
      if (event.key !== storageKey && event.key !== null) return;
      currentMode = storedMode() || 'system';
      applyResolvedTheme(currentMode);
      syncControls();
      announceThemeChange(currentMode);
    });

    applyResolvedTheme(currentMode);
    syncControls();
  });
})();
