import React, { useState } from 'react';
import { Space, Flex, Typography } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  FileOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import Tabs from '../../../components/designSystem/Tabs/Tabs.jsx';

const { Text, Title } = Typography;

/**
 * Tabs - Navigation component for organizing content into separate views
 *
 * Based on Ant Design v6.0 with Plus UI Design System tokens.
 * Supports line, card, and editable-card types with logical positioning.
 */
export default {
  title: 'Design System/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Tabs component for organizing and navigating between different views or sections of content.

**Features:**
- Three types: line (default), card, editable-card
- Logical positioning: top, bottom, start (left), end (right)
- Three sizes: small, middle, large
- Icon support in tab labels
- Editable tabs with add/remove functionality
- Plus UI Design System tokens (Inter font, semantic colors)
- Responsive behavior
- Dark mode support

**Ant Design v6.0**: This component uses:
- \`tabPlacement\` instead of \`tabPosition\` (logical positioning: start/end instead of left/right)
- Semantic structure with \`classNames\` and \`styles\` props for granular customization
        `.trim(),
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of tab items. Each item: { key, label, children, disabled, icon, closable }',
    },
    type: {
      control: 'select',
      options: ['line', 'card', 'editable-card'],
      description: 'Tab type/variant',
    },
    tabPlacement: {
      control: 'select',
      options: ['top', 'bottom', 'start', 'end'],
      description: 'v6: Tab placement using logical positioning (start=left in LTR, end=right in LTR)',
    },
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
      description: 'Tab size',
    },
    activeKey: {
      control: 'text',
      description: 'Current active tab key (controlled)',
    },
    defaultActiveKey: {
      control: 'text',
      description: 'Default active tab key (uncontrolled)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class for root element',
    },
    classNames: {
      control: 'object',
      description: 'Semantic classNames object (root, nav, tab, tabPanel, inkBar)',
    },
    styles: {
      control: 'object',
      description: 'Semantic styles object (root, nav, tab, tabPanel, inkBar)',
    },
    onChange: {
      action: 'tab changed',
      description: 'Callback when active tab changes',
    },
    onEdit: {
      action: 'tab edited',
      description: 'Callback when tab is added or removed (editable-card only)',
    },
    onTabClick: {
      action: 'tab clicked',
      description: 'Callback when tab is clicked',
    },
  },
  tags: ['autodocs'],
};

// Sample content for tabs
const sampleContent = {
  tab1: (
    <div>
      <Title level={4}>Overview</Title>
      <Text>
        This is the overview tab content. Here you can display a summary of important information,
        statistics, or an introduction to your application.
      </Text>
    </div>
  ),
  tab2: (
    <div>
      <Title level={4}>Details</Title>
      <Text>
        This is the details tab content. Here you can provide more in-depth information,
        specifications, or detailed documentation about your features.
      </Text>
    </div>
  ),
  tab3: (
    <div>
      <Title level={4}>Settings</Title>
      <Text>
        This is the settings tab content. Here users can configure preferences,
        manage their account, or adjust application settings.
      </Text>
    </div>
  ),
};

/**
 * Default line-type tabs.
 */
export const Default = {
  args: {
    items: [
      { key: '1', label: 'Tab 1', children: sampleContent.tab1 },
      { key: '2', label: 'Tab 2', children: sampleContent.tab2 },
      { key: '3', label: 'Tab 3', children: sampleContent.tab3 },
    ],
  },
};

/**
 * Tabs with icons.
 */
export const WithIcons = {
  args: {
    items: [
      {
        key: '1',
        label: (
          <span>
            <AppstoreOutlined /> Overview
          </span>
        ),
        children: sampleContent.tab1,
      },
      {
        key: '2',
        label: (
          <span>
            <BarChartOutlined /> Analytics
          </span>
        ),
        children: sampleContent.tab2,
      },
      {
        key: '3',
        label: (
          <span>
            <SettingOutlined /> Settings
          </span>
        ),
        children: sampleContent.tab3,
      },
    ],
  },
};

/**
 * Card type tabs.
 */
export const CardType = {
  args: {
    type: 'card',
    items: [
      { key: '1', label: 'Tab 1', children: sampleContent.tab1 },
      { key: '2', label: 'Tab 2', children: sampleContent.tab2 },
      { key: '3', label: 'Tab 3', children: sampleContent.tab3 },
    ],
  },
};

/**
 * Editable card type tabs (add/remove functionality).
 */
