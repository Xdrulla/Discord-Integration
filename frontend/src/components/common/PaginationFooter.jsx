import { Pagination } from "../designSystem";
import usePagination from "../../context/usePagination";

const PaginationFooter = () => {
  const { pagination, setPagination, showPagination } = usePagination();

  // Só mostra a paginação se showPagination for true E se houver dados
  if (!pagination || !showPagination || pagination.total === 0) return null;

  return (
    <div className="pagination-footer">
      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        showSizeChanger
        pageSizeOptions={[10, 20, 50]}
        showTotal={(total) => `Total de ${total} registros`}
        onChange={(page, pageSize) =>
          setPagination((prev) => ({ ...prev, current: page, pageSize }))
        }
      />
    </div>
  );
};

export default PaginationFooter;
