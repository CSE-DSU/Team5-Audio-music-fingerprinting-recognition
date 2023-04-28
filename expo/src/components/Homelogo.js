import React from 'react'
import { Image, StyleSheet , View} from 'react-native'

export default function Logo() {
  return(
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 541,
    left: 120,
    width: 50,
    height: 50,
  },
  image: {
    Position:'absolute',
    width: 90,
    height: 90,
    marginBottom: 10,
    bottom:215,
    right:130,
  },
})
