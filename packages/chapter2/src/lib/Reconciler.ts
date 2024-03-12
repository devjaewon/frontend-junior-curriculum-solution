import { Fiber } from "./react/Fiber";
import Scheduler from "./Scheduler";
import { ReactComponent } from "./react/ReactElement";
import { PatchNode } from "./react/PatchNode";
import { FiberRoot } from "./react/FiberRoot";
import Renderer from "./Renderer";
import { FiberEffect } from "./react/FiberEffect";

// 참고 소스코드
// Reconciler 주요 동작
// : https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberReconciler.js
// Fiber 스케줄링 동작
// : https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js#L744
class Reconciler {
  private _current: FiberRoot | null = null;

  constructor(
    private _scheduler: Scheduler,
    private _renderer: Renderer,
  ) {
    this._scheduler.on('renderComplete', (workInProgress) => {
      this._commit(workInProgress, this._diff(workInProgress));
    });
  }

  mount(component: ReactComponent) {
    const workInProgress = new FiberRoot(Fiber.createRoot(component));

    this._scheduler.schedule(
      workInProgress,
      [],
      null,
    );
  }

  private _setState(
    effect: FiberEffect,
    transitionKey: string | null,
  ) {
    if (!this._current) {
      throw new Error('assert');
    }

    const workInProgress = this._current.copy();

    workInProgress.setCurrent(effect.key);
    this._scheduler.schedule(
      workInProgress,
      [effect],
      transitionKey,
    );
  }

  private _diff(workInProgress: FiberRoot): PatchNode {
    return this._compare(
      this._current?.patchNode || null,
      workInProgress.patchNode,
    );
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

  private _commit(workInProgress: FiberRoot, patchNode: PatchNode) {
    this._renderer.apply(patchNode);
    // this._current?.off(); // event system 을 분리하지 않아서 우선은 메모리 누수 놔둔 상태입니다.
    this._current = workInProgress;
    this._current.callAfterCommit();
    this._current!.on('setState', ({ effect, transitonKey }) => {
      this._setState(effect, transitonKey);
    });
  }
}

export default Reconciler;
