import io
from pydub import AudioSegment
import speech_recognition as sr
import whisper
import tempfile
import os
import pyttsx3
import sys

## Para guardar archivos temporales

temp_file=tempfile.mkdtemp()
save_path = os.path.join(temp_file,'temp.wav')

## print(f'this is save_path: {save_path}')

listener = sr.Recognizer()

def listen_audio():
    try:
        with sr.Microphone() as source:
            ## print('lintening .... ')
            listener.adjust_for_ambient_noise(source) ## linpia el audio del ruido de fondo
            audio = listener.listen(source)
            data=io.BytesIO(audio.get_wav_data())
            audio_clip=AudioSegment.from_file(data) ## reconoce solo cuando hablo y no el ruido de fondo
            audio_clip.export(save_path,format='wav')

    except Exception as e:
        print(e)
 
    return save_path ## ruta del archivo que usara whisper

def recognize_audio(save_path):
    audio_model = whisper.load_model("base") ## se puede cambiar el peso del modelo 
    transcripcion = audio_model.transcribe(save_path, language = 'spanish', fp16=False)
    return transcripcion['text']    


if __name__ == '__main__':
    audio_path = sys.argv[1] if len(sys.argv) > 1 else listen_audio()  # Usar ruta si es proporcionada
    response = recognize_audio(audio_path)
    print(response)