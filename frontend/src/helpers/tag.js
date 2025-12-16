// ================================
// TAG CONSTANTS
// ================================

export const TAG_COLORS = {
  DEFAULT: 'default',
  PRIMARY: 'blue',
  SUCCESS: 'green',
  WARNING: 'gold',
  ERROR: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  RED: 'red',
  YELLOW: 'gold',
  ORANGE: 'orange',
  PURPLE: 'purple',
  CYAN: 'cyan',
  GRAY: 'default',
};

export const TAG_VARIANTS = {
  FILLED: 'filled',
  OUTLINED: 'outlined',
};

export const DEFAULT_TAG_COLOR = TAG_COLORS.DEFAULT;
export const DEFAULT_TAG_VARIANT = TAG_VARIANTS.FILLED;

// ================================
// TAG HELPER FUNCTIONS
// ================================

export const buildSemanticClassNames = (customClassNames = {}, color = DEFAULT_TAG_COLOR, variant = DEFAULT_TAG_VARIANT) => {
  return {
    root: `ds-tag__root ds-tag--${color} ds-tag--${variant} ${customClassNames.root || ''}`.trim(),
    ...customClassNames,
  };
};

export const buildSemanticStyles = (customStyles = {}) => {
  return {
    root: customStyles.root || {},
    ...customStyles,
  };
};

export const buildTagClasses = (className = '', color = DEFAULT_TAG_COLOR, variant = DEFAULT_TAG_VARIANT, closable = false) => {
  return [
    'ds-tag',
    `ds-tag--${color}`,
    `ds-tag--${variant}`,
    closable && 'ds-tag--closable',
    className,
  ].filter(Boolean).join(' ');
};
