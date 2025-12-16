import React from 'react';
import { Space, Flex } from 'antd';
import { HomeOutlined, UserOutlined, ShoppingOutlined, FileOutlined } from '@ant-design/icons';
import Breadcrumb from '../../../components/designSystem/Breadcrumb/Breadcrumb.jsx';

/**
 * Breadcrumb - Navigation component showing current location in hierarchy
 *
 * Based on Ant Design v6.0 with Plus UI Design System tokens.
 * Supports custom separators, dropdown menus, icons, and responsive behavior.
 */
export default {
  title: 'Design System/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Breadcrumb component for hierarchical navigation. Shows the user's current location within the application and allows easy navigation back through the hierarchy.

**Features:**
- Custom separators (text, icons, or React elements)
- Dropdown menus for collapsed items
- Icons in breadcrumb items
- Responsive behavior with text truncation
- Plus UI Design System tokens (Inter font, semantic colors)
- Dark mode support

**Ant Design v6.0**: This component uses the new semantic structure with \`classNames\` and \`styles\` props for granular customization.
        `.trim(),
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of breadcrumb items. Each item can have: title, href, onClick, menu, icon, className',
    },
    separator: {
      control: 'text',
      description: 'Separator between breadcrumb items (string or React element)',
    },
    maxItems: {
      control: 'number',
      description: 'Maximum number of items to display before collapsing',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class for root element',
    },
    classNames: {
      control: 'object',
      description: 'Semantic classNames object (root, item, link, separator)',
    },
    styles: {
      control: 'object',
      description: 'Semantic styles object (root, item, link, separator)',
    },
  },
  tags: ['autodocs'],
};

/**
 * Default breadcrumb with basic navigation hierarchy.
 */
export const Default = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      { title: 'Products', href: '/products' },
      { title: 'Electronics', href: '/products/electronics' },
      { title: 'Details' },
    ],
  },
};

/**
 * Breadcrumb with icon in home item.
 */
export const WithIcons = {
  args: {
    items: [
      { title: <><HomeOutlined /> Home</>, href: '/' },
      { title: <><ShoppingOutlined /> Products</>, href: '/products' },
      { title: <><FileOutlined /> Details</> },
    ],
  },
};

/**
 * Breadcrumb with custom arrow separator.
 */
export const ArrowSeparator = {
  args: {
    separator: '>',
    items: [
      { title: 'Home', href: '/' },
      { title: 'Products', href: '/products' },
      { title: 'Details' },
    ],
  },
};

/**
 * Breadcrumb with custom dot separator.
 */
export const DotSeparator = {
  args: {
    separator: '•',
    items: [
      { title: 'Home', href: '/' },
      { title: 'Products', href: '/products' },
      { title: 'Details' },
    ],
  },
};

/**
 * All separator variations.
 */
export const AllSeparators = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Flex vertical gap={8}>
        <span style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Slash (default)</span>
        <Breadcrumb
          separator="/"
          items={[
            { title: 'Home', href: '/' },
            { title: 'Products', href: '/products' },
            { title: 'Details' },
          ]}
        />
      </Flex>

      <Flex vertical gap={8}>
        <span style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Arrow</span>
        <Breadcrumb
          separator=">"
          items={[
            { title: 'Home', href: '/' },
            { title: 'Products', href: '/products' },
            { title: 'Details' },
          ]}
        />
      </Flex>

      <Flex vertical gap={8}>
        <span style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Dot</span>
        <Breadcrumb
          separator="•"
          items={[
            { title: 'Home', href: '/' },
            { title: 'Products', href: '/products' },
            { title: 'Details' },
          ]}
        />
      </Flex>
    </Space>
  ),
};

/**
 * Breadcrumb with dropdown menu for nested navigation.
 */
export const WithDropdown = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      {
        title: 'Products',
        menu: {
          items: [
            { key: '1', label: 'Electronics' },
            { key: '2', label: 'Clothing' },
            { key: '3', label: 'Books' },
            { key: '4', label: 'Home & Garden' },
          ],
        },
      },
      { title: 'Details' },
    ],
  },
};

/**
 * Breadcrumb with multiple dropdown menus.
 */
export const MultipleDropdowns = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      {
        title: 'Categories',
        menu: {
          items: [
            { key: '1', label: 'Electronics' },
            { key: '2', label: 'Clothing' },
            { key: '3', label: 'Books' },
          ],
        },
      },
      {
        title: 'Electronics',
        menu: {
          items: [
            { key: '1', label: 'Computers' },
            { key: '2', label: 'Phones' },
            { key: '3', label: 'Tablets' },
          ],
        },
      },
      { title: 'Laptop Details' },
    ],
  },
};

/**
 * Semantic structure with custom classNames (Ant Design v6).
 */
export const WithSemanticClasses = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      { title: 'Products', href: '/products' },
      { title: 'Details' },
    ],
    classNames: {
      root: 'custom-breadcrumb-root',
      item: 'custom-breadcrumb-item',
      link: 'custom-breadcrumb-link',
      separator: 'custom-breadcrumb-separator',
    },
  },
};

