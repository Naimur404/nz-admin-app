/**
 * Get today's date in local timezone in YYYY-MM-DD format
 * This ensures we always use the device's local date, not UTC
 */
export const getTodayLocalDate = (): string => {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const result = `${year}-${month}-${day}`;
    return result;
  } catch (error) {
    return '2025-11-17'; // Fallback to current date
  }
};

/**
 * Log date information for debugging timezone issues
 */
export const logDateInfo = (context: string) => {
  try {
    const currentDateTime = new Date();
    const localDate = getTodayLocalDate();
    
    return localDate;
  } catch (error) {
    return '2025-11-17'; // Fallback to current date
  }
};