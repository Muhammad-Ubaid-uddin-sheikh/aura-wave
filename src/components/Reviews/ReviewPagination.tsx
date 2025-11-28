"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type ReviewPaginationProps = {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
};

const ReviewPagination: React.FC<ReviewPaginationProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => (
  <Pagination className="mb-6">
    <PaginationContent className="flex items-center space-x-1 xs:space-x-2">
      {/* Previous Button */}
      <PaginationItem>
        <PaginationPrevious
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          className={`p-1 xs:p-2 rounded-md ${
            currentPage === 1 ? "pointer-events-none opacity-50" : ""
          }`}
        />
      </PaginationItem>

      {/* Page Numbers */}
      {totalPages <= 5 ? (
        // Show all pages if totalPages <= 5
        Array.from({ length: totalPages }).map((_, i) => (
          <PaginationItem key={i} className="hidden xs:block">
            <PaginationLink
              onClick={() => setCurrentPage(i + 1)}
              isActive={currentPage === i + 1}
              className={`p-1 xs:p-2 rounded-md ${
                currentPage === i + 1
                  ? "bg-primary hover:bg-primary-hover text-primary-foreground hover:text-muted-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))
      ) : (
        <>
          {/* First Page */}
          <PaginationItem className="hidden xs:block">
            <PaginationLink
              onClick={() => setCurrentPage(1)}
              isActive={currentPage === 1}
              className={`p-1 xs:p-2 rounded-md ${
                currentPage === 1
                  ? "bg-primary hover:bg-primary-hover text-primary-foreground hover:text-muted-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </PaginationLink>
          </PaginationItem>

          {/* Show ellipsis if currentPage > 3 */}
          {currentPage > 3 && (
            <PaginationItem className="hidden xs:block">
              <span className="p-1 xs:p-2 text-muted-foreground">...</span>
            </PaginationItem>
          )}

          {/* Middle Pages */}
          {Array.from({ length: totalPages })
            .map((_, i) => i + 1)
            .filter(
              (page) =>
                page !== 1 &&
                page !== totalPages &&
                page >= currentPage - 1 &&
                page <= currentPage + 1
            )
            .map((page) => (
              <PaginationItem key={page} className="hidden xs:block">
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className={`p-1 xs:p-2 rounded-md ${
                    currentPage === page
                      ? "bg-primary hover:bg-primary-hover text-primary-foreground hover:text-muted-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

          {/* Show ellipsis if currentPage < totalPages - 2 */}
          {currentPage < totalPages - 2 && (
            <PaginationItem className="hidden xs:block">
              <span className="p-1 xs:p-2 text-muted-foreground">...</span>
            </PaginationItem>
          )}

          {/* Last Page */}
          <PaginationItem className="hidden xs:block">
            <PaginationLink
              onClick={() => setCurrentPage(totalPages)}
              isActive={currentPage === totalPages}
              className={`p-1 xs:p-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-primary hover:bg-primary-hover text-primary-foreground hover:text-muted-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        </>
      )}

      {/* Page Info for Mobile */}
      <PaginationItem className="block xs:hidden">
        <span className="p-1 text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
      </PaginationItem>

      {/* Next Button */}
      <PaginationItem>
        <PaginationNext
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          className={`p-1 xs:p-2 rounded-md ${
            currentPage === totalPages ? "pointer-events-none opacity-50" : ""
          }`}
        />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
);

export default ReviewPagination;