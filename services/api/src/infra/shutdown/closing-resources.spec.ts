import { ClosingResources } from './closing-resources';

describe('ClosingResources', () => {
  it('lists what began closing and has not ended, in order', () => {
    const resources = new ClosingResources();
    const endWorker = resources.begin('worker orders');
    resources.begin('redis');
    resources.begin('worker orders');

    endWorker();

    expect(resources.list()).toEqual(['redis', 'worker orders']);
  });
});
