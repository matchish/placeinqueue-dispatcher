"use strict";
module.exports = class SpreadEvents{
    constructor(body, dao, moment, sqsUrls) {
        this.body = body;
        this.dao = dao;
        this.moment = moment;
        this.urls = sqsUrls
    }

    toArray() {
        let body = this.body;
        let dao = this.dao;
        let moment = this.moment;

        return new Promise(async (resolve, reject) => {
            const splitRange = (left, right) => {
                //TODO magic constant
                let range = right - left + 1;
                let newRange = Math.ceil(Math.max(range / 100, 100));
                let rangesAmount = Math.ceil(range/newRange);
                let splitted = Array.from(new Array(rangesAmount), (item, index) => {
                    let l = left + index * newRange;
                    let r = left + (index + 1) * newRange - 1;
                    r = right < r ? right : r;
                    return [l, r];
                });
                return splitted;
            };

            let range = body.range[1] - body.range[0] + 1;
            //TODO magic constant
            if (range > 100) {
                return resolve(splitRange(body.range[0], body.range[1]).map((range) => {
                    return {
                        DelaySeconds: 0,
                        MessageBody: JSON.stringify({...body, range: range}),
                        QueueUrl: this.urls.dispatcher
                    };
                }));
            } else {
                let events = await Promise.all(Array(range).fill(body.range[0]).map((x, y) => x + y).map(async (id) => {
                    let placeDao = new dao.PlaceDao;
                    let place = await placeDao.readEntity({
                        queue_id: body.queue_id,
                        id: id
                    });
                    //TODO magic constant
                    if (!place
                        || (!place.heartbeat_at && !Number.isInteger(place.number_in_queue))
                        || (moment(place.heartbeat_at).isBefore(moment().subtract(1, 'minutes')) && !Number.isInteger(place.number_in_queue))) {
                        return {
                            DelaySeconds: 0,
                            MessageBody: JSON.stringify({queue_id: body.queue_id, id: id}),
                            QueueUrl: this.urls.browser
                        };
                    }
                }));
                events = events.filter(e => e);
                resolve(events);
            }
        });
    }
}