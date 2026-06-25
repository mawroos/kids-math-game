import wave
import struct
import math

def generate_tone(filename, frequency, duration_sec, volume=0.5):
    sample_rate = 44100
    num_samples = int(sample_rate * duration_sec)

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        for i in range(num_samples):
            # simple sine wave
            value = int(volume * 32767.0 * math.sin(2.0 * math.pi * frequency * i / sample_rate))
            data = struct.pack('<h', value)
            wav_file.writeframesraw(data)

# Generate sounds
generate_tone('public/sounds/correct.wav', 880.0, 0.2) # High beep
generate_tone('public/sounds/wrong.wav', 220.0, 0.4) # Low boop
generate_tone('public/sounds/tick.wav', 1000.0, 0.05) # short tick
generate_tone('public/sounds/start.wav', 440.0, 0.5)
generate_tone('public/sounds/end.wav', 660.0, 1.0)
generate_tone('public/sounds/click.wav', 1200.0, 0.05)
