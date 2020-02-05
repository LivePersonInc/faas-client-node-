export interface ImplementedEvent {
  name: string;
  exp: number;
  isImplemented: boolean;
}

export class IsImplementedCache {
  private cache: ImplementedEvent[] = [];

  constructor(private cacheDuration: number) {}

  get(eventName: string): ImplementedEvent | undefined {
    const event: ImplementedEvent | undefined = this.cache.find(e => {
      return e.name === eventName;
    });
    if (event) {
      if (event.exp > Date.now()) return event;
      this.removeFromCache(event);
    }
    return undefined;
  }

  add(eventName: string, isImplemented: boolean): void {
    const event: ImplementedEvent | undefined = this.get(eventName);
    if (event) {
      this.removeFromCache(event);
    }
    const newEvent: ImplementedEvent = {
      name: eventName,
      exp: Date.now() + this.cacheDuration * 1000,
      isImplemented,
    };
    this.cache.push(newEvent);
  }

  private removeFromCache(event: ImplementedEvent): void {
    const index = this.cache.indexOf(event);
    this.cache.splice(index, 1);
  }
}
