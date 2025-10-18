import PropTypes from 'prop-types';

const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) => {
  const pageNumbers = [];
  const maxPagesToShow = 5;

  // Calculate start and end page numbers
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  // Adjust start page if we're near the end
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <div className="text-muted">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>

      <div className="d-flex align-items-center gap-2">
        {/* Items per page selector */}
        <div className="d-flex align-items-center me-3">
          <label htmlFor="itemsPerPage" className="me-2 mb-0 text-nowrap">
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            className="form-select form-select-sm"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            style={{ width: '80px' }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Pagination controls */}
        <nav aria-label="Page navigation">
          <ul className="pagination pagination-sm mb-0">
            {/* First page button */}
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                aria-label="First"
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
            </li>

            {/* Previous page button */}
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous"
              >
                <i className="fas fa-angle-left"></i>
              </button>
            </li>

            {/* Show first page if not in range */}
            {startPage > 1 && (
              <>
                <li className="page-item">
                  <button className="page-link" onClick={() => onPageChange(1)}>
                    1
                  </button>
                </li>
                {startPage > 2 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}
              </>
            )}

            {/* Page numbers */}
            {pageNumbers.map((number) => (
              <li
                key={number}
                className={`page-item ${currentPage === number ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => onPageChange(number)}
                >
                  {number}
                </button>
              </li>
            ))}

            {/* Show last page if not in range */}
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}
                <li className="page-item">
                  <button className="page-link" onClick={() => onPageChange(totalPages)}>
                    {totalPages}
                  </button>
                </li>
              </>
            )}

            {/* Next page button */}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next"
              >
                <i className="fas fa-angle-right"></i>
              </button>
            </li>

            {/* Last page button */}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last"
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
};

export default Pagination;