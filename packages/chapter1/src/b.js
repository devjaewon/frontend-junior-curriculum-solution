class HardWork {
  constructor() {
    this._result = 0;
    this._tasks = this._initTasks();
  }

  do() {
    const taskBundleSize = 100;
    const taskBundleCount = Math.ceil(this._tasks.length / taskBundleSize);

    // 비동기로 여러 작업을 분할한다음 순서를 보장하기 위해서
    // Promise chain을 사용합니다.
    let taskChain = Promise.resolve(0);
    for (let i = 0; i < taskBundleCount; i++) {
      taskChain = taskChain.then(next => this._do(next, next + taskBundleSize));
    }

    return taskChain;
  }

  _do(start, end) {
    console.log(start, end);
    const tasks = this._tasks.slice(start, end);

    for (let i = 0; i < tasks.length; i++) {
      tasks[i]();
    }

    // 비동기로 작업을 분할하고 순서를 보장한다고 Promise만 사용한다면
    // 우선순위가 높은 microTaskQueue를 계속 점유하기 때문에 병목이 해결되지 않습니다.
    // setTimeout을 통해 중간에 macroQueue로 작업을 한번 빼줘야 합니다.
    return new Promise(resolve => {
      setTimeout(() => resolve(end), 0);
    });
  }

  get result() {
    return this._result;
  }

  _initTasks() {
    const count = 30000;
    const tasks = new Array(count);

    for (let i = 0; i < count; i++) {
      tasks[i] = this._createTask(Math.floor(Math.random() * 3) + 1);
    }

    return tasks;
  }

  _createTask = (n) => () => {
    for (let i = 0; i < 1000; i++) {
      const randnum = Math.random();
      const alpha = Math.floor(randnum * 10) % n;
      
      if (alpha > 0) {
        this._result += alpha;
      }
    }

    this._sendLog();
  }

  async _sendLog() {
    const blob = new Blob([JSON.stringify({
      value: this._result.toFixed(2),
    }, null, 2)], {
      type: "application/json",
    });

    const res = await blob.text();
    JSON.parse(res);
  }
}

class Dashboard {
  constructor(work) {
    this._indicatorElement = document.getElementById('indicator');
    this._descriptionElement = document.getElementById('desc');
    this._startTimestamp = 0;
    this._work = work;
  }

  start() {
    this._startTimestamp = Date.now();
    requestAnimationFrame(this._render);
  }

  _render = () => {
    const timestamp = Date.now();
    const percent = (((timestamp - this._startTimestamp) * 5) % 10000) / 100;

    this._indicatorElement.style.setProperty('width', `${percent}%`);
    this._descriptionElement.innerHTML = `업무량: ${this._work.result}`;

    requestAnimationFrame(this._render);
  }
}

async function main () {
  const hardWork = new HardWork();
  const dashboard = new Dashboard(hardWork);

  dashboard.start();
  document.getElementById('btn').addEventListener('click', () => {
    hardWork.do();
  });
}

main();
