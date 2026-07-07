import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./src/sanity/env";

/**
 * Config for the Sanity CLI (`npm run studio`, `npm run studio:deploy`).
 * Shares the same projectId / dataset as the storefront via src/sanity/env.
 */
export default defineCliConfig({
  api: { projectId, dataset },
});
