#!/usr/bin/env node
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

require("babel/polyfill");

var _ramda = require("ramda");

var r = _interopRequireWildcard(_ramda);

var _awsSdk = require("aws-sdk");

var AWS = _interopRequireWildcard(_awsSdk);

var _uuid = require("uuid");

var uuid = _interopRequireWildcard(_uuid);

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

_commander2["default"].option("-a, --app [app]", "Application (web, api, etc)").option("-e, --env [env]", "Environment (production, staging, etc)").parse(process.argv);

if (!_commander2["default"].app) throw new Error("--app required");
if (!_commander2["default"].env) throw new Error("--env required");

var s3 = _bluebird2["default"].promisifyAll(new AWS.S3());
var elb = _bluebird2["default"].promisifyAll(new AWS.ELB());
var route53 = _bluebird2["default"].promisifyAll(new AWS.Route53());
var domains = _bluebird2["default"].promisifyAll(new AWS.Route53Domains());
var app = _commander2["default"].app;
var env = _commander2["default"].env;
var bucket = "intelos";
var dir = "deploy";
var bucket = "intelos";
var prefix = "deploy-db";
var key = "" + prefix + "/" + app + "-" + env + ".json";

var dbExists = function dbExists(s3, bucket, prefix, key) {
    var params, data, keys;
    return regeneratorRuntime.async(function dbExists$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                params = { Bucket: bucket, Prefix: prefix };
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(s3.listObjectsAsync(params));

            case 4:
                data = context$1$0.sent;
                keys = r.map(r.prop("Key"), data.Contents);
                return context$1$0.abrupt("return", r.find(r.equals(key), keys) !== undefined);

            case 9:
                context$1$0.prev = 9;
                context$1$0.t0 = context$1$0["catch"](0);

                console.log(context$1$0.t0.stack);
                throw context$1$0.t0;

            case 13:
            case "end":
                return context$1$0.stop();
        }
    }, null, this, [[0, 9]]);
};

var createEnvDB = function createEnvDB(s3, bucket, prefix, key) {
    var json;
    return regeneratorRuntime.async(function createEnvDB$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(dbExists(s3, bucket, prefix, key));

            case 3:
                if (context$1$0.sent) {
                    context$1$0.next = 10;
                    break;
                }

                json = "{\"current\": \"\", \"history\": []}";
                context$1$0.next = 7;
                return regeneratorRuntime.awrap(s3.putObjectAsync({ Bucket: bucket, Key: key, Body: json }));

            case 7:
                console.log("Created new environment database for " + app + "-" + env);
                context$1$0.next = 11;
                break;

            case 10:
                console.log("s3://" + bucket + "/" + prefix + "/" + key + " already exists!");

            case 11:
                context$1$0.next = 17;
                break;

            case 13:
                context$1$0.prev = 13;
                context$1$0.t0 = context$1$0["catch"](0);

                console.log(context$1$0.t0.stack);
                throw context$1$0.t0;

            case 17:
            case "end":
                return context$1$0.stop();
        }
    }, null, this, [[0, 13]]);
};

var domainExists = function domainExists(route53, domain) {
    var data, domains;
    return regeneratorRuntime.async(function domainExists$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(route53.listHostedZonesAsync());

            case 3:
                data = context$1$0.sent;
                domains = r.map(r.prop("Name"), data.HostedZones);
                return context$1$0.abrupt("return", r.find(r.equals("" + domain + "."), domains) !== undefined);

            case 8:
                context$1$0.prev = 8;
                context$1$0.t0 = context$1$0["catch"](0);

                console.log(context$1$0.t0.stack);
                throw context$1$0.t0;

            case 12:
            case "end":
                return context$1$0.stop();
        }
    }, null, this, [[0, 8]]);
};

var createSubDomain = function createSubDomain(route53, parentDomain, env) {
    var domain;
    return regeneratorRuntime.async(function createSubDomain$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                domain = "" + env + "." + parentDomain;
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(domainExists(route53, domain));

            case 4:
                if (context$1$0.sent) {
                    context$1$0.next = 9;
                    break;
                }

                context$1$0.next = 7;
                return regeneratorRuntime.awrap(route53.createHostedZoneAsync({
                    CallerReference: uuid.v1(),
                    Name: domain
                }));

            case 7:
                context$1$0.next = 10;
                break;

            case 9:
                console.log("domain " + domain + " already exists!");

            case 10:
                context$1$0.next = 16;
                break;

            case 12:
                context$1$0.prev = 12;
                context$1$0.t0 = context$1$0["catch"](0);

                console.trace(context$1$0.t0);
                throw context$1$0.t0;

            case 16:
            case "end":
                return context$1$0.stop();
        }
    }, null, this, [[0, 12]]);
};

