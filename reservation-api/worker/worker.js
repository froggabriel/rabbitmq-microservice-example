const amqp = require('amqplib');

let channel = null;
const QUEUE = 'process';

amqp.connect('amqp://localhost')
.then(conn => conn.createChannel())
.then(ch => {
    ch.assertQueue(QUEUE)
    .then(q => {
        //Watch incomming messages
        ch.consume(q.queue, msg => {
            const out = msg.content + ' processed';
            console.log(out);
            //Send back to the sender (replyTo) queue and give the correlationId back
            //so we can emit the event.
            ch.sendToQueue(msg.properties.replyTo, Buffer.from(out), {
                correlationId: msg.properties.correlationId
            });

            //Acknowledge the job done with the message.            
        });
    });
});