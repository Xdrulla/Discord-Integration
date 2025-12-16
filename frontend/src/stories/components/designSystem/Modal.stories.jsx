import React, { useState } from 'react';
import { Space, Flex, Typography, Input, Form } from 'antd';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import Modal from '../../../components/designSystem/Modal/Modal.jsx';
import Button from '../../../components/designSystem/Button/Button.jsx';

const { Text, Paragraph } = Typography;

/**
 * Modal - Componente de modal/diálogo do Design System
 *
 * O Modal é usado para exibir conteúdo em uma camada sobreposta que requer atenção do usuário.
 *
 * ✨ Atualizado para Ant Design v6.0
 */
export default {
  title: 'Design System/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
O componente **Modal** fornece uma interface para diálogos, confirmações e exibição de conteúdo que requer foco do usuário.

### Características

- ✅ **7 variantes**: Default, Confirm, Destructive, Info, Success, Warning, Error
- ✅ **5 tamanhos**: sm (400px), md (600px), lg (800px), xl (1000px), full (100%)
- ✅ **Responsivo**: Adaptação automática para mobile (bottom sheet)
- ✅ **Acessível**: Suporte a ESC, click fora, foco automático
- ✅ **Customizável**: Footer, header, tamanho, posição
- ✅ **Fullscreen**: Suporte a modais em tela cheia
- ✅ **Loading states**: Botões com estado de loading

**Ant Design v6.0**: Este componente utiliza a estrutura semântica com suporte a \`classNames\` e \`styles\`.
Elementos estilizáveis: wrapper, header, body, footer, mask, content.

### Quando usar

- Confirmações de ações importantes
- Formulários que requerem foco
- Exibição de informações detalhadas
- Ações destrutivas (delete, remove)
- Avisos e alertas críticos

### Boas práticas

✅ **Faça:**
- Use títulos claros e descritivos
- Mantenha o conteúdo conciso
- Use variant apropriada para o contexto
- Forneça sempre uma forma de fechar (X ou botão)
- Use loading state durante operações assíncronas

❌ **Evite:**
- Modais aninhados (modal dentro de modal)
- Conteúdo muito longo (considere uma página dedicada)
- Múltiplos modais ao mesmo tempo
- Fechar automaticamente sem aviso
        `.trim(),
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Se o modal está visível',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    variant: {
      control: 'select',
      options: ['default', 'confirm', 'destructive', 'info', 'success', 'warning', 'error'],
      description: 'Variante visual do modal',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Tamanho do modal',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
      },
    },
    title: {
      control: 'text',
      description: 'Título do modal',
      table: {
        type: { summary: 'string | ReactNode' },
      },
    },
    centered: {
      control: 'boolean',
      description: 'Se o modal está centralizado verticalmente',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    closable: {
      control: 'boolean',
      description: 'Se mostra o botão de fechar (X)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    maskClosable: {
      control: 'boolean',
      description: 'Se permite fechar clicando na máscara',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    keyboard: {
      control: 'boolean',
      description: 'Se permite fechar com ESC',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    confirmLoading: {
      control: 'boolean',
      description: 'Estado de loading do botão OK',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    fullscreen: {
      control: 'boolean',
      description: 'Se o modal ocupa toda a tela',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onOk: {
      action: 'ok clicked',
      description: 'Callback quando o botão OK é clicado',
      table: {
        type: { summary: 'function' },
      },
    },
    onCancel: {
      action: 'cancel clicked',
      description: 'Callback quando o modal é fechado',
      table: {
        type: { summary: 'function' },
      },
    },
    classNames: {
      control: 'object',
      description: '✨ v6: Objeto com classes CSS para elementos internos',
      table: {
        type: { summary: 'object' },
      },
    },
    styles: {
      control: 'object',
      description: '✨ v6: Objeto com estilos inline para elementos internos',
      table: {
        type: { summary: 'object' },
      },
    },
  },
};

/**
 * Modal básico padrão.
 * Use para exibir conteúdo que requer atenção do usuário.
 */
export const Default = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Abrir Modal
      </Button>
      <Modal
        title="Título do Modal"
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <Paragraph>Este é o conteúdo básico do modal.</Paragraph>
        <Paragraph>
          Você pode adicionar qualquer conteúdo aqui: textos, formulários, imagens, etc.
        </Paragraph>
      </Modal>
    </>
  );
};

/**
 * Todos os tamanhos disponíveis.
 * Demonstra sm (400px), md (600px), lg (800px), xl (1000px).
 */
export const AllSizes = () => {
  const [openSm, setOpenSm] = useState(false);
  const [openMd, setOpenMd] = useState(false);
  const [openLg, setOpenLg] = useState(false);
  const [openXl, setOpenXl] = useState(false);

  return (
    <Space wrap>
      <Button variant="primary" size="sm" onClick={() => setOpenSm(true)}>
        Small (sm)
      </Button>
      <Button variant="primary" size="sm" onClick={() => setOpenMd(true)}>
        Medium (md)
      </Button>
      <Button variant="primary" size="sm" onClick={() => setOpenLg(true)}>
        Large (lg)
      </Button>
      <Button variant="primary" size="sm" onClick={() => setOpenXl(true)}>
        Extra Large (xl)
      </Button>

      <Modal title="Modal Small (400px)" size="sm" open={openSm} onCancel={() => setOpenSm(false)}>
        <div className="ds-modal__slot-area">Slot Area - Small</div>
      </Modal>

      <Modal title="Modal Medium (600px)" size="md" open={openMd} onCancel={() => setOpenMd(false)}>
        <div className="ds-modal__slot-area">Slot Area - Medium</div>
      </Modal>

      <Modal title="Modal Large (800px)" size="lg" open={openLg} onCancel={() => setOpenLg(false)}>
        <div className="ds-modal__slot-area">Slot Area - Large</div>
      </Modal>

      <Modal title="Modal Extra Large (1000px)" size="xl" open={openXl} onCancel={() => setOpenXl(false)}>
        <div className="ds-modal__slot-area">Slot Area - Extra Large</div>
      </Modal>
    </Space>
  );
};

/**
 * Todas as variantes disponíveis.
 * Demonstra os 7 tipos de modais com diferentes contextos.
 */
export const AllVariants = () => {
  const [openDefault, setOpenDefault] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openDestructive, setOpenDestructive] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [openError, setOpenError] = useState(false);

  return (
    <Flex vertical gap={12}>
      <Button variant="primary" onClick={() => setOpenDefault(true)}>
        Default Modal
      </Button>
      <Button variant="primary" onClick={() => setOpenConfirm(true)}>
        Confirm Modal
      </Button>
      <Button variant="destructive" onClick={() => setOpenDestructive(true)}>
        Destructive Modal
      </Button>
      <Button variant="secondary" onClick={() => setOpenInfo(true)}>
        Info Modal
      </Button>
      <Button variant="secondary" onClick={() => setOpenSuccess(true)}>
        Success Modal
      </Button>
      <Button variant="secondary" onClick={() => setOpenWarning(true)}>
        Warning Modal
      </Button>
      <Button variant="secondary" onClick={() => setOpenError(true)}>
        Error Modal
      </Button>

      <Modal
        variant="default"
        title="Modal Padrão"
        open={openDefault}
        onOk={() => setOpenDefault(false)}
        onCancel={() => setOpenDefault(false)}
      >
        <Paragraph>Este é um modal padrão sem estilo específico.</Paragraph>
      </Modal>

      <Modal
        variant="confirm"
        title="Confirmar Ação"
        open={openConfirm}
        onOk={() => setOpenConfirm(false)}
        onCancel={() => setOpenConfirm(false)}
      >
        <Flex gap={12} align="start">
          <InfoCircleOutlined style={{ fontSize: '24px', color: '#3C91E6' }} />
          <div>
            <Paragraph>Você tem certeza que deseja continuar com esta ação?</Paragraph>
            <Paragraph>Esta operação pode levar alguns segundos.</Paragraph>
          </div>
        </Flex>
      </Modal>

      <Modal
        variant="destructive"
        title="Excluir Item"
        open={openDestructive}
        onOk={() => setOpenDestructive(false)}
        onCancel={() => setOpenDestructive(false)}
      >
        <Flex gap={12} align="start">
          <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#ef5c5c' }} />
          <div>
            <Paragraph strong>Esta ação não pode ser desfeita!</Paragraph>
            <Paragraph>
              Ao excluir este item, todos os dados relacionados serão permanentemente removidos.
            </Paragraph>
          </div>
        </Flex>
      </Modal>

      <Modal
        variant="info"
        title="Informação"
        open={openInfo}
        onOk={() => setOpenInfo(false)}
        onCancel={() => setOpenInfo(false)}
      >
        <Flex gap={12} align="start">
          <InfoCircleOutlined style={{ fontSize: '24px', color: '#3C91E6' }} />
          <Paragraph>
            Esta é uma mensagem informativa. Nenhuma ação crítica será executada.
          </Paragraph>
        </Flex>
      </Modal>

      <Modal
        variant="success"
        title="Operação Concluída"
        open={openSuccess}
        onOk={() => setOpenSuccess(false)}
        onCancel={() => setOpenSuccess(false)}
      >
        <Flex gap={12} align="start">
          <CheckCircleOutlined style={{ fontSize: '24px', color: '#2ecc71' }} />
          <div>
            <Paragraph strong>Sucesso!</Paragraph>
            <Paragraph>A operação foi concluída com êxito.</Paragraph>
          </div>
        </Flex>
      </Modal>

      <Modal
        variant="warning"
        title="Atenção"
        open={openWarning}
        onOk={() => setOpenWarning(false)}
        onCancel={() => setOpenWarning(false)}
      >
        <Flex gap={12} align="start">
          <WarningOutlined style={{ fontSize: '24px', color: '#FD7238' }} />
          <div>
            <Paragraph strong>Atenção!</Paragraph>
            <Paragraph>Revise cuidadosamente antes de continuar.</Paragraph>
          </div>
        </Flex>
      </Modal>

      <Modal
        variant="error"
        title="Erro"
        open={openError}
        onOk={() => setOpenError(false)}
        onCancel={() => setOpenError(false)}
      >
        <Flex gap={12} align="start">
          <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#ef5c5c' }} />
          <div>
            <Paragraph strong>Ocorreu um erro!</Paragraph>
            <Paragraph>Não foi possível completar a operação. Tente novamente.</Paragraph>
          </div>
        </Flex>
      </Modal>
    </Flex>
  );
};

