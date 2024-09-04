/**
 * literal match
 * 
 * abc: standard match
 * (a | b | c): union match
 * *: all match
 * @<(a | b)>: paramter with condition match
 * example.@<*>.@<(spec | test)>.(ts | js)
 */

type SUni = [string, ...string[]];
type WS2E<S> = S extends `${infer F} ${infer R}` ? `${F}${WS2E<R>}` : S;
type P2C<S> = S extends `${infer H}@<${infer C}>${infer T}` ? `${H}${C}${P2C<T>}` : S;
type A2S<S> = S extends `${infer H}*${infer T}` ? `${H}${string}${A2S<T>}` : S;
type U2T<U> = U extends `${infer F}|${infer R}` ? [F, ...U2T<R>] : [U];
type T2U<T> = T extends string[] ? T[number] : '';
type U2U<S> = S extends `${infer H}(${infer U})${infer T}` ? `${H}${T2U<U2T<U>>}${U2U<T>}` : S;
type M2S<S> = U2U<A2S<P2C<WS2E<S>>>>;
type M2SL<M> = M extends [infer F, ...infer R] ? [M2S<F>, ...M2SL<R>] : [];

type M2A<L, S> = S extends `${infer H}@<${infer E}>${infer T}`
    ? L extends `${M2S<H>}${infer A extends M2S<E>}${infer R extends M2S<T>}`
      ? [A, ...M2A<R, T>]
      : never
    : [];
type Arms<L, M, R> = M extends [infer H, ...infer T] ? [(...arg: M2A<L, H>) => R, ...Arms<L, T, R>] : [];

type LiteralMatch<L extends string, M extends SUni> = [L] extends [M2SL<M>[number]] ? <R>(arms: Arms<L, M, R>) => R : never;
function literalMatch<L extends string>(literal: L): <const M extends SUni>(matcher: M) => LiteralMatch<L, M>;
function literalMatch(literal: string): unknown {
    return function(matcher: SUni) {
        const { index, args } = (() => {
            for (const [index, m] of matcher.entries()) {
                const args = m2c(m)(literal);
                if (args !== false) {
                    return { index, args }
                }
            }
            return { index: NaN, args: [] };
        })();
        return function(arms: ((...arg: unknown[]) => unknown)[]) {
            return arms[index](...args)
        }
    }
}

function m2c(m: string): (arg: string) => unknown[] | false {
    return function(arg) {
        return false;
    }
}

declare const literal: `${'example' | 'sample'}.${'a' | 'b' | 'c' | 'd'}.${'spec' | 'test'}.${'js' | 'ts' | 'cjs' | 'mjs'}`

type CCC = M2A<
  `${'example' | 'sample'}.${'a' | 'b' | 'c' | 'd'}.${'spec' | 'test'}.${'js' | 'ts' | 'cjs' | 'mjs'}`,
  'example.@<*>.@<(spec | test)>.(ts | js)'
>

const a = literalMatch(literal)
const b = a([
    'example.@<*>.@<(spec | test)>.(ts | js)',
    '*'
])
const c = b([
    (x, y) => 123,
    () => 10,
])

type XYZ = 'x' | 'y' | 'z'
type PQR = 'p' | 'q' | 'r'
declare const literal2: `${XYZ}${PQR}${XYZ}${PQR}`

const x = literalMatch(literal2);
const y = x([
    '(x | y)@<*>@<*>*',
    '*'
])
const z = y([
    (x, y) => 123,
    () => 10,
])