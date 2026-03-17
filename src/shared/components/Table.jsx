import "../styles/table.css";
import { IoIosArrowBack, IoIosArrowForward  } from "react-icons/io";


const Table = ({
    columns = [],
    data = [],
    loading = false,
    emptyText = "Sin datos",
    keyField = "id",
    pagination = null
}) => {
    const colSpan = Math.max(columns.length, 1);

    const handlePrev = () => {
        if (pagination.page > 1) pagination.onPageChange(pagination.page - 1);
    };

    const handleNext = () => {
        if (pagination.page < pagination.totalPages) pagination.onPageChange(pagination.page + 1);
    };

    return (
        <>
            <table className="app-table">
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i}>{col.header}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr className="table-state-row">
                            <td className="table-state-cell" colSpan={colSpan}>
                                <div className="table-loading">
                                    <div className="loading-spinner"></div>
                                    <p>Cargando...</p>
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr className="table-state-row">
                            <td className="table-state-cell" colSpan={colSpan}>
                                <div className="table-empty">{emptyText}</div>
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr key={row[keyField]}>
                                {columns.map((col, colIndex) => {
                                    const rawValue = col.accessor ? row[col.accessor] : null;
                                    return (
                                        <td key={colIndex}>
                                            {col.cell ? col.cell(rawValue, row) : rawValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* PAGINACION */}
            {pagination && (
                <section className="table_pagination">
                    <div className="btns_pagination">
                        <button
                            className="pg-btn"
                            onClick={handlePrev}
                            disabled={pagination.page === 1}
                        >
                            <IoIosArrowBack /> Anterior
                        </button>

                        <span className="pg_info">
                            Página {pagination.page} de {pagination.totalPages} — Total {pagination.total}
                        </span>

                        <button
                            className="pg-btn"
                            onClick={handleNext}
                            disabled={pagination.page === pagination.totalPages}
                        >
                            Siguiente <IoIosArrowForward />
                        </button>
                    </div>
                </section>
            )}
        </>
    );
};

export default Table;
