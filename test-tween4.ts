import * as TWEEN from '@tweenjs/tween.js';
const group = new TWEEN.Group();
const obj = {x: 0};
new TWEEN.Tween(obj, group).to({x: 100}, 50).start();
setTimeout(() => {
    group.update();
    console.log("after 25ms:", obj.x);
    setTimeout(() => {
        group.update();
        console.log("after 60ms:", obj.x);
    }, 35);
}, 25);
