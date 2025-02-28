import PropTypes from "prop-types";
import { Input, Button } from "antd";

const FilterBar = ({ searchUser, setSearchUser, handleFilter }) => {
  return (
    <div className="filter-container">
      <Input
        placeholder="Filtrar por usuário"
        value={searchUser}
        onChange={(e) => setSearchUser(e.target.value)}
      />
      <Button type="primary" onClick={handleFilter}>Filtrar</Button>
    </div>
  );
};

FilterBar.propTypes = {
  searchUser: PropTypes.string.isRequired,
  setSearchUser: PropTypes.func.isRequired,
  handleFilter: PropTypes.func.isRequired,
};

export default FilterBar;
