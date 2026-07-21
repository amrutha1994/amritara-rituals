/**
 * Sanity Studio configuration — the standalone admin UI.
 * Run locally with `npm run studio` and publish with `npm run studio:deploy`
 * (hosts it at https://<project>.sanity.studio). Content authors manage
 * products, stones and intentions here; the storefront reads the same data
 * through `src/sanity/client.ts`.
 */
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
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
    structureTool({
      // Pin "Settings" as a single fixed document (the delivery rule etc.),
      // give products a drag-to-reorder list, and show the rest normally.
      structure: (S, context) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Settings")
              .id("settings")
              .child(
                S.document().schemaType("settings").documentId("settings"),
              ),
            S.divider(),
            orderableDocumentListDeskItem({
              type: "product",
              title: "Products (ordered)",
              S,
              context,
            }),
            S.divider(),
            // Everything else (stones, intentions) as default lists — but not
            // settings (pinned above) or product (the orderable list above).
            ...S.documentTypeListItems().filter(
              (item) => !["settings", "product"].includes(item.getId() ?? ""),
            ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
