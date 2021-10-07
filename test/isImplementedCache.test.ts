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
    it('should return the event with the provided skillId', () => {
      isImplementedCache.add(event, true, 'sampleSkill');

      expect(isImplementedCache.get(event,'sampleSkill')).toBeDefined();
      expect(isImplementedCache.get(event,'sampleSkill')?.skillId).toBeString();
      expect(isImplementedCache.get(event,'sampleSkill')?.skillId).toEqual('sampleSkill');
    });
    it('should not return an undefined if no entry for provided skillId was found', () => {
      isImplementedCache.add(event, true,'skill');

      expect(isImplementedCache.get(event,'skillsample')).toBeUndefined();
    });
  });
  // No unhappy flows since cache does not throw any errors
});