/**
 * Modal com formulário.
 * Exemplo de uso comum com campos de entrada.
 */
export const WithForm = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    // Simular requisição
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 2000);
  };

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Novo Usuário
      </Button>
      <Modal
        title="Criar Novo Usuário"
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
        confirmLoading={loading}
        okText="Criar Usuário"
        size="md"
      >
        <Form layout="vertical">
          <Form.Item label="Nome completo" required>
            <Input placeholder="Digite o nome completo" />
          </Form.Item>
          <Form.Item label="Email" required>
            <Input type="email" placeholder="usuario@example.com" />
          </Form.Item>
          <Form.Item label="Cargo">
            <Input placeholder="Ex: Desenvolvedor" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

/**
 * Modal de confirmação destrutiva.
 * Use para ações irreversíveis como delete.
 */
export const DestructiveConfirm = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      alert('Item excluído com sucesso!');
    }, 1500);
  };

  return (
    <>
      <Button variant="destructive" icon={<DeleteOutlined />} onClick={() => setOpen(true)}>
        Excluir Item
      </Button>
      <Modal
        variant="destructive"
        title="Confirmar Exclusão"
        open={open}
        onOk={handleDelete}
        onCancel={() => setOpen(false)}
        confirmLoading={loading}
        okText="Sim, excluir"
        cancelText="Cancelar"
        size="sm"
      >
        <Flex vertical gap={16}>
          <Flex gap={12} align="start">
            <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#ef5c5c', marginTop: '4px' }} />
            <div>
              <Paragraph strong style={{ marginBottom: '8px' }}>
                Esta ação não pode ser desfeita!
              </Paragraph>
              <Paragraph style={{ marginBottom: 0 }}>
                Ao excluir este item, todos os dados relacionados serão permanentemente removidos do sistema.
              </Paragraph>
            </div>
          </Flex>
        </Flex>
      </Modal>
    </>
  );
};

