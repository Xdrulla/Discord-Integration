import React from 'react';
import { Empty } from 'antd';
import PropTypes from 'prop-types';
import {
  buildSemanticClassNames,
  buildSemanticStyles,
  buildEmptyClasses,
  EMPTY_VARIANTS,
  DEFAULT_EMPTY_VARIANT,
} from '../../../helpers/emptyState';

/**
 * EmptyState - Component for displaying empty states
 *
 * @component
 * @example
 * <EmptyState description="No data found" />
 * <EmptyState description="No projects found" actions={<Button>Create Project</Button>} />
 */
const EmptyState = ({
  image,
  imageStyle,
  description = 'No data',
  children,
  variant = DEFAULT_EMPTY_VARIANT,
  className = '',
  classNames: customClassNames = {},
  styles: customStyles = {},
  ...restProps
}) => {
  const semanticClassNames = buildSemanticClassNames(customClassNames, variant);
  const semanticStyles = buildSemanticStyles(customStyles);
  const rootClassName = buildEmptyClasses(className, variant);

  return (
    <Empty
      image={image}
      imageStyle={imageStyle}
      description={description}
      className={rootClassName}
      classNames={semanticClassNames}
      styles={semanticStyles}
      {...restProps}
    >
      {children}
    </Empty>
  );
};

EmptyState.propTypes = {
  image: PropTypes.node,
  imageStyle: PropTypes.object,
  description: PropTypes.node,
  children: PropTypes.node,
  variant: PropTypes.oneOf(Object.values(EMPTY_VARIANTS)),
  className: PropTypes.string,
  classNames: PropTypes.object,
  styles: PropTypes.object,
};

export default EmptyState;
