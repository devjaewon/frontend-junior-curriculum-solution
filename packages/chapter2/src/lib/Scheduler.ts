import EventBus from "@kjojs/eventbus";
import { Fiber } from "./react/Fiber";
import { FiberRoot } from "./react/FiberRoot";

class Scheduler extends EventBus<{ renderComplete: Fiber }> {
  static instance = new Scheduler();

  private _stack: Array<Fiber> = [];

  constructor() {
    super();
    setInterval(() => {
      this._checkAndWork();
    }, 10);
  }

  schedule(fiberRoot: FiberRoot) {
    if (this._stack.length === 0) {
      return this._work(fiberRoot.current);
    }

    this._pushStack(fiberRoot.current);
  }

  private _work(fiber: Fiber) {
    fiber.render();

    const nextFiber = fiber.next();
    if (nextFiber) {
      this._pushStack(nextFiber);
    }
    
    if (this._stack.length === 0) {
      this.emit('renderComplete', fiber);
    }
  }

  private _pushStack(fiber: Fiber) {
    let cursor: Fiber | null = fiber;

    while (cursor !== null) {
      this._stack.push(cursor);
      cursor = cursor.next();
    }
  }

  private _checkAndWork() {
    if (this._stack.length > 0) {
      const fiber = this._stack.pop() || null;
      if (fiber) {
        this._work(fiber);
      }
    }
  }
}

export default Scheduler;
