var io = global.io = require('socket.io-client');
var fs = require('fs');
var Promise = global.Promise = require('promise');
var request = require('request');
var autostart;
if(process.argv[2] && process.argv[2] != "-") autostart = process.argv[2];

var consolemode = global.consolemode = {
	enabled: true,
	client_dir: __dirname
};

var do_url_request = function(url, callback) {
	request.get(url, function(err, response, data) {
		if(err)
			console.error("Failed to get "+url+" : "+err);
		else if(response.statusCode != 200)
			console.error("Failed to get "+url+" : RESPONSE CODE "+response.statusCode);
		else
			callback(data);
	});
};

var do_file_request = function(filename, callback) {
	var data = fs.readFileSync(consolemode.client_dir+"/SpaceBots/static"+filename).toString();
	callback(data);
};

global.include = function include(filename) {
	do_file_request("/"+filename, function(data) {
		data = data.replace("require('./vectors')", "include('vectors.js')");
		eval.call(global, data);
	});
};

global.include_url = function include_url(url) {
	do_url_request(url, function(data) {
		eval.call(global, data);
	});
};

global.include_local = function include_local(file) {
	var data = fs.readFileSync(consolemode.client_dir+"/"+file).toString();
	eval.call(global, data);
}

function fakeObject() {
	return { prototype: {} };
}

function fakeElement() {
	return { prototype: {},
		appendChild: function(a, b) {
			return fakeObject();
		},
		removeChild: function(elem) {
			return;
		},
		classList: {
			add: function(elem) {
				return;
			}
		},
		fadeOut: function() {
		},
		remove: function() {
		}
	};
}

var Element = global.Element = fakeObject();
var NodeList = global.NodeList = fakeObject();
var HTMLCollection = global.HTMLCollection = fakeObject();

var Audio = global.Audio = function(filename) {
	this.play = function() {
		return;
	};
	return;
};

var document = global.document = fakeObject();
document.getElementById = function(id)
{
	return fakeElement();
};
document.createElement = function(type)
{
	return fakeElement();
};
document.addEventListener = function(eventname, handler) {
	return;
};
document.querySelector = function(selector) {
	return fakeElement();
};
document.querySelectorAll = function(selector) {
	return [ fakeElement() ];
};
document.body = fakeElement();

var localStorage = global.localStorage = fakeObject();
localStorage.tutorial_finished = "true";

var explosions = global.explosions = []; // "Destruction & explosions" without "GUI" == problem ;)

include("vectors.js");
include("common.js");
include("resources.js");
do_file_request("/base.js", function(data) {
	data = data.replace("var script = document.createElement('script');", "// var script = document.createElement('script');");
	data = data.replace("if(title) script.title = title;", "// if(title) script.title = title;");
	data = data.replace("script.async = true;", "// script.async = true;");
	data = data.replace("script.src = data;", "// script.src = data;\ninclude_url(data);");
	data = data.replace("document.body.appendChild(script);", "// document.body.appendChild(script);");
	data = data.replace("document.body.removeChild(script);", "// document.body.removeChild(script);");
	eval.call(global, data);
});
include("base.js");
include("logging_in.js");
include("fail_handler.js");
include("important_objects.js");
include("avatar_list.js");
include("radio.js");
include("component_reporting.js");
include("destruction_explosions.js");
include("impulse_drive.js");
include("manipulator.js");
include("laboratory.js");
include("assembler.js");
include("user_sprites.js");
// do NOT include("gui.js");

if(autostart) {
	console.log("Loading autostart file \""+autostart+"\"...");
	include_local(autostart);
}

var exit = global.exit = function() {
	process.exit();
};

var nesh = require("nesh");
nesh.config.load();
nesh.start({
	prompt: '> ',
	useColors: true,
	historyFile: '.spacebots_client_history',
	historyMaxInputSize: 1024 * 1024,
}, function(err, repl) {
	if(err) {
		nesh.log.error(err);
		return;
	}

	repl.on('exit', function () {
		global.exit();
	});
});
