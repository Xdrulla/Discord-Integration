import React from 'react';
import { Space, Flex, Typography } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SearchOutlined,
  StarOutlined,
  HeartOutlined,
  SettingOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import Button from '../../../components/designSystem/Button/Button.jsx';

const { Text } = Typography;

/**
 * Button - Componente de botão do Design System
 *
 * O Button é usado para disparar ações e eventos no sistema.
 * Suporta múltiplas variantes, tamanhos, estados e ícones com posicionamento lógico (Ant Design v6).
 *
 * ✨ Atualizado para Ant Design v6.0
 */
export default {
  title: 'Design System/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
O componente **Button** fornece uma interface consistente para ações e interações do usuário.

### Características

- ✅ **5 variantes**: Primary, Secondary, Tertiary, Link, Destructive
- ✅ **3 tamanhos**: sm (32px), md (40px), lg (48px)
- ✅ **Estados**: Default, Hover, Focused, Disabled, Loading
- ✅ **Ícones**: Suporte a ícones com posicionamento lógico (start/end)
- ✅ **3 formas**: Default, Circle, Round
- ✅ **Responsivo**: Adaptação automática para mobile
- ✅ **Acessível**: Suporte completo a leitores de tela

**Ant Design v6.0**: Este componente utiliza a estrutura semântica com suporte a \`classNames\` e \`styles\`.
Usa \`iconPlacement\` (start/end) ao invés de \`iconPosition\` (left/right).

### Quando usar

- Ações primárias em formulários (submit, save)
- Navegação e direcionamento do usuário
- Ações destrutivas (delete, remove)
- Chamadas para ação (CTAs)

### Boas práticas

✅ **Faça:**
- Use variant="primary" para ação principal da tela
- Use variant="destructive" para ações irreversíveis
- Forneça texto descritivo (evite "OK", "Cancelar" genéricos)
- Use loading state durante operações assíncronas
- Mantenha consistência de tamanhos no mesmo contexto

❌ **Evite:**
- Múltiplos botões primários na mesma seção
- Textos muito longos (máximo 2-3 palavras)
- Ícones sem significado claro
- Botões desabilitados sem explicação
        `.trim(),
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'link', 'destructive'],
      description: 'Variante visual do botão',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamanho do botão',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Se o botão está desabilitado',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Estado de loading (mostra spinner)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    block: {
      control: 'boolean',
      description: 'Se o botão ocupa 100% da largura',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    shape: {
      control: 'select',
      options: ['default', 'circle', 'round'],
      description: 'Forma do botão',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    iconPlacement: {
      control: 'select',
      options: ['start', 'end'],
      description: '⚠️ v6: Posicionamento do ícone (anteriormente era "position")',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'start' },
      },
    },
    ghost: {
      control: 'boolean',
      description: 'Estilo fantasma (fundo transparente)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    htmlType: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Tipo HTML do botão',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'button' },
      },
    },
    onClick: {
      action: 'clicked',
      description: 'Callback quando o botão é clicado',
      table: {
        type: { summary: 'function' },
      },
    },
    classNames: {
      control: 'object',
      description: '✨ v6: Objeto com classes CSS para elementos internos (root, icon)',
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
 * Botão primário padrão.
 * Use para a ação principal da tela.
 */
export const Default = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Button',
  },
};

/**
 * Todas as variantes disponíveis.
 * Demonstra os 5 estilos visuais do botão.
 */
export const AllVariants = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500, color: '#667085' }}>Primary</Text>
        <Button variant="primary">Primary Button</Button>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500, color: '#667085' }}>Secondary (Outlined)</Text>
        <Button variant="secondary">Secondary Button</Button>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500, color: '#667085' }}>Tertiary (Ghost)</Text>
        <Button variant="tertiary">Tertiary Button</Button>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500, color: '#667085' }}>Link</Text>
        <Button variant="link">Link Button</Button>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500, color: '#667085' }}>Destructive (Danger)</Text>
        <Button variant="destructive">Destructive Button</Button>
      </Flex>
    </Space>
  ),
};

/**
 * Todos os tamanhos disponíveis.
 * Mostra a escala completa: sm (32px), md (40px), lg (48px).
 */
export const AllSizes = {
  render: () => (
    <Space direction="vertical" size="large" align="start">
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Small (sm) - 32px</Text>
        <Button variant="primary" size="sm">
          Small Button
        </Button>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Medium (md) - 40px</Text>
        <Button variant="primary" size="md">
          Medium Button
        </Button>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Large (lg) - 48px</Text>
        <Button variant="primary" size="lg">
          Large Button
        </Button>
      </Flex>
    </Space>
  ),
};

/**
 * ✨ v6: Botões com ícones usando posicionamento lógico.
 * Demonstra iconPlacement='start' e 'end' (ao invés de left/right em v5).
 */
