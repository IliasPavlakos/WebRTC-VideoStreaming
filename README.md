### Web-based πρόγραμμα διαμοιρασμού video μέσω libtorrent και απλός signalling server
### Τεχνολογία Πολυμέσων 2019, Εργασία 2η
### Παναγιώτης Λαμπρόπουλος, 3050085, WebRTC signalling server, αρχική προσθήκη webtorrent, UI, documentation
### Ηλίας Παυλάκος, 3160143, UI, documentation
### Γιώργος Παπανώτας, 3130163, Σχεδιασμός και Υλοποίηση του UI με χρήση Bootstrap 4 και JQuery
### Ελευθέριος Χατζηαράπης, 3130225, Διορθώσεις στην αρχική προσθήκη webtorrent

#### Εξαρτήσεις
Το λογισμικό αναπτύχθηκε και δοκιμάστηκε με τις ακόλουθες εκδόσεις λογισμικού:
* Server:
  * nodejs ~v12.13.1 και npm ~6.12.1 https://nodejs.org/en/download/package-manager/
* Client:
  * Chrome on Windows	Version:79.0.3945.117	Release Date:2020-01-07
  * Chromium Version 78.0.3904.97 (Developer Build) built on Debian 10.1, running on Debian 10.2 (64-bit)
  * Firefox 68.2.0esr (64-bit)

#### Οδηγίες χρήσης:
* Server set-up:
  1. Εγκατάσταση των εξαρτήσεων του server: `npm install`
  1. Εκτέλεση του server: `npm start`
* Χρήση:
  1. Για την προσθήκη ενός torrent που βρίσκεται στην κατοχή ενός χρήστη, ο χρήστης απλά το προσθέτει με χρήση του κουμπιού +
  1. Για την αναπαραγωγή ενός βίντεο που βρίσκεται στο δίκτυο torrent, ο χρήστης απλά επιλέγει view

#### Τεχνική ανάλυση:
  * Project-wide:
    * WebRTC: Πρότυπο της IETF και του W3C που προσφέρει το API `RTCPeerConnection`, το οποίο αναλαμβάνει την μετάδοση των πολυμέσων, και στο οποίο τροφοδοτούνται πληροφορίες σύμφωνα με τα πρότυπα ICE και SDP για την επίτευξη αυτής
    * ICE: Πρότυπο της IETF που επιτρέπει την παράκαμψη firewall και NAT στην επικοινωνία μεταξύ των peers. Δεν υλοποιήθηκε STUN/TURN server, αλλά χρησιμοποιήθηκε λίστα δημοσίως διαθέσιμων
    * SDP: Πρότυπο της IETF που χρησιμοποιείται de facto στο WebRTC και επιτρέπει στους χρήστες του να περιγράφουν τις μεταξύ τους συνδέσεις
    * socket.io: Προτιμήθηκε για την υλοποίηση του signalling server αντί απλών websockets για λόγους ταχύτητας στη φάση του prototyping. Βασική δυνατότητά του που χρησιμοποιήθηκε είναι η επικοινωνία με custom events μεταξύ client και server (αυτά είναι τα "ICE" και "SDP")
    * javascript: Σύγχρονη javascript (ES2018) για συντηρισιμότητα/αναγνωσιμότητα του κώδικα με χρήση functional μεθόδων, promises, async/await, και syntactic sugar (spread operator)
  * Server-side:
    * node.js: Επιλέχθηκε ως μέτρο περιορισμού του χρόνου ανάπτυξης. Η χρήση javascript και στα 2 άκρα (server και client) επιτρέπει την άμεση επαναχρησιμοποίηση κώδικα ή/και config files
    * npm: Για εγκατάσταση εξαρτήσεων και εκκίνηση του node server
    * express.js: Καθώς το πεδίο του έργου ήταν το WebRTC, επιλέχθηκε η express.js ώστε να μειωθεί ο χρόνος ανάπτυξης σε θέματα static file serving και περιγραφής endpoints
    * openssl: Η αρχική ανάπτυξη έγινε χωρίς χρήση SSL· με πρόσβαση, δηλαδή, μέσω απλού `http` στον server που έτρεχε στο τοπικό μηχάνημα. Κατά τις δοκιμές απομακρυσμένης χρήσης της εφαρμογής, ανακαλύφτηκε πως το βασικό capability `getDisplayMedia()` που χρησιμοποιείται, είναι από τη σχεδίασή του διαθέσιμο σε browser-side javascript **μόνον** όταν η σύνδεση με τον εξυπηρετητή γίνεται μέσω `https`.
  * Client-side:
    * WebTorrent: client γραμμένος σε javascript που λειτουργεί στον browser χωρίς plugin, επεκτάσεις, ή εγκατάσταση. Με την βοήθεια του WebRTC για πραγματική peer-to-peer μεταφορά δεδομένων συνδέει τους χρηστές μιας ιστοσελίδας συνθέτοντας ένα δίκτυο διανομής πόρων από browser σε browser. Όσο περισσότεροι χρήστες χρησιμοποιούν την ιστοσελίδα τόσο πιο γρήγορη και αξιόπιστη γίνεται.To πρωτόκολλο του webTorrent λειτουργεί όπως και το πολύ γνωστό BitTorrent με την διάφορα ότι χρησιμοποιεί το WebRTC αντί για TCP/uTP για πρωτόκολλο μεταφοράς. 

