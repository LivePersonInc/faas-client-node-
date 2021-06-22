export interface ImplementedEvent {
  name: string;
  exp: number;
  isImplemented: boolean;
  skillId?: string;
}

export class IsImplementedCache {
  private cache: ImplementedEvent[] = [];

  constructor(private cacheDuration: number) {}

  get(eventName: string, skillId?: string): ImplementedEvent | undefined {
    let event: ImplementedEvent | undefined;
    if (skillId) {
      event = this.cache.find(e => {
        return e.name === eventName && e.skillId === skillId;
      });
    } else {
      event = this.cache.find(e => {
        return e.name === eventName;
      });
    }
    if (event) {
      if (event.exp > Date.now()) return event;
      this.removeFromCache(event);
    }
    return undefined;
  }

  add(eventName: string, isImplemented: boolean, skillId?: string): void {
    const event: ImplementedEvent | undefined = this.get(eventName, skillId);
    if (event) {
      this.removeFromCache(event);
    }
    const newEvent: ImplementedEvent = {
      name: eventName,
      exp: Date.now() + this.cacheDuration * 1000,
      isImplemented,
      skillId,
    };
    this.cache.push(newEvent);
  }

  private removeFromCache(event: ImplementedEvent): void {
    const index = this.cache.indexOf(event);
    this.cache.splice(index, 1);
  }
}
