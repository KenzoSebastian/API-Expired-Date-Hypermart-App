import { and, asc, between, gt, gte, lt } from "drizzle-orm";
import { db } from "../config/db.js";
import { products } from "../db/schema.js";

export const fetchAndCountProducts = async (whereConditionFn, limit, offset) => {
  const productsQuery = db.query.products.findMany({
    where: whereConditionFn,
    orderBy: asc(products.expiredDate),
    limit,
    offset,
  });

  const totalProductsQuery = db.$count(products, whereConditionFn(products, { lt, gt, gte, and, between }));

  const [paginatedResult, totalItems] = await Promise.all([productsQuery, totalProductsQuery]);

  return [paginatedResult, totalItems];
};
