const express = require('express');
const EventEmitter = require('events');
const utils = require("../../app-common/library/utils")

const RESERVATION_EXCHANGE = 'reservation';
const eventEmmiter = new EventEmitter();
let channel = null;

const app = express();

function sendMsg({routingKey, handler, msg}) {
    return utils.sendMsg({
        exchange: RESERVATION_EXCHANGE,
        channel,
        eventEmmiter, 
        routingKey,
        handler, 
        msg
    });
}

app.get('/', (req, res) => {
    res.send('Welcome to Hive');
});

app.get('/process/:text', (req, res) => {
    // unique queue per endpoint
    const ROUTING_KEY = 'process';
    //sendMsg
    sendMsg({
        routingKey: ROUTING_KEY, 
        msg: req.params.text,
        handler: (reply) => {
            replyStr = reply.toString('utf8');
            console.log(replyStr);
            res.send(replyStr);
        }, 
    });
});

utils.init({
        url: 'amqp://localhost',
        eventEmmiter
    }) // once the channel has been created and we know how to handle replies,
    .then(ch => {
        channel = ch;
        // start the server
        app.listen(4000, () => console.log('Example app listening on port 4000'));
    });