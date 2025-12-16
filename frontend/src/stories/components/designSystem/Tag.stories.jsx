import React from 'react';
import { Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Tag from '../../../components/designSystem/Tag/Tag.jsx';

export default {
  title: 'Design System/Tag',
  component: Tag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const Default = {
  args: {
    children: 'Label',
  },
};

export const AllColors = {
  render: () => (
    <Space wrap>
      <Tag color="default">Default</Tag>
      <Tag color="blue">Blue</Tag>
      <Tag color="green">Green</Tag>
      <Tag color="red">Red</Tag>
      <Tag color="gold">Gold</Tag>
      <Tag color="orange">Orange</Tag>
      <Tag color="purple">Purple</Tag>
      <Tag color="cyan">Cyan</Tag>
    </Space>
  ),
};

export const WithIcons = {
  render: () => (
    <Space wrap>
      <Tag icon={<CheckCircleOutlined />} color="green">Success</Tag>
      <Tag icon={<CloseCircleOutlined />} color="red">Error</Tag>
      <Tag icon={<ExclamationCircleOutlined />} color="gold">Warning</Tag>
      <Tag icon={<SyncOutlined spin />} color="blue">Processing</Tag>
    </Space>
  ),
};

export const Closable = {
  render: () => (
    <Space wrap>
      <Tag closable>Closable</Tag>
      <Tag closable color="blue">Closable Blue</Tag>
      <Tag closable color="green">Closable Green</Tag>
      <Tag closable color="red">Closable Red</Tag>
    </Space>
  ),
};

export const WithBadgeNumbers = {
  render: () => (
    <Space wrap>
      <Tag>Label</Tag>
      <Tag>Label 5</Tag>
      <Tag color="blue">Label</Tag>
      <Tag color="blue">Label 5</Tag>
      <Tag color="green">Label</Tag>
      <Tag color="green">Label 5</Tag>
    </Space>
  ),
};

export const Outlined = {
  render: () => (
    <Space wrap>
      <Tag variant="outlined">Label</Tag>
      <Tag variant="outlined" color="blue">Label</Tag>
      <Tag variant="outlined" color="green">Label</Tag>
      <Tag variant="outlined" color="red">Label</Tag>
    </Space>
  ),
};

export const WithAvatar = {
  render: () => (
    <Space wrap>
      <Tag icon={<span style={{ width: 16, height: 16, borderRadius: '50%', background: '#4f46e5', display: 'inline-block' }} />}>
        Label
      </Tag>
      <Tag color="blue" icon={<span style={{ width: 16, height: 16, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />}>
        Label
      </Tag>
    </Space>
  ),
};
