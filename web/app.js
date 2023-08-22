//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream;              //stream from getUserMedia()
var rec;                    //Recorder.js object
var input;                  //MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //new audio context to help us record

async function startRecording() {
    console.log("recordButton clicked");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

        audioContext = new AudioContext({ sampleRate: 16000 });

        // assign to gumStream for later use
        gumStream = stream;

        // use the stream
        input = audioContext.createMediaStreamSource(stream);

        // Create the Recorder object and configure to record mono sound (1 channel)
        // Recording 2 channels will double the file size
        rec = new Recorder(input, { numChannels: 1 });

        // start the recording process
        rec.record();

        console.log("Recording started");
    } catch (err) {
        console.log(err);
    }
}

async function stopRecording() {
    return new Promise(async (resolve, reject) => {
        console.log("stopButton clicked");
        rec && rec.stop();

        // create WAV download link using audio data blob
        const url = await createDownloadLink();

        rec.clear();

        resolve(url);
    });
}

async function createDownloadLink() {
    return new Promise(resolve => {
        rec && rec.exportWAV(function (blob) {
            var url = URL.createObjectURL(blob);
            resolve(url);
        });
    });
}