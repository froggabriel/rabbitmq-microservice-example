const express = require('express');
const amqp = require('amqplib');
const EventEmitter = require('events');
const utils = require("../../app-common/library/utils")

const RESERVATION_QUEUE = 'reservation';
const eventEmmiter = new EventEmitter();

let channel = null;

function init() {
    return amqp.connect('amqp://localhost') // when the connection is created...
        .then(conn => conn.createChannel()) // and when the channel is created...
        .then(ch => {
            // the created channel will be our global channel for this server instance
            channel = ch;
            // give instructions for how to handle replies:
            // when a message is available in the reply-to queue (meaning the message has been processed by the worker)
            ch.consume('amq.rabbitmq.reply-to', msg => {
                // emit the message to the eventEmmitter for handling (each method will handle replies differently)
                eventEmmiter.emit(msg.properties.correlationId, msg.content)
            }, {noAck: true}); //no Ack is required
        });
}

// Generates random id for each message
function randomid() {
    return utils.getUniqueID();
    //return new Date().getTime().toString() + Math.random().toString() + Math.random().toString();
}

const app = express();

app.get('/', (req, res) => {
    res.send('Welcome to Hive');
});

app.get('/process/:text', (req, res) => {
    console.log("processing " + req.params.text);
    // assign random id to our message
    let id = randomid();
    // handle the reply from the worker
    eventEmmiter.once(id, msg => {
        res.write(msg, 'binary');
        res.end(null, 'binary');
    });
    // send our message to the reservation queue
    channel.assertQueue(RESERVATION_QUEUE) // assert message is in reservation queue
        .then(() => {
            // send our message in a Buffer to the reservation queue
            // correlationId is set to the random id we assigned to the message. The reply will have the same correlationId.
            channel.sendToQueue(RESERVATION_QUEUE, Buffer.from(req.params.text), {correlationId:id, replyTo: 'amq.rabbitmq.reply-to'})
        });
});

init() // once the channel has been created and we know how to handle replies,
    .then(() => {
        // start the server
        app.listen(4000, () => console.log('Example app listening on port 4000'))
    });