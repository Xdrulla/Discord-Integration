import React from 'react';
import { Avatar as AntAvatar, Badge } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import {
  getAvatarSize,
  buildAvatarClasses,
  buildStatusClasses,
  isClickable,
  getInitials,
  getStatusSize,
  isValidStatus,
  isValidStatusPosition,
  AVATAR_SHAPES,
  STATUS_POSITIONS,
  STATUS_TYPES,
} from '../../../helpers/avatar';

/**
 * Avatar - Componente de avatar do Plus UI Design System
 *
 * Avatar é usado para representar pessoas ou objetos. Suporta imagens, ícones,
 * iniciais de texto e indicadores de status.
 *
 * @component
 * @example
 * // Avatar com imagem
 * <Avatar src="https://example.com/avatar.jpg" size="md" />
 *
 * // Avatar com iniciais
 * <Avatar name="John Doe" size="lg" />
 *
 * // Avatar com status
 * <Avatar src="..." status="online" size="md" />
 */
const Avatar = ({
  // Ant Design props
  src,
  icon = <UserOutlined />,
  alt,
  shape = 'circle',
  draggable = false,
  crossOrigin,

  // Plus UI Design System custom props
  size = 'md',
  name,
  status,
  statusPosition = STATUS_POSITIONS.BOTTOM_RIGHT,
  onClick,
  href,
  className = '',
  style,
  ...restProps
}) => {
  // Validações
  if (status && !isValidStatus(status)) {
    console.warn(`Invalid status "${status}". Valid values are: ${Object.values(STATUS_TYPES).join(', ')}`);
  }

  if (status && !isValidStatusPosition(statusPosition)) {
    console.warn(
      `Invalid statusPosition "${statusPosition}". Valid values are: ${Object.values(STATUS_POSITIONS).join(', ')}`
    );
  }

  // Processar tamanho
  const avatarSize = getAvatarSize(size);
  const statusSize = getStatusSize(size);

  // Processar iniciais se não houver src
  const children = !src && name ? getInitials(name) : undefined;

  // Construir classes
  const avatarClasses = buildAvatarClasses({
    size,
    hasStatus: !!status,
    statusPosition,
    shape,
    clickable: isClickable(onClick, href),
    className,
  });

  const statusClasses = buildStatusClasses({
    status,
    position: statusPosition,
    size,
  });

  // Handler de click
  const handleClick = (e) => {
    if (href) {
      window.location.href = href;
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Renderizar avatar base
  const avatarElement = (
    <AntAvatar
      src={src}
      icon={!src && !name ? icon : undefined}
      alt={alt || name}
      size={avatarSize}
      shape={shape}
      draggable={draggable}
      crossOrigin={crossOrigin}
      className={avatarClasses}
      style={style}
      onClick={isClickable(onClick, href) ? handleClick : undefined}
      {...restProps}
    >
      {children}
    </AntAvatar>
  );

  // Se tem status, envolver com Badge
  if (status) {
    return (
      <Badge
        dot
        status={status === STATUS_TYPES.ONLINE ? 'success' : 'default'}
        className={statusClasses}
        style={{
          width: statusSize,
          height: statusSize,
        }}
      >
        {avatarElement}
      </Badge>
    );
  }

  return avatarElement;
};

Avatar.propTypes = {
  // Ant Design Avatar props
  /** URL da imagem do avatar */
  src: PropTypes.string,

  /** Ícone a ser exibido quando não há imagem ou nome */
  icon: PropTypes.node,

  /** Texto alternativo para a imagem */
  alt: PropTypes.string,

  /** Forma do avatar */
  shape: PropTypes.oneOf([AVATAR_SHAPES.CIRCLE, AVATAR_SHAPES.SQUARE]),

  /** Se o avatar pode ser arrastado */
  draggable: PropTypes.bool,

  /** Configuração CORS para imagem */
  crossOrigin: PropTypes.oneOf(['anonymous', 'use-credentials']),

  // Plus UI Design System custom props
  /** Tamanho do avatar */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', PropTypes.number]),

  /** Nome da pessoa (usado para gerar iniciais) */
  name: PropTypes.string,

  /** Status do usuário */
  status: PropTypes.oneOf(Object.values(STATUS_TYPES)),

  /** Posição do indicador de status */
  statusPosition: PropTypes.oneOf(Object.values(STATUS_POSITIONS)),

  /** Callback quando o avatar é clicado */
  onClick: PropTypes.func,

  /** Link para navegação ao clicar */
  href: PropTypes.string,

  /** Classes CSS adicionais */
  className: PropTypes.string,

  /** Estilos inline (evitar quando possível) */
  style: PropTypes.object,
};

export default Avatar;
