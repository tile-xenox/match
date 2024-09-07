import { describe, test, expect } from 'vitest';
import { objectMatch } from '../index';

describe('objectMatch', () => {
    test('literal', () => {
        type Uni = {
            type: 'a',
            a: number,
        } | {
            type: 'b',
            b: number,
        } | {
            type: 'c',
            c: number,
        }

        const obj = {
            type: 'c',
            c: 10,
        } as Uni;

        const actual = objectMatch(obj, 'type')(
            'a',
            'b',
            'c',
        )(
            (o) => `a_${o.a}`,
            (o) => `b_${o.b}`,
            (o) => `c_${o.c}`,
        )

        expect(actual).toBe('c_10');
    });

    test('union', () => {
        type Uni = {
            type: 'a',
            a: number,
        } | {
            type: 'b',
            b: number,
        } | {
            type: 'c',
            c: number,
        }

        const obj = {
            type: 'b',
            b: 10,
        } as Uni;

        const actual = objectMatch(obj, 'type')(
            '(a | b)',
            'c',
        )(
            (o) => `${o.type}_0`,
            (o) => `c_${o.c}`,
        )

        expect(actual).toBe('b_0');
    });
});

