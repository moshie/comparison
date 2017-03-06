"use strict";
var webpage = require("webpage");
var system = require("system");
var fs = require("fs");
var is_json_1 = require("./is-json");
var sanitize_path_1 = require("./sanitize-path");
var page = webpage.create();
console.error = function (error) {
    system.stderr.write(error + '\n');
};
var pathsFilepath = system.args[1] || '';
var domain = system.args[2] || '';
var environment = system.args[3] || '';
if (!environment) {
    console.error('Please specify a environment!');
    phantom.exit();
}
if (!domain) {
    console.error('Please specify a domain!');
    phantom.exit();
}
if (!pathsFilepath) {
    console.error('Please specify a filepath to paths!');
    phantom.exit();
}
var rawPaths = fs.read(pathsFilepath);
if (!rawPaths) {
    console.error('No content found inside ' + pathsFilepath);
    phantom.exit();
}
var paths;
if (is_json_1.default(rawPaths)) {
    paths = JSON.parse(rawPaths);
}
else {
    console.error('Parsing JSON Failed!');
    phantom.exit();
}
if (!Array.isArray(paths)) {
    console.error('paths content must be a type of [Object array]');
}
var page_width = 1600;
var page_height = 1800;
page.viewportSize = { width: page_width, height: page_height };
page.clipRect = { top: 0, left: 0, width: page_width, height: page_height };
page.onError = function (messageStack, trace) { };
var pathCollection = [];
var count = 0;
function handlePage() {
    var url = domain + paths[count];
    console.log(url);
    page.open(url, function (status) {
        if (status !== 'success') {
            console.error('Failed loading: ' + url);
            nextPage();
        }
        var id = sanitize_path_1.default(paths[count]);
        var output = "screenshots/" + environment + "/" + id + "_" + page_width + "x" + page_height + ".png";
        page.render(output);
        pathCollection.push(output);
        count++;
        nextPage();
    });
}
function nextPage() {
    if (typeof paths[count] === 'undefined') {
        console.log(JSON.stringify(pathCollection));
        phantom.exit();
    }
    handlePage();
}
nextPage();
//# sourceMappingURL=screenshot.phantomjs.js.map