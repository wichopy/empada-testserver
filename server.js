const express = require('express');
const SocketServer = require('ws').Server;
var uuid = require('node-uuid');
const WebSocket = require('ws');
// Set the port to 4000
const PORT = 5000;

// Create a new express server
const server = express()
    // Make the express server serve static assets (html, javascript, css) from the /public folder
    .use(express.static('public'))
    .listen(PORT, 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
//**Need to do server: app to use express. */
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
};
let clients = {};

const urlify = (text) => {
    var urlRegex = /(https?:\/\/.*\.(?:png|jpg|gif|jpeg|svg))/i;
    return text.replace(urlRegex, function(url) {
        return '<img src="' + url + '">';
    });
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
};

wss.on('connection', (client) => {
    let newuser = {
        id: uuid.v1(),
        type: 'incomingNotification',
        username: ''
    };
    // console.log('verify new use has a client code');
    // console.log(newuser);
    clients[newuser.id] = newuser;
    // console.log('here are your clients:');
    // console.log(clients);
    newuser.content = [Object.keys(clients).length, `User ${newuser.id} connected.`];
    //broadcast new user joined.
    wss.broadcast(JSON.stringify(newuser));
    wss.broadcast(JSON.stringify({
        type: 'systemUpdate',
        content: Object.keys(clients).length
    }));

    //initialize this client with a userid.
    newuser.code = 'newuser';
    client.send(JSON.stringify(newuser));

    client.on('message', function(event) {
        console.log(`I received: ${event}`);
        // let newMessage = JSON.parse(event);
        // if (client.readyState === client.OPEN) {
        //     switch (newMessage.type) {
        //         case 'postNotification':
        //             switch (newMessage.code) {
        //                 case 'namechange':
        //                     newMessage.type = 'incomingNotification';
        //                     newMessage.id = uuid.v1();
        //                     console.log(newMessage);
        //                     clients[newMessage.userid].username = newMessage.username;
        //                     clients[newMessage.userid].color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        //                     // newMessage.color = clients[newMessage.userid].color;
        //                     newMessage.code = 'addUserName';
        //                     wss.broadcast(JSON.stringify(newMessage));
        //                     break;
        //                 case 'logoff':
        //                     newMessage.type = 'systemUpdate'
        //                     console.log("Log off !");
        //                     delete clients[newMessage.content];
        //                     newMessage.content = Object.keys(clients).length;
        //                     wss.broadcast(JSON.stringify(newMessage));
        //                     break;
        //             }
        //             break;
        //         case `postMessage`:
        //             newMessage.id = uuid.v1();
        //             newMessage.type = 'incomingMessage';
        //             // ws.send(JSON.stringify(newMessage));
        //             newMessage.color = clients[newMessage.userid].color;
        //             console.log(urlify(newMessage.content));
        //             wss.broadcast(JSON.stringify(newMessage));
        //             break;
        //         default:
        //             throw new Error("unknown event type" + newMessage.type);
        //     }
        // }
    });

    // Set up a callback for when a client closes the socket. This usually means they closed their browser.
    client.on('close', (event) => {
        console.log('Client disconnected')
        let logout = {
            type: 'incomingNotification',
            content: `${clients[newuser.id].username} disconnected.`,
            username: '',
            id: uuid.v1()
        };
        if (logout.content === ' disconnected.') {
            logout.content = 'Annonymous disconnected.'
        }
        console.log("before delete from clients");
        console.log(clients);
        delete clients[newuser.id];
        console.log('clients after logout');
        console.log(clients);
        wss.broadcast(JSON.stringify(logout));
        wss.broadcast(JSON.stringify({ type: 'systemUpdate', content: Object.keys(clients).length }));
    });
});