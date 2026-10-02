import { ApiRoutes } from "@/constants/api-routes";

import { apiRequest } from "../client";

export const healthRoutes = {
  check: () => apiRequest<{ status: string }>(ApiRoutes.HEALTH),
};
