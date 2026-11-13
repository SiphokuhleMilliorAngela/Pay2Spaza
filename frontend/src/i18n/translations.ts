import { strings as legacy } from './strings';
import { en } from './lang/en';
import { zu } from './lang/zu';
import { xh } from './lang/xh';
import { st } from './lang/st';
import { tn } from './lang/tn';
import { af } from './lang/af';

export type { Strings } from './lang/en';
import type { Strings } from './lang/en';

// Same order as LANGUAGES in strings.ts: English, isiZulu, isiXhosa, Sesotho, Setswana, Afrikaans.
const BY_INDEX: Strings[] = [en, zu, xh, st, tn, af];

// Anything the older strings.ts has that the new files don't is kept (in English), so nothing goes missing.
export function getStrings(languageIndex: number): Strings {
  const extra = ((legacy as any)?.en ?? {}) as object;
  return { ...extra, ...(BY_INDEX[languageIndex] ?? en) } as Strings;
}
