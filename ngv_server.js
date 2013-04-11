/** CONFIG **/
var debug = true;
var log_level = 1; // 1: No, 3: verbose
var encoding = 'utf-8';
var public_html_path = 'public_html';
var http_port = 8000;
var host_ip = '127.0.0.1';

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
var Tiny = require('tiny');

/** DATA **/
var clients = {};
var db;

var poll_result = {
    male : 0,
    female : 0,
    ages : {'10':0, '20':0, '30':0, '40':0, '50':0, '60':0},
    marriage : {1:0, 2:0},
};

var pageChoices = {
};

var resultFileName = 'anna_result.txt';


fs.exists(resultFileName, function(exists) {
    if (!exists) {
        fs.writeFile(resultFileName, '{}', function (err) {
            if (err) throw err;
            console.log(resultFileName + ' is created');
        });
    }
    fs.readFile(resultFileName, function (err, data) {
        if (err) throw err;
        pageChoices = JSON.parse(data);
    });
});


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

/** MAIN **/
ngv_voting = function(con) {
    ngv_client_logger(con, 'connected ' + clients.length);
    con.on('close', do_nothing);
    con.on('vote', function(vote) {
        ngv_client_logger(con, vote);
        clients[con.id] = vote;
    });

    con.on('add_info', function(data) {
        if (data.gender == 'm') poll_result.male = poll_result.male + 1;
        else poll_result.female = poll_result.female + 1;

        if (data.marriage == 'true') poll_result.marriage[1] = poll_result.marriage[1] + 1;
        else poll_result.marriage[2] = poll_result.marriage[2] + 1;

        poll_result.ages[data.age] = poll_result.ages[data.age] + 1;

        ngv_client_logger(con, poll_result);
    });
    con.on('show_info_result', function() {
        con.emit('info_result', poll_result);
    });

    con.on('add_choice', function(data) {
        if (pageChoices[data.page] == null) pageChoices[data.page] = [];
        pageChoices[data.page].push(data);
        ngv_client_logger(con, data);
    // });
    // con.on('show_choice_result', function(data) {
        var choiceResult = [];
        var choiceTotalNumber = pageChoices[data.page].length;
        for (var i=0; i<choiceTotalNumber; i++) {
            if (pageChoices[data.page][i].choice == data.choice) {
                choiceResult.push(pageChoices[data.page][i]);
            }
        }
        con.emit('choice_result', {total: choiceTotalNumber, result: choiceResult});
        ngv_client_logger(con, 'total: ' + choiceTotalNumber);
    });

    con.on('save_anna_result', function() {
        fs.writeFile('anna_result.txt', JSON.stringify(pageChoices), function (err) {
            if (err) throw err;
            console.log('[Message]: anna_result.txt saved');
        });
    });
};

/** START SERVER **/
io = io.listen(http_server);
io.set('log level', log_level);
http_server.listen(http_port, host_ip);
console.log('[Message]: HTTP file server is running at http://'+host_ip+':'+http_port);

io.sockets.on('connection', ngv_voting);
io.sockets.on('error', ngv_error_logger);
io.sockets.on('disconnected', ngv_disconn_logger);

