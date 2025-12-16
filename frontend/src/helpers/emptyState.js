// ================================
// EMPTY STATE CONSTANTS
// ================================

export const EMPTY_VARIANTS = {
  DEFAULT: 'default',
  SIMPLE: 'simple',
};

export const DEFAULT_EMPTY_VARIANT = EMPTY_VARIANTS.DEFAULT;

// ================================
// EMPTY STATE HELPER FUNCTIONS
// ================================

export const buildSemanticClassNames = (customClassNames = {}, variant = DEFAULT_EMPTY_VARIANT) => {
  return {
    root: `ds-empty__root ds-empty--${variant} ${customClassNames.root || ''}`.trim(),
    ...customClassNames,
  };
};

export const buildSemanticStyles = (customStyles = {}) => {
  return {
    root: customStyles.root || {},
    ...customStyles,
  };
};

export const buildEmptyClasses = (className = '', variant = DEFAULT_EMPTY_VARIANT) => {
  return [
    'ds-empty',
    `ds-empty--${variant}`,
    className,
  ].filter(Boolean).join(' ');
};
