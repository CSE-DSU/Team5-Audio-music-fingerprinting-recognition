import React, { useState, useEffect } from 'react';
import Background from '../components/Background'
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, ProgressBarAndroid } from 'react-native';
import Homelogo from '../components/Homelogo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Logoutbutton from '../components/Logoutbutton'
import Searchbtn from '../components/Searchbtn'
import { Audio } from 'expo-av';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';


export default function Dashboard({ navigation }) {


  const RECORDING_OPTIONS = {
    android: {
        extension: '.raw',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 16,
        bitPerSample: 16,
        endian: Audio.RECORDING_OPTION_ENDIAN_LITTLE,
        signed: true
    },
    ios: {
      extension: '.raw',
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  };

  const recordAudio = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to record audio denied');
        return;
      }
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await recording.startAsync();
      // Wait for 4 seconds
      await new Promise(resolve => setTimeout(resolve, 4000));
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      const response = await fetch('https://e891-103-186-69-78.ngrok-free.app/save_audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/raw',
        },
        body: await fetch(uri).then(response => response.blob()),
      });
      const base64_string = await response.text();

      const options = {
        method: 'POST',
        url: 'https://shazam.p.rapidapi.com/songs/detect',
        headers: {
          'content-type': 'text/plain',
          'X-RapidAPI-Key': 'df7eeeabbfmsh2a589ed5de3e0f2p17b937jsn7ef6b69f2a88',
          'X-RapidAPI-Host': 'shazam.p.rapidapi.com'
        },
        data: base64_string,
      };
      const data = await axios.request(options);
      console.log(data);

      // navigation.navigate('Output'); 
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Background>
      <Homelogo/>
      <Logoutbutton
        mode="outlined"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'StartScreen' }],
          })
        }
      >
        <Image source={require('../assets/logoutimg.png')}  />
      </Logoutbutton>
      <Searchbtn
        mode="outlined"
        onPress={recordAudio}
        ></Searchbtn>
    </Background>
  )
}

const styles = StyleSheet.create({
  logoButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 10,
  },
  logo: {
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});