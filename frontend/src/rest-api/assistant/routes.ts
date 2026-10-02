import { ApiRoutes, HttpMethod } from "@/constants/api-routes";
import type { AskRequest, AskResponse } from "@/types/assistant";

import { apiRequest } from "../client";

export const assistantRoutes = {
  ask: (question: string) =>
    apiRequest<AskResponse>(ApiRoutes.ASSISTANT_ASK, {
      method: HttpMethod.POST,
      body: { question } satisfies AskRequest,
    }),
};
