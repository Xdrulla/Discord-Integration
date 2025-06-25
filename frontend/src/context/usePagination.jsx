import { useContext } from "react";
import PaginationContext from "./PaginationContext";

const usePagination = () => useContext(PaginationContext);

export default usePagination;
