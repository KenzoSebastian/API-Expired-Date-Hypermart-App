import { addDays, format } from "date-fns";
import { enUS } from "date-fns/locale";
import { fetchAndCountProducts } from "../../helper/fetchAndCountProducts.js";

export const getProductsByCategory = async (req, res) => {
  const { productCategory } = req.params;

  const todayStartOfDay = new Date();
  todayStartOfDay.setHours(0, 0, 0, 0);

  const sevenDaysFromNow = addDays(todayStartOfDay, 7);
  const fourteenDaysFromNow = addDays(todayStartOfDay, 14);

  const formatToday = format(todayStartOfDay, "yyyy-MM-dd", { locale: enUS });
  const formatSevenDays = format(sevenDaysFromNow, "yyyy-MM-dd", { locale: enUS });
  const formatFourteenDays = format(fourteenDaysFromNow, "yyyy-MM-dd", { locale: enUS });

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let productsData = [];
  let totalItems = 0;
  let whereConditionFn = null;

  try {
    switch (productCategory) {
      case "expired":
        whereConditionFn = (product, { lt }) => lt(product.expiredDate, formatToday);
        break;
      case "expiringSoon":
        whereConditionFn = (product, { gte, lt, and }) =>
          and(gte(product.expiredDate, formatToday), lt(product.expiredDate, formatSevenDays));
        break;
      case "expiringLater":
        whereConditionFn = (product, { between }) =>
          between(product.expiredDate, formatSevenDays, formatFourteenDays);
        break;
      case "goodProducts":
        whereConditionFn = (product, { gt }) => gt(product.expiredDate, formatFourteenDays);
        break;
      default:
        return res.status(400).json({
          status: "error",
          message: "Invalid product category provided.",
          data: null,
        });
    }

    if (whereConditionFn) {
      [productsData, totalItems] = await fetchAndCountProducts(whereConditionFn, limit, offset);
    } else {
      return res.status(400).json({
        status: "error",
        message: "No valid condition found for the product category.",
        data: null,
      });
    }

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    productsData.forEach((product) => {
      product.expiredDate = format(product.expiredDate, "dd MMMM yyyy", { locale: enUS });
      product.createdAt = format(product.createdAt, "dd MMMM yyyy", { locale: enUS });
      product.updatedAt = format(product.updatedAt, "dd MMMM yyyy", { locale: enUS });
    });

    return res.status(200).json({
      status: "success",
      message: `Products in category '${productCategory}' retrieved successfully`,
      data: productsData,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error(`Error fetching products for category '${productCategory}':`, error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch products. Please try again later.",
      data: null,
    });
  }
};
