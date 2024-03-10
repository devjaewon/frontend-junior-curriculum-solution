import { Fiber } from "./react/Fiber";
import Scheduler from "./Scheduler";
import { ReactComponent } from "./react/ReactElement";
import { PatchNode } from "./react/PatchNode";
import { FiberRoot } from "./react/FiberRoot";
import Renderer from "./Renderer";

// 참고 소스코드
// Reconciler 주요 동작
// : https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberReconciler.js
// Fiber 스케줄링 동작
// : https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js#L744
class Reconciler {
  private _current: FiberRoot | null = null;
  private _workInProgress: FiberRoot | null = null;

  constructor(
    private _scheduler: Scheduler,
    private _renderer: Renderer,
  ) {
    this._scheduler.on('renderComplete', () => {
      this._commit(this._diff());
    });
  }

  mount(component: ReactComponent) {
    this._workInProgress = new FiberRoot(Fiber.createRoot(component));
    this._scheduler.schedule(this._workInProgress);
  }

  private _update(key: string, task: (fiber: Fiber) => void) {
    if (!this._current) {
      throw new Error('assert');
    }

    this._workInProgress = this._current.copy();
    this._workInProgress.setCurrent(key, task);
    this._scheduler.schedule(this._workInProgress);
  }

  private _diff(): PatchNode {
    if (!this._workInProgress) {
      throw new Error('assert');
    }

    if (!this._current) {
      return this._updateAll(this._workInProgress.patchNode, true);
    }
    
    return this._compare(this._current.patchNode, this._workInProgress.patchNode);
  }

  private _updateAll(patch: PatchNode, dirty: boolean): PatchNode {
    patch.dirty = dirty;
    if (Array.isArray(patch.children) && patch.children.length > 0) {
      patch.children.forEach(patchChild => this._updateAll(patchChild, dirty));
    }

    return patch;
  }

  private _compare(before: PatchNode | null, after: PatchNode): PatchNode {
    if (before) {
      if (before.tagName !== after.tagName) {
        after.dirty = true;
      } else if (Object.keys(after.attributes).some(key => before.attributes[key] !== after.attributes[key])) {
        after.dirty = true;
      } else if (after.content !== before.content) {
        after.dirty = true;
      }
    } else {
      after.dirty = true;
    }

    if (after.children.length > 0) {
      after.children.some((afterChild, i) => {
        const beforeChild = before?.children[i] || null;
        this._compare(beforeChild, afterChild);
      });
    }

    return after;
  }

  private _commit(patchNode: PatchNode) {
    this._renderer.apply(patchNode);
    this._current?.off();
    this._current = this._workInProgress;
    this._current!.on('update', ({ key, task }) => this._update(key, task));
  }
}

export default Reconciler;
