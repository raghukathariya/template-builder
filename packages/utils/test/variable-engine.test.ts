import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseVariablePath,
  resolveVariablePath,
  extractVariableTokens,
  interpolateVariables,
} from '../src/index';

describe('parseVariablePath', () => {
  test('plain key', () => {
    assert.deepEqual(parseVariablePath('firstName'), [{ type: 'key', key: 'firstName' }]);
  });

  test('dotted path', () => {
    assert.deepEqual(parseVariablePath('customer.address.city'), [
      { type: 'key', key: 'customer' },
      { type: 'key', key: 'address' },
      { type: 'key', key: 'city' },
    ]);
  });

  test('array index', () => {
    assert.deepEqual(parseVariablePath('orders[0].price'), [
      { type: 'key', key: 'orders' },
      { type: 'index', index: 0 },
      { type: 'key', key: 'price' },
    ]);
  });

  test('multiple indices', () => {
    assert.deepEqual(parseVariablePath('matrix[1][2]'), [
      { type: 'key', key: 'matrix' },
      { type: 'index', index: 1 },
      { type: 'index', index: 2 },
    ]);
  });
});

describe('resolveVariablePath', () => {
  const data = {
    firstName: 'Ada',
    customer: { address: { city: 'London' } },
    orders: [{ price: 42 }, { price: 7 }],
    company: { logo: 'https://example.com/logo.png' },
  };

  test('resolves a plain key', () => {
    assert.equal(resolveVariablePath(data, 'firstName'), 'Ada');
  });

  test('resolves a nested object path', () => {
    assert.equal(resolveVariablePath(data, 'customer.address.city'), 'London');
  });

  test('resolves an array index path', () => {
    assert.equal(resolveVariablePath(data, 'orders[0].price'), 42);
    assert.equal(resolveVariablePath(data, 'orders[1].price'), 7);
  });

  test('returns undefined for a missing key', () => {
    assert.equal(resolveVariablePath(data, 'lastName'), undefined);
  });

  test('returns undefined for an out-of-range index', () => {
    assert.equal(resolveVariablePath(data, 'orders[5].price'), undefined);
  });

  test('returns undefined when indexing into a non-array', () => {
    assert.equal(resolveVariablePath(data, 'firstName[0]'), undefined);
  });

  test('returns undefined when key-accessing an array', () => {
    assert.equal(resolveVariablePath(data, 'orders.price'), undefined);
  });

  test('returns undefined when traversing through null/undefined', () => {
    assert.equal(resolveVariablePath({ a: null }, 'a.b.c'), undefined);
  });
});

describe('extractVariableTokens', () => {
  test('extracts and deduplicates tokens', () => {
    const tokens = extractVariableTokens('Hi {{firstName}}, your city is {{customer.address.city}}. Bye {{firstName}}!');
    assert.deepEqual(tokens, ['firstName', 'customer.address.city']);
  });

  test('trims whitespace inside braces', () => {
    assert.deepEqual(extractVariableTokens('{{  firstName  }}'), ['firstName']);
  });

  test('returns an empty array when there are no tokens', () => {
    assert.deepEqual(extractVariableTokens('no variables here'), []);
  });
});

describe('interpolateVariables', () => {
  const data = { firstName: 'Ada', orders: [{ price: 42 }] };

  test('replaces resolved tokens', () => {
    assert.equal(interpolateVariables('Hello {{firstName}}!', data), 'Hello Ada!');
  });

  test('replaces multiple tokens including array access', () => {
    assert.equal(
      interpolateVariables('{{firstName}} paid {{orders[0].price}}', data),
      'Ada paid 42',
    );
  });

  test('renders unresolved tokens as blank by default', () => {
    assert.equal(interpolateVariables('Hello {{lastName}}!', data), 'Hello !');
  });

  test('honors a custom onMissing callback', () => {
    const result = interpolateVariables('Hello {{lastName}}!', data, {
      onMissing: (path) => `[missing:${path}]`,
    });
    assert.equal(result, 'Hello [missing:lastName]!');
  });

  test('honors a custom formatValue callback', () => {
    const result = interpolateVariables('Price: {{orders[0].price}}', data, {
      formatValue: (value) => `$${value}`,
    });
    assert.equal(result, 'Price: $42');
  });
});
