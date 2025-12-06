import React from 'react';
import { Avatar as AntAvatar, Popover, Flex, Typography } from 'antd';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import {
  getAvatarSize,
  buildAvatarGroupClasses,
  formatExtraCount,
  DEFAULT_MAX_COUNT,
  DEFAULT_MAX_POPOVER_TRIGGER,
  AVATAR_SHAPES,
} from '../../../helpers/avatar';

const { Text } = Typography;

/**
 * AvatarGroup - Componente de grupo de avatares do Plus UI Design System
 *
 * AvatarGroup exibe múltiplos avatares em um grupo compacto, com opção de
 * limite de exibição e popover para avatares extras.
 *
 * @component
 * @example
 * <AvatarGroup
 *   items={[
 *     { src: 'url1.jpg', name: 'John' },
 *     { src: 'url2.jpg', name: 'Jane' },
 *   ]}
 *   maxCount={3}
 *   size="md"
 * />
 */
const AvatarGroup = ({
  // Ant Design AvatarGroup props
  maxCount = DEFAULT_MAX_COUNT,
  maxPopoverPlacement = 'top',
  maxPopoverTrigger = DEFAULT_MAX_POPOVER_TRIGGER,

  // Plus UI Design System custom props
  items = [],
  size = 'md',
  shape = AVATAR_SHAPES.CIRCLE,
  showTooltip = false,
  tooltipPlacement = 'top',
  onItemClick,
  className = '',
  ...restProps
}) => {
  // Processar tamanho
  const avatarSize = getAvatarSize(size);

  // Construir classes
  const groupClasses = buildAvatarGroupClasses({
    size,
    className,
  });

  // Items visíveis e extras
  const visibleItems = items.slice(0, maxCount);
  const extraItems = items.slice(maxCount);
  const extraCount = formatExtraCount(items.length, maxCount);

  // Renderizar avatar individual
  const renderAvatar = (item, index) => {
    const { src, name, icon, status, statusPosition, onClick, ...itemProps } = item;

    const avatarElement = (
      <Avatar
        key={index}
        src={src}
        name={name}
        icon={icon}
        status={status}
        statusPosition={statusPosition}
        size={size}
        shape={shape}
        onClick={onClick || (onItemClick ? () => onItemClick(item, index) : undefined)}
        {...itemProps}
      />
    );

    // Se showTooltip, envolver com Tooltip via Ant Design
    if (showTooltip && name) {
      return (
        <span key={index} title={name} className="ds-avatar-group__item">
          {avatarElement}
        </span>
      );
    }

    return (
      <span key={index} className="ds-avatar-group__item">
        {avatarElement}
      </span>
    );
  };

  // Renderizar popover com avatares extras
  const renderExtraPopover = () => {
    if (extraItems.length === 0) return null;

    const popoverContent = (
      <Flex vertical gap={8} className="ds-avatar-group__popover">
        {extraItems.map((item, index) => (
          <Flex key={index} align="center" gap={8} className="ds-avatar-group__popover-item">
            <Avatar
              src={item.src}
              name={item.name}
              icon={item.icon}
              size="sm"
              shape={shape}
              onClick={item.onClick || (onItemClick ? () => onItemClick(item, maxCount + index) : undefined)}
            />
            {item.name && <Text className="ds-avatar-group__popover-name">{item.name}</Text>}
          </Flex>
        ))}
      </Flex>
    );

    return (
      <Popover
        content={popoverContent}
        placement={maxPopoverPlacement}
        trigger={maxPopoverTrigger}
        overlayClassName="ds-avatar-group__popover-overlay"
      >
        <AntAvatar
          size={avatarSize}
          shape={shape}
          className="ds-avatar-group__extra"
        >
          {extraCount}
        </AntAvatar>
      </Popover>
    );
  };

  return (
    <AntAvatar.Group
      className={groupClasses}
      maxCount={maxCount}
      size={avatarSize}
      {...restProps}
    >
      {visibleItems.map((item, index) => renderAvatar(item, index))}
      {extraItems.length > 0 && renderExtraPopover()}
    </AntAvatar.Group>
  );
};

AvatarGroup.propTypes = {
  // Ant Design AvatarGroup props
  /** Número máximo de avatares visíveis */
  maxCount: PropTypes.number,

  /** Posicionamento do popover de avatares extras */
  maxPopoverPlacement: PropTypes.oneOf([
    'top',
    'left',
    'right',
    'bottom',
    'topLeft',
    'topRight',
    'bottomLeft',
    'bottomRight',
    'leftTop',
    'leftBottom',
    'rightTop',
    'rightBottom',
  ]),

  /** Trigger do popover de avatares extras */
  maxPopoverTrigger: PropTypes.oneOf(['hover', 'click', 'focus']),

  // Plus UI Design System custom props
  /** Array de items (avatares) */
  items: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string,
      name: PropTypes.string,
      icon: PropTypes.node,
      status: PropTypes.string,
      statusPosition: PropTypes.string,
      onClick: PropTypes.func,
    })
  ),

  /** Tamanho dos avatares */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', PropTypes.number]),

  /** Forma dos avatares */
  shape: PropTypes.oneOf([AVATAR_SHAPES.CIRCLE, AVATAR_SHAPES.SQUARE]),

  /** Exibir tooltip com nome ao hover */
  showTooltip: PropTypes.bool,

  /** Posicionamento do tooltip */
  tooltipPlacement: PropTypes.string,

  /** Callback quando um avatar é clicado */
  onItemClick: PropTypes.func,

  /** Classes CSS adicionais */
  className: PropTypes.string,
};

export default AvatarGroup;
