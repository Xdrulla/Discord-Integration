import { useState } from "react";
import PropTypes from "prop-types";
import PaginationContext from "./PaginationContext";

const PaginationProvider = ({ children }) => {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  return (
    <PaginationContext.Provider value={{ pagination, setPagination }}>
      {children}
    </PaginationContext.Provider>
  );
};

PaginationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PaginationProvider;
