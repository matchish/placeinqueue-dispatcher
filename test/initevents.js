'use strict';

const moment = require("moment");
const InitEvents = require("../src/initevents");
const expect = require('chai').expect

describe("source", function() {

    it("produce events if queue ready to start", async function() {
        //TODO mock now
        let startAt = moment().add(25, "minutes").toISOString();
        let dao = {
            QueueDao: class {
                readEntities() {
                    return new Promise((resolve, reject) => {
                        resolve([
                            {
                                id: 'test',
                                number_of_places: 10,
                                url: 'test',
                                prestart: 60,
                                start_at: startAt
                            }
                        ])
                    });
                }
            }
        }
        let events = await new InitEvents(dao, moment, {dispatcher: "dispatcher", browser: "browser"}).toArray();
        expect(events.length).to.be.equal(1);
    });

    it("don't produce events if queue not ready to start", async function() {
        let startAt = moment().add(100, "minutes").toISOString();
        let dao = {
            QueueDao: class {
                readEntities() {
                    return new Promise((resolve, reject) => {
                        resolve([
                            {
                                id: 'test',
                                number_of_places: 10,
                                url: 'test',
                                prestart: 60,
                                start_at: startAt
                            }
                        ])
                    });
                }
            }
        }
        let events = await new InitEvents(dao, moment, {dispatcher: "dispatcher", browser: "browser"}).toArray();
        expect(events.length).to.be.equal(0);
    });

});