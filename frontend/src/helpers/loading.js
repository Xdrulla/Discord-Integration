// ================================
// LOADING CONSTANTS
// ================================

export const LOADING_VARIANTS = ['dots', 'circle', 'ring'];
export const LOADING_SIZE_MAP = { small: 20, default: 32, large: 48 };
export const STROKE_WIDTH_MAP = { small: 3, default: 4, large: 5 };
export const DEFAULT_COLOR = '#4f46e5'; // indigo-600
export const TRACK_COLOR = '#e5e7eb'; // gray-200

// ================================
// LOADING HELPER FUNCTIONS
// ================================

export const getLoadingSize = (size) => LOADING_SIZE_MAP[size] || LOADING_SIZE_MAP.default;

export const getStrokeWidth = (size) => STROKE_WIDTH_MAP[size] || STROKE_WIDTH_MAP.default;

export const buildLoadingClasses = ({ variant, size, className }) => [
  'ds-loading',
  `ds-loading--${variant}`,
  `ds-loading--${size}`,
  className,
].filter(Boolean).join(' ');

export const buildSemanticClassNames = (customClassNames = {}) => ({
  root: `ds-loading__root ${customClassNames.root || ''}`.trim(),
  ...customClassNames,
});

export const buildSemanticStyles = (customStyles = {}) => ({
  root: customStyles.root || {},
  ...customStyles,
});
