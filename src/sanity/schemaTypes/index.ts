import type { SchemaTypeDefinition } from "sanity";

import { decorProductType } from "./decorProduct";
import { faqType } from "./faq";
import { intentionType } from "./intention";
import { pendantProductType } from "./pendantProduct";
import { productType } from "./product";
import { settingsType } from "./settings";
import { stoneType } from "./stone";

export const schemaTypes: SchemaTypeDefinition[] = [
  productType,
  decorProductType,
  pendantProductType,
  stoneType,
  intentionType,
  settingsType,
  faqType,
];
