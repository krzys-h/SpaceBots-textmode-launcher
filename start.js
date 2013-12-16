var fs = global.fs = require('fs');
var io = global.io = require('socket.io-client');
global.include = function include(filename) {
	fs.readFile(filename, "utf8", function(err, data) {
		if(err) {
			return;
		} else {
			data = data.replace("require('./vectors')", "include('vectors.js')");
			eval.call(global, data);
		}
	});
}

global.include_url = function include_url(url) {
	console.error("TODO: include_url(\""+url+"\")");
}

function fakeObject() {
	return { prototype: {} };
}

function fakeElement() {
	return { prototype: {},
		appendChild: function(a, b) {
			return fakeObject();
		},
		classList: {
			add: function(elem) {
				return;
			}
		},
		fadeOut: function() {
		}
	};
}

var Element = global.Element = fakeObject();
var NodeList = global.NodeList = fakeObject();
var HTMLCollection = global.HTMLCollection = fakeObject();

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
document.querySelectorAll = function(selector) {
	return [];
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
		fs.readFile(__dirname + this.path, "utf8", function(err, data) {
			if(err) {
				return;
			} else {
				data = data.replace("io.connect()", "io.connect(\"https://amt2013.pl\")");
				rootObject.responseText = data;
				rootObject.onreadystatechange();
			}
		});
	};
	return this;
};

var localStorage = global.localStorage = fakeObject();
localStorage.tutorial_finished = "true";

include("common.js");
include("resources.js");
fs.readFile("base.js", "utf8", function(err, data) {
	if(err) {
		return;
	} else {
		data = data.replace("var script = document.createElement('script');", "// var script = document.createElement('script');");
		data = data.replace("if(title) script.title = title;", "// if(title) script.title = title;");
		data = data.replace("script.async = true;", "// script.async = true;");
		data = data.replace("script.src = data;", "// script.src = data;\ninclude_url(data);");
		data = data.replace("script.textContent = 'try {' + data + '} catch(e) { console.error(e); }';", "// script.textContent = 'try {' + data + '} catch(e) { console.error(e); }';\n(function() { eval.apply(this.global, arguments); }('try {' + data + '} catch(e) { console.error(e); }'));");
		data = data.replace("document.body.appendChild(script);", "// document.body.appendChild(script);");
		data = data.replace("document.body.removeChild(script);", "// document.body.removeChild(script);");

		data = data.replace("\"Graphical tutorial\": \"/graphical_tutorial.js\",", "// \"Graphical tutorial\": \"/graphical_tutorial.js\",");
		data = data.replace("\"GUI\": \"/gui.js\"", "// \"GUI\": \"/gui.js\"");

		eval(data);
	}
});

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
