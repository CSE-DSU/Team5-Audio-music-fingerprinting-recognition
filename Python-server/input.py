from flask import Flask, request
import os
import numpy as np
import librosa
import soundfile as sf
import pickle
from scipy import fft, signal
from scipy.io.wavfile import read
from pydub import AudioSegment
import csv
import base64

app = Flask(__name__)

@app.route('/save_audio', methods=['POST'])
def save_audio():
    audio_data = request.get_data()
    audio_file = os.path.join('assets', 'recording.raw')
    with open(audio_file, 'wb') as f:
        f.write(audio_data)
    with open("assets/recording.raw", "rb") as f:
        bytes_data = f.read()
    base64_bytes = base64.b64encode(bytes_data)
    base64_string = base64_bytes.decode('utf-8')
    print (base64_string)
    return base64_string



# @app.route('/noice')
# def noice():
#     # Load the audio file
#     audio_file, sr = librosa.load('assets/recording.wav', sr=None)

#     # Compute the Short Time Fourier Transform (STFT)
#     stft = librosa.stft(audio_file)

#     # Compute the magnitude and phase components of the STFT
#     magnitude = np.abs(stft)
#     phase = np.angle(stft)

#     # Estimate the noise profile using the first few frames of the magnitude spectrogram
#     noise_frames = 10  # number of frames to use for noise estimation
#     noise_profile = np.mean(magnitude[:, :noise_frames], axis=1)

#     # Subtract the noise profile from the magnitude spectrogram using spectral subtraction
#     subtracted_mag = np.maximum(magnitude - noise_profile[:, np.newaxis], 0)

#     # Reconstruct the audio signal using the modified magnitude and original phase
#     modified_stft = subtracted_mag * np.exp(1j * phase)
#     modified_audio = librosa.istft(modified_stft)

#     # Save the processed audio signal to disk
#     sf.write('assets/cleanRecording.wav', audio_file, sr)


@app.route('/create_constellation')
def create_constellation(audio, Fs):
    # Parameters
    window_length_seconds = 0.5
    window_length_samples = int(window_length_seconds * Fs)
    window_length_samples += window_length_samples % 2
    num_peaks = 15

    # Pad the song to divide evenly into windows
    amount_to_pad = window_length_samples - audio.size % window_length_samples

    song_input = np.pad(audio, (0, amount_to_pad))

    # Perform a short time fourier transform
    frequencies, times, stft = signal.stft(
        song_input, Fs, nperseg=window_length_samples, nfft=window_length_samples, return_onesided=True
    )

    constellation_map = []

    for time_idx, window in enumerate(stft.T):
        # Spectrum is by default complex. 
        # We want real values only
        spectrum = abs(window)
        # Find peaks - these correspond to interesting features
        # Note the distance - want an even spread across the spectrum
        peaks, props = signal.find_peaks(spectrum, prominence=0, distance=200)

        # Only want the most prominent peaks
        # With a maximum of 15 per time slice
        n_peaks = min(num_peaks, len(peaks))
        # Get the n_peaks largest peaks from the prominences
        # This is an argpartition
        # Useful explanation: https://kanoki.org/2020/01/14/find-k-smallest-and-largest-values-and-its-indices-in-a-numpy-array/
        largest_peaks = np.argpartition(props["prominences"], -n_peaks)[-n_peaks:]
        for peak in peaks[largest_peaks]:
            frequency = frequencies[peak]
            constellation_map.append([time_idx, frequency])

    return constellation_map


@app.route('/create_hashes')
def create_hashes(constellation_map, song_id=None):
    hashes = {}
    # Use this for binning - 23_000 is slighlty higher than the maximum
    # frequency that can be stored in the .wav files, 22.05 kHz
    upper_frequency = 23_000 
    frequency_bits = 10

    # Iterate the constellation
    for idx, (time, freq) in enumerate(constellation_map):
        # Iterate the next 100 pairs to produce the combinatorial hashes
        # When we produced the constellation before, it was sorted by time already
        # So this finds the next n points in time (though they might occur at the same time)
        for other_time, other_freq in constellation_map[idx : idx + 500]: 
            diff = other_time - time
            # If the time difference between the pairs is too small or large
            # ignore this set of pairs
            if diff <= 1 or diff > 10:
                continue

            # Place the frequencies (in Hz) into a 1024 bins
            freq_binned = freq / upper_frequency * (2 ** frequency_bits)
            other_freq_binned = other_freq / upper_frequency * (2 ** frequency_bits)

            # Produce a 32 bit hash
            # Use bit shifting to move the bits to the correct location
            hash = int(freq_binned) | (int(other_freq_binned) << 10) | (int(diff) << 20)
            hashes[hash] = (time, song_id)
    return hashes



@app.route('/find')
def find():
    # Load the database
    database = pickle.load(open('data/database.pickle', 'rb'))

    # Load the song index from CSV file
    song_name_index = {}
    with open('data/songs.csv', 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        next(reader) # skip header row
        for row in reader:
            song_id, song_name = row
            song_name_index[int(song_id)] = song_name

    # Load a short recording with some background noise
    Fs, audio_input = read("assets\cleanRecording.wav")
    # Create the constellation and hashes
    constellation = create_constellation(audio_input, Fs)
    hashes = create_hashes(constellation, None)

    # For each hash in the song, check if there's a match in the database
    # There could be multiple matching tracks, so for each match:
    #   Incrememnt a counter for that song ID by one
    matches_per_song = {}
    for hash, (sample_time, _) in hashes.items():
        if hash in database:
            matching_occurences = database[hash]
            for source_time, song_id in matching_occurences:
                if song_id not in matches_per_song:
                    matches_per_song[song_id] = 0
                matches_per_song[song_id] += 1

    max_matches_song_id, max_matches = max(matches_per_song.items(), key=lambda x: x[1])
    for song_id, num_matches in list(sorted(matches_per_song.items(), key=lambda x: x[1], reverse=True))[:10]:
        print(f"Song: {song_name_index[song_id]} - Matches: {num_matches}")

    # Create the response string with the song name and num_matches
    response_string = f"{song_name_index[max_matches_song_id]} "

    print (response_string)
    return response_string

if __name__ == "__main__":
    app.run(debug=True)