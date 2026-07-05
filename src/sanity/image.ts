import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "./env";

const builder = imageUrlBuilder({ projectId, dataset });

/**
 * Turn a Sanity image reference into a URL builder, e.g.
 * `urlFor(img).width(800).url()`. Used by the data mappers to produce plain
 * image URLs for the existing `Product.image` / `Stone.image` string fields.
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
