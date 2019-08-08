const amqp = require('amqplib');

let channel = null;
const RESERVATION_QUEUE = 'reservation';

amqp.connect('amqp://localhost')
.then(conn => conn.createChannel())
.then(ch => {
    ch.assertQueue(RESERVATION_QUEUE)
    .then(() => {
        //Watch incomming messages
        ch.consume(RESERVATION_QUEUE, msg => {
            const out = msg.content + ' processed';
            //Send back to the sender (replyTo) queue and give the correlationId back
            //so we can emit the event.
            ch.sendToQueue(msg.properties.replyTo, Buffer.from(out), {
                correlationId: msg.properties.correlationId
            });

            //Acknowledge the job done with the message.
            ch.ack(msg);
        });
    });
});