export const WithIcons = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Icon Start (padrão)</Text>
        <Space wrap>
          <Button variant="primary" icon={<PlusOutlined />} iconPlacement="start">
            Add Item
          </Button>
          <Button variant="secondary" icon={<DownloadOutlined />} iconPlacement="start">
            Download
          </Button>
          <Button variant="tertiary" icon={<SearchOutlined />} iconPlacement="start">
            Search
          </Button>
        </Space>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Icon End</Text>
        <Space wrap>
          <Button variant="primary" icon={<PlusOutlined />} iconPlacement="end">
            Add Item
          </Button>
          <Button variant="secondary" icon={<DownloadOutlined />} iconPlacement="end">
            Download
          </Button>
          <Button variant="tertiary" icon={<SearchOutlined />} iconPlacement="end">
            Search
          </Button>
        </Space>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Icon Only</Text>
        <Space wrap>
          <Button variant="primary" icon={<PlusOutlined />} size="sm" />
          <Button variant="primary" icon={<PlusOutlined />} size="md" />
          <Button variant="primary" icon={<PlusOutlined />} size="lg" />
          <Button variant="secondary" icon={<SearchOutlined />} size="md" />
          <Button variant="destructive" icon={<DeleteOutlined />} size="md" />
        </Space>
      </Flex>
    </Space>
  ),
};

/**
 * Estados do botão.
 * Demonstra loading, disabled e ghost states.
 */
export const States = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Default</Text>
        <Space wrap>
          <Button variant="primary">Default</Button>
          <Button variant="secondary">Default</Button>
          <Button variant="tertiary">Default</Button>
        </Space>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Loading</Text>
        <Space wrap>
          <Button variant="primary" loading>
            Loading
          </Button>
          <Button variant="secondary" loading>
            Loading
          </Button>
          <Button variant="tertiary" loading>
            Loading
          </Button>
        </Space>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Disabled</Text>
        <Space wrap>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
          <Button variant="tertiary" disabled>
            Disabled
          </Button>
        </Space>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Ghost (Fundo transparente)</Text>
        <Space wrap style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <Button variant="primary" ghost>
            Ghost Primary
          </Button>
          <Button variant="secondary" ghost>
            Ghost Secondary
          </Button>
        </Space>
      </Flex>
    </Space>
  ),
};

/**
 * Formas do botão.
 * Demonstra default, circle e round.
 */
export const Shapes = {
  render: () => (
    <Space direction="vertical" size="large" align="start">
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Default (retangular)</Text>
        <Button variant="primary" shape="default">
          Default Shape
        </Button>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Round (bordas arredondadas)</Text>
        <Button variant="primary" shape="round">
          Round Shape
        </Button>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Circle (apenas com ícone)</Text>
        <Space wrap>
          <Button variant="primary" shape="circle" icon={<StarOutlined />} size="sm" />
          <Button variant="primary" shape="circle" icon={<HeartOutlined />} size="md" />
          <Button variant="primary" shape="circle" icon={<SettingOutlined />} size="lg" />
        </Space>
      </Flex>
    </Space>
  ),
};

/**
 * Botões em bloco (largura 100%).
 * Útil para formulários e layouts mobile.
 */
export const BlockButtons = {
  render: () => (
    <Flex vertical gap={12} style={{ maxWidth: '400px' }}>
      <Button variant="primary" block>
        Primary Block Button
      </Button>
      <Button variant="secondary" block>
        Secondary Block Button
      </Button>
      <Button variant="tertiary" block>
        Tertiary Block Button
      </Button>
      <Button variant="destructive" block icon={<DeleteOutlined />}>
        Delete Account
      </Button>
    </Flex>
  ),
};

/**
 * ✨ v6: Demonstração de estrutura semântica com classNames.
 * Mostra como aplicar classes customizadas aos elementos internos.
 */
export const WithSemanticClasses = {
  render: () => (
    <Space wrap>
      <Button
        variant="primary"
        icon={<PlusOutlined />}
        classNames={{
          root: 'custom-button-root',
          icon: 'custom-button-icon',
        }}
      >
        Custom Classes
      </Button>
      <Button
        variant="secondary"
        icon={<DownloadOutlined />}
        classNames={{
          root: 'custom-outline-button',
          icon: 'custom-icon-style',
        }}
      >
        Download
      </Button>
    </Space>
  ),
};

/**
 * ✨ v6: Demonstração de estrutura semântica com styles.
 * Mostra como aplicar estilos inline aos elementos internos.
 */
