// ================================
// BADGE CONSTANTS
// ================================

/**
 * Badge color variants
 */
export const BADGE_COLORS = {
  // Semantic colors
  DEFAULT: 'default',
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',

  // Additional colors
  BLUE: 'blue',
  GREEN: 'green',
  RED: 'red',
  YELLOW: 'yellow',
  ORANGE: 'orange',
  PURPLE: 'purple',
  GRAY: 'gray',
};

/**
 * Badge status variants (dot badge)
 */
export const BADGE_STATUS = {
  SUCCESS: 'success',
  PROCESSING: 'processing',
  DEFAULT: 'default',
  ERROR: 'error',
  WARNING: 'warning',
};

/**
 * Badge sizes
 */
export const BADGE_SIZES = {
  DEFAULT: 'default',
  SMALL: 'small',
};

/**
 * Default badge color
 */
export const DEFAULT_BADGE_COLOR = BADGE_COLORS.ERROR;

/**
 * Default badge size
 */
export const DEFAULT_BADGE_SIZE = BADGE_SIZES.DEFAULT;

/**
 * Maximum count to display before showing "+"
 */
export const DEFAULT_OVERFLOW_COUNT = 99;

// ================================
// BADGE HELPER FUNCTIONS
// ================================

/**
 * Builds semantic classNames for Badge component (Ant Design v6)
 * @param {Object} customClassNames - Custom classNames object
 * @param {string} color - Badge color
 * @param {boolean} isDot - Whether badge is a dot
 * @param {string} status - Badge status
 * @returns {Object} Semantic classNames object
 */
export const buildSemanticClassNames = (
  customClassNames = {},
  color = DEFAULT_BADGE_COLOR,
  isDot = false,
  status = null
) => {
  const dotClass = isDot ? 'ds-badge--dot' : '';
  const statusClass = status ? `ds-badge--status-${status}` : '';

  return {
    root: `ds-badge__root ds-badge--${color} ${dotClass} ${statusClass} ${customClassNames.root || ''}`.trim(),
    indicator: `ds-badge__indicator ${customClassNames.indicator || ''}`.trim(),
    ...customClassNames,
  };
};

/**
 * Builds semantic styles for Badge component (Ant Design v6)
 * @param {Object} customStyles - Custom styles object
 * @returns {Object} Semantic styles object
 */
export const buildSemanticStyles = (customStyles = {}) => {
  return {
    root: customStyles.root || {},
    indicator: customStyles.indicator || {},
    ...customStyles,
  };
};

/**
 * Builds className string for Badge root
 * @param {string} className - Custom className
 * @param {string} color - Badge color
 * @param {boolean} isDot - Whether badge is a dot
 * @param {string} status - Badge status
 * @param {string} size - Badge size
 * @returns {string} Combined className string
 */
export const buildBadgeClasses = (
  className = '',
  color = DEFAULT_BADGE_COLOR,
  isDot = false,
  status = null,
  size = DEFAULT_BADGE_SIZE
) => {
  return [
    'ds-badge',
    `ds-badge--${color}`,
    isDot && 'ds-badge--dot',
    status && `ds-badge--status-${status}`,
    size === BADGE_SIZES.SMALL && 'ds-badge--small',
    className,
  ].filter(Boolean).join(' ');
};

/**
 * Validates badge color
 * @param {string} color - Badge color
 * @returns {string} Valid color value
 */
export const validateBadgeColor = (color) => {
  const validColors = Object.values(BADGE_COLORS);
  return validColors.includes(color) ? color : DEFAULT_BADGE_COLOR;
};

/**
 * Validates badge status
 * @param {string} status - Badge status
 * @returns {string|null} Valid status value or null
 */
export const validateBadgeStatus = (status) => {
  const validStatuses = Object.values(BADGE_STATUS);
  return validStatuses.includes(status) ? status : null;
};

/**
 * Formats badge count with overflow
 * @param {number} count - Badge count
 * @param {number} overflowCount - Max count before showing "+"
 * @returns {string|number} Formatted count
 */
export const formatBadgeCount = (count, overflowCount = DEFAULT_OVERFLOW_COUNT) => {
  if (typeof count !== 'number') return count;
  return count > overflowCount ? `${overflowCount}+` : count;
};

/**
 * Checks if badge should be shown (count > 0)
 * @param {number} count - Badge count
 * @param {boolean} showZero - Whether to show badge when count is 0
 * @returns {boolean} True if badge should be shown
 */
export const shouldShowBadge = (count, showZero = false) => {
  if (typeof count !== 'number') return true;
  return showZero || count > 0;
};

/**
 * Maps color variant to Ant Design color prop
 * @param {string} color - DS color variant
 * @returns {string} Ant Design color
 */
export const mapColorToAntd = (color) => {
  const colorMap = {
    [BADGE_COLORS.PRIMARY]: 'blue',
    [BADGE_COLORS.SUCCESS]: 'green',
    [BADGE_COLORS.WARNING]: 'gold',
    [BADGE_COLORS.ERROR]: 'red',
    [BADGE_COLORS.DEFAULT]: 'default',
  };

  return colorMap[color] || color;
};
