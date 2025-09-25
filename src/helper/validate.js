import { format } from "date-fns";
import { enUS } from "date-fns/locale";

export const validateProductData = (value, fieldName, type, errors) => {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  ) {
    errors.push(`${fieldName} is missing.`);
    return null;
  }

  switch (type) {
    case "number":
      const num = parseFloat(value);
      if (isNaN(num)) {
        errors.push(`${fieldName} "${value}" is not a valid number.`);
        return null;
      }
      return num;
    case "integer":
      const int = parseInt(value, 10);
      if (isNaN(int)) {
        errors.push(`${fieldName} "${value}" is not a valid integer.`);
        return null;
      }
      return int;
    case "string":
      return value.toString().trim();
    case "date_ddmmyyyy": // Format khusus untuk DD-MM-YYYY
      const arrDate = value.split("-");
      if (arrDate.length !== 3) {
        errors.push(
          `${fieldName} "${value}" format is invalid. Expected DD-MM-YYYY.`
        );
        return null;
      } else {
        const dateFormatted = format(
          new Date(value.replace(/\./g, "")),
          "dd-MM-yyyy",
          {
            locale: enUS,
          }
        );
        return dateFormatted;
      }
    default:
      return value;
  }
};
