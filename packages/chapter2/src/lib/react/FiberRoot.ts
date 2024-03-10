import EventBus from "@kjojs/eventbus";
import { Fiber } from "./Fiber";
import { PatchNode } from "./PatchNode";

export class FiberRoot extends EventBus<{
  update: {
    key: string;
    task: (fiber: Fiber) => void;
  };
}> {
  private _current: Fiber;

  constructor(
    private _fiber: Fiber,
  ) {
    super();
    _fiber.on('update', fiber => this.emit('update', fiber));
    this._current = _fiber;
  }

  get current(): Fiber {
    return this._current;
  }

  get patchNode(): PatchNode {
    return this._fiber.patchNode;
  }

  copy(): FiberRoot {
    const newFiber = this._fiber.copy(null);

    return new FiberRoot(newFiber);
  }

  setCurrent(key: string, task: (fiber: Fiber) => void) {
    const fiber = this._fiber.findDescendants(key)?.fiber;
    if (!fiber) {
      return;
    }

    this._current = fiber;
    this._current.setRoot();
    task(this._current);
  }
}
