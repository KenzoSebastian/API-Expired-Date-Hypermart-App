import { db } from "../../config/db.js";
import { getCategoryDateFormatter } from "../../helper/getCategoryDateFormatter.js";
import { randomElement } from "../../helper/RandomElemenArray.js";
import { notificationTemplates } from "../../lib/notificationTemplates.js";

export const getProductCheck = async (req, res) => {
  let productsData = [];
  let categoryParam = "";

  const { formatFourteenDays, formatSevenDays, formatToday } = getCategoryDateFormatter();

  try {
    while (productsData.length === 0) {
      categoryParam = randomElement(["expired", "expiringSoon", "expiringLater"]);

      switch (categoryParam) {
        case "expired":
          productsData = await db.query.products.findMany({
            where: (product, { lt }) => lt(product.expiredDate, formatToday),
          });
          break;
        case "expiringSoon":
          productsData = await db.query.products.findMany({
            where: (product, { gte, lt, and }) =>
              and(gte(product.expiredDate, formatToday), lt(product.expiredDate, formatSevenDays)),
          });
          break;
        case "expiringLater":
          productsData = await db.query.products.findMany({
            where: (product, { between }) =>
              between(product.expiredDate, formatSevenDays, formatFourteenDays),
          });
          break;
        default:
          return res.status(400).json({
            status: "error",
            message: "Invalid product category determined.", // Pesan lebih sesuai
            data: null,
          });
      }
    }

    const product = randomElement(productsData);

    const today = new Date();
    const expiryDate = new Date(product.expiredDate);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let relevantDays;
    if (categoryParam === "expired") {
      relevantDays = Math.abs(diffDays);
      if (relevantDays === 0) relevantDays = 1;
    } else {
      relevantDays = diffDays;
    }

    const templates = notificationTemplates[categoryParam];
    const selectedTemplate = randomElement(templates);

    const notificationTitle = selectedTemplate.title;
    const notificationMessage = selectedTemplate.message(product.description, relevantDays);

    return res.status(200).json({
      status: "success",
      title: notificationTitle,
      message: notificationMessage,
      data: product,
    });
  } catch (error) {
    console.error("Error checking product:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to check product. Please try again later.",
      data: null,
    });
  }
};
