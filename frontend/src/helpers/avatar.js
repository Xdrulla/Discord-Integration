// ================================
// AVATAR HELPER
// ================================
// Constantes e funções auxiliares para componentes Avatar

// ================================
// CONSTANTES
// ================================

/**
 * Mapa de tamanhos do Avatar
 * Baseado no Plus UI Design System
 */
export const AVATAR_SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
};

/**
 * Tamanho padrão do Avatar
 */
export const DEFAULT_AVATAR_SIZE = 40;

/**
 * Contagem máxima padrão para AvatarGroup
 */
export const DEFAULT_MAX_COUNT = 5;

/**
 * Tamanho máximo padrão para AvatarGroup
 */
export const DEFAULT_MAX_POPOVER_TRIGGER = 'hover';

/**
 * Posições de status disponíveis
 */
export const STATUS_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
};

/**
 * Tipos de status disponíveis
 */
export const STATUS_TYPES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
  AWAY: 'away',
};

/**
 * Shapes disponíveis para Avatar
 */
export const AVATAR_SHAPES = {
  CIRCLE: 'circle',
  SQUARE: 'square',
};

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Converte tamanho do DS para valor numérico do Ant Design
 * @param {string|number} size - Tamanho (xs, sm, md, lg, xl, 2xl ou número)
 * @returns {number} Tamanho em pixels
 *
 * @example
 * getAvatarSize('md') // 40
 * getAvatarSize(50) // 50
 */
export const getAvatarSize = (size) => {
  if (typeof size === 'number') return size;
  return AVATAR_SIZE_MAP[size] || DEFAULT_AVATAR_SIZE;
};

/**
 * Constrói classes CSS para o Avatar
 * @param {Object} params - Parâmetros para construir classes
 * @param {string} params.size - Tamanho do avatar
 * @param {boolean} params.hasStatus - Se tem indicador de status
 * @param {string} params.statusPosition - Posição do status
 * @param {string} params.shape - Forma do avatar (circle, square)
 * @param {boolean} params.clickable - Se é clicável
 * @param {string} params.className - Classes adicionais
 * @returns {string} Classes CSS concatenadas
 *
 * @example
 * buildAvatarClasses({ size: 'md', hasStatus: true, statusPosition: 'bottom-right' })
 * // 'ds-avatar ds-avatar--size-md ds-avatar--with-status ds-avatar--status-bottom-right'
 */
export const buildAvatarClasses = ({
  size,
  hasStatus = false,
  statusPosition = STATUS_POSITIONS.BOTTOM_RIGHT,
  shape = AVATAR_SHAPES.CIRCLE,
  clickable = false,
  className = '',
}) => {
  return [
    'ds-avatar',
    size && `ds-avatar--size-${size}`,
    hasStatus && 'ds-avatar--with-status',
    hasStatus && `ds-avatar--status-${statusPosition}`,
    shape === AVATAR_SHAPES.SQUARE && 'ds-avatar--square',
    clickable && 'ds-avatar--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');
};

/**
 * Constrói classes CSS para o AvatarGroup
 * @param {Object} params - Parâmetros para construir classes
 * @param {string} params.size - Tamanho dos avatars
 * @param {string} params.className - Classes adicionais
 * @returns {string} Classes CSS concatenadas
 */
export const buildAvatarGroupClasses = ({ size, className = '' }) => {
  return ['ds-avatar-group', size && `ds-avatar-group--size-${size}`, className]
    .filter(Boolean)
    .join(' ');
};

/**
 * Constrói classes CSS para o indicador de status
 * @param {Object} params - Parâmetros para construir classes
 * @param {string} params.status - Tipo de status (online, offline, busy, away)
 * @param {string} params.position - Posição do status
 * @param {string} params.size - Tamanho do avatar
 * @returns {string} Classes CSS concatenadas
 *
 * @example
 * buildStatusClasses({ status: 'online', position: 'bottom-right', size: 'md' })
 * // 'ds-avatar__status ds-avatar__status--online ds-avatar__status--bottom-right ds-avatar__status--size-md'
 */
export const buildStatusClasses = ({ status, position, size }) => {
  return [
    'ds-avatar__status',
    status && `ds-avatar__status--${status}`,
    position && `ds-avatar__status--${position}`,
    size && `ds-avatar__status--size-${size}`,
  ]
    .filter(Boolean)
    .join(' ');
};

/**
 * Verifica se o avatar deve ser clicável
 * @param {Function} onClick - Callback de click
 * @param {string} href - Link href
 * @returns {boolean}
 *
 * @example
 * isClickable(handleClick) // true
 * isClickable(null, '/profile') // true
 * isClickable() // false
 */
export const isClickable = (onClick, href) => {
  return !!(onClick || href);
};

/**
 * Gera initials a partir de um nome
 * @param {string} name - Nome completo
 * @param {number} maxChars - Número máximo de caracteres (default: 2)
 * @returns {string} Iniciais em maiúsculas
 *
 * @example
 * getInitials('John Doe') // 'JD'
 * getInitials('John') // 'JO'
 * getInitials('John Middle Doe', 3) // 'JMD'
 */
export const getInitials = (name, maxChars = 2) => {
  if (!name) return '';

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return name.substring(0, maxChars).toUpperCase();
  }

  return words
    .slice(0, maxChars)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

/**
 * Calcula o tamanho do status indicator baseado no tamanho do avatar
 * @param {string|number} avatarSize - Tamanho do avatar
 * @returns {number} Tamanho do status indicator em pixels
 *
 * @example
 * getStatusSize('xs') // 6
 * getStatusSize('md') // 10
 * getStatusSize('xl') // 16
 */
export const getStatusSize = (avatarSize) => {
  const size = getAvatarSize(avatarSize);

  if (size <= 24) return 6; // xs
  if (size <= 32) return 8; // sm
  if (size <= 40) return 10; // md
  if (size <= 48) return 12; // lg
  if (size <= 64) return 14; // xl
  return 16; // 2xl
};

/**
 * Formata o contador de avatars extras no AvatarGroup
 * @param {number} count - Número de avatars extras
 * @param {number} maxCount - Número máximo de avatars visíveis
 * @returns {string} Texto formatado (ex: '+3', '+99')
 *
 * @example
 * formatExtraCount(3, 5) // '+3'
 * formatExtraCount(150, 5) // '+99'
 */
export const formatExtraCount = (count, maxCount) => {
  const extra = count - maxCount;
  if (extra <= 0) return '';
  return extra > 99 ? '+99' : `+${extra}`;
};

/**
 * Valida se o status é válido
 * @param {string} status - Status a validar
 * @returns {boolean}
 */
export const isValidStatus = (status) => {
  return Object.values(STATUS_TYPES).includes(status);
};

/**
 * Valida se a posição do status é válida
 * @param {string} position - Posição a validar
 * @returns {boolean}
 */
export const isValidStatusPosition = (position) => {
  return Object.values(STATUS_POSITIONS).includes(position);
};
