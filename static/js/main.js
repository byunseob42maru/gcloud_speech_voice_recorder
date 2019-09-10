
// Account for different environments
window.AudioContext = window.AudioContext || window.webkitAudioContext;


function gotStream(stream) {
	audioInput = audioContext.createMediaStreamSource(stream); // Audio Input Node
	gainNode = audioContext.createGain(); // Gain Node to amplify audio stream
	audioInput.connect(gainNode);

	audioRecorder = new Recorder(gainNode); // Create Recorder object that receives audio data via Gain Node

	zeroGain = audioContext.createGain();
	zeroGain.gain.value = 0.0;
	inputPoint.connect(zeroGain);
	zeroGain.connect(audioContext.destination);
	//inputPoint.connect(audioContext.destination);
}

function setupAudio() {
	// Account for different environments
	if (!navigator.getUserMedia) {
		navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	}

	navigator.getUserMedia(
		{
			"audio": {
				"mandatory": {
					"googEchoCancellation": "false",
					"googAutoGainControl": "false",
					"googNoiseSuppression": "false",
					"googHighpassFilter": "false"
				},
				"optional": []
			},
		}, gotStream, function(e) {
			alert("Error: Audio source for recording not found.");
			console.log(e);
		});
	// Media Access가 성공하면 callback function인 gotStream()을 MediaStream object를 parameter값으로 pass하여 호출
}

window.addEventListener('load', setupAudio);
