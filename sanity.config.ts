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
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      // "New product" inside a tab's list pre-fills that tab.
      {
        id: "rangeProduct-in-range",
        title: "Shop product in tab",
        schemaType: "rangeProduct",
        parameters: [{ name: "rangeId", type: "string" }],
        value: ({ rangeId }: { rangeId: string }) => ({
          range: { _type: "reference", _ref: rangeId },
        }),
      },
    ],
  },
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
            // Collections tabs beyond Bracelets (Stone Décor, Pendants, …). A
            // new tab is just a new "Collection tab" + products — no code.
            orderableDocumentListDeskItem({
              type: "productRange",
              title: "Collection tabs (ordered)",
              S,
              context,
            }),
            // Browse/add products one tab at a time; new products created here
            // are already assigned to that tab.
            S.listItem()
              .title("Shop products by tab")
              .id("rangeProductsByTab")
              .child(
                S.documentTypeList("productRange")
                  .title("Tabs")
                  .child((rangeId) =>
                    S.documentList()
                      .title("Products")
                      .schemaType("rangeProduct")
                      .filter('_type == "rangeProduct" && range._ref == $rangeId')
                      .params({ rangeId })
                      .initialValueTemplates([
                        S.initialValueTemplateItem("rangeProduct-in-range", { rangeId }),
                      ]),
                  ),
              ),
            // Display order: drag within a tab's products (the tab is shown
            // under each name); other tabs' positions don't matter.
            orderableDocumentListDeskItem({
              type: "rangeProduct",
              title: "Shop products (ordered)",
              S,
              context,
            }),
            S.divider(),
            orderableDocumentListDeskItem({
              type: "faq",
              title: "FAQs (ordered)",
              S,
              context,
            }),
            S.divider(),
            // Everything else (stones, intentions) as default lists — but not
            // settings (pinned above) or the orderable product lists above.
            ...S.documentTypeListItems().filter(
              (item) =>
                !["settings", "product", "productRange", "rangeProduct", "faq"].includes(
                  item.getId() ?? "",
                ),
            ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