#### Πηγές
   * Documetation του WebTorrent:
       * https://webtorrent.io/docs
       * https://github.com/webtorrent/webtorrent
       * https://github.com/webtorrent/webtorrent/blob/master/docs/api.md
   * Οδηγοί
     * Εκτεταμένος, προτεινόμενος οδηγός:
       * https://www.html5rocks.com/en/tutorials/webrtc/basics/
       * https://www.tribler.org/StreamingExperiment/
     * Απλοί βήμα προς βήμα οδηγοί:
       * https://blog.carbonfive.com/2014/10/16/webrtc-made-simple/
       * https://www.scaledrone.com/blog/webrtc-chat-tutorial/
       * https://webtorrent.io/intro
     * Σχηματική περιγραφή, χρήσιμη στην αποσφαλμάτωση της εφαρμογής:
       * https://www.pkc.io/blog/untangling-the-webrtc-flow/
   * Δείγμα υπαρχουσών εφαρμογών που μελετήθηκαν, υλοποιηθείσες σε διαφορετικές χρονικές περιόδους
     * https://github.com/EricssonResearch/openwebrtc
     * https://github.com/michaelneu/howto-webrtc
     * https://github.com/shanet/WebRTC-Example
     * https://github.com/feross/simple-peer
     * https://github.com/antoniom/webrtc-vanillajs
     * https://github.com/pubnub/webrtc-chat
     * https://github.com/0xc14m1z/webrtc-signaling-server
     * https://github.com/simplewebrtc/SimpleWebRTC
     * https://github.com/andyet/SimpleWebRTC
     * https://github.com/simplewebrtc/signalmaster
     * https://github.com/satanas/simple-signaling-server
     * https://github.com/simplewebrtc/SimpleWebRTC
     * https://github.com/HenrikJoreteg/SimpleWebRTC
     * https://github.com/ScaleDrone/webrtc-text-chat-tutorial
     * https://github.com/topics/webrtc-signaling
     * https://github.com/hakobera/serverless-webrtc-signaling-server
     * https://github.com/Swizec/webrtc-sample
   

#### Συμπεράσματα, προβλήματα, λύσεις
* Κατά την έρευνα και υλοποίηση της εφαρμογής, σχηματίστηκε η εντύπωση πως το πρωτόκολλο webrtc έχει περάσει πολλές φάσεις, ανά τα έτη, και πως σε κάθε νέα φάση, η υποστήριξη διαφόρων λειτουργιών από browsers/server software αλλάζει σε μεγάλο βαθμό. Κατά κάποιους το WebRTC είναι έτοιμο (https://bloggeek.me/webrtc-state-2019/), αλλά η βραχεία (και σχετικά επιφανειακή) τριβή με αυτό κατά την εκπόνηση της παρούσας εργασίας έδωσε την εντύπωση πως το πρωτόκολλο ακόμα ωριμάζει. Βασικός δείκτης αυτού είναι πως υποστήριξη για πολλές από τις λειτουργίες που ορίζονται από το πρωτόκολλο έχουν υλοποιηθεί πρόσφατα στους πιο δημοφιλείς browsers, ενώ άλλες δεν προσφέρονται ακόμη.
* Αν και το WebTorrent ανοίγει μια νέα πόρτα αποκεντρωμένης σύνδεσης από browser σε browser, δεν μπορείς να κατεβάσεις οποιοδήποτε τυχαίο magnet ή torrent file στο διαδίκτυο. Το torrent πρέπει να γίνεται seed αποκλειστικά από client που υποστηρίζει το πρωτόκολλο WebRTC. Έτσι οι desktop torrent clients πρέπει να προσθέσουν την επιπλέον υποστήριξη για το webRTC πρωτόκολλο προκειμένου να συνδεθούν με browsers στο web.
Clients που υποστιρίζουν WebRTC:
    * https://webtorrent.io/desktop
    * https://wiki.vuze.com/w/WebTorrent
    * https://instant.io/
    * https://btorrent.xyz/

#### Επεκτάσεις
Πιθανές επεκτάσεις της εφαρμογής περιλαμβάνουν:
  * Χρήση του `simple-peer` κατά το documentation του `webtorrent`, που δίνει τη δυνατότητα προσθήκης peers στο δίκτυο μας μέσω της εφαρμογής μας
  * Αφαίρεση του `webtorrent` και χρήση του WebRTC video stream απ'ευθείας απ'την εφαρμογή μας, με προσθήκη του `libtorrent`
  * Προσθήκη δυνατότητας διαμοιρασμού αρχείων torrent μεταξύ των συνδεδεμένων χρηστών μέσω `DataChannel`

#### Η ανάπτυξη έγινε σε περιβάλλον/με χρήση των εφαρμογών:
  * Visual Studio 2019
  * Debian 10.2
  * KDE 5.54.0 / Plasma 5.14.5
  * nano
  * KDevelop
