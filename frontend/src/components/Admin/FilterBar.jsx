import PropTypes from "prop-types";
import { Input, DatePicker, Space } from "antd";
import { useState } from "react";

const { RangePicker } = DatePicker;

const FilterBar = ({ role, searchUser, setSearchUser, setDateRange }) => {
  const [localDateRange, setLocalDateRange] = useState([null, null]);

  const onDateChange = (dates) => {
    setLocalDateRange(dates || [null, null]);
    setDateRange(dates || [null, null]);
  };

  return (
    <div className="filter-container">
      <Space className="filter-elements" wrap>
        {role === "admin" && (
          <Input
            placeholder="Filtrar por usuário"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="filter-input"
          />
        )}

        <RangePicker
          value={localDateRange}
          onChange={onDateChange}
          allowClear
          format="DD/MM/YYYY"
          className="date-picker"
        />
      </Space>
    </div>
  );
};

FilterBar.propTypes = {
  role: PropTypes.string.isRequired,
  searchUser: PropTypes.string.isRequired,
  setSearchUser: PropTypes.func.isRequired,
  setDateRange: PropTypes.func.isRequired,
};

export default FilterBar;
