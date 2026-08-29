import dayjs from "dayjs";


export const getFormattedDate = () => dayjs().format('YYYY-MM-DD');
export const getFormattedTime = () => dayjs().format('HH:mm');

export const CATEGORY_COLORS = [
  "#2C4A3E",
  "#7A7B4A",
  "#B08C4F",
  "#5C7A5E",
  "#8C5B3E",
  "#4A6670",
  "#9C6B4F",
  "#6B7A3E",
] as const;


