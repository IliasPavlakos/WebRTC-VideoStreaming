const c = {
    rtc: {
        prot: "ws",
        bind: "0.0.0.0",
        port: 8080,
        path: "/peerjs",
    },
    ws: {
        prot: "ws",
        bind: "0.0.0.0",
        port: 8080,
        path: "websocket",
    },
    web: {
        root: "../client",
        prot: "http",
        bind: "0.0.0.0",
        port: 8081,
        bort: 80,
        path: "/",
    },
    ice: [
        {urls:["stun.ekiga.net:3478", "stun.jappix.com:3478", "stun.linphone.org:3478", "stun.noc.ams-ix.net:3478", "stun.nottingham.ac.uk:3478", "stun.services.mozilla.com:3478", "stun.stunprotocol.org:3478", "stunserver.org:3478"]},
    ],
    logEnabled: false
};

try {
    module.exports = c;
} catch (err) {
}
