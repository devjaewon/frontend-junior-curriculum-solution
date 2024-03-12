import EventBus from "@kjojs/eventbus";
import { Fiber } from "./Fiber";
import { PatchNode } from "./PatchNode";
import { FiberEffect } from "./FiberEffect";

export class FiberRoot extends EventBus<{
  setState: {
    effect: FiberEffect;
    transitonKey: string | null;
  };
}> {
  private _current: Fiber;

  constructor(
    private _root: Fiber,
  ) {
    super();
    _root.on('setState', fiber => this.emit('setState', fiber));
    this._current = _root;
  }

  get current(): Fiber {
    return this._current;
  }

  get patchNode(): PatchNode {
    return this._root.patchNode;
  }

  copy(): FiberRoot {
    const newFiber = this._root.copy(null);
    const newFiberRoot = new FiberRoot(newFiber);

    if (this._current.key !== newFiberRoot.current.key) {
      newFiberRoot.setCurrent(this._current.key);
    }

    return newFiberRoot;
  }

  copyForPending(key: string) {
    const newFiber = this._root.copyForPending(null, key);
    const newFiberRoot = new FiberRoot(newFiber);
    newFiberRoot.setCurrent(key);

    return newFiberRoot;
  }

  setCurrent(key: string) {
    const fiber = this._root.findDescendants(key)?.fiber;
    if (!fiber) {
      return;
    }

    this._current = fiber;
    this._current.setRoot();
  }

  callAfterCommit(): void {
    this._current.callAfterCommit();
  }
}
