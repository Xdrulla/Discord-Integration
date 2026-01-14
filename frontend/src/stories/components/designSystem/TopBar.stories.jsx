import { Menu, Input, Button, Badge, Avatar } from 'antd';
import { SearchOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons';
import TopBar from '../../../components/designSystem/TopBar/TopBar.jsx';

const menuItems = [
  { key: 'home', label: 'Home' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'projects', label: 'Projects' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'reporting', label: 'Reporting' },
  { key: 'users', label: 'Users' },
];

export default {
  title: 'Design System/TopBar',
  component: TopBar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export const Default = {
  render: () => (
    <TopBar
      logo={<img src="https://via.placeholder.com/120x32/4f46e5/ffffff?text=GoePIK" alt="Logo" />}
      menu={<Menu mode="horizontal" items={menuItems} style={{ border: 'none', flex: 1 }} />}
      search={<Input placeholder="Search" prefix={<SearchOutlined />} />}
      actions={
        <>
          <Badge dot>
            <BellOutlined style={{ fontSize: '20px' }} />
          </Badge>
          <SettingOutlined style={{ fontSize: '20px' }} />
          <Avatar src="https://i.pravatar.cc/150?img=1" />
        </>
      }
    />
  ),
};

export const Simple = {
  render: () => (
    <TopBar
      logo={<img src="https://via.placeholder.com/120x32/4f46e5/ffffff?text=GoePIK" alt="Logo" />}
      actions={<Button type="primary">Sign In</Button>}
    />
  ),
};
