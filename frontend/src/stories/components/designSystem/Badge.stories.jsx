import React from 'react';
import { Space, Flex, Avatar, Typography } from 'antd';
import {
  ClockCircleOutlined,
  MailOutlined,
  BellOutlined,
  ShoppingCartOutlined,
  MessageOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Badge from '../../../components/designSystem/Badge/Badge.jsx';

const { Text, Title } = Typography;

/**
 * Badge - Small status indicator for UI elements
 *
 * Based on Ant Design v6.0 with Plus UI Design System tokens.
 * Supports numeric counts, dot indicators, and status badges.
 */
export default {
  title: 'Design System/Badge',
  component: Badge,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Badge component for displaying notification counts, status indicators, or small labels.

**Features:**
- Numeric badges with overflow (99+)
- Dot badges for simple indicators
- Status badges with text
- Multiple color variants (primary, success, warning, error, and more)
- Two sizes: default and small
- Standalone or wrapped around elements
- Plus UI Design System tokens (Inter font, semantic colors)
- Dark mode support

**Ant Design v6.0**: This component uses the semantic structure with \`classNames\` and \`styles\` props for granular customization.
        `.trim(),
      },
    },
  },
  argTypes: {
    count: {
      control: 'number',
      description: 'Number to show in badge',
    },
    dot: {
      control: 'boolean',
      description: 'Display a dot instead of count',
    },
    showZero: {
      control: 'boolean',
      description: 'Show badge when count is 0',
    },
    overflowCount: {
      control: 'number',
      description: 'Max count to show (displays "count+" when exceeded)',
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error', 'blue', 'green', 'red', 'yellow', 'orange', 'purple', 'gray'],
      description: 'Badge color variant',
    },
    status: {
      control: 'select',
      options: ['success', 'processing', 'default', 'error', 'warning'],
      description: 'Badge status (for status badge with text)',
    },
    text: {
      control: 'text',
      description: 'Text to display next to status badge',
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
      description: 'Badge size',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class',
    },
    classNames: {
      control: 'object',
      description: 'Semantic classNames object (root, indicator)',
    },
    styles: {
      control: 'object',
      description: 'Semantic styles object (root, indicator)',
    },
  },
  tags: ['autodocs'],
};

/**
 * Default numeric badge.
 */
export const Default = {
  args: {
    count: 5,
    children: <Avatar shape="square" icon={<UserOutlined />} />,
  },
};

/**
 * Dot badge (simple indicator).
 */
export const Dot = {
  args: {
    dot: true,
    children: <BellOutlined style={{ fontSize: '24px' }} />,
  },
};

/**
 * Badge with overflow count (99+).
 */
export const OverflowCount = {
  render: () => (
    <Space size="large">
      <Badge count={99}>
        <Avatar shape="square" icon={<UserOutlined />} />
      </Badge>
      <Badge count={100}>
        <Avatar shape="square" icon={<UserOutlined />} />
      </Badge>
      <Badge count={999} overflowCount={999}>
        <Avatar shape="square" icon={<UserOutlined />} />
      </Badge>
    </Space>
  ),
};

/**
 * All color variants.
 */
export const AllColors = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Semantic Colors</Text>
        <Space size="large" wrap>
          <Flex vertical align="center" gap={8}>
            <Badge count={5} color="default">
              <Avatar shape="square" icon={<UserOutlined />} />
            </Badge>
            <Text style={{ fontSize: '12px' }}>Default</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Badge count={5} color="primary">
              <Avatar shape="square" icon={<UserOutlined />} />
            </Badge>
            <Text style={{ fontSize: '12px' }}>Primary</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Badge count={5} color="success">
              <Avatar shape="square" icon={<UserOutlined />} />
            </Badge>
            <Text style={{ fontSize: '12px' }}>Success</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Badge count={5} color="warning">
              <Avatar shape="square" icon={<UserOutlined />} />
            </Badge>
            <Text style={{ fontSize: '12px' }}>Warning</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Badge count={5} color="error">
              <Avatar shape="square" icon={<UserOutlined />} />
            </Badge>
            <Text style={{ fontSize: '12px' }}>Error</Text>
          </Flex>
        </Space>
      </Flex>

      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Additional Colors</Text>
        <Space size="large" wrap>
          <Flex vertical align="center" gap={8}>
            <Badge count={5} color="blue">
              <Avatar shape="square" icon={<UserOutlined />} />
            </Badge>
            <Text style={{ fontSize: '12px' }}>Blue</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Badge count={5} color="green">
              <Avatar shape="square" icon={<UserOutlined />} />
            </Badge>
            <Text style={{ fontSize: '12px' }}>Green</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Badge count={5} color="red">
              <Avatar shape="square" icon={<UserOutlined />} />
            </Badge>
            <Text style={{ fontSize: '12px' }}>Red</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Badge count={5} color="yellow">
              <Avatar shape="square" icon={<UserOutlined />} />
            </Badge>
            <Text style={{ fontSize: '12px' }}>Yellow</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Badge count={5} color="orange">
              <Avatar shape="square" icon={<UserOutlined />} />
            </Badge>
            <Text style={{ fontSize: '12px' }}>Orange</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Badge count={5} color="purple">
              <Avatar shape="square" icon={<UserOutlined />} />
            </Badge>
            <Text style={{ fontSize: '12px' }}>Purple</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Badge count={5} color="gray">
              <Avatar shape="square" icon={<UserOutlined />} />
            </Badge>
            <Text style={{ fontSize: '12px' }}>Gray</Text>
          </Flex>
        </Space>
      </Flex>
    </Space>
  ),
};

