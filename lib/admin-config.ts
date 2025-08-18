export const ADMIN_CONFIG = {
  // Remove hardcoded credentials - now stored in database
  dashboard: {
    title: "Dar Sellami Admin Dashboard",
    itemsPerPage: 10,
  },
  security: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    maxLoginAttempts: 5,
  }
};