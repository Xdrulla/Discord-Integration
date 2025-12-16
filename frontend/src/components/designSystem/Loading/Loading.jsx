import { useMemo } from 'react';
import { Spin } from 'antd';
import PropTypes from 'prop-types';
import {
  getLoadingSize,
  getStrokeWidth,
  buildLoadingClasses,
  buildSemanticClassNames,
  buildSemanticStyles,
  DEFAULT_COLOR,
  TRACK_COLOR,
  LOADING_VARIANTS,
} from '../../../helpers/loading';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';

// Circle spinner with arc
const CircleIndicator = ({ size, color, trackColor, strokeWidth, disableAnimation }) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const arcPortion = 0.75;
  const dash = Math.round(circumference * arcPortion);
  const gap = Math.round(circumference - dash);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <g>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          transform={`rotate(-90 ${center} ${center})`}
        />
        {!disableAnimation && (
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from={`0 ${center} ${center}`}
            to={`360 ${center} ${center}`}
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </g>
    </svg>
  );
};

CircleIndicator.propTypes = {
  size: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  trackColor: PropTypes.string.isRequired,
  strokeWidth: PropTypes.number.isRequired,
  disableAnimation: PropTypes.bool,
};

// Ring spinner with rotating dots
const RingIndicator = ({ size, color, disableAnimation }) => {
  const radius = size / 2;
  const dotCount = 12;
  const dotRadius = Math.max(1.5, Math.round(size * 0.08));
  const trackRadius = radius - dotRadius - 1;

  const dots = useMemo(
    () =>
      Array.from({ length: dotCount }).map((_, i) => {
        const angle = (i / dotCount) * 2 * Math.PI;
        const cx = radius + trackRadius * Math.cos(angle);
        const cy = radius + trackRadius * Math.sin(angle);
        const opacity = 0.3 + (i / dotCount) * 0.7;
        return <circle key={i} cx={cx} cy={cy} r={dotRadius} fill={color} opacity={opacity} />;
      }),
    [dotCount, radius, trackRadius, dotRadius, color]
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <g>
        {dots}
        {!disableAnimation && (
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from={`0 ${radius} ${radius}`}
            to={`360 ${radius} ${radius}`}
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </g>
    </svg>
  );
};

RingIndicator.propTypes = {
  size: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  disableAnimation: PropTypes.bool,
};

/**
 * Loading - Loading indicator component
 *
 * @component
 * @example
 * <Loading variant="dots" />
 * <Loading variant="circle" size="large" />
 * <Loading variant="ring" tip="Loading..." />
 */
const Loading = ({
  variant = 'dots',
  size = 'default',
  color = DEFAULT_COLOR,
  trackColor = TRACK_COLOR,
  tip,
  spinning = true,
  reducedMotion = false,
  className = '',
  classNames: customClassNames = {},
  styles: customStyles = {},
  children,
  ...restProps
}) => {
  const classes = buildLoadingClasses({ variant, size, className });
  const semanticClassNames = buildSemanticClassNames(customClassNames);
  const semanticStyles = buildSemanticStyles(customStyles);
  const sizePx = getLoadingSize(size);
  const strokeWidth = getStrokeWidth(size);
  const prefersReducedMotion = usePrefersReducedMotion();
  const disableAnimation = reducedMotion || prefersReducedMotion;

  const indicator = useMemo(() => {
    if (variant === 'circle') {
      return (
        <CircleIndicator
          size={sizePx}
          color={color}
          trackColor={trackColor}
          strokeWidth={strokeWidth}
          disableAnimation={disableAnimation}
        />
      );
    }

    if (variant === 'ring') {
      return (
        <RingIndicator
          size={sizePx}
          color={color}
          disableAnimation={disableAnimation}
        />
      );
    }

    // Default: dots (Ant Design default)
    return undefined;
  }, [variant, sizePx, color, trackColor, strokeWidth, disableAnimation]);

  return (
    <Spin
      spinning={spinning}
      tip={tip}
      size={size}
      className={classes}
      classNames={semanticClassNames}
      styles={semanticStyles}
      indicator={indicator}
      {...restProps}
    >
      {children}
    </Spin>
  );
};

Loading.propTypes = {
  variant: PropTypes.oneOf(LOADING_VARIANTS),
  size: PropTypes.oneOf(['small', 'default', 'large']),
  color: PropTypes.string,
  trackColor: PropTypes.string,
  tip: PropTypes.node,
  spinning: PropTypes.bool,
  reducedMotion: PropTypes.bool,
  className: PropTypes.string,
  classNames: PropTypes.object,
  styles: PropTypes.object,
  children: PropTypes.node,
};

export default Loading;
