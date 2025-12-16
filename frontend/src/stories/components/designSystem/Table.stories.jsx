import React, { useState } from 'react';
import { Space, Flex, Avatar, Badge, Tag, Typography } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import Table from '../../../components/designSystem/Table/Table.jsx';

const { Text } = Typography;

/**
 * Table - Data table component for displaying structured data
 *
 * Based on Ant Design v6.0 with Plus UI Design System tokens.
 * Supports sorting, filtering, pagination, row selection, and fixed columns.
 */
export default {
  title: 'Design System/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Table component for displaying and organizing structured data with advanced features.

**Features:**
- Sortable columns
- Filterable data
- Pagination with customizable page sizes
- Row selection (checkbox/radio)
- Fixed columns (start/end)
- Scrollable content
- Three sizes: small, middle, large
- Bordered and striped variants
- Loading states
- Empty states
- Plus UI Design System tokens (Inter font, semantic colors)
- Responsive behavior
- Dark mode support

**Ant Design v6.0**: This component uses:
- \`fixed: 'start'\` and \`fixed: 'end'\` for logical positioning (instead of 'left'/'right')
- Semantic structure with \`classNames\` and \`styles\` props for granular customization
        `.trim(),
      },
    },
  },
  argTypes: {
    columns: {
      control: 'object',
      description: 'Table columns configuration',
    },
    dataSource: {
      control: 'object',
      description: 'Data source array',
    },
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
      description: 'Table size',
    },
    bordered: {
      control: 'boolean',
      description: 'Whether to show borders',
    },
    striped: {
      control: 'boolean',
      description: 'Whether to show striped rows',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    pagination: {
      control: 'object',
      description: 'Pagination configuration (false to disable)',
    },
    rowSelection: {
      control: 'object',
      description: 'Row selection configuration',
    },
    scroll: {
      control: 'object',
      description: 'Scroll configuration for fixed header/columns',
    },
  },
  tags: ['autodocs'],
};

