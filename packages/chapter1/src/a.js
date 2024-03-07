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

JuniorEngineer.prototype = Object.create(Worker.prototype, {});

JuniorEngineer.prototype._super = function (health) {
  Worker.call(this, health);
}

JuniorEngineer.prototype.getIntelligence = function () {
  return this._intelligence;
}

JuniorEngineer.prototype.work = function () {
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
