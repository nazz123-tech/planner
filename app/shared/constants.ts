import dayjs from "dayjs";


export const getFormattedDate = () => dayjs().format('YYYY-MM-DD');
export const getFormattedTime = () => dayjs().format('HH:mm');

export const CATEGORY_COLORS = [
  "#1D332A", // Deep forest
  "#2C4A3E", // Forest
  "#3A5A45", // Pine
  "#4A6B4A", // Fern
  "#5C6B3C", // Moss
  "#5F6039", // Deep olive
  "#7A7B4A", // Olive
  "#9B9C6E", // Sage
] as const;


