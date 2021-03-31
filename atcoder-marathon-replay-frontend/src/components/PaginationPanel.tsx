import React from 'react';
import { PaginationOptions } from 'react-bootstrap-table-next';
import {
  Col,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
} from 'reactstrap';
import { range } from '../utils';
import './pagination-panel.scss';

const pageList = (
  currPage: number,
  pageStartIndex: number,
  totalPages: number
): number[] => {
  if (totalPages === 0) {
    return [];
  }
  if (totalPages <= 10) {
    return range(1, totalPages);
  }

  const pageNumbers = [currPage];
  let tmpExp = 1;
  for (;;) {
    tmpExp *= 2;
    const tmpPageNumber = currPage - tmpExp + 1;
    if (tmpPageNumber < pageStartIndex) {
      break;
    }
    pageNumbers.unshift(tmpPageNumber);
  }
  if (pageNumbers[0] !== pageStartIndex) {
    pageNumbers.unshift(pageStartIndex);
  }

  tmpExp = 1;
  for (;;) {
    tmpExp *= 2;
    const tmpPageNumber = currPage + tmpExp - 1;
    if (tmpPageNumber > totalPages) {
      break;
    }
    pageNumbers.push(tmpPageNumber);
  }
  if (pageNumbers.slice(-1)[0] !== totalPages) {
    pageNumbers.push(totalPages);
  }

  return pageNumbers;
};

interface PaginationChildProps extends PaginationOptions {
  tableId?: string;
  bootstrap4?: boolean;
}

interface PaginationPanelProps extends PaginationChildProps {
  renderSizePerPage: boolean;
}

export const PaginationPanel: React.FC<PaginationPanelProps> = (props) => {
  const {
    renderSizePerPage,
    totalSize,
    sizePerPage,
    sizePerPageList,
    onSizePerPageChange,
    page,
    pageStartIndex,
    onPageChange,
  } = props;
  if (
    page === undefined ||
    pageStartIndex === undefined ||
    onPageChange === undefined ||
    totalSize === undefined ||
    sizePerPage === undefined ||
    sizePerPageList === undefined ||
    onSizePerPageChange === undefined
  )
    return null;
  const totalPages = Math.ceil(totalSize / sizePerPage);
  const pageNumbers = pageList(page, pageStartIndex, totalPages);

  return (
    <div className="pagination-panel-parent">
      {renderSizePerPage && (
        <>
          <Row>
            <Col className="size-per-page">
              <span className="small">
                {'per page: '}
                {(sizePerPageList as number[]).map((p) => (
                  <a
                    key={p}
                    className={`standings-per-page${
                      p === sizePerPage ? ' active' : ''
                    }`}
                    onClick={() => onSizePerPageChange(p, 1)}
                  >
                    {p}
                  </a>
                ))}
              </span>
            </Col>
          </Row>
          <hr className="size-per-page-splitter" />
        </>
      )}
      <Row>
        <Col>
          <Pagination
            className="pagination-sm"
            style={{ flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {pageNumbers.map((pageNumber) => (
              <PaginationItem key={pageNumber} active={pageNumber === page}>
                <PaginationLink
                  onClick={() => onPageChange(pageNumber, sizePerPage)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
          </Pagination>
        </Col>
      </Row>
    </div>
  );
};