export const EditableCard = {
  render: () => {
    const [items, setItems] = useState([
      { key: '1', label: 'Tab 1', children: 'Content of Tab 1', closable: false },
      { key: '2', label: 'Tab 2', children: 'Content of Tab 2' },
      { key: '3', label: 'Tab 3', children: 'Content of Tab 3' },
    ]);
    const [activeKey, setActiveKey] = useState('1');

    const onEdit = (targetKey, action) => {
      if (action === 'add') {
        const newKey = String(items.length + 1);
        setItems([
          ...items,
          {
            key: newKey,
            label: `Tab ${newKey}`,
            children: `Content of Tab ${newKey}`,
          },
        ]);
        setActiveKey(newKey);
      } else if (action === 'remove') {
        const newItems = items.filter((item) => item.key !== targetKey);
        setItems(newItems);
        if (activeKey === targetKey && newItems.length > 0) {
          setActiveKey(newItems[0].key);
        }
      }
    };

    return (
      <Tabs
        type="editable-card"
        items={items}
        activeKey={activeKey}
        onChange={setActiveKey}
        onEdit={onEdit}
      />
    );
  },
};

/**
 * All size variations.
 */
export const AllSizes = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Small</Text>
        <Tabs
          size="small"
          items={[
            { key: '1', label: 'Tab 1', children: 'Small tab content' },
            { key: '2', label: 'Tab 2', children: 'Small tab content' },
            { key: '3', label: 'Tab 3', children: 'Small tab content' },
          ]}
        />
      </Flex>

      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Middle (default)</Text>
        <Tabs
          size="middle"
          items={[
            { key: '1', label: 'Tab 1', children: 'Middle tab content' },
            { key: '2', label: 'Tab 2', children: 'Middle tab content' },
            { key: '3', label: 'Tab 3', children: 'Middle tab content' },
          ]}
        />
      </Flex>

      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Large</Text>
        <Tabs
          size="large"
          items={[
            { key: '1', label: 'Tab 1', children: 'Large tab content' },
            { key: '2', label: 'Tab 2', children: 'Large tab content' },
            { key: '3', label: 'Tab 3', children: 'Large tab content' },
          ]}
        />
      </Flex>
    </Space>
  ),
};

/**
 * v6: Logical positioning - Top placement (default).
 */
export const PlacementTop = {
  args: {
    tabPlacement: 'top',
    items: [
      { key: '1', label: 'Tab 1', children: sampleContent.tab1 },
      { key: '2', label: 'Tab 2', children: sampleContent.tab2 },
      { key: '3', label: 'Tab 3', children: sampleContent.tab3 },
    ],
  },
};

/**
 * v6: Logical positioning - Bottom placement.
 */
export const PlacementBottom = {
  args: {
    tabPlacement: 'bottom',
    items: [
      { key: '1', label: 'Tab 1', children: sampleContent.tab1 },
      { key: '2', label: 'Tab 2', children: sampleContent.tab2 },
      { key: '3', label: 'Tab 3', children: sampleContent.tab3 },
    ],
  },
};

/**
 * v6: Logical positioning - Start placement (left in LTR, right in RTL).
 */
export const PlacementStart = {
  args: {
    tabPlacement: 'start',
    items: [
      { key: '1', label: 'Tab 1', children: sampleContent.tab1 },
      { key: '2', label: 'Tab 2', children: sampleContent.tab2 },
      { key: '3', label: 'Tab 3', children: sampleContent.tab3 },
    ],
  },
};

/**
 * v6: Logical positioning - End placement (right in LTR, left in RTL).
 */
export const PlacementEnd = {
  args: {
    tabPlacement: 'end',
    items: [
      { key: '1', label: 'Tab 1', children: sampleContent.tab1 },
      { key: '2', label: 'Tab 2', children: sampleContent.tab2 },
      { key: '3', label: 'Tab 3', children: sampleContent.tab3 },
    ],
  },
};

/**
 * Tabs with disabled state.
 */
export const WithDisabledTab = {
  args: {
    items: [
      { key: '1', label: 'Active Tab', children: sampleContent.tab1 },
      { key: '2', label: 'Disabled Tab', children: sampleContent.tab2, disabled: true },
      { key: '3', label: 'Active Tab', children: sampleContent.tab3 },
    ],
  },
};

/**
 * v6: Semantic structure with custom classNames.
 */
export const WithSemanticClasses = {
  args: {
    items: [
      { key: '1', label: 'Tab 1', children: 'Custom styled content' },
      { key: '2', label: 'Tab 2', children: 'Custom styled content' },
      { key: '3', label: 'Tab 3', children: 'Custom styled content' },
    ],
    classNames: {
      root: 'custom-tabs-root',
      nav: 'custom-tabs-nav',
      tab: 'custom-tabs-tab',
      inkBar: 'custom-ink-bar',
    },
  },
};

