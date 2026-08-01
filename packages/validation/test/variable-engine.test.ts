import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildVariableSchema,
  validateVariableValue,
  validateVariableBindings,
  CustomValidatorRegistry,
  UnregisteredCustomValidatorError,
  type VariableSchemaNode,
} from '../src/variable-engine';

describe('buildVariableSchema — per type', () => {
  test('string: required rejects empty, accepts non-empty', () => {
    const node: VariableSchemaNode = { key: 'name', type: 'string', validation: { required: true } };
    assert.equal(validateVariableValue(node, '').success, false);
    assert.equal(validateVariableValue(node, 'Ada').success, true);
  });

  test('string: minLength/maxLength enforced', () => {
    const node: VariableSchemaNode = { key: 'name', type: 'string', validation: { minLength: 2, maxLength: 4 } };
    assert.equal(validateVariableValue(node, 'a').success, false);
    assert.equal(validateVariableValue(node, 'abcde').success, false);
    assert.equal(validateVariableValue(node, 'abc').success, true);
  });

  test('string: regex enforced', () => {
    const node: VariableSchemaNode = { key: 'code', type: 'string', validation: { regex: '^[A-Z]{3}$' } };
    assert.equal(validateVariableValue(node, 'abc').success, false);
    assert.equal(validateVariableValue(node, 'ABC').success, true);
  });

  test('email: rejects malformed addresses', () => {
    const node: VariableSchemaNode = { key: 'email', type: 'email' };
    assert.equal(validateVariableValue(node, 'not-an-email').success, false);
    assert.equal(validateVariableValue(node, 'ada@example.com').success, true);
  });

  test('phone: default E.164-ish pattern', () => {
    const node: VariableSchemaNode = { key: 'phone', type: 'phone' };
    assert.equal(validateVariableValue(node, 'not a phone').success, false);
    assert.equal(validateVariableValue(node, '+14155552671').success, true);
  });

  test('image: requires a URL', () => {
    const node: VariableSchemaNode = { key: 'logo', type: 'image' };
    assert.equal(validateVariableValue(node, 'not a url').success, false);
    assert.equal(validateVariableValue(node, 'https://example.com/logo.png').success, true);
  });

  test('number/currency: min/max enforced', () => {
    const node: VariableSchemaNode = { key: 'price', type: 'currency', validation: { min: 0, max: 100 } };
    assert.equal(validateVariableValue(node, -1).success, false);
    assert.equal(validateVariableValue(node, 101).success, false);
    assert.equal(validateVariableValue(node, 42).success, true);
  });

  test('boolean: rejects non-boolean', () => {
    const node: VariableSchemaNode = { key: 'active', type: 'boolean' };
    assert.equal(validateVariableValue(node, 'true').success, false);
    assert.equal(validateVariableValue(node, true).success, true);
  });

  test('date: coerces ISO strings, enforces min/max', () => {
    const node: VariableSchemaNode = {
      key: 'when',
      type: 'date',
      validation: { min: Date.parse('2020-01-01'), max: Date.parse('2030-01-01') },
    };
    assert.equal(validateVariableValue(node, '2019-01-01').success, false);
    assert.equal(validateVariableValue(node, '2025-06-01').success, true);
  });

  test('enum: only declared values accepted', () => {
    const node: VariableSchemaNode = { key: 'tier', type: 'enum', validation: { enumValues: ['gold', 'silver'] } };
    assert.equal(validateVariableValue(node, 'bronze').success, false);
    assert.equal(validateVariableValue(node, 'gold').success, true);
  });

  test('enum: throws at build time with no enumValues', () => {
    const node: VariableSchemaNode = { key: 'tier', type: 'enum' };
    assert.throws(() => buildVariableSchema(node));
  });

  test('json: accepts any JSON-serializable value', () => {
    const node: VariableSchemaNode = { key: 'payload', type: 'json' };
    assert.equal(validateVariableValue(node, { a: [1, 2, 3] }).success, true);
  });

  test('object: validates nested children by key', () => {
    const node: VariableSchemaNode = {
      key: 'customer',
      type: 'object',
      children: [
        { key: 'city', type: 'string', validation: { required: true } },
        { key: 'zip', type: 'string', validation: { regex: '^[0-9]{5}$' } },
      ],
    };
    assert.equal(validateVariableValue(node, { city: 'London', zip: '12345' }).success, true);
    assert.equal(validateVariableValue(node, { city: '', zip: 'abcde' }).success, false);
  });

  test('array: validates every element against the element schema', () => {
    const node: VariableSchemaNode = {
      key: 'orders',
      type: 'array',
      children: [{ key: 'price', type: 'number', validation: { min: 0 } }],
    };
    assert.equal(validateVariableValue(node, [1, 2, 3]).success, true);
    assert.equal(validateVariableValue(node, [1, -2, 3]).success, false);
  });
});

