// ================================
// MODAL HELPER
// ================================
// Constantes e funções auxiliares para componentes Modal

// ================================
// CONSTANTES
// ================================

/**
 * Tamanhos do Modal
 * Baseado no Design System
 */
export const MODAL_SIZE_MAP = {
  sm: 400,
  md: 600,
  lg: 800,
  xl: 1000,
  full: '100%',
};

/**
 * Tamanho padrão do Modal
 */
export const DEFAULT_MODAL_SIZE = 'md';

/**
 * Variantes do Modal (baseado no tipo de ação)
 */
export const MODAL_VARIANTS = {
  DEFAULT: 'default',
  CONFIRM: 'confirm',
  DESTRUCTIVE: 'destructive',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

/**
 * Tipos de footer disponíveis
 */
export const FOOTER_TYPES = {
  DEFAULT: 'default',        // Botões padrão (Cancelar + OK)
  CUSTOM: 'custom',          // Footer customizado
  NONE: 'none',              // Sem footer
  SINGLE_ACTION: 'single',   // Apenas um botão
};

/**
 * Posições do Modal na tela
 */
export const MODAL_PLACEMENT = {
  CENTER: 'center',
  TOP: 'top',
};

/**
 * Estilos de animação
 */
export const ANIMATION_TYPES = {
  FADE: 'fade',
  ZOOM: 'zoom',
  SLIDE_DOWN: 'slide-down',
  SLIDE_UP: 'slide-up',
};

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Converte tamanho do DS para valor numérico ou percentual
 * @param {string|number} size - Tamanho (sm, md, lg, xl, full ou número)
 * @returns {number|string} Tamanho em pixels ou percentual
 *
 * @example
 * getModalSize('md') // 600
 * getModalSize(700) // 700
 * getModalSize('full') // '100%'
 */
export const getModalSize = (size) => {
  if (typeof size === 'number') return size;
  return MODAL_SIZE_MAP[size] || MODAL_SIZE_MAP[DEFAULT_MODAL_SIZE];
};

/**
 * Constrói classes CSS para o Modal
 * @param {Object} params - Parâmetros para construir classes
 * @param {string} params.variant - Variante do modal
 * @param {string} params.size - Tamanho do modal
 * @param {boolean} params.centered - Se o modal está centralizado
 * @param {boolean} params.fullscreen - Se o modal ocupa tela cheia
 * @param {string} params.className - Classes adicionais
 * @returns {string} Classes CSS concatenadas
 *
 * @example
 * buildModalClasses({ variant: 'confirm', size: 'md', centered: true })
 * // 'ds-modal ds-modal--confirm ds-modal--size-md ds-modal--centered'
 */
export const buildModalClasses = ({
  variant = MODAL_VARIANTS.DEFAULT,
  size = DEFAULT_MODAL_SIZE,
  centered = false,
  fullscreen = false,
  className = '',
}) => {
  return [
    'ds-modal',
    variant !== MODAL_VARIANTS.DEFAULT && `ds-modal--${variant}`,
    `ds-modal--size-${size}`,
    centered && 'ds-modal--centered',
    fullscreen && 'ds-modal--fullscreen',
    className,
  ]
    .filter(Boolean)
    .join(' ');
};

/**
 * Constrói objeto de classNames semânticos para Ant Design v6
 * @param {Object} customClassNames - ClassNames customizados
 * @param {string} variant - Variante do modal
 * @returns {Object} Objeto de classNames para Ant Design v6
 *
 * @example
 * buildSemanticClassNames({}, 'confirm')
 * // { wrapper: 'ds-modal__wrapper', header: 'ds-modal__header--confirm', ... }
 */
export const buildSemanticClassNames = (customClassNames = {}, variant = '') => {
  return {
    wrapper: `ds-modal__wrapper ${customClassNames.wrapper || ''}`.trim(),
    header: `ds-modal__header ${variant ? `ds-modal__header--${variant}` : ''} ${customClassNames.header || ''}`.trim(),
    body: `ds-modal__body ${customClassNames.body || ''}`.trim(),
    footer: `ds-modal__footer ${customClassNames.footer || ''}`.trim(),
    mask: `ds-modal__mask ${customClassNames.mask || ''}`.trim(),
    content: `ds-modal__content ${customClassNames.content || ''}`.trim(),
    ...customClassNames,
  };
};

/**
 * Valida se a variante é válida
 * @param {string} variant - Variante a validar
 * @returns {boolean}
 */
export const isValidVariant = (variant) => {
  return Object.values(MODAL_VARIANTS).includes(variant);
};

/**
 * Valida se o tamanho é válido
 * @param {string|number} size - Tamanho a validar
 * @returns {boolean}
 */
export const isValidSize = (size) => {
  if (typeof size === 'number') return size > 0;
  return Object.keys(MODAL_SIZE_MAP).includes(size);
};

/**
 * Determina se deve mostrar o ícone de fechar
 * @param {boolean} closable - Se o modal é fechável
 * @param {string} variant - Variante do modal
 * @returns {boolean}
 */
export const shouldShowCloseIcon = (closable, variant) => {
  // Modais destrutivos podem ter closable=false por padrão
  if (variant === MODAL_VARIANTS.DESTRUCTIVE && closable === undefined) {
    return false;
  }
  return closable !== false;
};

/**
 * Gera configuração de botões do footer baseado na variante
 * @param {string} variant - Variante do modal
 * @param {Function} onOk - Callback do botão OK
 * @param {Function} onCancel - Callback do botão Cancelar
 * @returns {Object} Configuração dos botões
 *
 * @example
 * getFooterButtonConfig('destructive', handleDelete, handleCancel)
 * // { okText: 'Deletar', okButtonProps: { variant: 'destructive' }, ... }
 */
export const getFooterButtonConfig = (variant, onOk, onCancel) => {
  const configs = {
    [MODAL_VARIANTS.DESTRUCTIVE]: {
      okText: 'Confirmar',
      cancelText: 'Cancelar',
      okButtonProps: { variant: 'destructive' },
      cancelButtonProps: { variant: 'secondary' },
    },
    [MODAL_VARIANTS.CONFIRM]: {
      okText: 'Confirmar',
      cancelText: 'Cancelar',
      okButtonProps: { variant: 'primary' },
      cancelButtonProps: { variant: 'secondary' },
    },
    [MODAL_VARIANTS.INFO]: {
      okText: 'Entendi',
      cancelText: 'Fechar',
      okButtonProps: { variant: 'primary' },
      cancelButtonProps: { variant: 'tertiary' },
    },
    [MODAL_VARIANTS.SUCCESS]: {
      okText: 'Continuar',
      cancelText: 'Fechar',
      okButtonProps: { variant: 'primary' },
      cancelButtonProps: { variant: 'tertiary' },
    },
    [MODAL_VARIANTS.WARNING]: {
      okText: 'Entendi',
      cancelText: 'Cancelar',
      okButtonProps: { variant: 'primary' },
      cancelButtonProps: { variant: 'secondary' },
    },
    [MODAL_VARIANTS.ERROR]: {
      okText: 'Tentar novamente',
      cancelText: 'Fechar',
      okButtonProps: { variant: 'primary' },
      cancelButtonProps: { variant: 'tertiary' },
    },
  };

  return configs[variant] || {
    okText: 'OK',
    cancelText: 'Cancelar',
    okButtonProps: { variant: 'primary' },
    cancelButtonProps: { variant: 'secondary' },
  };
};

/**
 * Calcula a altura máxima do modal baseado na viewport
 * @param {number} viewportHeight - Altura da viewport
 * @param {number} padding - Padding vertical (padrão: 48px top + 48px bottom)
 * @returns {number} Altura máxima do modal
 */
export const calculateMaxHeight = (viewportHeight, padding = 96) => {
  return viewportHeight - padding;
};

/**
 * Determina se deve usar scroll interno ou externo
 * @param {number} contentHeight - Altura do conteúdo
 * @param {number} maxHeight - Altura máxima permitida
 * @returns {boolean} true se deve usar scroll interno
 */
export const shouldUseInternalScroll = (contentHeight, maxHeight) => {
  return contentHeight > maxHeight;
};
