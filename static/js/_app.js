//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

let gumStream; 						//stream from getUserMedia()
let rec; 							//Recorder.js object
let input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb.
let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext; //audio context to help us record

let recordButton = document.getElementById("recordButton");
let stopButton = document.getElementById("stopButton");
let pauseButton = document.getElementById("pauseButton");
let fileUploadButton = document.getElementById("fileUploadButton");

let file = document.getElementById("print");
let isRecording = false;

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

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

    recordButton.disabled = true;
    stopButton.disabled = false;
    pauseButton.disabled = false

    /*
        We're using the standard promise based getUserMedia()
        https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    */

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

        /*
            create an audio context after getUserMedia is called
            sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
            the sampleRate defaults to the one set in your OS for your playback device
        */
        audioContext = new AudioContext();

        //update the format
        document.getElementById("formats").innerHTML = "Format: 1 channel pcm @ " + audioContext.sampleRate / 1000 + "kHz"

        /*  assign to gumStream for later use  */
        gumStream = stream;

        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);

        /*
            Create the Recorder object and configure to record mono sound (1 channel)
            Recording 2 channels  will double the file size
        */
        rec = new Recorder(input, {numChannels: 1})

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
        rec.record()
        pauseButton.innerHTML = "Pause";

    }
}

function stopRecording() {
    console.log("stopButton clicked");

    //disable the stop button, enable the record too allow for new recordings
    stopButton.disabled = true;
    recordButton.disabled = false;
    pauseButton.disabled = true;

    //reset button just in case the recording is stopped while paused
    pauseButton.innerHTML = "Pause";

    //tell the recorder to stop the recording
    rec.stop();

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();

    //create the wav blob and pass it on to createDownloadLink
    rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
    let url = URL.createObjectURL(blob);
    let au = document.createElement('audio');
    let li = document.createElement('li');
    let link = document.createElement('a');

    //name of .wav file to use during upload and download (without extendion)
    let filename = new Date().toISOString();

    //add controls to the <audio> element
    au.controls = true;
    au.src = url;

    //save to disk link
    // link.href = url;
    // link.download = filename + ".wav"; //download forces the browser to donwload the file using the  filename
    // link.innerHTML = "Save to disk";

    //add the new audio element to li
    li.appendChild(au);

    //add the filename to the li
    // li.appendChild(document.createTextNode(filename + ".wav "))

    //add the save to disk link to li
    li.appendChild(link);

    //upload link
    // let upload = document.createElement('a');
    // upload.href = "#";
    // upload.innerHTML = "Upload";
    // upload.addEventListener("click", () => {
    //     document.getElementById("print").value = "";
    //     let xhr = new XMLHttpRequest();
    //     xhr.onload = function (e) {
    //         if (this.readyState === 4) {
    //             console.log("Server returned: ", e.target.responseText);
    //             document.getElementById("print").value += '\n' + e.target.responseText;
    //         }
    //     };
    //     let fd = new FormData();
    //     fd.append("file", blob, filename);
    //     xhr.open("POST", "/uploads", true);
    //     xhr.send(fd);
    // });

    const upload = () => {
        document.getElementById("print").value = "";
        let xhr = new XMLHttpRequest();
        xhr.onload = function (e) {
            if (this.readyState === 4) {
                console.log("Server returned: ", e.target.responseText);
                document.getElementById("print").value += '\n' + e.target.responseText;
            }
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
    recordingsList.appendChild(li);
}

function toggleRecording() {
	var micIcon = document.getElementById("mic");
	isRecording = !isRecording;

	if (isRecording) { // Now recording (i.e. isRecording = true)
		if (!rec) { // If audioRecorder does not exist
			return;
		} // If audioRecorder exists
		micIcon.src = "http://localhost:8100/static/images/microphone_recording.png";
		$("#show_rec_status").attr("style", "visiblility:visible");
		rec.clear();
		rec.record();
	}
	else { // Now stopping (i.e. isRecording = false)
		micIcon.src = "http://localhost:8100/static/images/microphone_idle.png";
		$("#show_rec_status").attr("style", "visibility:hidden");
		rec.stop();
	}
}