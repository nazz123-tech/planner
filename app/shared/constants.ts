import dayjs from "dayjs";


export const getFormattedDate = () => dayjs().format('YYYY-MM-DD');
export const getFormattedTime = () => dayjs().format('HH:mm');

export const CATEGORY_COLORS = [
  "#2C4A3E", // Forest
  "#4A6B4A", // Fern
  "#7A7B4A", // Olive
  "#9B9C6E", // Sage
  "#B99738", // Mustard
  "#A4703F", // Ochre
  "#8C4A32", // Terracotta
  "#3F6C6B", // Pine teal
] as const;


