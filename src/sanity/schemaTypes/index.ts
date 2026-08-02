import type { SchemaTypeDefinition } from "sanity";

import { decorProductType } from "./decorProduct";
import { intentionType } from "./intention";
import { productType } from "./product";
import { settingsType } from "./settings";
import { stoneType } from "./stone";

export const schemaTypes: SchemaTypeDefinition[] = [
  productType,
  decorProductType,
  stoneType,
  intentionType,
  settingsType,
];