/**
 * Status badges with text.
 */
export const StatusBadges = {
  render: () => (
    <Space direction="vertical" size="middle">
      <Badge status="success" text="Success" />
      <Badge status="processing" text="Processing" />
      <Badge status="default" text="Default" />
      <Badge status="error" text="Error" />
      <Badge status="warning" text="Warning" />
    </Space>
  ),
};

/**
 * Standalone badges (without children).
 */
export const Standalone = {
  render: () => (
    <Space size="large" wrap>
      <Badge count={5} />
      <Badge count={10} color="primary" />
      <Badge count={25} color="success" />
      <Badge count={99} color="warning" />
      <Badge count={100} color="error" />
    </Space>
  ),
};

/**
 * Size variations.
 */
export const Sizes = {
  render: () => (
    <Space direction="vertical" size="large">
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Default Size</Text>
        <Space size="large">
          <Badge count={5}>
            <Avatar shape="square" icon={<UserOutlined />} />
          </Badge>
          <Badge count={99}>
            <Avatar shape="square" icon={<UserOutlined />} />
          </Badge>
          <Badge dot>
            <BellOutlined style={{ fontSize: '24px' }} />
          </Badge>
        </Space>
      </Flex>

      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Small Size</Text>
        <Space size="large">
          <Badge count={5} size="small">
            <Avatar size="small" shape="square" icon={<UserOutlined />} />
          </Badge>
          <Badge count={99} size="small">
            <Avatar size="small" shape="square" icon={<UserOutlined />} />
          </Badge>
          <Badge dot size="small">
            <BellOutlined style={{ fontSize: '20px' }} />
          </Badge>
        </Space>
      </Flex>
    </Space>
  ),
};

/**
 * Dot badges in different colors.
 */
export const DotColors = {
  render: () => (
    <Space size="large" wrap>
      <Badge dot color="primary">
        <BellOutlined style={{ fontSize: '24px' }} />
      </Badge>
      <Badge dot color="success">
        <BellOutlined style={{ fontSize: '24px' }} />
      </Badge>
      <Badge dot color="warning">
        <BellOutlined style={{ fontSize: '24px' }} />
      </Badge>
      <Badge dot color="error">
        <BellOutlined style={{ fontSize: '24px' }} />
      </Badge>
      <Badge dot color="blue">
        <BellOutlined style={{ fontSize: '24px' }} />
      </Badge>
      <Badge dot color="purple">
        <BellOutlined style={{ fontSize: '24px' }} />
      </Badge>
    </Space>
  ),
};

/**
 * Show zero count.
 */
export const ShowZero = {
  render: () => (
    <Space size="large">
      <Flex vertical align="center" gap={8}>
        <Badge count={0} showZero={false}>
          <Avatar shape="square" icon={<UserOutlined />} />
        </Badge>
        <Text style={{ fontSize: '12px' }}>showZero=false</Text>
      </Flex>
      <Flex vertical align="center" gap={8}>
        <Badge count={0} showZero>
          <Avatar shape="square" icon={<UserOutlined />} />
        </Badge>
        <Text style={{ fontSize: '12px' }}>showZero=true</Text>
      </Flex>
    </Space>
  ),
};

