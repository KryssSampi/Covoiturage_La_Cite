import api from "./admin.api";

const fallbackStats = {
  users: 1284,
  activeDrivers: 72,
  pendingValidations: 12,
  ridesToday: 49,
  requestsThisWeek: 163,
  co2Saved: 1840,
  reports: 7,
};

export const fetchStats = async () => {
  try {
    const res = await api.get("/statistics");
    return { ...fallbackStats, ...res.data };
  } catch (error) {
    return fallbackStats;
  }
};
