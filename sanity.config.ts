/**
 * Sanity Studio configuration — the standalone admin UI.
 * Run locally with `npm run studio` and publish with `npm run studio:deploy`
 * (hosts it at https://<project>.sanity.studio). Content authors manage
 * products, stones and intentions here; the storefront reads the same data
 * through `src/sanity/client.ts`.
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "amritara",
  title: "Amritara Rituals",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