/**
 * Modal sem footer.
 * Use quando não precisa de botões de ação.
 */
export const WithoutFooter = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Abrir Modal
      </Button>
      <Modal
        title="Informações do Sistema"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        size="md"
      >
        <Flex vertical gap={16}>
          <Paragraph>
            <strong>Versão:</strong> 2.5.0
          </Paragraph>
          <Paragraph>
            <strong>Data de lançamento:</strong> 15 de Dezembro de 2025
          </Paragraph>
          <Paragraph>
            <strong>Novidades:</strong>
          </Paragraph>
          <ul style={{ marginLeft: '20px' }}>
            <li>Novo sistema de notificações</li>
            <li>Melhorias de performance</li>
            <li>Correções de bugs</li>
          </ul>
          <Button variant="primary" block onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

/**
 * Modal fullscreen.
 * Use para conteúdo extenso que precisa de mais espaço.
 */
export const Fullscreen = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Abrir Fullscreen
      </Button>
      <Modal
        title="Modal em Tela Cheia"
        open={open}
        onCancel={() => setOpen(false)}
        fullscreen
        footer={null}
      >
        <Flex vertical gap={24}>
          <Paragraph>
            Este modal ocupa toda a tela, ideal para formulários extensos ou visualização de conteúdo detalhado.
          </Paragraph>
          <div style={{ height: '400px', background: '#f5f5f5', borderRadius: '8px', padding: '24px' }}>
            <Text>Área de conteúdo extenso</Text>
          </div>
          <Space>
            <Button variant="primary" icon={<SaveOutlined />}>
              Salvar
            </Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </Space>
        </Flex>
      </Modal>
    </>
  );
};

