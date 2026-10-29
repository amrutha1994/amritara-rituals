import type { SchemaTypeDefinition } from "sanity";

import { faqType } from "./faq";
import { intentionType } from "./intention";
import { productType } from "./product";
import { productRangeType } from "./productRange";
import { rangeProductType } from "./rangeProduct";
import { settingsType } from "./settings";
import { stoneType } from "./stone";

export const schemaTypes: SchemaTypeDefinition[] = [
  productType,
  productRangeType,
  rangeProductType,
  stoneType,
  intentionType,
  settingsType,
  faqType,
];
