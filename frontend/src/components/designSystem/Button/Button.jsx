import React from 'react';
import { Button as AntButton } from 'antd';
import PropTypes from 'prop-types';
import {
  getButtonSize,
  mapVariantToType,
  isDestructive,
  buildButtonClasses,
  buildSemanticClassNames,
  isValidVariant,
  isValidSize,
  isValidIconPlacement,
  hasIconOnly,
  BUTTON_VARIANTS,
  BUTTON_SHAPES,
  ICON_PLACEMENT,
  DEFAULT_BUTTON_SIZE,
} from '../../../helpers/button';

/**
 * Button - Componente de botão do Design System
 *
 * Button é usado para disparar ações e eventos. Suporta múltiplas variantes,
 * tamanhos, estados e ícones com posicionamento lógico (v6).
 *
 * @component
 * @example
 * // Botão primário básico
 * <Button variant="primary">Click me</Button>
 *
 * // Botão com ícone no início
 * <Button variant="primary" icon={<PlusOutlined />} iconPlacement="start">
 *   Add Item
 * </Button>
 *
 * // Botão destrutivo
 * <Button variant="destructive">Delete</Button>
 */
const Button = ({
  // Ant Design props
  htmlType = 'button',
  loading = false,
  disabled = false,
  block = false,
  ghost = false,
  shape = BUTTON_SHAPES.DEFAULT,
  href,
  target,

  // ✨ NOVO v6: Props de estrutura semântica
  classNames: customClassNames = {},
  styles: customStyles = {},

  // Plus UI Design System custom props
  variant = BUTTON_VARIANTS.PRIMARY,
  size = DEFAULT_BUTTON_SIZE,
  icon,
  iconPlacement = ICON_PLACEMENT.START,
  children,
  className = '',
  onClick,
  ...restProps
}) => {
  // Validações
  if (variant && !isValidVariant(variant)) {
    console.warn(
      `Invalid variant "${variant}". Valid values are: ${Object.values(BUTTON_VARIANTS).join(', ')}`
    );
  }

  if (size && !isValidSize(size)) {
    console.warn(`Invalid size "${size}". Valid values are: sm, md, lg`);
  }

  if (iconPlacement && !isValidIconPlacement(iconPlacement)) {
    console.warn(
      `Invalid iconPlacement "${iconPlacement}". Valid values are: ${Object.values(ICON_PLACEMENT).join(', ')}`
    );
  }

  // Processar tamanho
  const antdSize = getButtonSize(size);

  // Processar tipo do Ant Design baseado na variante
  const antdType = mapVariantToType(variant);

  // Verificar se é destrutivo
  const isDanger = isDestructive(variant);

  // Verificar se é icon-only
  const isIconOnly = hasIconOnly(icon, children);

  // Construir classes
  const buttonClasses = buildButtonClasses({
    variant,
    size,
    block,
    iconOnly: isIconOnly,
    shape,
    className,
  });

  // ✨ NOVO v6: Construir classNames semânticos
  const semanticClassNames = buildSemanticClassNames(customClassNames, variant);

  // ✨ NOVO v6: Construir styles semânticos
  const semanticStyles = {
    root: customStyles.root || {},
    icon: customStyles.icon || {},
    ...customStyles,
  };

  return (
    <AntButton
      type={antdType}
      size={antdSize}
      htmlType={htmlType}
      loading={loading}
      disabled={disabled}
      block={block}
      danger={isDanger}
      ghost={ghost}
      shape={shape}
      icon={icon}
      iconPlacement={iconPlacement} // ✨ v6: usa placement ao invés de position
      href={href}
      target={target}
      className={buttonClasses}
      classNames={semanticClassNames} // ✨ v6: estrutura semântica
      styles={semanticStyles} // ✨ v6: estrutura semântica
      onClick={onClick}
      {...restProps}
    >
      {children}
    </AntButton>
  );
};

Button.propTypes = {
  // Ant Design Button props
  /** Tipo HTML do botão (button, submit, reset) */
  htmlType: PropTypes.oneOf(['button', 'submit', 'reset']),

  /** Estado de loading do botão */
  loading: PropTypes.bool,

  /** Se o botão está desabilitado */
  disabled: PropTypes.bool,

  /** Se o botão ocupa 100% da largura do container */
  block: PropTypes.bool,

  /** Estilo fantasma (fundo transparente) */
  ghost: PropTypes.bool,

  /** Forma do botão */
  shape: PropTypes.oneOf(Object.values(BUTTON_SHAPES)),

  /** URL para navegação (transforma o botão em link) */
  href: PropTypes.string,

  /** Target do link (quando href está presente) */
  target: PropTypes.string,

  // ✨ NOVO v6: Props de estrutura semântica
  /** Objeto com classes CSS para elementos internos (root, icon) */
  classNames: PropTypes.shape({
    root: PropTypes.string,
    icon: PropTypes.string,
  }),

  /** Objeto com estilos inline para elementos internos */
  styles: PropTypes.shape({
    root: PropTypes.object,
    icon: PropTypes.object,
  }),

  // Plus UI Design System custom props
  /** Variante visual do botão */
  variant: PropTypes.oneOf(Object.values(BUTTON_VARIANTS)),

  /** Tamanho do botão */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),

  /** Ícone do botão (componente de ícone) */
  icon: PropTypes.node,

  /** Posicionamento do ícone (v6: start/end ao invés de left/right) */
  iconPlacement: PropTypes.oneOf(Object.values(ICON_PLACEMENT)),

  /** Conteúdo do botão (texto ou elementos) */
  children: PropTypes.node,

  /** Classes CSS adicionais */
  className: PropTypes.string,

  /** Callback quando o botão é clicado */
  onClick: PropTypes.func,
};

export default Button;
