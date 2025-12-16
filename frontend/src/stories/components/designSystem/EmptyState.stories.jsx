import React from 'react';
import { Space, Button } from 'antd';
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import EmptyState from '../../../components/designSystem/EmptyState/EmptyState.jsx';

export default {
  title: 'Design System/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const Default = {
  args: {
    description: 'No data found',
  },
};

export const WithActions = {
  render: () => (
    <EmptyState description="No projects found">
      <Space>
        <Button type="default">Clear search</Button>
        <Button type="primary">New project</Button>
      </Space>
    </EmptyState>
  ),
};

export const CustomIcon = {
  render: () => (
    <EmptyState
      image={<FileTextOutlined style={{ fontSize: '64px', color: '#0ea5e9' }} />}
      description="No projects found"
    >
      <Space>
        <Button>Clear search</Button>
        <Button type="primary">New project</Button>
      </Space>
    </EmptyState>
  ),
};

export const SearchEmpty = {
  render: () => (
    <EmptyState
      image={<SearchOutlined style={{ fontSize: '64px', color: '#6b7280' }} />}
      description={
        <div>
          <div>Your search "Landing page design" did not match</div>
          <div>any projects. Please try again.</div>
        </div>
      }
    >
      <Space>
        <Button>Clear search</Button>
        <Button type="primary">New project</Button>
      </Space>
    </EmptyState>
  ),
};

export const Simple = {
  args: {
    description: 'No data',
    image: null,
  },
};

export const AllVariations = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <EmptyState description="No projects found">
          <Button type="primary">New project</Button>
        </EmptyState>
      </div>

      <div style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <EmptyState
          image={<FileTextOutlined style={{ fontSize: '64px', color: '#0ea5e9' }} />}
          description="No files uploaded"
        >
          <Space>
            <Button>Browse files</Button>
            <Button type="primary">Upload</Button>
          </Space>
        </EmptyState>
      </div>
    </Space>
  ),
};