// Sample data - Members table
const memberData = [
  {
    key: '1',
    name: 'Olivia Rhye',
    username: '@olivia',
    status: 'Active',
    role: 'Product Designer',
    email: 'olivia@goepik.com.br',
    groups: ['Design', 'Product', 'Marketing'],
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    key: '2',
    name: 'Phoenix Baker',
    username: '@phoenix',
    status: 'Active',
    role: 'Product Manager',
    email: 'phoenix@untitledu.com',
    groups: ['Design', 'Product', 'Marketing'],
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    key: '3',
    name: 'Lana Steiner',
    username: '@lana',
    status: 'Active',
    role: 'Frontend Developer',
    email: 'lana@untitledu.com',
    groups: ['Design', 'Product', 'Marketing'],
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    key: '4',
    name: 'Demi Wilkinson',
    username: '@demi',
    status: 'Active',
    role: 'Backend Developer',
    email: 'demi@untitledu.com',
    groups: ['Design', 'Product', 'Marketing'],
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    key: '5',
    name: 'Candice Wu',
    username: '@candice',
    status: 'Active',
    role: 'Fullstack Developer',
    email: 'candice@untitledu.com',
    groups: ['Design', 'Product', 'Marketing'],
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
];

// Sample data - Invoice table
const invoiceData = [
  {
    key: '1',
    invoice: '#3068',
    date: 'Jan 6, 2024',
    status: 'Paid',
    customer: { name: 'Olivia Rhye', email: 'olivia@goepik.com.br', avatar: 'https://i.pravatar.cc/150?img=1' },
    purchase: 'Monthly subscription',
  },
  {
    key: '2',
    invoice: '#3067',
    date: 'Jan 6, 2024',
    status: 'Paid',
    customer: { name: 'Phoenix Baker', email: 'phoenix@untitledu.com', avatar: 'https://i.pravatar.cc/150?img=2' },
    purchase: 'Monthly subscription',
  },
  {
    key: '3',
    invoice: '#3066',
    date: 'Jan 5, 2024',
    status: 'Refunded',
    customer: { name: 'Lana Steiner', email: 'lana@untitledu.com', avatar: 'https://i.pravatar.cc/150?img=3' },
    purchase: 'Monthly subscription',
  },
  {
    key: '4',
    invoice: '#3065',
    date: 'Jan 5, 2024',
    status: 'Paid',
    customer: { name: 'Demi Wilkinson', email: 'demi@untitledu.com', avatar: 'https://i.pravatar.cc/150?img=4' },
    purchase: 'Monthly subscription',
  },
  {
    key: '5',
    invoice: '#3064',
    date: 'Jan 4, 2024',
    status: 'Cancelled',
    customer: { name: 'Candice Wu', email: 'candice@untitledu.com', avatar: 'https://i.pravatar.cc/150?img=5' },
    purchase: 'Monthly subscription',
  },
];

// Member columns
const memberColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (text, record) => (
      <Flex align="center" gap={12}>
        <Avatar src={record.avatar} />
        <Flex vertical gap={2}>
          <Text strong style={{ fontSize: '14px' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.username}</Text>
        </Flex>
      </Flex>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    filters: [
      { text: 'Active', value: 'Active' },
      { text: 'Inactive', value: 'Inactive' },
    ],
    onFilter: (value, record) => record.status === value,
    render: (status) => (
      <Badge status={status === 'Active' ? 'success' : 'default'} text={status} />
    ),
  },
  {
    title: 'Cargo',
    dataIndex: 'role',
    key: 'role',
    sorter: (a, b) => a.role.localeCompare(b.role),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Groups',
    dataIndex: 'groups',
    key: 'groups',
    render: (groups) => (
      <Space size={4} wrap>
        {groups.map((group) => (
          <Tag key={group} color="blue" style={{ fontSize: '11px' }}>
            {group}
          </Tag>
        ))}
      </Space>
    ),
  },
];

// Invoice columns
const invoiceColumns = [
  {
    title: 'Invoice',
    dataIndex: 'invoice',
    key: 'invoice',
    width: 100,
    sorter: (a, b) => a.invoice.localeCompare(b.invoice),
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    width: 120,
    sorter: (a, b) => new Date(a.date) - new Date(b.date),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    filters: [
      { text: 'Paid', value: 'Paid' },
      { text: 'Refunded', value: 'Refunded' },
      { text: 'Cancelled', value: 'Cancelled' },
    ],
    onFilter: (value, record) => record.status === value,
    render: (status) => {
      const config = {
        Paid: { icon: <CheckCircleOutlined />, color: 'success' },
        Refunded: { icon: <ClockCircleOutlined />, color: 'default' },
        Cancelled: { icon: <CloseCircleOutlined />, color: 'error' },
      };
      return <Tag icon={config[status]?.icon} color={config[status]?.color}>{status}</Tag>;
    },
  },
  {
    title: 'Customer',
    dataIndex: 'customer',
    key: 'customer',
    render: (customer) => (
      <Flex align="center" gap={12}>
        <Avatar src={customer.avatar} size="small" />
        <Flex vertical gap={2}>
          <Text style={{ fontSize: '14px' }}>{customer.name}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{customer.email}</Text>
        </Flex>
      </Flex>
    ),
  },
  {
    title: 'Purchase',
    dataIndex: 'purchase',
    key: 'purchase',
  },
];

/**
 * Default table with basic data.
 */
export const Default = {
  args: {
    columns: memberColumns,
    dataSource: memberData,
  },
};

/**
 * Table with row selection (checkbox).
 */
export const WithSelection = {
  render: () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    return (
      <Table
        columns={memberColumns}
        dataSource={memberData}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />
    );
  },
};

/**
 * Table with pagination.
 */
export const WithPagination = {
  args: {
    columns: invoiceColumns,
    dataSource: Array.from({ length: 50 }, (_, i) => ({
      ...invoiceData[i % 5],
      key: String(i + 1),
      invoice: `#${3068 - i}`,
    })),
    pagination: {
      total: 50,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total, range) => `${range[0]}-${range[1]} de ${total}`,
    },
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
        <Table
          size="small"
          columns={memberColumns}
          dataSource={memberData.slice(0, 3)}
          pagination={false}
        />
      </Flex>

      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Middle (default)</Text>
        <Table
          size="middle"
          columns={memberColumns}
          dataSource={memberData.slice(0, 3)}
          pagination={false}
        />
      </Flex>

      <Flex vertical gap={8}>
        <Text style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Large</Text>
        <Table
          size="large"
          columns={memberColumns}
          dataSource={memberData.slice(0, 3)}
          pagination={false}
        />
      </Flex>
    </Space>
  ),
};

/**
 * Bordered table.
 */
export const Bordered = {
  args: {
    columns: memberColumns,
    dataSource: memberData,
    bordered: true,
  },
};

/**
 * Striped rows.
 */
export const Striped = {
  args: {
    columns: memberColumns,
    dataSource: memberData,
    striped: true,
  },
};

/**
 * Loading state.
 */
export const Loading = {
  args: {
    columns: memberColumns,
    dataSource: memberData,
    loading: true,
  },
};

/**
 * Empty state.
 */