/**
 * ✨ v6: Demonstração de estrutura semântica com classNames.
 * Mostra como aplicar classes customizadas aos elementos internos.
 */
export const WithSemanticClasses = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Abrir Modal
      </Button>
      <Modal
        title="Modal com Classes Customizadas"
        open={open}
        onCancel={() => setOpen(false)}
        classNames={{
          header: 'custom-modal-header',
          body: 'custom-modal-body',
          footer: 'custom-modal-footer',
        }}
      >
        <Paragraph>Este modal tem classes CSS customizadas aplicadas aos elementos internos.</Paragraph>
      </Modal>
    </>
  );
};

/**
 * ✨ v6: Demonstração de estrutura semântica com styles.
 * Mostra como aplicar estilos inline aos elementos internos.
 */
export const WithSemanticStyles = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Abrir Modal
      </Button>
      <Modal
        title="Modal com Estilos Customizados"
        open={open}
        onCancel={() => setOpen(false)}
        styles={{
          header: { background: 'linear-gradient(135deg, #43CDB2 0%, #339481 100%)', color: '#fff' },
          body: { padding: '32px' },
          mask: { backdropFilter: 'blur(10px)' },
        }}
      >
        <Paragraph style={{ color: '#333' }}>
          Este modal tem estilos inline customizados aplicados aos elementos internos.
        </Paragraph>
      </Modal>
    </>
  );
};

/**
 * Modal com loading state.
 * Demonstra feedback visual durante operações assíncronas.
 */
export const WithLoadingState = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);
    // Simular download
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      alert('Download concluído!');
    }, 3000);
  };

  return (
    <>
      <Button variant="primary" icon={<DownloadOutlined />} onClick={() => setOpen(true)}>
        Baixar Relatório
      </Button>
      <Modal
        variant="confirm"
        title="Baixar Relatório"
        open={open}
        onOk={handleDownload}
        onCancel={() => setOpen(false)}
        confirmLoading={loading}
        okText="Baixar"
        cancelText="Cancelar"
        size="sm"
      >
        <Paragraph>
          O relatório será baixado no formato PDF. Este processo pode levar alguns segundos.
        </Paragraph>
      </Modal>
    </>
  );
};

/**
 * Modal não-closable.
 * Use para ações obrigatórias que o usuário deve completar.
 */
export const NonClosable = () => {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Abrir Modal
      </Button>
      <Modal
        title="Termos de Uso"
        open={open}
        closable={false}
        maskClosable={false}
        keyboard={false}
        onOk={() => setOpen(false)}
        okText="Aceito"
        cancelText="Recusar"
        onCancel={() => {
          setOpen(false);
          alert('Você recusou os termos');
        }}
        size="md"
      >
        <Flex vertical gap={16}>
          <Paragraph>
            Para continuar usando este serviço, você deve aceitar os termos de uso.
          </Paragraph>
          <div style={{ maxHeight: '200px', overflow: 'auto', padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </Text>
          </div>
        </Flex>
      </Modal>
    </>
  );
};
