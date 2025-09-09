import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./constants.js";

// 🔹 Extract and validate pagination params
export const getPaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(req.query.limit) || DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// 🔹 Format a standard paginated API response
export const buildPaginatedResponse = (data, page, limit, totalCount) => {
  return {
    data,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1,
    },
  };
};