/**
 * Semantic structure with custom styles (Ant Design v6).
 */
export const WithSemanticStyles = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      { title: 'Products', href: '/products' },
      { title: 'Details' },
    ],
    styles: {
      root: {
        padding: '12px 16px',
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
      },
      item: { fontWeight: 500 },
      link: { color: '#4f46e5' },
      separator: { fontSize: '16px', margin: '0 12px' },
    },
  },
};

/**
 * Deep navigation hierarchy (6 levels).
 */
export const DeepHierarchy = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      { title: 'Dashboard', href: '/dashboard' },
      { title: 'Settings', href: '/dashboard/settings' },
      { title: 'User Management', href: '/dashboard/settings/users' },
      { title: 'Roles & Permissions', href: '/dashboard/settings/users/roles' },
      { title: 'Edit Role' },
    ],
  },
};

/**
 * Breadcrumb in a card context.
 */
export const InCard = {
  render: () => (
    <div
      style={{
        padding: '24px',
        border: '1px solid #E4E7EC',
        borderRadius: '12px',
        backgroundColor: '#fff',
        maxWidth: '800px',
      }}
    >
      <Breadcrumb
        items={[
          { title: 'Home', href: '/' },
          { title: 'Products', href: '/products' },
          { title: 'Electronics', href: '/products/electronics' },
          { title: 'Laptop Details' },
        ]}
      />

      <div style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
          MacBook Pro 16"
        </h2>
        <p style={{ color: '#667085', fontSize: '14px' }}>
          High-performance laptop for professionals
        </p>
      </div>
    </div>
  ),
};

/**
 * Breadcrumb with clickable handlers.
 */
export const WithClickHandlers = {
  args: {
    items: [
      {
        title: 'Home',
        onClick: () => alert('Navigate to Home'),
      },
      {
        title: 'Products',
        onClick: () => alert('Navigate to Products'),
      },
      {
        title: 'Details',
      },
    ],
  },
};

/**
 * Responsive breadcrumb (resize window to see truncation).
 */
export const Responsive = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <p style={{ fontSize: '12px', color: '#667085', marginBottom: '12px' }}>
        Breadcrumb items will truncate on small screens
      </p>
      <Breadcrumb
        items={[
          { title: 'Home', href: '/' },
          { title: 'Very Long Product Category Name', href: '/products' },
          { title: 'Another Long Subcategory', href: '/products/electronics' },
          { title: 'Final Details Page' },
        ]}
      />
    </div>
  ),
};

/**
 * Breadcrumb with icons and dropdown menu.
 */
export const IconsWithDropdown = {
  args: {
    items: [
      { title: <><HomeOutlined /> Home</>, href: '/' },
      {
        title: <><ShoppingOutlined /> Products</>,
        menu: {
          items: [
            { key: '1', label: 'Electronics', icon: <FileOutlined /> },
            { key: '2', label: 'Clothing', icon: <FileOutlined /> },
            { key: '3', label: 'Books', icon: <FileOutlined /> },
          ],
        },
      },
      { title: <><FileOutlined /> Details</> },
    ],
  },
};

/**
 * Two-level breadcrumb (minimal).
 */
export const TwoLevels = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      { title: 'Current Page' },
    ],
  },
};

/**
 * Single item breadcrumb.
 */
export const SingleItem = {
  args: {
    items: [
      { title: 'Dashboard' },
    ],
  },
};

/**
 * Real-world e-commerce example.
 */
export const EcommerceExample = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div
        style={{
          padding: '20px 24px',
          backgroundColor: '#F9FAFB',
          borderBottom: '1px solid #E4E7EC',
        }}
      >
        <Breadcrumb
          items={[
            { title: <><HomeOutlined /> Home</>, href: '/' },
            {
              title: 'Electronics',
              menu: {
                items: [
                  { key: '1', label: 'Computers & Laptops' },
                  { key: '2', label: 'Phones & Tablets' },
                  { key: '3', label: 'Audio & Video' },
                  { key: '4', label: 'Cameras' },
                ],
              },
            },
            { title: 'Computers & Laptops', href: '/electronics/computers' },
            { title: 'MacBook Pro 16"' },
          ]}
        />
      </div>
    </Space>
  ),
};

/**
 * Real-world admin dashboard example.
 */
export const AdminDashboardExample = {
  render: () => (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #E4E7EC',
      }}
    >
      <Breadcrumb
        items={[
          { title: <><HomeOutlined /> Dashboard</>, href: '/dashboard' },
          {
            title: 'Settings',
            menu: {
              items: [
                { key: '1', label: <><UserOutlined /> User Management</> },
                { key: '2', label: 'System Settings' },
                { key: '3', label: 'Security' },
                { key: '4', label: 'Integrations' },
              ],
            },
          },
          { title: 'User Management', href: '/dashboard/settings/users' },
          { title: 'Edit User' },
        ]}
      />
    </div>
  ),
};
