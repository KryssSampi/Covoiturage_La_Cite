import api from "./admin.api";

export const exportStats = async (format) => {
  const res = await api.get(`/statistics/export?format=${format}`);
  return res.data;
};
``