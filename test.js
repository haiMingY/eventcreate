const EventListener = require('./index');

function test(a) {
  console.log(a);
}
EventListener.on('test', test);
EventListener.on('test', test);
EventListener.emit('test', 1);

EventListener.emit('before', 'before');
EventListener.emit('after', 'after');
function before(str) {
  console.log('-------str', str);
}
setTimeout(() => {
  EventListener.on('before', before);
}, 5000);
setTimeout(() => {
  EventListener.on('after', before);
}, 8000);

function once(once) {
  console.log(once);
}

EventListener.once('once', once);
EventListener.emit('once', 1);
EventListener.emit('once', 2);
