import * as TWEEN from '@tweenjs/tween.js';
const group = new TWEEN.Group();
const obj = {x: 0};
new TWEEN.Tween(obj, group).to({x: 100}, 50).start();
group.update(undefined);
console.log(obj.x);
