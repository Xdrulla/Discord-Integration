import { Flex, Row, Col, Typography } from 'antd';
import FileUpload from '../../../components/designSystem/FileUpload/FileUpload.jsx';

const { Text } = Typography;

const DONE_FILES = [
  {
    uid: 'done-1',
    name: 'Tech design requirements.pdf',
    status: 'done',
    percent: 100,
    size: 200 * 1024,
    type: 'application/pdf',
  },
  {
    uid: 'done-2',
    name: 'Dashboard prototype FINAL.fig',
    status: 'done',
    percent: 100,
    size: Math.round(4.2 * 1024 * 1024),
    type: 'application/octet-stream',
  },
];

const UPLOADING_FILES = [
  {
    uid: 'up-1',
    name: 'Dashboard prototype.mp4',
    status: 'uploading',
    percent: 70,
    size: 16 * 1024 * 1024,
    type: 'video/mp4',
  },
  {
    uid: 'up-2',
    name: 'Dashboard prototype FINAL.fig',
    status: 'uploading',
    percent: 70,
    size: Math.round(4.2 * 1024 * 1024),
    type: 'application/octet-stream',
  },
];

const MIXED_FILES = [
  {
    uid: 'mix-1',
    name: 'Tech design requirements.pdf',
    status: 'done',
    percent: 100,
    size: 200 * 1024,
    type: 'application/pdf',
  },
  {
    uid: 'mix-2',
    name: 'Dashboard recording.mp4',
    status: 'uploading',
    percent: 40,
    size: 16 * 1024 * 1024,
    type: 'video/mp4',
  },
  {
    uid: 'mix-3',
    name: 'Dashboard prototype FINAL.fig',
    status: 'uploading',
    percent: 80,
    size: Math.round(4.2 * 1024 * 1024),
    type: 'application/octet-stream',
  },
];

const ERROR_FILES = [
  {
    uid: 'err-1',
    name: 'Upload failed.png',
    status: 'error',
    percent: 45,
    size: 380 * 1024,
    type: 'image/png',
  },
];

export default {
  title: 'Design System/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
File upload com drag-and-drop baseado no modelo do Figma.

**Ant Design v6.0**: utiliza \`classNames\` e \`styles\` semânticos do Upload (root/list/item).
        `.trim(),
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    multiple: { control: 'boolean' },
    maxCount: { control: 'number' },
    hint: { control: 'text' },
    description: { control: 'text' },
    helpText: { control: 'text' },
    showHelpText: { control: 'boolean' },
    uploadingIndicator: { control: 'select', options: ['progress', 'remove'] },
    showRemoveOnDone: { control: 'boolean' },
    classNames: { control: 'object' },
    styles: { control: 'object' },
  },
  tags: ['autodocs'],
};

/**
 * Estado padrão (dropzone vazio).
 */
export const Default = {
  args: {},
};

/**
 * Arquivos concluídos (status "done").
 */
export const WithDoneFiles = {
  args: {
    defaultFileList: DONE_FILES,
  },
};

/**
 * Upload em andamento com indicador circular (modelo do Figma).
 */
export const UploadingWithProgress = {
  args: {
    defaultFileList: UPLOADING_FILES,
    uploadingIndicator: 'progress',
  },
};

/**
 * Upload em andamento com ação de remover.
 */
export const UploadingWithRemoveAction = {
  args: {
    defaultFileList: UPLOADING_FILES,
    uploadingIndicator: 'remove',
  },
};

/**
 * Lista mista: concluído + uploads em andamento.
 */
export const MixedList = {
  args: {
    defaultFileList: MIXED_FILES,
    uploadingIndicator: 'remove',
  },
};

/**
 * Estado de erro.
 */
export const WithError = {
  args: {
    defaultFileList: ERROR_FILES,
  },
};

/**
 * Componente desabilitado.
 */
export const Disabled = {
  args: {
    disabled: true,
    defaultFileList: MIXED_FILES,
  },
};

/**
 * ✨ v6: Demonstração de classNames semânticos (root/list/item).
 */
export const WithSemanticClasses = {
  args: {
    classNames: {
      root: 'custom-file-upload-root',
      list: 'custom-file-upload-list',
      item: 'custom-file-upload-item',
    },
    defaultFileList: MIXED_FILES,
  },
};

/**
 * ✨ v6: Demonstração de styles semânticos (root/list/item).
 */
export const WithSemanticStyles = {
  args: {
    styles: {
      root: { outline: '2px dashed #22c55e', outlineOffset: 6 },
    },
    defaultFileList: MIXED_FILES,
  },
};

/**
 * Visão geral em grid (referência do modelo do Figma).
 */
export const FigmaOverview = {
  render: () => (
    <Flex vertical gap={12}>
      <Text strong>File upload</Text>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <FileUpload />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <FileUpload defaultFileList={MIXED_FILES} uploadingIndicator="remove" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <FileUpload defaultFileList={UPLOADING_FILES} uploadingIndicator="progress" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <FileUpload defaultFileList={UPLOADING_FILES} uploadingIndicator="remove" />
        </Col>
      </Row>
    </Flex>
  ),
};