export const Empty = {
  args: {
    columns: memberColumns,
    dataSource: [],
  },
};

/**
 * Table with fixed columns (scroll horizontally).
 */
export const FixedColumns = {
  args: {
    columns: [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        fixed: 'start',
        width: 200,
        render: (text, record) => (
          <Flex align="center" gap={12}>
            <Avatar src={record.avatar} />
            <Text strong>{text}</Text>
          </Flex>
        ),
      },
      { title: 'Status', dataIndex: 'status', key: 'status', width: 150 },
      { title: 'Role', dataIndex: 'role', key: 'role', width: 200 },
      { title: 'Email', dataIndex: 'email', key: 'email', width: 250 },
      { title: 'Groups', dataIndex: 'groups', key: 'groups', width: 300 },
      { title: 'Extra Col 1', key: 'extra1', width: 150 },
      { title: 'Extra Col 2', key: 'extra2', width: 150 },
      {
        title: 'Actions',
        key: 'actions',
        fixed: 'end',
        width: 100,
        render: () => (
          <Space size="small">
            <EditOutlined style={{ cursor: 'pointer', color: '#667085' }} />
            <DeleteOutlined style={{ cursor: 'pointer', color: '#667085' }} />
          </Space>
        ),
      },
    ],
    dataSource: memberData,
    scroll: { x: 1500 },
  },
};

/**
 * v6: Semantic structure with custom classNames.
 */
export const WithSemanticClasses = {
  args: {
    columns: memberColumns,
    dataSource: memberData.slice(0, 3),
    pagination: false,
    classNames: {
      header: 'custom-table-header',
      body: 'custom-table-body',
      row: 'custom-table-row',
    },
  },
};

/**
 * v6: Semantic structure with custom styles.
 */
export const WithSemanticStyles = {
  args: {
    columns: memberColumns,
    dataSource: memberData.slice(0, 3),
    pagination: false,
    styles: {
      header: { backgroundColor: '#f0f9ff' },
      row: { borderLeft: '3px solid #4f46e5' },
    },
  },
};

/**
 * Real-world example: Members table.
 */
export const MembersTable = {
  render: () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    return (
      <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px' }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: '16px' }}>
          <div>
            <Text strong style={{ fontSize: '18px', display: 'block' }}>Membros</Text>
            <Text type="secondary" style={{ fontSize: '14px' }}>100 users</Text>
          </div>
        </Flex>

        <Table
          columns={memberColumns}
          dataSource={memberData}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
        />
      </div>
    );
  },
};

/**
 * Real-world example: Invoice table.
 */
export const InvoiceTable = {
  render: () => (
    <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px' }}>
      <Table
        columns={invoiceColumns}
        dataSource={invoiceData}
        pagination={{
          total: invoiceData.length,
          pageSize: 10,
          showTotal: (total, range) => `Página 1 de ${Math.ceil(total / 10)}`,
        }}
      />
    </div>
  ),
};

/**
 * Real-world example: Files table.
 */
export const FilesTable = {
  render: () => {
    const filesData = [
      { key: '1', name: 'Tech requirements.pdf', size: '200 KB', date: 'Jan 4, 2024', modified: 'Jan 4, 2024', uploader: 'Olivia Rhye' },
      { key: '2', name: 'Dashboard screenshot.jpg', size: '720 KB', date: 'Jan 4, 2024', modified: 'Jan 4, 2024', uploader: 'Phoenix Baker' },
      { key: '3', name: 'Dashboard prototype recording.mp4', size: '16 MB', date: 'Jan 2, 2024', modified: 'Jan 2, 2024', uploader: 'Lana Steiner' },
      { key: '4', name: 'Dashboard prototype FINAL.fig', size: '4.2 MB', date: 'Jan 6, 2024', modified: 'Jan 6, 2024', uploader: 'Demi Wilkinson' },
    ];

    const filesColumns = [
      {
        title: 'Nome do arquivo',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <Text>{text}</Text>,
      },
      { title: 'Tamanho', dataIndex: 'size', key: 'size', width: 120 },
      { title: 'Data de criação', dataIndex: 'date', key: 'date', width: 150 },
      { title: 'Data de modificação', dataIndex: 'modified', key: 'modified', width: 180 },
      { title: 'Carregado por', dataIndex: 'uploader', key: 'uploader', width: 180 },
    ];

    return (
      <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px' }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: '16px' }}>
          <Text strong style={{ fontSize: '18px' }}>Arquivos carregados</Text>
        </Flex>

        <Table
          columns={filesColumns}
          dataSource={filesData}
          pagination={false}
        />
      </div>
    );
  },
};
