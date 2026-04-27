import { unstable_cache } from "next/cache"
import { fetchDashboardData } from "./data"

export const getCachedDashboardData = unstable_cache(
  fetchDashboardData,
  ["dashboard-data"],
  { tags: ["dashboard-data"], revalidate: false }
)
