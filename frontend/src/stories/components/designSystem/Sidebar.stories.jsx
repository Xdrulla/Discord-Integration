import { Avatar, Flex, Typography } from 'antd';
import {
  HomeOutlined,
  BarChartOutlined,
  TeamOutlined,
  FolderOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Sidebar from '../../../components/designSystem/Sidebar/Sidebar.jsx';

const { Text } = Typography;

const menuItems = [
  {
    key: 'home',
    icon: <HomeOutlined />,
    label: 'Home',
  },
  {
    key: 'dashboard',
    icon: <BarChartOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'projects',
    icon: <FolderOutlined />,
    label: 'Projects',
  },
  {
    key: 'tasks',
    icon: <FileTextOutlined />,
    label: 'Tasks',
  },
  {
    key: 'team',
    icon: <TeamOutlined />,
    label: 'Team',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
];

const UserProfile = () => (
  <Flex align="center" gap={12}>
    <Avatar src="https://i.pravatar.cc/150?img=1" />
    <Flex vertical style={{ flex: 1 }}>
      <Text strong style={{ fontSize: '14px' }}>
        Olivia Rhye
      </Text>
      <Text type="secondary" style={{ fontSize: '12px' }}>
        olivia@goepik.com.br
      </Text>
    </Flex>
  </Flex>
);

export default {
  title: 'Design System/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export const Default = {
  render: () => (
    <div style={{ height: '100vh' }}>
      <Sidebar
        logo={<img src="https://via.placeholder.com/120x32/4f46e5/ffffff?text=GoePIK" alt="Logo" />}
        menuItems={menuItems}
        user={<UserProfile />}
      />
    </div>
  ),
};

export const Collapsed = {
  render: () => (
    <div style={{ height: '100vh' }}>
      <Sidebar
        logo={<img src="https://via.placeholder.com/32x32/4f46e5/ffffff?text=G" alt="Logo" />}
        menuItems={menuItems}
        collapsed
        user={<UserProfile />}
      />
    </div>
  ),
};
