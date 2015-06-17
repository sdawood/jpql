/**
 * Created by sdawood on 13/06/2015.

 REACTAZ (Resource Active Tags) or just call me "raz"
 ^
 10   Meet Reac Taz
 9
 8        ^   ^
 7       (@) (#)
 6          $
 5      <=-...+=>
 4
 3         ><
 2        DATA
 1        TAZ
 0 1 2 3 4 5 6 7 8 9 10 $*/
var Rx = require('rx/dist/rx.all');

// client -> subscribes to subject subscribed to all sources for node data concat, merge, flatMap are applied as needed guided gy the ast, results should be flatMapped before returned to client by all means

//client requires paths
//proxy provides subscriptions
//take(1)-proxy be default pulls one value from each proxy
//proxy optionally accepts callbacks (widget notifications) when new data is available
//there is an observable per node, .return, .concat, .merge, .take, ...etc of data from the node's source
//observables are combined together and flatMapLatest to form a sink proxy aggregating all node-proxies

// Every second
var source = Rx.Observable.interval(1000);

var subject = new Rx.Subject();

var subSource = source.subscribe(subject);

var subSubject1 = subject.subscribe(
  function (x) { console.log('Value published to observer #1: ' + x); },
  function (e) { console.log('onError: ' + e.message); },
  function () { console.log('onCompleted'); });

var subSubject2 = subject.subscribe(
  function (x) { console.log('Value published to observer #2: ' + x); },
  function (e) { console.log('onError: ' + e.message); },
  function () { console.log('onCompleted'); });

setTimeout(function () {
  // Clean up
  subject.onCompleted();
  subSubject1.dispose();
  subSubject2.dispose();
}, 5000);