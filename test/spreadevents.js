'use strict';

const moment = require("moment");
const SpreadEvents = require("../src/spreadevents");
const expect = require('chai').expect

describe("spread", function() {

    it("if range is 1-100000 it produce 100 events to dispatcher queue", async function() {
        //TODO mock now
        let dao = {
            QueueDao: class {}
        };
        let body = {
            queue_id: "test",
            range: [1, 100000]
        };
        let events = await new SpreadEvents(body, dao, moment, {dispatcher: "dispatcher", browser: "browser"}).toArray();
        expect(events.length).to.be.equal(100);
    });
    it("if range is 95-110 and all browsers stopped it produce 16 events to browser queue", async function() {
        //TODO mock now
        let heartbeatAt = moment().subtract(30, "seconds").toISOString();
        let dao = {
            PlaceDao: class {
                readEntity(key) {
                    return new Promise((resolve, reject) => {
                        resolve([
                            {
                                id: key.id,
                                queue_id: key.queue_id,
                                heartbeat_at: heartbeatAt,
                            }
                        ])
                    });
                }
            }
        }
        let body = {
            queue_id: "test",
            range: [95, 110]
        };
        let events = await new SpreadEvents(body, dao, moment, {dispatcher: "dispatcher", browser: "browser"}).toArray();
        expect(events.length).to.be.equal(16);
    });

});