export const WithSemanticStyles = {
  render: () => (
    <Space wrap>
      <Button
        variant="primary"
        icon={<PlusOutlined />}
        styles={{
          root: { borderRadius: '20px', padding: '0 24px' },
          icon: { fontSize: '18px' },
        }}
      >
        Custom Styles
      </Button>
      <Button
        variant="secondary"
        styles={{
          root: { border: '2px dashed #43CDB2' },
        }}
      >
        Dashed Border
      </Button>
    </Space>
  ),
};

/**
 * Botões destrutivos.
 * Use para ações irreversíveis que requerem atenção.
 */
export const Destructive = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Ações destrutivas</Text>
        <Space wrap>
          <Button variant="destructive">Delete</Button>
          <Button variant="destructive" icon={<DeleteOutlined />}>
            Delete Item
          </Button>
          <Button variant="destructive" icon={<DeleteOutlined />} iconPlacement="end">
            Remove All
          </Button>
        </Space>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Destrutivo em diferentes tamanhos</Text>
        <Space wrap>
          <Button variant="destructive" size="sm" icon={<DeleteOutlined />}>
            Small
          </Button>
          <Button variant="destructive" size="md" icon={<DeleteOutlined />}>
            Medium
          </Button>
          <Button variant="destructive" size="lg" icon={<DeleteOutlined />}>
            Large
          </Button>
        </Space>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Destrutivo com estados</Text>
        <Space wrap>
          <Button variant="destructive" loading>
            Deleting...
          </Button>
          <Button variant="destructive" disabled>
            Disabled
          </Button>
        </Space>
      </Flex>
    </Space>
  ),
};

/**
 * Exemplo de uso em formulário.
 * Demonstra padrão comum de botões em forms.
 */
export const InForm = {
  render: () => (
    <Flex
      vertical
      gap={16}
      style={{
        padding: '24px',
        border: '1px solid #E4E7EC',
        borderRadius: '12px',
        backgroundColor: '#fff',
        maxWidth: '500px',
      }}
    >
      <Text style={{ fontSize: '18px', fontWeight: 600 }}>Criar nova conta</Text>
      <Flex vertical gap={8}>
        <Text>Nome completo</Text>
        <div style={{ height: '40px', background: '#F9FAFB', border: '1px solid #D0D5DD', borderRadius: '8px' }} />
      </Flex>
      <Flex vertical gap={8}>
        <Text>Email</Text>
        <div style={{ height: '40px', background: '#F9FAFB', border: '1px solid #D0D5DD', borderRadius: '8px' }} />
      </Flex>
      <Flex vertical gap={8}>
        <Text>Senha</Text>
        <div style={{ height: '40px', background: '#F9FAFB', border: '1px solid #D0D5DD', borderRadius: '8px' }} />
      </Flex>
      <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: '8px' }}>
        <Button variant="tertiary">Cancelar</Button>
        <Button variant="primary" htmlType="submit" icon={<CheckOutlined />}>
          Criar conta
        </Button>
      </Space>
    </Flex>
  ),
};

/**
 * Exemplo de uso em card de ação.
 * Demonstra diferentes botões em um contexto real.
 */
export const InCard = {
  render: () => (
    <Flex
      vertical
      gap={16}
      style={{
        padding: '24px',
        border: '1px solid #E4E7EC',
        borderRadius: '12px',
        backgroundColor: '#fff',
        maxWidth: '400px',
      }}
    >
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '16px', fontWeight: 600 }}>Exportar dados</Text>
        <Text style={{ fontSize: '14px', color: '#667085' }}>
          Baixe todos os seus dados em formato CSV ou JSON.
        </Text>
      </Flex>
      <Flex vertical gap={8}>
        <Button variant="primary" icon={<DownloadOutlined />} block>
          Exportar como CSV
        </Button>
        <Button variant="secondary" icon={<DownloadOutlined />} block>
          Exportar como JSON
        </Button>
        <Button variant="tertiary" block>
          Cancelar
        </Button>
      </Flex>
    </Flex>
  ),
};

/**
 * Grupo de botões com ações relacionadas.
 * Mostra padrão de múltiplas ações em linha.
 */
export const ActionGroup = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Ações principais</Text>
        <Space wrap>
          <Button variant="primary" icon={<PlusOutlined />}>
            Novo
          </Button>
          <Button variant="secondary" icon={<DownloadOutlined />}>
            Exportar
          </Button>
          <Button variant="tertiary" icon={<SearchOutlined />}>
            Buscar
          </Button>
        </Space>
      </Flex>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>Ações de item</Text>
        <Space wrap>
          <Button variant="secondary" size="sm">
            Editar
          </Button>
          <Button variant="secondary" size="sm">
            Duplicar
          </Button>
          <Button variant="destructive" size="sm" icon={<DeleteOutlined />}>
            Excluir
          </Button>
        </Space>
      </Flex>
    </Space>
  ),
};
