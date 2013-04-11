if (process.argv.length > 2) {
    option = process.argv[2];
} else {
    option = 0;
}

var nStore = require('nstore');
nStore = nStore.extend(require('nstore/query')());
var votes = nStore.new('vote.db', function() {
    if (option == 0) {
        console.log('db set start');
        for (var i=0; i<30000; i=i+1) {
            var data = {
                time: Date.now(),
                gender: Math.random(1) > 0.5 ? 'm' : 'f',
                choice: Math.random(1) > 0.7 ? 1 : 0,
                subject: Math.round(Math.random()*10),
                page: Math.round(Math.random()*14),
            };
            votes.save(null, data, function(err, key) { if (err) console.log(err);});
        }
        console.log('db set end');
    }

    if (option == 1) {
        console.log('start query1');
        votes.find([{gender: 'm'}, {gender: 'f'}], function(err, results) {
            console.log('total : ' + Object.keys(results).length);
        });

        console.log('start query2');
        votes.find({page: 5, choice: 0}, function(err, results) {
            console.log('page5&choice0 : ' + Object.keys(results).length);
        });

        console.log('start query3');
        votes.find({page: 1, choice: 1}, function(err, results) {
            console.log('page1&choice1 : ' + Object.keys(results).length);
        });

    }
});
