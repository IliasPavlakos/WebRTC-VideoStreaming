const fs = require("fs");
const http = require("http");
const express = require("express");
const path = require("path");
const c = require("../shared/config.js");
const h = require("../shared/helpers.js");
const socketio  = require("socket.io");
//const https = require("https");
const relayableSignals = ["ICE", "SDP"]; //signal types we ought to relay between clients
let sockets = {}; //{uid: socket} holds all clients who use this signalling server
const app = express();  //set up express app
app.use(c.web.path, express.static(path.join(__dirname,c.web.root))); //the WebRTC app root
app.use("/shared", express.static(path.join(__dirname,"../shared"))); //shared js between client and server

//const server = https.createServer({key : fs.readFileSync("./server.key"), cert: fs.readFileSync("./server.cert")}, app);
const server = http.createServer(app);
const io = socketio(server);
const send = (socket, type, data) => {
    h.log(`${type}#sending`, data.uid, data, socket.uid);
    socket.emit(type, data);
    h.log(`${type}#sent`, data.uid, data, socket.uid);
};

server.listen(c.web.port, c.web.bind, () => h.log("serve", path.join(__dirname,c.web.root), "Web app+signalling server", `${c.web.prot}://${c.web.bind}:${c.web.port}${c.web.path}`));

io.on("connection", source => { //set up socket.io so that we can act as a signalling server for the WebRTC apps
    h.log("connection#processing", source.uid, "", "me");
    source.uid = source.handshake.query.uid || h.randomName();
    sockets[source.uid] = source;
    
    const others = Object.keys(sockets).filter(target => target !== source.uid); //send these to the new peer, and send the new peer to them
    
    send(source, "adds", {uids: others}); //send them    
//     others.forEach(target => send(sockets[target], "add", {uid: source.uid, initialize: false})); //send new peer to them
    
    relayableSignals.forEach(type => {//for each signal type
        source.on(type, msg => {
            h.log(`${type}#processing`, source.uid, msg, msg.uid);
            if (sockets[msg.uid] === undefined) return;
            send(sockets[msg.uid], type, {...msg, uid: source.uid}); //relay the signal
            h.log(`${type}#processed`, source.uid, msg, msg.uid);
        });
    });
    
    source.on("disconnect", () => {
        h.log("disconnect#procesing", source.uid, "", "onDisonnect");
        Object.values(sockets).forEach(target => send(target, "remove", source.uid));
        delete sockets[source.uid];
        h.log("disconnect#processed", source.uid, "", "onDisonnect");
    });
    h.log("connection#processed", source.uid, "", "me");
});

//const redirect_server = http.createServer((req,res) => {
//    res.writeHead(301, {Location: `https://${req.headers.host}${req.url}`});
//    res.end();
//}).listen(c.web.bort);