describe('required vs optional', () => {
  test('optional field accepts undefined/null', () => {
    const node: VariableSchemaNode = { key: 'nickname', type: 'string' };
    assert.equal(validateVariableValue(node, undefined).success, true);
    assert.equal(validateVariableValue(node, null).success, true);
  });

  test('required field rejects undefined/null', () => {
    const node: VariableSchemaNode = { key: 'name', type: 'string', validation: { required: true } };
    assert.equal(validateVariableValue(node, undefined).success, false);
    assert.equal(validateVariableValue(node, null).success, false);
  });
});

describe('custom validators', () => {
  test('registered validator runs and can fail with a message', () => {
    const registry = new CustomValidatorRegistry();
    registry.register('isEven', (value) => (typeof value === 'number' && value % 2 === 0) || 'Must be even');

    const node: VariableSchemaNode = { key: 'count', type: 'number', validation: { customValidatorKey: 'isEven' } };
    const failure = validateVariableValue(node, 3, registry);
    assert.equal(failure.success, false);
    assert.equal(failure.errors[0]?.message, 'Must be even');

    const success = validateVariableValue(node, 4, registry);
    assert.equal(success.success, true);
  });

  test('unregistered validator key throws at build time', () => {
    const registry = new CustomValidatorRegistry();
    const node: VariableSchemaNode = { key: 'count', type: 'number', validation: { customValidatorKey: 'missing' } };
    assert.throws(() => buildVariableSchema(node, registry), UnregisteredCustomValidatorError);
  });
});

describe('validateVariableBindings — dotted-path integration with the Phase 6 path engine', () => {
  test('resolves each binding by path and reports errors keyed by that path', () => {
    const bindings: VariableSchemaNode[] = [
      { key: 'firstName', type: 'string', validation: { required: true } },
      { key: 'customer.address.zip', type: 'string', validation: { regex: '^[0-9]{5}$' } },
      { key: 'orders[0].price', type: 'currency', validation: { min: 0 } },
    ];

    const goodData = {
      firstName: 'Ada',
      customer: { address: { zip: '94107' } },
      orders: [{ price: 42 }],
    };
    assert.equal(validateVariableBindings(bindings, goodData).success, true);

    const badData = {
      firstName: '',
      customer: { address: { zip: 'bad' } },
      orders: [{ price: -5 }],
    };
    const result = validateVariableBindings(bindings, badData);
    assert.equal(result.success, false);
    assert.equal(result.errors.length, 3);
    assert.deepEqual(
      result.errors.map((e) => e.field).sort(),
      ['customer.address.zip', 'firstName', 'orders[0].price'],
    );
  });

  test('a missing required binding is reported', () => {
    const bindings: VariableSchemaNode[] = [{ key: 'lastName', type: 'string', validation: { required: true } }];
    const result = validateVariableBindings(bindings, {});
    assert.equal(result.success, false);
    assert.equal(result.errors[0]?.field, 'lastName');
  });
});
