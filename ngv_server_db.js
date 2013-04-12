/** CONFIG **/
var debug = true;
var log_level = 1; // 1: No, 3: verbose
var encoding = 'utf-8';
var public_html_path = 'public_html';
var http_port = 8000;
var host_ip = '127.0.0.1';
var dbFileName = 'votes.db';

if (process.argv.length > 2) {
    host_ip = process.argv[2];
}
if (process.argv.length > 3) {
    http_port = process.argv[3];
}

/** IMPORT MODULES **/
var http = require('http');
var io = require('socket.io');
var fs = require('fs');
var static = require('node-static');
var nStore = require('nstore');
nStore = nStore.extend(require('nstore/query')());

/** DATA **/
var clients = {};
var votes = null;

// var poll_result = {
//     male : 0,
//     female : 0,
//     ages : {'10':0, '20':0, '30':0, '40':0, '50':0, '60':0},
//     marriage : {1:0, 2:0},
// };

// var pageChoices = {
// };

// var resultFileName = 'anna_result.txt';

// fs.exists(resultFileName, function(exists) {
//     if (!exists) {
//         fs.writeFile(resultFileName, '{}', function (err) {
//             if (err) throw err;
//             console.log(resultFileName + ' is created');
//         });
//     }
//     fs.readFile(resultFileName, function (err, data) {
//         if (err) throw err;
//         pageChoices = JSON.parse(data);
//     });
// });


/** INIT SERVICES **/
var file = new(static.Server)(public_html_path);
var http_server = http.createServer(function(req, res) {
    req.addListener('end', function() {
        file.serve(req, res);
    });
});

/** LOGGERS & ETC **/
var do_nothing = function() {};

var ngv_error_logger = function() {
    console.log(Array.prototype.join.call(arguments, ", "));
};

var ngv_disconn_logger = function(con) {
    if (debug) {
        console.log('[Message]: '+con.id+' disconnected');
    }
};

var ngv_client_logger = function(con, data) {
    if (debug) {
        console.log("[Client:"+con.id+"]");
        console.log(data);
    }
};

var objectCount = function(object) {
    if (object && typeof(object) == 'object') {
        return Object.keys(object).length;
    } else {
        return -1;
    }
}

/** MAIN **/
ngv_voting = function(con) {
    ngv_client_logger(con, 'connected ');
    con.on('close', do_nothing);
    con.on('vote', function(vote) {
        ngv_client_logger(con, vote);
        clients[con.id] = vote;
    });

    con.on('add_info', function(data) {
    });

    con.on('show_info_result', function() {
        // con.emit('info_result', poll_result);
    });

    con.on('add_choice', function(data) {
        votes.save(null, data, function(err, key) {
            if (err) ngv_client_logger(con, 'error in add_choice: ' + err);
            // votes.find({page: data.page}, function(err, results) { // {{{

            //     if (err) { 
            //         ngv_client_logger(con, 'error in find votes ' + err);
            //         return;
            //     } else {
            //         var totalNumberForPage = objectCount(results);
            //         var sameChoiceNumber = 0;
            //         var sameChoiceMaleNumber = 0;
            //         var sameChoiceFemaleNumber = 0;
            //         var age10 = 0;
            //         var age20 = 0;
            //         var age30 = 0;
            //         var age40 = 0;
            //         var age50 = 0;

            //         for (key in results) {
            //             if (results[key].choice == data.choice) {
            //                 sameChoiceNumber++;

            //                 if (results[key].gender == 'm') {
            //                     sameChoiceMaleNumber++;
            //                 }

            //                 if (results[key].age == '10') age10++;
            //                 if (results[key].age == '20') age20++;
            //                 if (results[key].age == '30') age30++;
            //                 if (results[key].age == '40') age40++;
            //                 if (results[key].age == '50') age50++;
            //             }
            //             
            //         }

            //         var choiceResultData = {
            //             total: totalNumberForPage,
            //             sameChoice: sameChoiceNumber,
            //             sameChoiceMale: sameChoiceMaleNumber,
            //             sameChoiceFemale: sameChoiceNumber - sameChoiceMaleNumber,
            //             ages: {
            //                 10: age10,
            //                 20: age20,
            //                 30: age30,
            //                 40: age40,
            //                 50: age50,
            //             },
            //         };
            //         con.emit('choice_result', choiceResultData);
            //         ngv_client_logger(con, 'total: ' + totalNumberForPage + ' for page: ' + data.page);
            //     }
            // }); //vote_find end }}}
        }); //vote_save end
    });

    con.on('show_choice_result', function(data) {
            votes.find({page: data.page}, function(err, results) { // {{{

                if (err) { 
                    ngv_client_logger(con, 'error in find votes ' + err);
                    return;
                } else {
                    var totalNumberForPage = objectCount(results);
                    var sameChoiceNumber = 0;
                    var sameChoiceMaleNumber = 0;
                    var sameChoiceFemaleNumber = 0;
                    var age10 = 0;
                    var age20 = 0;
                    var age30 = 0;
                    var age40 = 0;
                    var age50 = 0;

                    for (key in results) {
                        if (results[key].choice == data.choice) {
                            sameChoiceNumber++;

                            if (results[key].gender == 'm') {
                                sameChoiceMaleNumber++;
                            }

                            if (results[key].age == '10') age10++;
                            if (results[key].age == '20') age20++;
                            if (results[key].age == '30') age30++;
                            if (results[key].age == '40') age40++;
                            if (results[key].age == '50') age50++;
                        }
                        
                    }

                    var choiceResultData = {
                        total: totalNumberForPage,
                        sameChoice: sameChoiceNumber,
                        sameChoiceMale: sameChoiceMaleNumber,
                        sameChoiceFemale: sameChoiceNumber - sameChoiceMaleNumber,
                        ages: {
                            10: age10,
                            20: age20,
                            30: age30,
                            40: age40,
                            50: age50,
                        },
                    };
                    con.emit('choice_result', choiceResultData);
                    ngv_client_logger(con, 'total: ' + totalNumberForPage + ' for page: ' + data.page);
                }
            }); //vote_find end }}}
    });

    con.on('save_anna_result', function() {
        console.log('[Message]: nothing happend.. ');
    });
};

/** START SERVER **/
io = io.listen(http_server);
io.set('log level', log_level);

votes = nStore.new(dbFileName, function() {
    console.log('[Message]: DB initialized - ' + dbFileName);
    http_server.listen(http_port, host_ip);
    console.log('[Message]: HTTP file server is running at http://'+host_ip+':'+http_port);

    io.sockets.on('connection', ngv_voting);
    io.sockets.on('error', ngv_error_logger);
    io.sockets.on('disconnected', ngv_disconn_logger);
});
