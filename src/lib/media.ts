import { asset } from "./utils";

/** Optimized photography lives in public/img/generated and src/img/generated. */
export function media(name: string) {
  return asset(`img/generated/${name}.webp`);
}

export function mediaSet(name: string) {
  return `${media(name)} 1x, ${asset(`img/generated/${name}@2x.webp`)} 2x, ${asset(`img/generated/${name}@3x.webp`)} 3x`;
}