var createELB = function createELB(elb, app, env) {
    return regeneratorRuntime.async(function createELB$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
            case "end":
                return context$1$0.stop();
        }
    }, null, this);
};

var main = function main() {
    return regeneratorRuntime.async(function main$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(createEnvDB(s3, bucket, prefix, key));

            case 2:
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(createSubDomain(route53, "intelostech.com", env));

            case 4:
                context$1$0.next = 6;
                return regeneratorRuntime.awrap(createELB(elb, app, env));

            case 6:
            case "end":
                return context$1$0.stop();
        }
    }, null, this);
};

main();
//# sourceMappingURL=data:application/json;base64,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QUFFLEdBQUcsRUFBRSxHQUFHOzs7Ozs7OztDQUUzQyxDQUFBOztBQUVELElBQUksSUFBSSxHQUFHLFNBQVAsSUFBSTs7Ozs7Z0RBQ0UsV0FBVyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQzs7OztnREFDcEMsZUFBZSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxHQUFHLENBQUM7Ozs7Z0RBQ2hELFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQzs7Ozs7OztDQUNqQyxDQUFBOztBQUVELElBQUksRUFBRSxDQUFDIiwiZmlsZSI6ImNyZWF0ZV9lbnZfZGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCBcImJhYmVsL3BvbHlmaWxsXCI7XG5pbXBvcnQgKiBhcyByIGZyb20gXCJyYW1kYVwiO1xuaW1wb3J0ICogYXMgQVdTIGZyb20gXCJhd3Mtc2RrXCI7XG5pbXBvcnQgKiBhcyB1dWlkIGZyb20gXCJ1dWlkXCI7XG5pbXBvcnQgcHJvZ3JhbSBmcm9tIFwiY29tbWFuZGVyXCI7XG5pbXBvcnQgUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcblxucHJvZ3JhbVxuICAgIC5vcHRpb24oXCItYSwgLS1hcHAgW2FwcF1cIiwgXCJBcHBsaWNhdGlvbiAod2ViLCBhcGksIGV0YylcIilcbiAgICAub3B0aW9uKFwiLWUsIC0tZW52IFtlbnZdXCIsIFwiRW52aXJvbm1lbnQgKHByb2R1Y3Rpb24sIHN0YWdpbmcsIGV0YylcIilcbiAgICAucGFyc2UocHJvY2Vzcy5hcmd2KTtcblxuaWYgKCFwcm9ncmFtLmFwcCkgdGhyb3cgbmV3IEVycm9yKFwiLS1hcHAgcmVxdWlyZWRcIik7XG5pZiAoIXByb2dyYW0uZW52KSB0aHJvdyBuZXcgRXJyb3IoXCItLWVudiByZXF1aXJlZFwiKTtcblxudmFyIHMzICAgICAgPSBQcm9taXNlLnByb21pc2lmeUFsbChuZXcgQVdTLlMzKCkpO1xudmFyIGVsYiAgICAgPSBQcm9taXNlLnByb21pc2lmeUFsbChuZXcgQVdTLkVMQigpKTtcbnZhciByb3V0ZTUzID0gUHJvbWlzZS5wcm9taXNpZnlBbGwobmV3IEFXUy5Sb3V0ZTUzKCkpO1xudmFyIGRvbWFpbnMgPSBQcm9taXNlLnByb21pc2lmeUFsbChuZXcgQVdTLlJvdXRlNTNEb21haW5zKCkpO1xudmFyIGFwcCAgICAgPSBwcm9ncmFtLmFwcDtcbnZhciBlbnYgICAgID0gcHJvZ3JhbS5lbnY7XG52YXIgYnVja2V0ICA9IFwiaW50ZWxvc1wiO1xudmFyIGRpciAgICAgPSBcImRlcGxveVwiO1xudmFyIGJ1Y2tldCAgPSBcImludGVsb3NcIjtcbnZhciBwcmVmaXggID0gXCJkZXBsb3ktZGJcIjtcbnZhciBrZXkgICAgID0gYCR7cHJlZml4fS8ke2FwcH0tJHtlbnZ9Lmpzb25gO1xuXG52YXIgZGJFeGlzdHMgPSBhc3luYyBmdW5jdGlvbihzMywgYnVja2V0LCBwcmVmaXgsIGtleSkge1xuICAgIHRyeSB7XG4gICAgICAgIHZhciBwYXJhbXMgPSB7IEJ1Y2tldDogYnVja2V0LCBQcmVmaXg6IHByZWZpeCB9O1xuICAgICAgICB2YXIgZGF0YSA9IGF3YWl0IHMzLmxpc3RPYmplY3RzQXN5bmMocGFyYW1zKTtcbiAgICAgICAgdmFyIGtleXMgPSByLm1hcChyLnByb3AoXCJLZXlcIiksIGRhdGEuQ29udGVudHMpO1xuICAgICAgICByZXR1cm4gci5maW5kKHIuZXF1YWxzKGtleSksIGtleXMpICE9PSB1bmRlZmluZWQ7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2spO1xuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbn1cblxudmFyIGNyZWF0ZUVudkRCID0gYXN5bmMgZnVuY3Rpb24oczMsIGJ1Y2tldCwgcHJlZml4LCBrZXkpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAoIWF3YWl0IGRiRXhpc3RzKHMzLCBidWNrZXQsIHByZWZpeCwga2V5KSkge1xuICAgICAgICAgICAgdmFyIGpzb24gPSBcIntcXFwiY3VycmVudFxcXCI6IFxcXCJcXFwiLCBcXFwiaGlzdG9yeVxcXCI6IFtdfVwiO1xuICAgICAgICAgICAgYXdhaXQgczMucHV0T2JqZWN0QXN5bmMoe0J1Y2tldDogYnVja2V0LCBLZXk6IGtleSwgQm9keToganNvbn0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYENyZWF0ZWQgbmV3IGVudmlyb25tZW50IGRhdGFiYXNlIGZvciAke2FwcH0tJHtlbnZ9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgczM6Ly8ke2J1Y2tldH0vJHtwcmVmaXh9LyR7a2V5fSBhbHJlYWR5IGV4aXN0cyFgKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59XG5cbnZhciBkb21haW5FeGlzdHMgPSBhc3luYyBmdW5jdGlvbihyb3V0ZTUzLCBkb21haW4pIHtcbiAgICB0cnkge1xuICAgICAgICB2YXIgZGF0YSA9IGF3YWl0IHJvdXRlNTMubGlzdEhvc3RlZFpvbmVzQXN5bmMoKTtcbiAgICAgICAgdmFyIGRvbWFpbnMgPSByLm1hcChyLnByb3AoXCJOYW1lXCIpLCBkYXRhLkhvc3RlZFpvbmVzKTtcbiAgICAgICAgcmV0dXJuIHIuZmluZChyLmVxdWFscyhgJHtkb21haW59LmApLCBkb21haW5zKSAhPT0gdW5kZWZpbmVkO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coZS5zdGFjayk7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufVxuXG52YXIgY3JlYXRlU3ViRG9tYWluID0gYXN5bmMgZnVuY3Rpb24ocm91dGU1MywgcGFyZW50RG9tYWluLCBlbnYpIHtcbiAgICB0cnkge1xuICAgICAgICB2YXIgZG9tYWluID0gYCR7ZW52fS4ke3BhcmVudERvbWFpbn1gO1xuICAgICAgICBpZiAoIWF3YWl0IGRvbWFpbkV4aXN0cyhyb3V0ZTUzLCBkb21haW4pKSB7XG4gICAgICAgICAgICBhd2FpdCByb3V0ZTUzLmNyZWF0ZUhvc3RlZFpvbmVBc3luYyh7XG4gICAgICAgICAgICAgICAgQ2FsbGVyUmVmZXJlbmNlOiB1dWlkLnYxKCksXG4gICAgICAgICAgICAgICAgTmFtZTogZG9tYWluXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBkb21haW4gJHtkb21haW59IGFscmVhZHkgZXhpc3RzIWApXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLnRyYWNlKGUpO1xuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbn1cblxudmFyIGNyZWF0ZUVMQiA9IGFzeW5jIGZ1bmN0aW9uKGVsYiwgYXBwLCBlbnYpIHtcblxufVxuXG52YXIgbWFpbiA9IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgIGF3YWl0IGNyZWF0ZUVudkRCKHMzLCBidWNrZXQsIHByZWZpeCwga2V5KTtcbiAgICBhd2FpdCBjcmVhdGVTdWJEb21haW4ocm91dGU1MywgXCJpbnRlbG9zdGVjaC5jb21cIiwgZW52KTtcbiAgICBhd2FpdCBjcmVhdGVFTEIoZWxiLCBhcHAsIGVudik7XG59XG5cbm1haW4oKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=