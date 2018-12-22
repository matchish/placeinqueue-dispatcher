'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: process.env.AWS_REGION});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const InitEvents = require('./initevents');
const SpreadEvents = require('./spreadevents');
const dao = require('placeinqueue-dao');
const moment = require('moment');
const sqsUrls = {
  dispatcher: AWS_SQS_DISPATCHER_URL,
  browser: AWS_SQS_BROWSER_URL,
};

module.exports.dispatcher = async (event, context) =>  {
    let message = event.Records.pop();
    let body = JSON.parse(message.body);
    await Promise.all(new SpreadEvents(body, dao, moment, sqsUrls).toArray().map((event) => {
        return new Promise((resolve, reject) => {
            sqs.sendMessage(event, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }));
    return { message: 'Ok' };
};

module.exports.source = async (event, context) => {
    await Promise.all(new InitEvents(dao, moment, sqsUrls).toArray().map((event) => {
        return new Promise((resolve, reject) => {
            sqs.sendMessage(event, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }));
    return { message: 'Ok' };
}