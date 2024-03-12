import EventBus from "@kjojs/eventbus";
import { Fiber } from "./react/Fiber";
import { ScheduleType } from "../constants/ReactType";
import { FiberRoot } from "./react/FiberRoot";
import { FiberEffect } from "./react/FiberEffect";
import fiberTransition from "./react/FiberTransition";

enum ScheduleTaskType {
  Urgent,
  UrgentPending,
  Transition,
}

interface ScheduleTask {
  taskType: ScheduleTaskType;
  root: FiberRoot;
  cursor: Fiber;
  effectMap: Record<string, Array<FiberEffect>>;
  transitionKey: string | null;
  timer: NodeJS.Timeout | null;
  timeTick: number;
}

class Scheduler extends EventBus<{ renderComplete: FiberRoot }> {
  static instance = new Scheduler();

  private _queue: Array<ScheduleTask> = [];
  private _current: ScheduleTask | null = null;

  schedule(
    fiberRoot: FiberRoot,
    effects: FiberEffect[],
    transitionKey: string | null,
  ) {
    const effectMap = effects.reduce((map, effect) => {
      map[effect.key] = map[effect.key] || [];
      map[effect.key].push(effect);

      return map;
    }, {} as Record<string, Array<FiberEffect>>);

    const task: ScheduleTask = {
      taskType: transitionKey ? ScheduleTaskType.Transition : ScheduleTaskType.Urgent,
      root: fiberRoot,
      cursor: fiberRoot.current,
      transitionKey,
      effectMap,
      timeTick: 0,
      timer: null,
    };

    this._abortIfTransitionTaskExist();
    if (task.transitionKey) {
      this._enqueueTransition(task);
    } else {
      this._enqueueTask(task);
    }
  }

  private _enqueueTask(task: ScheduleTask) {
    if (!this._current) {
      this._current = task;
      this._workAsync(10);
      return;
    }
    
    this._queue.push(task);
  }

  private _enqueueTransition(task: ScheduleTask) {
    if (!task.transitionKey) {
      throw new Error('알수없는 오류');
    }
    const pendingRoot = task.root.copy();
    const pendingTask: ScheduleTask = {
      taskType: ScheduleTaskType.UrgentPending,
      root: pendingRoot,
      cursor: pendingRoot.current,
      effectMap: {},
      transitionKey: task.transitionKey,
      timer: null,
      timeTick: 0,
    };

    this._enqueueTask(pendingTask);
    this._enqueueTask({
      ...task,
      taskType: ScheduleTaskType.Transition,
      transitionKey: null,
    });
  }

  private _workAsync(delay: number) {
    if (!this._current) {
      return;
    }
    if (this._current.timer) {
      clearTimeout(this._current.timer);
    }

    this._current.timer = setTimeout(() => {
      this._work();
    }, delay);
  }

  private _work() {
    if (!this._current) {
      this._current = this._queue.shift() || null;
      if (this._current) {
        this._work();
      }
      return;
    }

    const {
      taskType,
      cursor,
      root,
      effectMap,
      transitionKey,
    } = this._current;

    effectMap[cursor.key]?.forEach(effect => {
      effect.task(cursor);
    });

    if (taskType === ScheduleTaskType.UrgentPending) {
      fiberTransition.isTransitionPending = true;
      if (cursor.key === transitionKey) {
        cursor.render();
      }
      fiberTransition.isTransitionPending = false;
    } else {
      cursor.render();
    }

    const nextFiber = cursor.next();
    if (!nextFiber) {
      this.emit('renderComplete', root);

      this._current = this._queue.shift() || null;
      if (this._current) {
        this._workAsync(10);
      }
      return;
    }

    let asyncTask = false;
    const now = performance.now();
    if (this._current.timeTick === 0) {
      this._current.timeTick = now;
    } else if (now - this._current.timeTick > 50) {
      asyncTask = true
    }

    this._current.cursor = nextFiber;
    if (asyncTask) {
      this._workAsync(0);
    } else {
      this._work();
    }
  }

  private _abortIfTransitionTaskExist() {
    while (this._current && this._current.taskType !== ScheduleTaskType.Urgent) {
      this._abortCurrent();
      this._current = this._queue.shift() || null;
    }
  }

  private _abortCurrent() {
    if (!this._current) {
      return;
    }

    if (this._current.timer) {
      clearTimeout(this._current.timer);
    }
    this._current = null;
  }
}

export default Scheduler;
