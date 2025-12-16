import React from 'react';
import { Badge as AntBadge } from 'antd';
import PropTypes from 'prop-types';
import {
  buildSemanticClassNames,
  buildSemanticStyles,
  buildBadgeClasses,
  validateBadgeColor,
  validateBadgeStatus,
  formatBadgeCount,
  shouldShowBadge,
  mapColorToAntd,
  BADGE_COLORS,
  BADGE_STATUS,
  BADGE_SIZES,
  DEFAULT_BADGE_COLOR,
  DEFAULT_BADGE_SIZE,
  DEFAULT_OVERFLOW_COUNT,
} from '../../../helpers/badge';

/**
 * Badge - Small status indicator for UI elements
 *
 * Based on Ant Design v6.0 Badge with Plus UI Design System tokens.
 * Supports numeric counts, dot indicators, and status badges.
 *
 * @component
 * @example
 * // Numeric badge
 * <Badge count={5}>
 *   <Avatar />
 * </Badge>
 *
 * @example
 * // Dot badge
 * <Badge dot>
 *   <NotificationIcon />
 * </Badge>
 *
 * @example
 * // Status badge
 * <Badge status="success" text="Success" />
 *
 * @example
 * // Standalone badge
 * <Badge count={25} />
 */
const Badge = ({
  // Ant Design props
  count,
  dot = false,
  showZero = false,
  overflowCount = DEFAULT_OVERFLOW_COUNT,
  status,
  text,

  // Custom props
  color = DEFAULT_BADGE_COLOR,
  size = DEFAULT_BADGE_SIZE,
  className = '',
  classNames: customClassNames = {},
  styles: customStyles = {},

  // Children (element to wrap)
  children,

  ...restProps
}) => {
  // Validate color and status
  const validColor = validateBadgeColor(color);
  const validStatus = validateBadgeStatus(status);

  // Map DS color to Ant Design color
  const antdColor = mapColorToAntd(validColor);

  // Check if badge should be shown
  const visible = shouldShowBadge(count, showZero);

  // Build semantic structure for v6
  const semanticClassNames = buildSemanticClassNames(
    customClassNames,
    validColor,
    dot,
    validStatus
  );
  const semanticStyles = buildSemanticStyles(customStyles);
  const rootClassName = buildBadgeClasses(className, validColor, dot, validStatus, size);

  // Status badge (dot with text)
  if (validStatus && text) {
    return (
      <AntBadge
        status={validStatus}
        text={text}
        className={rootClassName}
        classNames={semanticClassNames}
        styles={semanticStyles}
        {...restProps}
      />
    );
  }

  // Regular badge (with count or dot)
  return (
    <AntBadge
      count={count}
      dot={dot}
      showZero={showZero}
      overflowCount={overflowCount}
      color={antdColor}
      className={rootClassName}
      classNames={semanticClassNames}
      styles={semanticStyles}
      {...restProps}
    >
      {children}
    </AntBadge>
  );
};

Badge.propTypes = {
  /**
   * Number to show in badge
   */
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.node]),

  /**
   * Whether to display a dot instead of count
   */
  dot: PropTypes.bool,

  /**
   * Whether to show badge when count is 0
   */
  showZero: PropTypes.bool,

  /**
   * Max count to show (displays "count+" when exceeded)
   */
  overflowCount: PropTypes.number,

  /**
   * Badge status (for status badge with text)
   * 'success' | 'processing' | 'default' | 'error' | 'warning'
   */
  status: PropTypes.oneOf(Object.values(BADGE_STATUS)),

  /**
   * Text to display next to status badge
   */
  text: PropTypes.node,

  /**
   * Badge color variant
   * 'default' | 'primary' | 'success' | 'warning' | 'error' | 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'purple' | 'gray'
   */
  color: PropTypes.oneOf(Object.values(BADGE_COLORS)),

  /**
   * Badge size
   * 'default' | 'small'
   */
  size: PropTypes.oneOf(Object.values(BADGE_SIZES)),

  /**
   * Additional CSS class for root element
   */
  className: PropTypes.string,

  /**
   * Semantic classNames object for internal elements (Ant Design v6)
   * Available keys: root, indicator
   */
  classNames: PropTypes.shape({
    root: PropTypes.string,
    indicator: PropTypes.string,
  }),

  /**
   * Semantic styles object for internal elements (Ant Design v6)
   * Available keys: root, indicator
   */
  styles: PropTypes.shape({
    root: PropTypes.object,
    indicator: PropTypes.object,
  }),

  /**
   * Element to wrap with badge (optional)
   */
  children: PropTypes.node,
};

export default Badge;
