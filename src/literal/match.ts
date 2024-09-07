import type { LiteralMatch } from './type';

/**
 * ## pattern
 * - `abc`: literal match and filter as literal
 * - `{abc}`: literal match and filter as string
 * - `[123]`: literal match and filter as number
 * - `(a | b | c)`: union match
 * - `#`: number match
 * - `*`: string match
 * - `@<*>`: parameter match
 */
export function literalMatch<L extends string>(literal: L): <const P extends [string, ...string[]]>(...pattern: P) => LiteralMatch<L, P>;
export function literalMatch(literal: string): unknown {
    return (...pattern: string[]) => {
        const { index, args } = (() => {
            for (const [index, p] of pattern.entries()) {
                const args = p2a(p)(literal);
                if (args) {
                    return { index, args };
                }
            }
            return { index: NaN, args: [] };
        })();
        return (...cb: ((...params: string[]) => unknown)[]) => cb[index]?.(...args);
    }
}

const p2a = (p: string): (param: string) => string[] | undefined => {
    const regexp = new RegExp(`^${
        p.replaceAll(/\{(.+?)\}/g, '$1') // unwrap {}
         .replaceAll(/\[(.+?)\]/g, '$1') // unwrap []
         .replaceAll(/[.+?^${}[\]\\]/g, '\\$&') // escape
         .replaceAll('#', '\\d+') // number match
         .replaceAll('*', '.*') // string match
         .replaceAll(/ +\| +/g, '|') // remove space in union
         .replaceAll(/\((.+?)\)/g, '(?:$1)') // change non capture group
         .replaceAll(/@<(.+?)>/g, '($1)') // make capture group
    }$`);
    return (param) => regexp.exec(param)?.slice(1);
}
