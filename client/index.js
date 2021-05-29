let localList = [];
let peers = {};
const uid = sessionStorage.getItem("#uid") || prompt("What is your name?", h.randomName());
sessionStorage.setItem("#uid", uid);
const whereio = `${window.location.protocol}//${window.location.host}/?uid=${uid}`;

const server = io(whereio); //connect to our signalling server, requesting uid

//we will probably use this as is, because it's the basic <event_type, json> pair
const send = (type, data) => {
    h.log(`${type}#sending`, "me", data, data.uid);
    server.emit(type, data);
    h.log(`${type}#sent`, "me", data, data.uid);
};

const wtclient = new WebTorrent();

// HTML elements
var $body = document.body
var $progressBar = document.querySelector('#progressBar')
var $numPeers = document.querySelector('#numPeers')
var $downloaded = document.querySelector('#downloaded')
var $total = document.querySelector('#total')
var $remaining = document.querySelector('#remaining')
var $uploadSpeed = document.querySelector('#uploadSpeed')
var $downloadSpeed = document.querySelector('#downloadSpeed')

const addTorrent = () => {
     localList.push({name: prompt("What is your torrent's name?", "Sintel"), url: prompt("What is your torrent's url?", "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent")});
    //localList.push({name: "Sintel", url: "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent"});
    populateTable();
};

const getList = () => {
    let ret = [];
    ret = ret.concat(localList);
    Object.keys(peers).forEach(pid => {
         ret = ret.concat(peers[pid].torrents || []);
    });
    h.log("getlist",  "", ret, "");
    return ret;
};

const populateTable = () => {
    getList().forEach(
        (e, i) =>
            $('.test').append(
                `<tr>
                    <th scope="row">${i+1}</th>
                    <td>${e.name}</td>
                    <td><a href="#">View This</a></td>
                    <td><button data-url=${e.url} type="button" class="btn btn-outline-light list">View This!</button></td>
                </tr>`
            )
    );
};

//TODO: Show the user the list of files, and let them pick

$('body').on('click', '.list', function() {
    $('.magnet_list').hide();
    $('.player').show();
    torrentId = event.target.dataset["url"];   
    wtclient.add(torrentId, torrent => {
        const file = torrent.files.find(file=> file.name.endsWith(".mp4"));
        file.appendTo("#video");
        document.getElementsByClassName("video_title")[0].innerHTML = file.name;

        var text = "";
        for (i = 0; i < torrent.files.length; i++) {
          text += "<p>" + torrent.files[i].name + "</p>";
        }
        document.getElementsByClassName("video_data")[0].innerHTML = text;

        // Trigger statistics refresh
        torrent.on('done', onDone)
        setInterval(onProgress, 500)
        onProgress()
        
        // Statistics
        function onProgress () {
            // Get the Peers
            $numPeers.innerHTML = torrent.numPeers + (torrent.numPeers === 1 ? ' peer' : ' peers');

            // Get Progress
            var percent = Math.round(torrent.progress * 100 * 100) / 100;
            $progressBar.style.width = percent + '%';
            $downloaded.innerHTML = prettyBytes(torrent.downloaded);
            $total.innerHTML = prettyBytes(torrent.length);

            // Remaining time - Uses momemt.js to convert time to a human readable format.
            var remaining;
            if (torrent.done) {
            remaining = 'Done.';
            } else {
            remaining = moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize();
            remaining = remaining[0].toUpperCase() + remaining.substring(1) + ' remaining.';
            }
            $remaining.innerHTML = remaining;

            // Get Speed rates
            $downloadSpeed.innerHTML = prettyBytes(torrent.downloadSpeed) + '/s';
            $uploadSpeed.innerHTML = prettyBytes(torrent.uploadSpeed) + '/s';
        }

        function onDone () {
            $body.className += ' is-seed';
            onProgress();
        }
    });
});

//Converts input to a human readable value.
function prettyBytes(num) {
    var exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if (neg) num = -num;
    if (num < 1) return (neg ? '-' : '') + num + ' B';
    exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
    num = Number((num / Math.pow(1000, exponent)).toFixed(2));
    unit = units[exponent];
    return (neg ? '-' : '') + num + ' ' + unit;
}    

const handle = {
    "adds": source => source.uids.forEach(suid => handle.add({uid: suid, initialize: true})), //create an offer for each of the existing peers
    "add": async source => {
        if (peers[source.uid] === undefined) {
            peers[source.uid] = new RTCPeerConnection(c.ice); //{optional: [{DtlsSrtpKeyAgreement: true}]}
            chan = peers[source.uid].createDataChannel("datachannel");
            
            peers[source.uid].onicecandidate = evt => {
                h.log("icecandidate#processing",  source.uid, evt.candidate, "me");
                if (evt.candidate) {
                    send("ICE", {uid: source.uid, candidate: evt.candidate});
                }
                h.log("icecandidate#processed",  source.uid, evt.candidate, "me");
            };

            //we're also tasked with starting the conn handshakes with the peer, cool
            if (source.initialize) {
                await peers[source.uid].setLocalDescription(await peers[source.uid].createOffer());
                send("SDP",{uid: source.uid, description: peers[source.uid].localDescription});
            }
        }
    },
    //these are basic communications structures, we basically need these as is
    "ICE": source => peers[source.uid].addIceCandidate(source.candidate),
    "SDP": async source => {
        switch (source.description.type) {
            case "offer":
                await handle["add"](source, false);
                await peers[source.uid].setRemoteDescription(source.description);
                const ans = await peers[source.uid].createAnswer();
                peers[source.uid].setLocalDescription(ans);
                send("SDP", {uid: source.uid, description: ans});
            break;
            case "answer":
                await peers[source.uid].setRemoteDescription(source.description);

            break;
            case "pranswer":
                console.error("legacy sdp type 'provisional answer' not implemented");
            break;
            case "rollback":
                console.error("sdp rollback not supported");
            break;
            default:
                console.error("invalid sdp type", source.type);
            break;
        }

    },
    "remove": source => {
        if (peers[source.uid] !== undefined) {
            if (peers[source.uid]) peers[source.uid].close();
            delete peers[source.uid];
        }
    },
    "removes": source  => source.uids.forEach(suid => handle.remove({uid: suid})),
    "disconnect": source => handle.removes({uids: Object.keys(peers)}),
};

//same here, this calls the handlers for the incoming messages
Object.entries(handle).forEach(([type,func]) => server.on(type, source => {
    h.log(`${type}#processing`, source.uid || "server", source, "me");
    func(source);
    h.log(`${type}#processed`, source.uid || "server", source, "me");
}));    
