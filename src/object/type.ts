type S2E<S> = S extends `${infer F} ${infer R}` ? `${F}${S2E<R>}` : S;
type A2S<S> = S extends `${infer H}*${infer T}` ? `${H}${string}${A2S<T>}` : S;
type S2N<S> = S extends `${infer H}#${infer T}` ? `${H}${number}${A2S<T>}` : S;
type U2T<U> = U extends `${infer F}|${infer R}` ? [F, ...U2T<R>] : [U];
type T2U<T> = T extends string[] ? T[number] : '';
type U2S<S> = T2U<U2T<S2E<S>>>;
type U2U<S> = S extends `${infer H}(${infer U})${infer T}` ? `${H}${U2S<U>}${U2U<T>}` : S;
type L2S<S, C> = S extends `${infer H}{${infer L}}${infer T}` ? `${H}${C extends true ? L : string}${L2S<T, C>}` : S;
type L2N<S, C> = S extends `${infer H}[${infer L}]${infer T}` ? `${H}${C extends true ? L : number}${L2N<T, C>}` : S;
type P2S<S, C> = U2U<A2S<S2N<L2N<L2S<S, C>, C>>>>;
type P2SL<P> = P extends [infer F, ...infer R] ? [P2S<F, true>, ...P2SL<R>] : [];

type P2A<O, K extends string, P> = O extends { [D in K]: infer V extends string | number | null | undefined }
    ? `${V}` extends P2S<P, false>
        ? O
        : P2S<P, false> extends `${V}`
            ? O & { [D in K]: P2S<P, true> }
            : never
    : never;

type Cb<O, K extends string, P, R> = P extends [infer H, ...infer T]
    ? [
        (param: P2A<O, K, H>) => R,
        ...Cb<O, K, T, R>
    ]
    : [];

export type ObjectMatch<O, K extends keyof O & string, P> = [O[K]] extends [P2SL<P>[number]]
    ? <R>(...cb: Cb<O, K, P, R>) => R
    : never;
