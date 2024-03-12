import EventBus from "@kjojs/eventbus";
import { Fiber } from "./react/Fiber";
import { FiberRoot } from "./react/FiberRoot";

class Scheduler extends EventBus<{ renderComplete: Fiber }> {
  static instance = new Scheduler();

  constructor() {
    super();
  }

  schedule(fiberRoot: FiberRoot) {
    this._work(fiberRoot.current)
  }

  private _work(fiber: Fiber) {
    fiber.render();

    const nextFiber = fiber.next();
    if (nextFiber) {
      this._work(nextFiber);
    } else {
      this.emit('renderComplete', fiber);
    }
  }
}

export default Scheduler;
