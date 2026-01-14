// ================================
// HEADER CONSTANTS
// ================================

export const HEADER_VARIANTS = {
  DEFAULT: 'default',
  SIMPLE: 'simple',
};

export const DEFAULT_HEADER_VARIANT = HEADER_VARIANTS.DEFAULT;

// ================================
// HEADER HELPER FUNCTIONS
// ================================

export const buildSemanticClassNames = (customClassNames = {}) => ({
  root: `ds-header__root ${customClassNames.root || ''}`.trim(),
  ...customClassNames,
});

export const buildSemanticStyles = (customStyles = {}) => ({
  root: customStyles.root || {},
  ...customStyles,
});

export const buildHeaderClasses = (className = '') => [
  'ds-header',
  className,
].filter(Boolean).join(' ');
