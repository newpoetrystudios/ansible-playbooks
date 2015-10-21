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
    var params, data;
    return regeneratorRuntime.async(function createELB$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                params = {
                    LoadBalancerName: "" + app + "-" + env,
                    Listeners: [{
                        InstancePort: 80,
                        LoadBalancerPort: 80,
                        Protocol: "HTTP"
                    }],
                    Subnets: ["subnet-aaf959f3"]
                };
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(elb.createLoadBalancerAsync(params));

            case 4:
                data = context$1$0.sent;
                return context$1$0.abrupt("return", data.DNSName);

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

var addCNAME = function addCNAME(route53, src, dest) {
    return regeneratorRuntime.async(function addCNAME$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
            case "end":
                return context$1$0.stop();
        }
    }, null, this);
};

var main = function main() {
    var dnsName;
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
                dnsName = context$1$0.sent;

                console.log("created load balancer:", dnsName);

            case 8:
            case "end":
                return context$1$0.stop();
        }
    }, null, this);
};

main();
//# sourceMappingURL=data:application/json;base64,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QUFFLEdBQUcsRUFBRSxHQUFHO1FBRWhDLE1BQU0sRUFVTixJQUFJOzs7OztBQVZKLHNCQUFNLEdBQUc7QUFDVCxvQ0FBZ0IsT0FBSyxHQUFHLFNBQUksR0FBRyxBQUFFO0FBQ2pDLDZCQUFTLEVBQUUsQ0FBQztBQUNSLG9DQUFZLEVBQUUsRUFBRTtBQUNoQix3Q0FBZ0IsRUFBRSxFQUFFO0FBQ3BCLGdDQUFRLEVBQUUsTUFBTTtxQkFDbkIsQ0FBQztBQUNGLDJCQUFPLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztpQkFDL0I7O2dEQUVnQixHQUFHLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDOzs7QUFBaEQsb0JBQUk7b0RBQ0QsSUFBSSxDQUFDLE9BQU87Ozs7OztBQUVuQix1QkFBTyxDQUFDLEdBQUcsQ0FBQyxlQUFFLEtBQUssQ0FBQyxDQUFDOzs7Ozs7OztDQUc1QixDQUFBOztBQUVELElBQUksUUFBUSxHQUFHLFNBQVgsUUFBUSxDQUFrQixPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUk7Ozs7Ozs7O0NBRS9DLENBQUE7O0FBRUQsSUFBSSxJQUFJLEdBQUcsU0FBUCxJQUFJO1FBR0EsT0FBTzs7Ozs7Z0RBRkwsV0FBVyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQzs7OztnREFDcEMsZUFBZSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxHQUFHLENBQUM7Ozs7Z0RBQ2xDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQzs7O0FBQXhDLHVCQUFPOztBQUdYLHVCQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLE9BQU8sQ0FBQyxDQUFDOzs7Ozs7O0NBQ2xELENBQUE7O0FBRUQsSUFBSSxFQUFFLENBQUMiLCJmaWxlIjoiY3JlYXRlX2Vudl9kYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuaW1wb3J0IFwiYmFiZWwvcG9seWZpbGxcIjtcbmltcG9ydCAqIGFzIHIgZnJvbSBcInJhbWRhXCI7XG5pbXBvcnQgKiBhcyBBV1MgZnJvbSBcImF3cy1zZGtcIjtcbmltcG9ydCAqIGFzIHV1aWQgZnJvbSBcInV1aWRcIjtcbmltcG9ydCBwcm9ncmFtIGZyb20gXCJjb21tYW5kZXJcIjtcbmltcG9ydCBQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuXG5wcm9ncmFtXG4gICAgLm9wdGlvbihcIi1hLCAtLWFwcCBbYXBwXVwiLCBcIkFwcGxpY2F0aW9uICh3ZWIsIGFwaSwgZXRjKVwiKVxuICAgIC5vcHRpb24oXCItZSwgLS1lbnYgW2Vudl1cIiwgXCJFbnZpcm9ubWVudCAocHJvZHVjdGlvbiwgc3RhZ2luZywgZXRjKVwiKVxuICAgIC5wYXJzZShwcm9jZXNzLmFyZ3YpO1xuXG5pZiAoIXByb2dyYW0uYXBwKSB0aHJvdyBuZXcgRXJyb3IoXCItLWFwcCByZXF1aXJlZFwiKTtcbmlmICghcHJvZ3JhbS5lbnYpIHRocm93IG5ldyBFcnJvcihcIi0tZW52IHJlcXVpcmVkXCIpO1xuXG52YXIgczMgICAgICA9IFByb21pc2UucHJvbWlzaWZ5QWxsKG5ldyBBV1MuUzMoKSk7XG52YXIgZWxiICAgICA9IFByb21pc2UucHJvbWlzaWZ5QWxsKG5ldyBBV1MuRUxCKCkpO1xudmFyIHJvdXRlNTMgPSBQcm9taXNlLnByb21pc2lmeUFsbChuZXcgQVdTLlJvdXRlNTMoKSk7XG52YXIgZG9tYWlucyA9IFByb21pc2UucHJvbWlzaWZ5QWxsKG5ldyBBV1MuUm91dGU1M0RvbWFpbnMoKSk7XG52YXIgYXBwICAgICA9IHByb2dyYW0uYXBwO1xudmFyIGVudiAgICAgPSBwcm9ncmFtLmVudjtcbnZhciBidWNrZXQgID0gXCJpbnRlbG9zXCI7XG52YXIgZGlyICAgICA9IFwiZGVwbG95XCI7XG52YXIgYnVja2V0ICA9IFwiaW50ZWxvc1wiO1xudmFyIHByZWZpeCAgPSBcImRlcGxveS1kYlwiO1xudmFyIGtleSAgICAgPSBgJHtwcmVmaXh9LyR7YXBwfS0ke2Vudn0uanNvbmA7XG5cbnZhciBkYkV4aXN0cyA9IGFzeW5jIGZ1bmN0aW9uKHMzLCBidWNrZXQsIHByZWZpeCwga2V5KSB7XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIHBhcmFtcyA9IHsgQnVja2V0OiBidWNrZXQsIFByZWZpeDogcHJlZml4IH07XG4gICAgICAgIHZhciBkYXRhID0gYXdhaXQgczMubGlzdE9iamVjdHNBc3luYyhwYXJhbXMpO1xuICAgICAgICB2YXIga2V5cyA9IHIubWFwKHIucHJvcChcIktleVwiKSwgZGF0YS5Db250ZW50cyk7XG4gICAgICAgIHJldHVybiByLmZpbmQoci5lcXVhbHMoa2V5KSwga2V5cykgIT09IHVuZGVmaW5lZDtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coZS5zdGFjayk7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufVxuXG52YXIgY3JlYXRlRW52REIgPSBhc3luYyBmdW5jdGlvbihzMywgYnVja2V0LCBwcmVmaXgsIGtleSkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICghYXdhaXQgZGJFeGlzdHMoczMsIGJ1Y2tldCwgcHJlZml4LCBrZXkpKSB7XG4gICAgICAgICAgICB2YXIganNvbiA9IFwie1xcXCJjdXJyZW50XFxcIjogXFxcIlxcXCIsIFxcXCJoaXN0b3J5XFxcIjogW119XCI7XG4gICAgICAgICAgICBhd2FpdCBzMy5wdXRPYmplY3RBc3luYyh7QnVja2V0OiBidWNrZXQsIEtleToga2V5LCBCb2R5OiBqc29ufSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ3JlYXRlZCBuZXcgZW52aXJvbm1lbnQgZGF0YWJhc2UgZm9yICR7YXBwfS0ke2Vudn1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBzMzovLyR7YnVja2V0fS8ke3ByZWZpeH0vJHtrZXl9IGFscmVhZHkgZXhpc3RzIWApO1xuICAgICAgICB9XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2spO1xuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbn1cblxudmFyIGRvbWFpbkV4aXN0cyA9IGFzeW5jIGZ1bmN0aW9uKHJvdXRlNTMsIGRvbWFpbikge1xuICAgIHRyeSB7XG4gICAgICAgIHZhciBkYXRhID0gYXdhaXQgcm91dGU1My5saXN0SG9zdGVkWm9uZXNBc3luYygpO1xuICAgICAgICB2YXIgZG9tYWlucyA9IHIubWFwKHIucHJvcChcIk5hbWVcIiksIGRhdGEuSG9zdGVkWm9uZXMpO1xuICAgICAgICByZXR1cm4gci5maW5kKHIuZXF1YWxzKGAke2RvbWFpbn0uYCksIGRvbWFpbnMpICE9PSB1bmRlZmluZWQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlLnN0YWNrKTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59XG5cbnZhciBjcmVhdGVTdWJEb21haW4gPSBhc3luYyBmdW5jdGlvbihyb3V0ZTUzLCBwYXJlbnREb21haW4sIGVudikge1xuICAgIHRyeSB7XG4gICAgICAgIHZhciBkb21haW4gPSBgJHtlbnZ9LiR7cGFyZW50RG9tYWlufWA7XG4gICAgICAgIGlmICghYXdhaXQgZG9tYWluRXhpc3RzKHJvdXRlNTMsIGRvbWFpbikpIHtcbiAgICAgICAgICAgIGF3YWl0IHJvdXRlNTMuY3JlYXRlSG9zdGVkWm9uZUFzeW5jKHtcbiAgICAgICAgICAgICAgICBDYWxsZXJSZWZlcmVuY2U6IHV1aWQudjEoKSxcbiAgICAgICAgICAgICAgICBOYW1lOiBkb21haW5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYGRvbWFpbiAke2RvbWFpbn0gYWxyZWFkeSBleGlzdHMhYClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UoZSk7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufVxuXG52YXIgY3JlYXRlRUxCID0gYXN5bmMgZnVuY3Rpb24oZWxiLCBhcHAsIGVudikge1xuICAgIHRyeSB7XG4gICAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgICAgICBMb2FkQmFsYW5jZXJOYW1lOiBgJHthcHB9LSR7ZW52fWAsXG4gICAgICAgICAgICBMaXN0ZW5lcnM6IFt7XG4gICAgICAgICAgICAgICAgSW5zdGFuY2VQb3J0OiA4MCxcbiAgICAgICAgICAgICAgICBMb2FkQmFsYW5jZXJQb3J0OiA4MCxcbiAgICAgICAgICAgICAgICBQcm90b2NvbDogXCJIVFRQXCJcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgU3VibmV0czogW1wic3VibmV0LWFhZjk1OWYzXCJdXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0YSA9IGF3YWl0IGVsYi5jcmVhdGVMb2FkQmFsYW5jZXJBc3luYyhwYXJhbXMpO1xuICAgICAgICByZXR1cm4gZGF0YS5ETlNOYW1lO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coZS5zdGFjayk7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufVxuXG52YXIgYWRkQ05BTUUgPSBhc3luYyBmdW5jdGlvbihyb3V0ZTUzLCBzcmMsIGRlc3QpIHtcbiAgICBcbn1cblxudmFyIG1haW4gPSBhc3luYyBmdW5jdGlvbigpIHtcbiAgICBhd2FpdCBjcmVhdGVFbnZEQihzMywgYnVja2V0LCBwcmVmaXgsIGtleSk7XG4gICAgYXdhaXQgY3JlYXRlU3ViRG9tYWluKHJvdXRlNTMsIFwiaW50ZWxvc3RlY2guY29tXCIsIGVudik7XG4gICAgdmFyIGRuc05hbWUgPSBhd2FpdCBjcmVhdGVFTEIoZWxiLCBhcHAsIGVudik7XG5cblxuICAgIGNvbnNvbGUubG9nKFwiY3JlYXRlZCBsb2FkIGJhbGFuY2VyOlwiLCBkbnNOYW1lKTtcbn1cblxubWFpbigpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==