import type { ObjectMatch } from './type';

/**
 * ## pattern
 * - `abc`: literal match and filter as literal
 * - `{abc}`: literal match and filter as string
 * - `[123]`: literal match and filter as number
 * - `(a | b | c)`: union match
 * - `#`: number match
 * - `*`: string match
 */
export function objectMatch<
    K extends string,
    O extends { [P in K]: string | number | null | undefined }
>(obj: O, discriminator: K): <const P extends [string, ...string[]]>(...pattern: P) => ObjectMatch<O, K, P>;
export function objectMatch(obj: Record<string, unknown>, discriminator: string): unknown {
    const value = String(obj[discriminator]);
    return (...pattern: string[]) => {
        const index = (() => {
            for (const [index, p] of pattern.entries()) {
                if (p2c(p)(value)) {
                    return index;
                }
            }
            return NaN;
        })();
        return (...cb: ((params: unknown) => unknown)[]) => cb[index]?.(obj);
    }
}

const p2c = (p: string): (param: string) => boolean => {
    const regexp = new RegExp(`^${
        p.replaceAll(/\{(.+?)\}/g, '$1') // unwrap {}
         .replaceAll(/\[(.+?)\]/g, '$1') // unwrap []
         .replaceAll(/[.+?^${}[\]\\]/g, '\\$&') // escape
         .replaceAll('#', '\\d+') // number match
         .replaceAll('*', '.*') // string match
         .replaceAll(/ +\| +/g, '|') // remove space in union
    }$`);
    return (param) => regexp.test(param);
}
