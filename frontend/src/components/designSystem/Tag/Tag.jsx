import React from 'react';
import { Tag as AntTag } from 'antd';
import PropTypes from 'prop-types';
import {
  buildSemanticClassNames,
  buildSemanticStyles,
  buildTagClasses,
  TAG_COLORS,
  TAG_VARIANTS,
  DEFAULT_TAG_COLOR,
  DEFAULT_TAG_VARIANT,
} from '../../../helpers/tag';

/**
 * Tag - Component for categorizing or labeling content
 *
 * @component
 * @example
 * <Tag>Label</Tag>
 * <Tag color="blue">Blue Tag</Tag>
 * <Tag closable onClose={() => console.log('closed')}>Closable</Tag>
 */
const Tag = ({
  children,
  color = DEFAULT_TAG_COLOR,
  variant = DEFAULT_TAG_VARIANT,
  closable = false,
  icon,
  bordered = true,
  className = '',
  classNames: customClassNames = {},
  styles: customStyles = {},
  onClose,
  ...restProps
}) => {
  const semanticClassNames = buildSemanticClassNames(customClassNames, color, variant);
  const semanticStyles = buildSemanticStyles(customStyles);
  const rootClassName = buildTagClasses(className, color, variant, closable);

  const tagProps = {
    color,
    closable,
    icon,
    bordered: variant === TAG_VARIANTS.OUTLINED ? true : bordered,
    className: rootClassName,
    classNames: semanticClassNames,
    styles: semanticStyles,
    onClose,
    ...restProps,
  };

  return <AntTag {...tagProps}>{children}</AntTag>;
};

Tag.propTypes = {
  children: PropTypes.node,
  color: PropTypes.oneOf(Object.values(TAG_COLORS)),
  variant: PropTypes.oneOf(Object.values(TAG_VARIANTS)),
  closable: PropTypes.bool,
  icon: PropTypes.node,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  classNames: PropTypes.object,
  styles: PropTypes.object,
  onClose: PropTypes.func,
};

export default Tag;
