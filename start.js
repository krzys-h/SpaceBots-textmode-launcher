var io = global.io = require('socket.io-client');
var fs = require('fs');
var request = require('request');
var server = "https://amt2013.pl";
if(process.argv[2]) server = process.argv[2];
var autostart;
if(process.argv[3]) autostart = process.argv[3];

global.consolemode = {
	enabled: true,
	server: server
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

var do_request = function(filename, callback) {
	if(filename[0] == "/")
		do_url_request(server+"/"+filename, callback);
	else
		do_url_request(filename, callback);
};

global.include = function include(filename) {
	do_request("/"+filename, function(data) {
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
	fs.readFile(file, function(err, data) {
		if(err) {
			console.log(err);
		} else {
			eval.call(global, data.toString());
		}
	});
};

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

var XMLHttpRequest = global.XMLHttpRequest = function() {
	this.open = function(mode, path)
	{
		this.mode = mode;
		this.path = path;
	};
	this.onreadystatechange = undefined;
	this.readyState = 4;
	var rootObject = this;
	this.send = function()
	{
		do_request(this.path, function(data) {
			data = data.replace("io.connect()", "io.connect(\""+server+"\")");
			data = data.replace("log_in();", "// log_in();");
			rootObject.responseText = data;
			rootObject.onreadystatechange();

			if(rootObject.path == "/user_sprites.js") {
				global.log_in.call(global);
				if(autostart) include_local(autostart);
			}
		});
	};
	return this;
};

var localStorage = global.localStorage = fakeObject();
localStorage.tutorial_finished = "true";

var explosions = global.explosions = []; // "Destruction & explosions" without "GUI" == problem ;)

include("common.js");
include("resources.js");
do_request("/base.js", function(data) {
	data = data.replace("var script = document.createElement('script');", "// var script = document.createElement('script');");
	data = data.replace("if(title) script.title = title;", "// if(title) script.title = title;");
	data = data.replace("script.async = true;", "// script.async = true;");
	data = data.replace("script.src = data;", "// script.src = data;\ninclude_url(data);");
	data = data.replace("script.textContent = 'try {' + data + '} catch(e) { console.error(e); }';", "// script.textContent = 'try {' + data + '} catch(e) { console.error(e); }';\n(function() { eval.apply(this.global, arguments); }('try {' + data + '} catch(e) { console.error(e); }'));");
	data = data.replace("document.body.appendChild(script);", "// document.body.appendChild(script);");
	data = data.replace("document.body.removeChild(script);", "// document.body.removeChild(script);");
	data = data.replace("\"Graphical tutorial\": \"/graphical_tutorial.js\",", "// \"Graphical tutorial\": \"/graphical_tutorial.js\",");
	data = data.replace("\"GUI\": \"/gui.js\"", "// \"GUI\": \"/gui.js\"");
	eval.call(global, data);
});

global.exit = function() {
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
		process.exit();
	});
});
