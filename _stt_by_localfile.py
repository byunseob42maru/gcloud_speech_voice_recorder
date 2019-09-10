import io
import time


def transcribe_file(speech_file):
    """Transcribe the given audio file."""
    from google.cloud import speech
    from google.cloud.speech import enums
    from google.cloud.speech import types
    client = speech.SpeechClient()

    with io.open(speech_file, 'rb') as audio_file:
        content = audio_file.read()

    audio = types.RecognitionAudio(content=content)
    config = types.RecognitionConfig(
        encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=48000,
        language_code='en-SG')
    start_time = time.time()
    operation = client.long_running_recognize(config, audio)

    print('Waiting for operation to complete...')
    test = ''
    response = operation.result(timeout=99999)

    # Each result is for a consecutive portion of the audio. Iterate through
    # them to get the transcripts for the entire audio file.
    for result in response.results:
        # The first alternative is the most likely one for this portion.
        print(result.alternatives[0].transcript)
        test += result.alternatives[0].transcript
        # print(u'Transcript: {}'.format(result.alternatives[0].transcript))
        # print('Confidence: {}'.format(result.alternatives[0].confidence))

    print("WorkingTime: {} sec".format(time.time() - start_time))
    return test

transcribe_file('tttt.wav')