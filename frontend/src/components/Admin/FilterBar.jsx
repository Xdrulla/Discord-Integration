import PropTypes from 'prop-types';
import { Input, DatePicker, Space, Button } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import AddManualRecordModal from './AddManualRecordModal';

const { RangePicker } = DatePicker;

const FilterBar = ({ role, searchUser, setSearchUser, setDateRange, currentTab }) => {
  const [manualModalOpen, setManualModalOpen] = useState(false);

  const handleUserSearch = e => setSearchUser(e.target.value);
  const handleDateChange = dates => setDateRange(dates || [null, null]);

  const showSearch = role === 'admin';
  const showManual = role === 'admin' || role === 'leitor';
  const showAddManual = role === 'admin' || role === 'leitor';

  return (
    <div className="filter-container" role="region" aria-label="Filter controls">
      <Space className="filter-elements" wrap align="center">
        {showSearch && (
          <Input
            className="filter-input"
            placeholder="Pesquisar usuário"
            prefix={<SearchOutlined />}
            value={searchUser}
            onChange={handleUserSearch}
            allowClear
            aria-label="Pesquisar por usuário"
          />
        )}

        {showManual && (
          <RangePicker
            className="date-picker"
            value={null}
            onChange={handleDateChange}
            allowClear
            format="DD/MM/YYYY"
            aria-label="Selecionar intervalo de datas"
          />
        )}

        {showAddManual && currentTab === '1' && (
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setManualModalOpen(true)}
            title="Adicionar registro manual"
            aria-label="Adicionar registro manual"
          />
        )}
      </Space>

      <AddManualRecordModal
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
      />
    </div>
  );
};

FilterBar.propTypes = {
  role: PropTypes.oneOf(['admin', 'leitor']).isRequired,
  searchUser: PropTypes.string.isRequired,
  setSearchUser: PropTypes.func.isRequired,
  setDateRange: PropTypes.func.isRequired,
  currentTab: PropTypes.string,
};

export default FilterBar;
