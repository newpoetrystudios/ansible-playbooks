#!/usr/bin/env node

import "babel/polyfill";
import * as r from "ramda";
import * as AWS from "aws-sdk";
import * as uuid from "uuid";
import program from "commander";
import Promise from "bluebird";

program
    .option("-a, --app [app]", "Application (web, api, etc)")
    .option("-e, --env [env]", "Environment (production, staging, etc)")
    .parse(process.argv);

if (!program.app) throw new Error("--app required");
if (!program.env) throw new Error("--env required");

var s3      = Promise.promisifyAll(new AWS.S3());
var elb     = Promise.promisifyAll(new AWS.ELB());
var route53 = Promise.promisifyAll(new AWS.Route53());
var domains = Promise.promisifyAll(new AWS.Route53Domains());
var app     = program.app;
var env     = program.env;
var bucket  = "intelos";
var dir     = "deploy";
var bucket  = "intelos";
var prefix  = "deploy-db";
var key     = `${prefix}/${app}-${env}.json`;

var dbExists = async function(s3, bucket, prefix, key) {
    try {
        var params = { Bucket: bucket, Prefix: prefix };
        var data = await s3.listObjectsAsync(params);
        var keys = r.map(r.prop("Key"), data.Contents);
        return r.find(r.equals(key), keys) !== undefined;
    } catch(e) {
        console.log(e.stack);
        throw e;
    }
}

var createEnvDB = async function(s3, bucket, prefix, key) {
    try {
        if (!await dbExists(s3, bucket, prefix, key)) {
            var json = "{\"current\": \"\", \"history\": []}";
            await s3.putObjectAsync({Bucket: bucket, Key: key, Body: json});
            console.log(`Created new environment database for ${app}-${env}`);
        } else {
            console.log(`s3://${bucket}/${prefix}/${key} already exists!`);
        }
    } catch(e) {
        console.log(e.stack);
        throw e;
    }
}

var domainExists = async function(route53, domain) {
    try {
        var data = await route53.listHostedZonesAsync();
        var domains = r.map(r.prop("Name"), data.HostedZones);
        return r.find(r.equals(`${domain}.`), domains) !== undefined;
    } catch (e) {
        console.log(e.stack);
        throw e;
    }
}

var createSubDomain = async function(route53, parentDomain, env) {
    try {
        var domain = `${env}.${parentDomain}`;
        if (!await domainExists(route53, domain)) {
            await route53.createHostedZoneAsync({
                CallerReference: uuid.v1(),
                Name: domain
            });
        } else {
            console.log(`domain ${domain} already exists!`)
        }
        
    } catch (e) {
        console.trace(e);
        throw e;
    }
}

var createELB = async function(elb, app, env) {

}

var main = async function() {
    await createEnvDB(s3, bucket, prefix, key);
    await createSubDomain(route53, "intelostech.com", env);
    await createELB(elb, app, env);
}

main();