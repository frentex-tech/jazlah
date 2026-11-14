import { resolveRouteAudience } from './resolve-route-audience';

describe('resolveRouteAudience', () => {
  it.each([
    ['public/auth', 'public'],
    ['customer/orders', 'customer'],
    ['vendor', 'vendor'],
    ['kitchen/orders/:id', 'kitchen'],
    ['admin/users', 'admin'],
    ['/customer/me', 'customer'],
  ])('reads the audience of %s', (path, expected) => {
    expect(resolveRouteAudience(path)).toBe(expected);
  });

  it.each([
    ['a path without an audience', 'health'],
    ['a word that only starts like an audience', 'publicity/ads'],
    ['an audience that is not the first segment', 'orders/customer'],
    ['an empty path', ''],
    ['no path', undefined],
  ])('finds none in %s', (_label, path) => {
    expect(resolveRouteAudience(path)).toBeNull();
  });

  it('reads several paths only when they agree', () => {
    expect(resolveRouteAudience(['admin/a', 'admin/b'])).toBe('admin');
    expect(resolveRouteAudience(['admin/a', 'vendor/b'])).toBeNull();
    expect(resolveRouteAudience(['admin/a', 'health'])).toBeNull();
  });
});
