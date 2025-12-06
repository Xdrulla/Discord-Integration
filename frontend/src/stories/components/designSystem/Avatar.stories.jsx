import React from 'react';
import { Space, Flex, Typography } from 'antd';
import Avatar from '../../../components/designSystem/Avatar/Avatar.jsx';

const { Text } = Typography;

/**
 * Avatar - Componente de avatar do Plus UI Design System
 *
 * O Avatar é usado para representar pessoas, organizações ou entidades de forma visual.
 * Suporta diferentes tamanhos, formas, imagens, iniciais de texto e indicadores de status.
 */
export default {
  title: 'Design System/Avatar',
  component: Avatar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
O componente **Avatar** fornece uma representação visual de usuários ou entidades no sistema.

### Características

- ✅ **6 tamanhos**: xs (24px), sm (32px), md (40px), lg (48px), xl (64px), 2xl (80px)
- ✅ **2 formas**: Circle (padrão) e Square
- ✅ **Iniciais automáticas**: Gera iniciais a partir do nome quando não há imagem
- ✅ **Status indicators**: Online, Offline, Busy, Away
- ✅ **4 posições de status**: Top-left, Top-right, Bottom-left, Bottom-right
- ✅ **Interativo**: Suporta onClick e href para navegação
- ✅ **Acessível**: Alt text e suporte a leitores de tela

### Quando usar

- Representar usuários em listas, cards ou headers
- Mostrar status de disponibilidade em tempo real
- Identificar autores de comentários ou posts
- Exibir membros de equipes ou grupos

### Boas práticas

✅ **Faça:**
- Use tamanhos consistentes no mesmo contexto
- Forneça sempre um nome para gerar iniciais quando não houver imagem
- Use status indicators apenas quando relevante
- Prefira formato circular para pessoas

❌ **Evite:**
- Misturar tamanhos diferentes no mesmo componente
- Usar imagens de baixa qualidade
- Adicionar status sem significado claro
        `,
      },
    },
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'URL da imagem do avatar',
      table: {
        type: { summary: 'string' },
      },
    },
    name: {
      control: 'text',
      description: 'Nome da pessoa (usado para gerar iniciais quando não há imagem)',
      table: {
        type: { summary: 'string' },
      },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Tamanho do avatar',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
      },
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Forma do avatar',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'circle' },
      },
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'busy', 'away'],
      description: 'Status de disponibilidade do usuário',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    statusPosition: {
      control: 'select',
      options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
      description: 'Posição do indicador de status',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'bottom-right' },
      },
    },
    onClick: {
      action: 'clicked',
      description: 'Callback executado quando o avatar é clicado',
      table: {
        type: { summary: 'function' },
      },
    },
    href: {
      control: 'text',
      description: 'URL para navegação ao clicar no avatar',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

/**
 * Avatar padrão com imagem.
 */
export const Default = {
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    name: 'John Doe',
    size: 'md',
  },
};

/**
 * Avatar com iniciais.
 * Quando não há imagem, o avatar exibe as iniciais do nome automaticamente.
 */
export const WithInitials = {
  args: {
    name: 'Jane Smith',
    size: 'md',
  },
};

/**
 * Avatar com status online.
 * Mostra um indicador verde indicando que o usuário está disponível.
 */
export const WithStatusOnline = {
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    name: 'Alice Johnson',
    size: 'md',
    status: 'online',
  },
};

/**
 * Todos os tamanhos disponíveis.
 * Mostra a escala completa de tamanhos do Avatar: xs, sm, md, lg, xl e 2xl.
 */
export const AllSizes = {
  render: () => (
    <Space size="large" wrap>
      <Flex vertical align="center" gap={8}>
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=xs" name="XS" size="xs" />
        <Text style={{ fontSize: '12px' }}>Extra Small (xs)</Text>
      </Flex>
      <Flex vertical align="center" gap={8}>
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=sm" name="SM" size="sm" />
        <Text style={{ fontSize: '12px' }}>Small (sm)</Text>
      </Flex>
      <Flex vertical align="center" gap={8}>
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=md" name="MD" size="md" />
        <Text style={{ fontSize: '12px' }}>Medium (md)</Text>
      </Flex>
      <Flex vertical align="center" gap={8}>
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=lg" name="LG" size="lg" />
        <Text style={{ fontSize: '12px' }}>Large (lg)</Text>
      </Flex>
      <Flex vertical align="center" gap={8}>
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=xl" name="XL" size="xl" />
        <Text style={{ fontSize: '12px' }}>Extra Large (xl)</Text>
      </Flex>
      <Flex vertical align="center" gap={8}>
        <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=2xl" name="2XL" size="2xl" />
        <Text style={{ fontSize: '12px' }}>2XL</Text>
      </Flex>
    </Space>
  ),
};

/**
 * Todos os status disponíveis.
 * Demonstra os 4 estados de disponibilidade: online, offline, busy e away.
 */
export const AllStatuses = {
  render: () => (
    <Space size="large" wrap>
      <Flex vertical align="center" gap={8}>
        <Avatar
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=online"
          name="Online"
          size="lg"
          status="online"
        />
        <Text>Online</Text>
      </Flex>
      <Flex vertical align="center" gap={8}>
        <Avatar
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=offline"
          name="Offline"
          size="lg"
          status="offline"
        />
        <Text>Offline</Text>
      </Flex>
      <Flex vertical align="center" gap={8}>
        <Avatar
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=busy"
          name="Busy"
          size="lg"
          status="busy"
        />
        <Text>Busy</Text>
      </Flex>
      <Flex vertical align="center" gap={8}>
        <Avatar
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=away"
          name="Away"
          size="lg"
          status="away"
        />
        <Text>Away</Text>
      </Flex>
    </Space>
  ),
};
