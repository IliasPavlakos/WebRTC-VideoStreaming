const h = {
    randomName: () => `u${Math.round(Math.random()*1000)}`,
    parseOrNull: (string) => {
        let obj;
        try {
            obj = JSON.parse(string);
        } catch (err) {
            obj = null;
        }
        return obj;
    },
    getWsUri: (prot, host, path) => `${prot === "https:" ? "wss:" : "ws:"}//${host}/${path}`,
    handleEvent: (handlers, message, extra) => {
        const obj = parseOrNull(message);
        if ( obj === null) {
            console.error(`Unparseable:\t${message}`);
        } else {
            if (handlers[obj.type] === undefined) {
                console.error(`Unhandleable:\t${obj}`);
            } else {
                console.log(`Handling: \t${JSON.stringify(obj)}`);
                handlers[obj.type](obj, extra);
            }
        }
    },
    lon: (label, src, what, tgt, where) => console[where || "log"](label, "\tSource:", src, "\tValue:", what, "\tTarget:", tgt),
    loff: () => {},
    err: (label, src,  what, tgt, where) => h.log(label, src, what, tgt, "err"),
};

let logEnabled;

try {
    logEnabled = require("./config.js").logEnabled;
} catch (err) {
    logEnabled = c.logEnabled;
}

h.log = h[logEnabled? "lon" : "loff"];

try {
    module.exports = h;
} catch (err) {
}