/**
 * v6: Semantic structure with custom styles.
 */
export const WithSemanticStyles = {
  args: {
    items: [
      { key: '1', label: 'Tab 1', children: 'Custom styled content' },
      { key: '2', label: 'Tab 2', children: 'Custom styled content' },
      { key: '3', label: 'Tab 3', children: 'Custom styled content' },
    ],
    styles: {
      root: {
        padding: '16px',
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
      },
      inkBar: { height: '3px', backgroundColor: '#10b981' },
    },
  },
};

/**
 * Real-world dashboard example with icons.
 */
export const DashboardExample = {
  render: () => (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #E4E7EC',
      }}
    >
      <Tabs
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <HomeOutlined /> Overview
              </span>
            ),
            children: (
              <div>
                <Title level={4}>Dashboard Overview</Title>
                <Space direction="vertical" size="middle">
                  <Text>Welcome to your dashboard. Here's a summary of your recent activity.</Text>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                      <Text strong>Total Users</Text>
                      <Title level={3} style={{ marginTop: '8px' }}>
                        1,234
                      </Title>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                      <Text strong>Active Sessions</Text>
                      <Title level={3} style={{ marginTop: '8px' }}>
                        456
                      </Title>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                      <Text strong>Revenue</Text>
                      <Title level={3} style={{ marginTop: '8px' }}>
                        $12,345
                      </Title>
                    </div>
                  </div>
                </Space>
              </div>
            ),
          },
          {
            key: 'analytics',
            label: (
              <span>
                <BarChartOutlined /> Analytics
              </span>
            ),
            children: (
              <div>
                <Title level={4}>Analytics</Title>
                <Text>View detailed analytics and metrics about your application performance.</Text>
              </div>
            ),
          },
          {
            key: 'users',
            label: (
              <span>
                <TeamOutlined /> Users
              </span>
            ),
            children: (
              <div>
                <Title level={4}>User Management</Title>
                <Text>Manage users, permissions, and access controls.</Text>
              </div>
            ),
          },
          {
            key: 'settings',
            label: (
              <span>
                <SettingOutlined /> Settings
              </span>
            ),
            children: (
              <div>
                <Title level={4}>Settings</Title>
                <Text>Configure your application settings and preferences.</Text>
              </div>
            ),
          },
        ]}
      />
    </div>
  ),
};

/**
 * Real-world card-type navigation.
 */
export const CardNavigation = {
  render: () => (
    <Tabs
      type="card"
      items={[
        {
          key: 'profile',
          label: (
            <span>
              <UserOutlined /> Profile
            </span>
          ),
          children: (
            <div style={{ padding: '16px' }}>
              <Title level={4}>User Profile</Title>
              <Text>Edit your profile information and preferences.</Text>
            </div>
          ),
        },
        {
          key: 'notifications',
          label: (
            <span>
              <BellOutlined /> Notifications
            </span>
          ),
          children: (
            <div style={{ padding: '16px' }}>
              <Title level={4}>Notifications</Title>
              <Text>Manage your notification settings and preferences.</Text>
            </div>
          ),
        },
        {
          key: 'files',
          label: (
            <span>
              <FileOutlined /> Files
            </span>
          ),
          children: (
            <div style={{ padding: '16px' }}>
              <Title level={4}>Your Files</Title>
              <Text>Access and manage your uploaded files and documents.</Text>
            </div>
          ),
        },
      ]}
    />
  ),
};

/**
 * Vertical tabs on the left (start placement).
 */
export const VerticalStart = {
  render: () => (
    <div style={{ minHeight: '300px' }}>
      <Tabs
        tabPlacement="start"
        items={[
          {
            key: '1',
            label: <><ShopOutlined /> Dashboard</>,
            children: <div style={{ padding: '16px' }}>Dashboard content</div>,
          },
          {
            key: '2',
            label: <><TeamOutlined /> Team</>,
            children: <div style={{ padding: '16px' }}>Team content</div>,
          },
          {
            key: '3',
            label: <><CloudOutlined /> Cloud</>,
            children: <div style={{ padding: '16px' }}>Cloud content</div>,
          },
          {
            key: '4',
            label: <><SettingOutlined /> Settings</>,
            children: <div style={{ padding: '16px' }}>Settings content</div>,
          },
        ]}
      />
    </div>
  ),
};

/**
 * Many tabs (scrollable).
 */
export const ManyTabs = {
  args: {
    items: Array.from({ length: 15 }, (_, i) => ({
      key: String(i + 1),
      label: `Tab ${i + 1}`,
      children: `Content of Tab ${i + 1}`,
    })),
  },
};
