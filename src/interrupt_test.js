/* jshint asi: false */
import can from 'can';
import './can-interrupt';
import 'steal-qunit';
import 'can/map/define/';

var Recipe = can.Map.extend({});

asyncTest('changes don\'t set when cancelled - remove', function () {
    var recipe = new Recipe({
        name: 'cheese',
        level: 'hard',
        type: 'dairy'
    });

    recipe.bind("changing", function (event) {
        var mapProperty = event.args[0];
        if (mapProperty === 'name') {
            event.cancel();
            start();
        }
    });

    can.transaction.start();
    recipe.attr('level', 'easy');
    recipe.removeAttr('name');
    recipe.attr('type', 'cream');
    can.transaction.stop();

    equal(recipe.attr('name'), 'cheese', 'Property NOT SET');
    equal(recipe.attr('level'), 'hard', 'Property NOT SET');
    equal(recipe.attr('type'), 'dairy', 'Property NOT SET');

});

asyncTest('changes set on resume - remove', function () {
    var recipe = new Recipe({
        cups: 10,
        flour: true,
        salt: 'kosher'
    });

    recipe.bind("changing", function (event) {
        var mapProperty = event.args[0];
        if (mapProperty === 'flour') {
            event.resume();
            start();
        }
    });

    can.transaction.start();
    recipe.attr('cups', 235);
    recipe.removeAttr('flour');
    recipe.attr('salt', 'sea');
    can.transaction.stop();

    equal(recipe.attr('cups'), 235, 'Property SET');
    equal(recipe.attr('flour'), undefined, 'Property SET');
    equal(recipe.attr('salt'), 'sea', 'Property SET');

});

asyncTest('pause', function () {
    var recipe = new Recipe({
        name: 'cheese',
        level: 'hard',
        type: 'dairy'
    });

    recipe.bind("changing", function (event) {
        var mapProperty = event.args[0];
        if (mapProperty === 'name') {
            event.pause(function(){
                event.cancel();
                start();
            });
        }
    });

    can.transaction.start();
    recipe.attr('level', 'easy');
    recipe.removeAttr('name');
    recipe.attr('type', 'cream');
    can.transaction.stop();

    equal(recipe.attr('name'), 'cheese', 'Property NOT SET');
    equal(recipe.attr('level'), 'hard', 'Property NOT SET');
    equal(recipe.attr('type'), 'dairy', 'Property NOT SET');

});

asyncTest('changes don\'t set when cancelled - change', function () {
    var recipe = new Recipe({
        name: 'cheese',
        level: 'hard',
        type: 'dairy'
    });

    recipe.bind("changing", function (event) {
        var mapProperty = event.args[1];
        if (mapProperty === 'name') {
            event.cancel();
            start();
        }
    });

    can.transaction.start();
    recipe.attr('level', 'easy');
    recipe.attr('name', 'blah');
    recipe.attr('type', 'cream');
    can.transaction.stop();

    equal(recipe.attr('name'), 'cheese', 'Property NOT SET');
    equal(recipe.attr('level'), 'hard', 'Property NOT SET');
    equal(recipe.attr('type'), 'dairy', 'Property NOT SET');

});

asyncTest('changes set on resume - change', function () {
    var recipe = new Recipe({
        cups: 10,
        flour: true,
        salt: 'kosher'
    });

    recipe.bind("changing", function (event) {
        var mapProperty = event.args[1];
        if (mapProperty === 'flour') {
            event.resume();
            start();
        }
    });

    can.transaction.start();
    recipe.attr('cups', 235);
    recipe.attr('flour', 'true');
    recipe.attr('salt', 'sea');
    can.transaction.stop();

    equal(recipe.attr('cups'), 235, 'Property SET');
    equal(recipe.attr('flour'), 'true', 'Property SET');
    equal(recipe.attr('salt'), 'sea', 'Property SET');

});

test('changes set without interrupt', function () {

    var recipe = new Recipe({
        cups: 10,
        flour: true,
        salt: 'kosher'
    });

    can.transaction.start();
    recipe.attr('cups', 235);
    recipe.attr('flour', false);
    recipe.attr('salt', 'sea');
    can.transaction.stop();

    equal(recipe.attr('cups'), 235, 'Property SET');
    equal(recipe.attr('flour'), false, 'Property SET');
    equal(recipe.attr('salt'), 'sea', 'Property SET');

});

if(can.route.batch) {
    asyncTest('can.route can be interrupted', function() {

        var AppState = can.Map.extend({
            define: {
                flour: {
                    value: "true",
                    serialize: false
                }
            }
        });
        var appState = new AppState();

        can.route.map(appState);
        can.route.bind("changing", function(event){
            var mapProperty = event.args[1];
            if (mapProperty === 'flour') {
                event.cancel();
                start();
            }
        });
        can.route(':flour');
        can.route.ready();

        location.hash = "#!flour=false";

        equal(can.route.attr('flour'), "true", 'Property NOT SET');

    });
}
