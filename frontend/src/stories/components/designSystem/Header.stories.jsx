import { Button, Input, Space } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import Header from '../../../components/designSystem/Header/Header.jsx';
import Tabs from '../../../components/designSystem/Tabs/Tabs.jsx';

export default {
  title: 'Design System/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export const Default = {
  render: () => (
    <Header
      title="Team members"
      description="Manage your team members and their account permissions here."
      actions={
        <Space>
          <Button>Secondary</Button>
          <Button type="primary" icon={<PlusOutlined />}>
            Primary
          </Button>
        </Space>
      }
    />
  ),
};

export const WithTabs = {
  render: () => (
    <Header
      title="Team members"
      description="Manage your team members and their account permissions here."
      tabs={
        <Tabs
          items={[
            { key: '1', label: 'Tertiary' },
            { key: '2', label: 'Secondary' },
            { key: '3', label: 'Secondary' },
            { key: '4', label: 'Primary' },
          ]}
        />
      }
      search={<Input placeholder="Search" prefix={<SearchOutlined />} />}
      actions={
        <Space>
          <Button>Secondary</Button>
          <Button type="primary">Primary</Button>
        </Space>
      }
    />
  ),
};
