"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var URL = require("url");
var Promise = require("bluebird");
var Spider = require("node-spider");
var remove_hash_1 = require("./remove-hash");
var valid_protocol_1 = require("./valid-protocol");
var merge_pathname_1 = require("./merge-pathname");
var is_absolute_url_1 = require("./is-absolute-url");
var check_shorthand_url_1 = require("./check-shorthand-url");
var has_invalid_extension_1 = require("./has-invalid-extension");
var paths = [];
var checked = [];
function handleRequest(spider, doc, domain) {
    doc.$('a[href]').each(function (i, elem) {
        var href = doc.$(this).attr('href');
        href = remove_hash_1.default(href);
        if (!valid_protocol_1.default(href) || checked.indexOf(href) !== -1 || has_invalid_extension_1.default(href)) {
            return true;
        }
        checked.push(href);
        if (is_absolute_url_1.default(domain, href)) {
            var url = check_shorthand_url_1.default(href);
            href = url.pathname;
            href = href.replace(/^(\/)/, '');
            var next = URL.format(url);
        }
        else {
            if (/^(https?\:\/\/)/.test(href)) {
                return true;
            }
            href = href.replace(/^(\/)/, '');
            var next = merge_pathname_1.default(domain, href);
        }
        if (paths.indexOf(href) !== -1) {
            return true;
        }
        paths.push(href);
        spider.queue(next, function (doc) { return handleRequest(spider, doc, domain); });
    });
}
function crawl(environments) {
    var url = environments[Object.keys(environments)[0]];
    var domain = URL.parse(url);
    return new Promise(function (resolve, reject) {
        var spider = new Spider({
            concurrent: 5,
            error: function (error, url) { return reject(error); },
            done: function () { return resolve(paths); },
            headers: {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
            },
        });
        spider.queue(URL.format(domain), function (doc) { return handleRequest(spider, doc, domain); });
    });
}
handleRequest;
exports.default = crawl;
//# sourceMappingURL=crawl.js.map