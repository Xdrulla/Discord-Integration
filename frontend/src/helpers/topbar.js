// ================================
// TOPBAR CONSTANTS
// ================================

export const TOPBAR_VARIANTS = {
  DEFAULT: 'default',
  SIMPLE: 'simple',
};

export const DEFAULT_TOPBAR_VARIANT = TOPBAR_VARIANTS.DEFAULT;

// ================================
// TOPBAR HELPER FUNCTIONS
// ================================

export const buildSemanticClassNames = (customClassNames = {}, variant = DEFAULT_TOPBAR_VARIANT) => ({
  root: `ds-topbar__root ds-topbar--${variant} ${customClassNames.root || ''}`.trim(),
  ...customClassNames,
});

export const buildSemanticStyles = (customStyles = {}) => ({
  root: customStyles.root || {},
  ...customStyles,
});

export const buildTopBarClasses = (className = '', variant = DEFAULT_TOPBAR_VARIANT, fixed = false) => [
  'ds-topbar',
  `ds-topbar--${variant}`,
  fixed && 'ds-topbar--fixed',
  className,
].filter(Boolean).join(' ');
