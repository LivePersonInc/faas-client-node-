import {IsImplementedCache} from '../src/helper/isImplementedCache';

const event = 'event';
let isImplementedCache: IsImplementedCache;
beforeEach(() => {
  isImplementedCache = new IsImplementedCache(2);
});
describe('ImplementedCache', () => {
  describe('success flows', () => {
    it(
      'should add an event with a specific name to cache' +
        'and return it when called again',
      () => {
        isImplementedCache.add(event, true);

        expect(isImplementedCache.get(event)).toBeDefined();
        expect(isImplementedCache.get(event)?.isImplemented).toBeTrue();
      }
    );
    it('should overwrite a specific event that already exists in cache', () => {
      isImplementedCache.add(event, true);
      isImplementedCache.add(event, false);

      expect(isImplementedCache.get(event)).toBeDefined();
      expect(isImplementedCache.get(event)?.isImplemented).toBeFalse();
    });
    it('should not return an event that is expired', () => {
      isImplementedCache = new IsImplementedCache(-2);
      isImplementedCache.add(event, true);

      expect(isImplementedCache.get(event)).toBeUndefined();
    });
    it('should return an event that has skillId', () => {
      isImplementedCache.add(event, true, 'smapleSkill');

      expect(isImplementedCache.get(event)).toBeDefined();
      expect(isImplementedCache.get(event)?.skillId).toBeDefined();
      expect(isImplementedCache.get(event)?.skillId).toBeString();
    });
  });
  // No unhappy flows since cache does not throw any errors
});
