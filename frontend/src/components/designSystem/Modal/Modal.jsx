import React from 'react';
import { Modal as AntModal } from 'antd';
import PropTypes from 'prop-types';
import {
  getModalSize,
  buildModalClasses,
  buildSemanticClassNames,
  isValidVariant,
  isValidSize,
  shouldShowCloseIcon,
  getFooterButtonConfig,
  MODAL_VARIANTS,
  MODAL_PLACEMENT,
  DEFAULT_MODAL_SIZE,
} from '../../../helpers/modal';

/**
 * Modal - Componente de modal/diálogo do Design System
 *
 * Modal é usado para exibir conteúdo em uma camada sobreposta, geralmente para
 * confirmações, formulários ou informações que requerem atenção do usuário.
 *
 * @component
 * @example
 * // Modal básico
 * <Modal open={isOpen} onCancel={handleClose} title="Título do Modal">
 *   Conteúdo do modal
 * </Modal>
 *
 * // Modal de confirmação
 * <Modal
 *   variant="confirm"
 *   open={isOpen}
 *   onOk={handleConfirm}
 *   onCancel={handleCancel}
 *   title="Confirmar ação"
 * >
 *   Tem certeza que deseja continuar?
 * </Modal>
 *
 * // Modal destrutivo
 * <Modal
 *   variant="destructive"
 *   open={isOpen}
 *   onOk={handleDelete}
 *   onCancel={handleCancel}
 *   title="Excluir item"
 * >
 *   Esta ação não pode ser desfeita.
 * </Modal>
 */
const Modal = ({
  // Ant Design props
  open = false,
  title,
  closable,
  maskClosable = true,
  keyboard = true,
  centered = true,
  footer,
  okText,
  cancelText,
  confirmLoading = false,
  destroyOnClose = true,
  forceRender = false,
  mask = true,
  zIndex = 1000,

  // ✨ NOVO v6: Props de estrutura semântica
  classNames: customClassNames = {},
  styles: customStyles = {},

  // Plus UI Design System custom props
  variant = MODAL_VARIANTS.DEFAULT,
  size = DEFAULT_MODAL_SIZE,
  fullscreen = false,
  children,
  className = '',
  onOk,
  onCancel,
  ...restProps
}) => {
  // Validações
  if (variant && !isValidVariant(variant)) {
    console.warn(
      `Invalid variant "${variant}". Valid values are: ${Object.values(MODAL_VARIANTS).join(', ')}`
    );
  }

  if (size && !isValidSize(size)) {
    console.warn(
      `Invalid size "${size}". Valid values are: sm, md, lg, xl, full or a number`
    );
  }

  // Processar tamanho
  const modalWidth = getModalSize(size);

  // Determinar se deve mostrar o ícone de fechar
  const showCloseIcon = shouldShowCloseIcon(closable, variant);

  // Construir classes
  const modalClasses = buildModalClasses({
    variant,
    size,
    centered,
    fullscreen,
    className,
  });

  // ✨ NOVO v6: Construir classNames semânticos
  const semanticClassNames = buildSemanticClassNames(customClassNames, variant);

  // ✨ NOVO v6: Construir styles semânticos
  const semanticStyles = {
    wrapper: customStyles.wrapper || {},
    header: customStyles.header || {},
    body: customStyles.body || {},
    footer: customStyles.footer || {},
    mask: customStyles.mask || {},
    content: customStyles.content || {},
    ...customStyles,
  };

  // Configuração dos botões do footer baseado na variante
  const footerButtonConfig = getFooterButtonConfig(variant, onOk, onCancel);

  // Determinar textos dos botões
  const finalOkText = okText || footerButtonConfig.okText;
  const finalCancelText = cancelText || footerButtonConfig.cancelText;

  // Se footer é null, não mostra footer
  // Se footer é undefined, usa o footer padrão
  // Se footer é um componente, usa o componente customizado
  let finalFooter = footer;

  if (footer === null) {
    finalFooter = null;
  } else if (footer === undefined && (onOk || onCancel)) {
    // Usa footer padrão com botões do DS
    finalFooter = undefined; // Deixa o Ant Design criar o footer padrão
  }

  return (
    <AntModal
      open={open}
      title={title}
      width={fullscreen ? '100vw' : modalWidth}
      closable={showCloseIcon}
      maskClosable={maskClosable}
      keyboard={keyboard}
      centered={centered}
      footer={finalFooter}
      okText={finalOkText}
      cancelText={finalCancelText}
      confirmLoading={confirmLoading}
      destroyOnClose={destroyOnClose}
      forceRender={forceRender}
      mask={mask}
      zIndex={zIndex}
      className={modalClasses}
      classNames={semanticClassNames} // ✨ v6: estrutura semântica
      styles={semanticStyles} // ✨ v6: estrutura semântica
      onOk={onOk}
      onCancel={onCancel}
      {...restProps}
    >
      {children}
    </AntModal>
  );
};

Modal.propTypes = {
  // Ant Design Modal props
  /** Se o modal está visível */
  open: PropTypes.bool,

  /** Título do modal */
  title: PropTypes.node,

  /** Se mostra o botão de fechar (X) */
  closable: PropTypes.bool,

  /** Se permite fechar clicando na máscara */
  maskClosable: PropTypes.bool,

  /** Se permite fechar com ESC */
  keyboard: PropTypes.bool,

  /** Se o modal está centralizado verticalmente */
  centered: PropTypes.bool,

  /** Footer customizado (null para remover, undefined para padrão) */
  footer: PropTypes.node,

  /** Texto do botão OK */
  okText: PropTypes.string,

  /** Texto do botão Cancelar */
  cancelText: PropTypes.string,

  /** Estado de loading do botão OK */
  confirmLoading: PropTypes.bool,

  /** Se destrói os elementos filhos ao fechar */
  destroyOnClose: PropTypes.bool,

  /** Se renderiza o modal antes de abrir */
  forceRender: PropTypes.bool,

  /** Se mostra a máscara de fundo */
  mask: PropTypes.bool,

  /** z-index do modal */
  zIndex: PropTypes.number,

  // ✨ NOVO v6: Props de estrutura semântica
  /** Objeto com classes CSS para elementos internos (wrapper, header, body, footer, mask, content) */
  classNames: PropTypes.shape({
    wrapper: PropTypes.string,
    header: PropTypes.string,
    body: PropTypes.string,
    footer: PropTypes.string,
    mask: PropTypes.string,
    content: PropTypes.string,
  }),

  /** Objeto com estilos inline para elementos internos */
  styles: PropTypes.shape({
    wrapper: PropTypes.object,
    header: PropTypes.object,
    body: PropTypes.object,
    footer: PropTypes.object,
    mask: PropTypes.object,
    content: PropTypes.object,
  }),

  // Plus UI Design System custom props
  /** Variante visual do modal */
  variant: PropTypes.oneOf(Object.values(MODAL_VARIANTS)),

  /** Tamanho do modal */
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
    PropTypes.number,
  ]),

  /** Se o modal ocupa toda a tela */
  fullscreen: PropTypes.bool,

  /** Conteúdo do modal */
  children: PropTypes.node,

  /** Classes CSS adicionais */
  className: PropTypes.string,

  /** Callback quando o botão OK é clicado */
  onOk: PropTypes.func,

  /** Callback quando o modal é fechado */
  onCancel: PropTypes.func,
};

export default Modal;