/**
 * v6: Semantic structure with custom classNames.
 */
export const WithSemanticClasses = {
  args: {
    count: 10,
    children: <Avatar shape="square" icon={<UserOutlined />} />,
    classNames: {
      root: 'custom-badge-root',
      indicator: 'custom-badge-indicator',
    },
  },
};

/**
 * v6: Semantic structure with custom styles.
 */
export const WithSemanticStyles = {
  args: {
    count: 10,
    children: <Avatar shape="square" icon={<UserOutlined />} />,
    styles: {
      indicator: {
        backgroundColor: '#10b981',
        fontSize: '14px',
      },
    },
  },
};

/**
 * Real-world example: Notification icons.
 */
export const NotificationIcons = {
  render: () => (
    <Space size="large">
      <Badge count={12} color="error">
        <BellOutlined style={{ fontSize: '24px', color: '#667085' }} />
      </Badge>
      <Badge count={5} color="primary">
        <MailOutlined style={{ fontSize: '24px', color: '#667085' }} />
      </Badge>
      <Badge dot color="success">
        <MessageOutlined style={{ fontSize: '24px', color: '#667085' }} />
      </Badge>
      <Badge count={3} color="warning">
        <ShoppingCartOutlined style={{ fontSize: '24px', color: '#667085' }} />
      </Badge>
    </Space>
  ),
};

/**
 * Real-world example: User avatars with status.
 */
export const UserAvatars = {
  render: () => (
    <Space size="large">
      <Badge dot color="success">
        <Avatar src="https://i.pravatar.cc/150?img=1" />
      </Badge>
      <Badge dot color="warning">
        <Avatar src="https://i.pravatar.cc/150?img=2" />
      </Badge>
      <Badge dot color="error">
        <Avatar src="https://i.pravatar.cc/150?img=3" />
      </Badge>
      <Badge dot color="gray">
        <Avatar src="https://i.pravatar.cc/150?img=4" />
      </Badge>
    </Space>
  ),
};

/**
 * Real-world example: Navigation with badges.
 */
export const NavigationExample = {
  render: () => (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #E4E7EC',
        maxWidth: '300px',
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={12}>
            <BellOutlined style={{ fontSize: '20px', color: '#667085' }} />
            <Text>Notifications</Text>
          </Flex>
          <Badge count={12} color="error" />
        </Flex>

        <Flex align="center" justify="space-between">
          <Flex align="center" gap={12}>
            <MailOutlined style={{ fontSize: '20px', color: '#667085' }} />
            <Text>Messages</Text>
          </Flex>
          <Badge count={5} color="primary" />
        </Flex>

        <Flex align="center" justify="space-between">
          <Flex align="center" gap={12}>
            <ClockCircleOutlined style={{ fontSize: '20px', color: '#667085' }} />
            <Text>Updates</Text>
          </Flex>
          <Badge dot color="success" />
        </Flex>

        <Flex align="center" justify="space-between">
          <Flex align="center" gap={12}>
            <ShoppingCartOutlined style={{ fontSize: '20px', color: '#667085' }} />
            <Text>Cart</Text>
          </Flex>
          <Badge count={3} color="warning" />
        </Flex>
      </Space>
    </div>
  ),
};

/**
 * Real-world example: Status indicators.
 */
export const StatusIndicators = {
  render: () => (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #E4E7EC',
      }}
    >
      <Title level={5} style={{ marginBottom: '16px' }}>
        System Status
      </Title>
      <Space direction="vertical" size="middle">
        <Badge status="success" text="Database: Online" />
        <Badge status="success" text="API Server: Running" />
        <Badge status="processing" text="Background Jobs: Processing" />
        <Badge status="warning" text="Cache: High Memory Usage" />
        <Badge status="default" text="Monitoring: Disabled" />
      </Space>
    </div>
  ),
};

/**
 * Custom badge content (text instead of number).
 */
export const CustomContent = {
  render: () => (
    <Space size="large">
      <Badge count="NEW" color="primary">
        <Avatar shape="square" icon={<UserOutlined />} />
      </Badge>
      <Badge count="HOT" color="error">
        <Avatar shape="square" icon={<UserOutlined />} />
      </Badge>
      <Badge count="VIP" color="purple">
        <Avatar shape="square" icon={<UserOutlined />} />
      </Badge>
    </Space>
  ),
};
