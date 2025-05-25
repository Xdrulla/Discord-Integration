import PropTypes from 'prop-types';
import { Input, DatePicker, Space, Tooltip } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import AddManualRecordModal from './AddManualRecordModal';

const { RangePicker } = DatePicker;

const FilterBar = ({ role, searchUser, setSearchUser, setDateRange }) => {
  const [manualModalOpen, setManualModalOpen] = useState(false);

  const handleUserSearch = e => setSearchUser(e.target.value);
  const handleDateChange = dates => setDateRange(dates || [null, null]);

  return (
    <div className="filter-container" role="region" aria-label="Filter controls">
      <Space className="filter-elements" wrap align="center">
        {role === 'admin' && (
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
        <RangePicker
          className="date-picker"
          value={null}
          onChange={handleDateChange}
          allowClear
          format="DD/MM/YYYY"
          aria-label="Selecionar intervalo de datas"
        />
        {role === 'admin' && (
          <Tooltip title="Adicionar registro manual">
            <button
              type="button"
              className="add-manual-button"
              onClick={() => setManualModalOpen(true)}
              aria-label="Adicionar registro manual"
            >
              <PlusOutlined />
            </button>
          </Tooltip>
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
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
  searchUser: PropTypes.string.isRequired,
  setSearchUser: PropTypes.func.isRequired,
  setDateRange: PropTypes.func.isRequired,
};

export default FilterBar;
