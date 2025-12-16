// ================================
// BUTTON HELPER
// ================================
// Constantes e funções auxiliares para componentes Button

// ================================
// CONSTANTES
// ================================

/**
 * Mapa de tamanhos do Button
 * Baseado no Design System
 */
export const BUTTON_SIZE_MAP = {
  sm: 'small',
  md: 'middle',
  lg: 'large',
};

/**
 * Tamanho padrão do Button
 */
export const DEFAULT_BUTTON_SIZE = 'md';

/**
 * Tipos de botão disponíveis
 * Mapeamento para os tipos do Ant Design v6
 */
export const BUTTON_TYPES = {
  PRIMARY: 'primary',
  DEFAULT: 'default',
  DASHED: 'dashed',
  TEXT: 'text',
  LINK: 'link',
};

/**
 * Variantes customizadas do Design System
 */
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',           // Filled primary (azul/brand)
  SECONDARY: 'secondary',       // Outlined
  TERTIARY: 'tertiary',         // Ghost/Text
  LINK: 'link',                 // Link style
  DESTRUCTIVE: 'destructive',   // Danger/Error
};

/**
 * Estados do botão
 */
export const BUTTON_STATES = {
  DEFAULT: 'default',
  HOVER: 'hover',
  FOCUSED: 'focused',
  DISABLED: 'disabled',
  LOADING: 'loading',
};

/**
 * Posicionamento do ícone (v6: usa placement ao invés de position)
 */
export const ICON_PLACEMENT = {
  START: 'start',
  END: 'end',
};

/**
 * Formas do botão
 */
export const BUTTON_SHAPES = {
  DEFAULT: 'default',
  CIRCLE: 'circle',
  ROUND: 'round',
};

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Converte tamanho do DS para tamanho do Ant Design
 * @param {string} size - Tamanho (sm, md, lg)
 * @returns {string} Tamanho do Ant Design
 *
 * @example
 * getButtonSize('md') // 'middle'
 * getButtonSize('sm') // 'small'
 */
export const getButtonSize = (size) => {
  return BUTTON_SIZE_MAP[size] || BUTTON_SIZE_MAP[DEFAULT_BUTTON_SIZE];
};

/**
 * Mapeia variante do DS para type do Ant Design
 * @param {string} variant - Variante do DS
 * @returns {string} Type do Ant Design
 *
 * @example
 * mapVariantToType('primary') // 'primary'
 * mapVariantToType('secondary') // 'default'
 * mapVariantToType('tertiary') // 'text'
 */
export const mapVariantToType = (variant) => {
  const variantMap = {
    [BUTTON_VARIANTS.PRIMARY]: BUTTON_TYPES.PRIMARY,
    [BUTTON_VARIANTS.SECONDARY]: BUTTON_TYPES.DEFAULT,
    [BUTTON_VARIANTS.TERTIARY]: BUTTON_TYPES.TEXT,
    [BUTTON_VARIANTS.LINK]: BUTTON_TYPES.LINK,
    [BUTTON_VARIANTS.DESTRUCTIVE]: BUTTON_TYPES.PRIMARY,
  };

  return variantMap[variant] || BUTTON_TYPES.DEFAULT;
};

/**
 * Verifica se o botão é do tipo destrutivo
 * @param {string} variant - Variante do botão
 * @returns {boolean}
 */
export const isDestructive = (variant) => {
  return variant === BUTTON_VARIANTS.DESTRUCTIVE;
};

/**
 * Constrói classes CSS para o Button
 * @param {Object} params - Parâmetros para construir classes
 * @param {string} params.variant - Variante do botão
 * @param {string} params.size - Tamanho do botão
 * @param {boolean} params.block - Se o botão ocupa 100% da largura
 * @param {boolean} params.iconOnly - Se o botão tem apenas ícone
 * @param {string} params.shape - Forma do botão
 * @param {string} params.className - Classes adicionais
 * @returns {string} Classes CSS concatenadas
 *
 * @example
 * buildButtonClasses({ variant: 'primary', size: 'md', block: true })
 * // 'ds-button ds-button--primary ds-button--size-md ds-button--block'
 */
export const buildButtonClasses = ({
  variant = BUTTON_VARIANTS.PRIMARY,
  size = DEFAULT_BUTTON_SIZE,
  block = false,
  iconOnly = false,
  shape = BUTTON_SHAPES.DEFAULT,
  className = '',
}) => {
  return [
    'ds-button',
    `ds-button--${variant}`,
    `ds-button--size-${size}`,
    block && 'ds-button--block',
    iconOnly && 'ds-button--icon-only',
    shape !== BUTTON_SHAPES.DEFAULT && `ds-button--${shape}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
};

/**
 * Constrói objeto de classNames semânticos para Ant Design v6
 * @param {Object} customClassNames - ClassNames customizados
 * @param {string} variant - Variante do botão
 * @returns {Object} Objeto de classNames para Ant Design v6
 *
 * @example
 * buildSemanticClassNames({}, 'primary')
 * // { root: 'ds-button__root', icon: 'ds-button__icon' }
 */
export const buildSemanticClassNames = (customClassNames = {}, variant = '') => {
  return {
    root: `ds-button__root ${variant ? `ds-button__root--${variant}` : ''} ${customClassNames.root || ''}`.trim(),
    icon: `ds-button__icon ${customClassNames.icon || ''}`.trim(),
    ...customClassNames,
  };
};

/**
 * Valida se a variante é válida
 * @param {string} variant - Variante a validar
 * @returns {boolean}
 */
export const isValidVariant = (variant) => {
  return Object.values(BUTTON_VARIANTS).includes(variant);
};

/**
 * Valida se o tamanho é válido
 * @param {string} size - Tamanho a validar
 * @returns {boolean}
 */
export const isValidSize = (size) => {
  return Object.keys(BUTTON_SIZE_MAP).includes(size);
};

/**
 * Valida se o posicionamento do ícone é válido (v6)
 * @param {string} placement - Posicionamento a validar
 * @returns {boolean}
 */
export const isValidIconPlacement = (placement) => {
  return Object.values(ICON_PLACEMENT).includes(placement);
};

/**
 * Determina se o botão deve ter apenas ícone (sem texto)
 * @param {node} icon - Ícone do botão
 * @param {node} children - Conteúdo do botão
 * @returns {boolean}
 */
export const hasIconOnly = (icon, children) => {
  return !!icon && !children;
};
