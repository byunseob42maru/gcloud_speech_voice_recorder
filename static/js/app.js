//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

let gumStream; 						//stream from getUserMedia()
let rec; 							//Recorder.js object
let input; 							//MediaStreamAudioSourceNode we'll be recording

let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext; //audio context to help us record

let recordButton = document.getElementById("recordButton");
let stopButton = document.getElementById("stopButton");
let pauseButton = document.getElementById("pauseButton");

let file = document.getElementById("print");
let isRecording = false;


$("#fileUploadButton").click((e) => {
    e.preventDefault();
    $("#file").trigger('click');
});


function startRecording() {
    console.log("recordButton clicked");
    /*
        Simple constraints object, for more advanced audio features see
        https://addpipe.com/blog/audio-constraints-getusermedia/
    */

    let constraints = {audio: true, video: false};

    /*
       Disable the record button until we get a success or fail from getUserMedia()
   */

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

        /*
            create an audio context after getUserMedia is called
            sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
            the sampleRate defaults to the one set in your OS for your playback device
        */
        audioContext = new AudioContext();

        /*  assign to gumStream for later use  */
        gumStream = stream;

        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);

        /*
            Create the Recorder object and configure to record mono sound (1 channel)
            Recording 2 channels  will double the file size
        */
        rec = new Recorder(input, {numChannels: 1});

        //start the recording process
        rec.record();

        console.log("Recording started");

    }).catch(function (err) {
        //enable the record button if getUserMedia() fails
        recordButton.disabled = false;
        stopButton.disabled = true;
        pauseButton.disabled = true
    });
}

function pauseRecording() {
    console.log("pauseButton clicked rec.recording=", rec.recording);
    if (rec.recording) {
        //pause
        rec.stop();
        pauseButton.innerHTML = "Resume";
    } else {
        //resume
        rec.record();
        pauseButton.innerHTML = "Pause";

    }
}

function stopRecording() {
    console.log("stopButton clicked");

    rec.stop();

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();

    //create the wav blob and pass it on to createDownloadLink
    rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
    let url = URL.createObjectURL(blob);
    let au = document.getElementById('audio');

    let filename = new Date().toISOString();

    au.controls = true;
    au.src = url;
    $("#audio").css("display", "block");

    const upload = () => {
        $("#p_caption").text("Speak to text converting.....");
        let xhr = new XMLHttpRequest();
        xhr.onload = function (e) {
            if (this.readyState === 4) {
                $("#p_caption").text('');
                const resultText = e.target.responseText;
                console.log("Server returned: ", resultText);
                console.log(resultText)
                if (resultText) {
                    const text = $("#p_caption").text();
                    $("#p_caption").text(text + '\n' + e.target.responseText);
                } else {
                    $("#p_caption").text('The voice is inaccurate. Please rerecord');
                }
            }
        };
        xhr.onerror = () => {
            console.error("STT error");
            $("#p_caption").text('STT result is error. Please rerecord');
        };
        let fd = new FormData();
        fd.append("file", blob, filename);
        xhr.open("POST", "/uploads", true);
        xhr.send(fd);
    };

    upload();
    // li.appendChild(document.createTextNode(" "))//add a space in between
    // li.appendChild(upload)//add the upload link to li

    //add the li element to the ol
}

function toggleRecording() {
    const micIcon = document.getElementById("mic");
    isRecording = !isRecording;

    if (isRecording) {
        micIcon.src = "/static/images/microphone_recording.png";
        $("#show_rec_status").attr("style", "visiblility:visible");
        startRecording();
        if (!rec) {
            return;
        }
    } else {
        micIcon.src = "/static/images/microphone_idle.png";
        $("#show_rec_status").attr("style", "visibility:hidden");
        stopRecording();
    }
}