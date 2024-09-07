import { describe, test, expect } from 'vitest';
import { literalMatch } from '../index';

describe('literalMatch', () => {
    test('literal', () => {
        const literal = 'abc' as 'abc' | 'xyz';

        const actual = literalMatch(literal)(
            '@<abc>',
            '@<xyz>',
        )(
            (a) => a,
            (b) => b,
        );

        expect(actual).toBe('abc');
    });

    test('string', () => {
        const literal: string = 'xyz';

        const actual = literalMatch(literal)(
            '@<{abc}>',
            '@<{xyz}>',
            '@<*>',
        )(
            (a) => a,
            (b) => b,
            (c) => c,
        );

        expect(actual).toBe('xyz');
    });

    test('union', () => {
        const literal = 'b_z' as `${'a' | 'b' | 'c'}_${'x' | 'y' | 'z'}`;

        const actual = literalMatch(literal)(
            'a_@<(x | y | z)>',
            'b_@<(x | y | z)>',
            'c_@<(x | y | z)>',
        )(
            (a) => `1_${a}`,
            (b) => `2_${b}`,
            (c) => `3_${c}`,
        );

        expect(actual).toBe('2_z');
    });

    test('number', () => {
        const literal = 'v8' as `v${number}`;

        const actual = literalMatch(literal)(
            'v@<[6]>',
            'v@<[7]>',
            'v@<[8]>',
            'v@<#>',
        )(
            (a) => `1_${a}`,
            (b) => `2_${b}`,
            (c) => `3_${c}`,
            (d) => `4_${d}`,
        );

        expect(actual).toBe('3_8');
    });

    test('combination', () => {
        const literal = 'example.12.spec.mjs' as `${string}.${number}.${'spec' | 'test'}.${'ts' | 'tsx' | 'js' | 'cjs' | 'mjs'}`;

        const actual = literalMatch(literal)(
            '{example}.@<#>.test.*',
            '@<{(example | sample)}>.@<#>.spec.@<*js>',
            '@<*>.#.spec.@<(ts | tsx)>',
            '@<*>.#.spec.@<*js>',
            '*.#.test.@<*>',
        )(
            (a) => `example_${a}_txt`,
            (a, b, c) => `${a}_${b}_${c}`,
            (a, b) => `${a}_0_${b}`,
            (a, b) => `${a}_0_${b}`,
            (a) => `example_0_${a}`,
        );

        expect(actual).toBe('example_12_mjs');
    })
});

