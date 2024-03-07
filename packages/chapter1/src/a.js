function Worker (health) {
  this._health = health ?? 10;
}

function JuniorEngineer(health, intelligence) {
  this._super(health);
  this._intelligence = intelligence ?? 1;
  // 문제 A - 추가문제에 대한 해설
  // 히든 클래스 구조가 변화하지 않도록 만들어서 내부적으로 인스턴스가 재생성되는 부하를 줄입니다.
  this._isBornGenius = this._intelligence > 10;
}

// 문제 A에 대한 해설
// prototype 체이닝을 이용한 상속을 구현하는 방법입니다.
Worker.prototype.getHealth = function () {
  return this._health;
}

Worker.prototype.work = function () {
  this._health--;
}

// Object.create을 사용했는데, setPrototypeOf를 사용해도 되고 new 키워드를 사용해도 무방합니다. (new 키워드는 불필요한 처리가 추가로 들어가게 되겠지만요)
// 프로토타입 슬롯을 갖는 객체를 prototype에 할당함으로써 체이닝을 구성할 수 있다는 점만 이해하면 됩니다.
JuniorEngineer.prototype = Object.create(Worker.prototype, {});

JuniorEngineer.prototype._super = function (health) {
  // 부모 함수를 반영하기 위해 call 함수를 이용하고 있습니다.
  // 이 로직을 이해하기 위해서는 자바스크립트 함수의 동작과 this 바인딩 개념을 알아야 합니다.
  Worker.call(this, health);
}

JuniorEngineer.prototype.getIntelligence = function () {
  return this._intelligence;
}

JuniorEngineer.prototype.work = function () {
  // 만약 메서드 명이 달랐다면 this 키워드로 체이닝을 통해 바로 접근이 가능 했겠지만
  // 메서드 명이 같아서 아래와 같이 실행해줄 수 있습니다.
  Worker.prototype.work.call(this);
  this._intelligence++;
}

JuniorEngineer.prototype.isBornGenius = function () {
  return this._isBornGenius ?? false;
}
//-문제 A에 대한 해설

// function main() {
//   var startTime = performance.now();
//   for (var i = 0; i < 10000000; i++) {
//     new JuniorEngineer(10, Math.floor(Math.random() * 20)).isBornGenius();
//   }
//   var endTime = performance.now();
  
//   console.log(endTime - startTime);
// }

// main();

module.exports = {
  Worker,
  JuniorEngineer,
}
