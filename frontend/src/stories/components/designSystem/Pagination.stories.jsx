import React from 'react';
import { Space } from 'antd';
import Pagination from '../../../components/designSystem/Pagination/Pagination.jsx';

export default {
  title: 'Design System/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const Default = {
  args: {
    total: 100,
    pageSize: 10,
  },
};

export const WithSizeChanger = {
  args: {
    total: 100,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50, 100],
  },
};

export const WithQuickJumper = {
  args: {
    total: 100,
    showQuickJumper: true,
  },
};

export const Simple = {
  args: {
    total: 100,
    showSizeChanger: false,
    showTotal: false,
  },
};

export const Small = {
  args: {
    total: 100,
    size: 'small',
  },
};

export const AllVariations = {
  render: () => (
    <Space direction="vertical" size="large">
      <Pagination total={100} />
      <Pagination total={100} showQuickJumper />
      <Pagination total={100} size="small" />
    </Space>
  ),
};
