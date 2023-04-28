import React, { useState, useEffect } from 'react';
import Background from '../components/Background'
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, ProgressBarAndroid } from 'react-native';
import Homelogo from '../components/Homelogo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Logoutbutton from '../components/Logoutbutton'
import Searchbtn from '../components/Searchbtn'
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios'

const API_KEY = 'df7eeeabbfmsh2a589ed5de3e0f2p17b937jsn7ef6b69f2a88';
const API_URL = 'https://shazam.p.rapidapi.com/search';

export default function Output({ navigation }) {
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);

  const searchSong = async () => {
    try {
      const returnans = await fetch('https://e891-103-186-69-78.ngrok-free.app/find')
      const responseString = await returnans.text();
      console.log(responseString);
      const response = await fetch(`${API_URL}?term=${encodeURIComponent(responseString)}`, {
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'shazam.p.rapidapi.com',
        },
      });
      const data = await response.json();
      console.log(data);
      setArtists(data.artists.hits);
      setTracks(data.tracks.hits);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    searchSong();
  }, []);

  return (
    <Background>
      <Homelogo />
      <Logoutbutton
        mode="outlined"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'StartScreen' }],
          })
        }
      >
        <Image source={require('../assets/logoutimg.png')} />
      </Logoutbutton>
      <View style={styles.container}>
        {artists.length > 0 && tracks.length > 0 ? (
          <View style={styles.content}>
            <Image style={styles.image} source={{ uri: tracks[0].track.images.coverart }} />
              <Text style={styles.title}>
                <Text style={{ fontWeight: 'bold' }}>
                  {'\n\n'}{'Song name :'}{tracks[0].track.title}{'\n\n'}
                  {'Song by '}{artists[0].artist.name}
                </Text>
              </Text>
          </View>
        ) : (
          <Text style={styles.title}>Loading...</Text>
        )}
      </View>
    </Background>
  );
}


const styles = StyleSheet.create({
  container: {
    height: 575, // fixed height of 200 pixels
    width: 300,
    backgroundColor: 'rgba(220,192,192,0.5)', // grayish with transparency
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10, // shape of a rectangle with slightly rounded corners
    shadowColor: 'rgba(255,105,180,0.5)', // stronger pink shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
  },
  image: {
    align: 'center',
    width: 200,
    height: 200,
    resizeMode: 'contain',
    borderRadius: 10,
  },
});
