import { addDays, format } from "date-fns";
import { enUS } from "date-fns/locale";

export const getCategoryDateFormatter = () => {
    const todayStartOfDay = new Date();
    todayStartOfDay.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = addDays(todayStartOfDay, 7);
    const fourteenDaysFromNow = addDays(todayStartOfDay, 14);

    const formatToday = format(todayStartOfDay, "yyyy-MM-dd", { locale: enUS });
    const formatSevenDays = format(sevenDaysFromNow, "yyyy-MM-dd", { locale: enUS });
    const formatFourteenDays = format(fourteenDaysFromNow, "yyyy-MM-dd", { locale: enUS });

    return { formatToday, formatSevenDays, formatFourteenDays };
}