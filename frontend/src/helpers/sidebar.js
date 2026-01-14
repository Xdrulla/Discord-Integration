// ================================
// SIDEBAR CONSTANTS
// ================================

export const SIDEBAR_WIDTHS = {
  COLLAPSED: 80,
  DEFAULT: 240,
  WIDE: 280,
};

export const DEFAULT_SIDEBAR_WIDTH = SIDEBAR_WIDTHS.DEFAULT;

// ================================
// SIDEBAR HELPER FUNCTIONS
// ================================

export const buildSemanticClassNames = (customClassNames = {}, collapsed = false) => ({
  root: `ds-sidebar__root ${collapsed ? 'ds-sidebar--collapsed' : ''} ${customClassNames.root || ''}`.trim(),
  ...customClassNames,
});

export const buildSemanticStyles = (customStyles = {}) => ({
  root: customStyles.root || {},
  ...customStyles,
});

export const buildSidebarClasses = (className = '', collapsed = false) => [
  'ds-sidebar',
  collapsed && 'ds-sidebar--collapsed',
  className,
].filter(Boolean).join(' ');
