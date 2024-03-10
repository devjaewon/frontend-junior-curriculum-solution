import { Fiber } from "./react/Fiber";
import Scheduler from "./Scheduler";
import { ReactComponent, ReactElement } from "./react/ReactElement";
import { PatchNode } from "./react/PatchNode";
import { FiberRoot } from "./react/FiberRoot";
import Renderer from "./Renderer";

// 참고 소스코드
// Reconciler 주요 동작
// : https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberReconciler.js
// Fiber 스케줄링 동작
// : https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js#L744
class Reconciler {
  static cursor: Fiber | null = null;
  static stateIndex: number = -1;

  private _current: FiberRoot | null = null;
  private _workInProgress: FiberRoot | null = null;

  constructor(
    private _scheduler: Scheduler,
    private _renderer: Renderer,
  ) {
    this._scheduler.on('renderComplete', () => {
      console.log('render complete');
      const patchNode = this._diff();
      this._renderer.apply(patchNode);
      this._current = this._workInProgress;
    });
  }

  mount(component: ReactComponent) {
    this._workInProgress = new FiberRoot(component);
    this._scheduler.schedule(this._workInProgress);
  }

  private _diff(): PatchNode {
    return this._workInProgress!.patchNode;
  }
}

export default Reconciler;
