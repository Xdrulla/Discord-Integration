import { Space, Flex, Typography } from 'antd';
import Loading from '../../../components/designSystem/Loading/Loading.jsx';

const { Text } = Typography;

export default {
  title: 'Design System/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const Default = {
  args: {
    variant: 'dots',
    spinning: true,
  },
};

export const AllVariants = {
  render: () => (
    <Space size="large" wrap>
      <Flex vertical align="center" gap={8}>
        <Loading variant="dots" />
        <Text style={{ fontSize: '12px' }}>Dots</Text>
      </Flex>
      <Flex vertical align="center" gap={8}>
        <Loading variant="circle" />
        <Text style={{ fontSize: '12px' }}>Circle</Text>
      </Flex>
      <Flex vertical align="center" gap={8}>
        <Loading variant="ring" />
        <Text style={{ fontSize: '12px' }}>Ring</Text>
      </Flex>
    </Space>
  ),
};

export const AllSizes = {
  render: () => (
    <Flex vertical gap={24} style={{ width: '100%' }}>
      <Flex vertical gap={12}>
        <Text style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Dots</Text>
        <Space size="large">
          <Flex vertical align="center" gap={8}>
            <Loading variant="dots" size="small" />
            <Text style={{ fontSize: '12px' }}>Small</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Loading variant="dots" size="default" />
            <Text style={{ fontSize: '12px' }}>Default</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Loading variant="dots" size="large" />
            <Text style={{ fontSize: '12px' }}>Large</Text>
          </Flex>
        </Space>
      </Flex>

      <Flex vertical gap={12}>
        <Text style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Circle</Text>
        <Space size="large">
          <Flex vertical align="center" gap={8}>
            <Loading variant="circle" size="small" />
            <Text style={{ fontSize: '12px' }}>Small</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Loading variant="circle" size="default" />
            <Text style={{ fontSize: '12px' }}>Default</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Loading variant="circle" size="large" />
            <Text style={{ fontSize: '12px' }}>Large</Text>
          </Flex>
        </Space>
      </Flex>

      <Flex vertical gap={12}>
        <Text style={{ fontSize: '12px', color: '#667085', fontWeight: 500 }}>Ring</Text>
        <Space size="large">
          <Flex vertical align="center" gap={8}>
            <Loading variant="ring" size="small" />
            <Text style={{ fontSize: '12px' }}>Small</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Loading variant="ring" size="default" />
            <Text style={{ fontSize: '12px' }}>Default</Text>
          </Flex>
          <Flex vertical align="center" gap={8}>
            <Loading variant="ring" size="large" />
            <Text style={{ fontSize: '12px' }}>Large</Text>
          </Flex>
        </Space>
      </Flex>
    </Flex>
  ),
};

export const WithText = {
  render: () => (
    <Space size="large" wrap>
      <Loading variant="dots" tip="Loading..." />
      <Loading variant="circle" tip="Loading..." />
      <Loading variant="ring" tip="Loading..." />
    </Space>
  ),
};

export const WrapContent = {
  render: () => (
    <Loading variant="circle" spinning tip="Loading content...">
      <div
        style={{
          padding: '40px',
          background: '#f9fafb',
          borderRadius: '8px',
          minHeight: '200px',
        }}
      >
        <h3>Content Area</h3>
        <p>This content is wrapped by the loading indicator.</p>
      </div>
    </Loading>
  ),
};
