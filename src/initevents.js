module.exports = class InitEvents {
    constructor(dao, moment, sqsUrls) {
        this.dao = dao;
        this.moment = moment;
        this.urls = sqsUrls
    }

    toArray() {
        let queueDao = new this.dao.QueueDao();
        return new Promise(async (resolve, reject) => {
            let queues = await queueDao.readEntities();
            let moment = this.moment;
            let events = queues.map((queue) => {
                //TODO env DI
                if (moment().isBetween(moment(queue.start_at).subtract(queue.prestart, 'minutes'), moment(queue.start_at).add(process.env.BROWSER_SHUTDOWN_WAIT, 'minutes'))) {
                    return {
                        DelaySeconds: 0,
                        MessageBody: JSON.stringify({
                            range: [1, queue.number_of_places],
                            queue_id: queue.id,
                            url: queue.url,
                        }),
                        //TODO env DI
                        QueueUrl: this.urls.dispatcher
                    };

                }
            });
            events = events.filter(e => e);
            return resolve(events);
        })
    }
}