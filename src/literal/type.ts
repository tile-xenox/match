type S2E<S> = S extends `${infer F} ${infer R}` ? `${F}${S2E<R>}` : S;
type P2C<S> = S extends `${infer H}@<${infer C}>${infer T}` ? `${H}${C}${P2C<T>}` : S;
type A2S<S> = S extends `${infer H}*${infer T}` ? `${H}${string}${A2S<T>}` : S;
type S2N<S> = S extends `${infer H}#${infer T}` ? `${H}${number}${A2S<T>}` : S;
type U2T<U> = U extends `${infer F}|${infer R}` ? [F, ...U2T<R>] : [U];
type T2U<T> = T extends string[] ? T[number] : '';
type U2S<S> = T2U<U2T<S2E<S>>>;
type U2U<S> = S extends `${infer H}(${infer U})${infer T}` ? `${H}${U2S<U>}${U2U<T>}` : S;
type L2S<S, C> = S extends `${infer H}{${infer L}}${infer T}` ? `${H}${C extends true ? L : string}${L2S<T, C>}` : S;
type L2N<S, C> = S extends `${infer H}[${infer L}]${infer T}` ? `${H}${C extends true ? L : number}${L2N<T, C>}` : S;
type P2S<S, C> = U2U<A2S<S2N<P2C<L2N<L2S<S, C>, C>>>>>;
type P2SL<P> = P extends [infer F, ...infer R] ? [P2S<F, true>, ...P2SL<R>] : [];

type P2A<L, P> = P extends `${infer H}@<${infer E}>${infer T}`
    ? L extends `${P2S<H, false>}${infer A extends P2S<E, false>}${P2S<T, false>}`
        ? L extends `${P2S<H, false>}${P2S<E, false>}${infer R extends P2S<T, false>}`
            ? [A & P2S<E, true>, ...P2A<R, T>]
            : never
        : string extends L
            ? [P2S<E, true>, ...P2A<string, T>]
            : never
    : [];

type Cb<L, P, R> = P extends [infer H, ...infer T]
    ? [
        (...params: P2A<L, H>) => R,
        ...Cb<L, T, R>
    ]
    : [];

export type LiteralMatch<L, P> = [L] extends [P2SL<P>[number]]
    ? <R>(...cb: Cb<L, P, R>) => R
    : never;
