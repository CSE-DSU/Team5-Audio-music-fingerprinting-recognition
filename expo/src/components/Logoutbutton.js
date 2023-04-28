import React from 'react';
import { TouchableOpacity, StyleSheet, Image, View } from 'react-native';

const Logoutbutton = ({ onPress, source }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        style={styles.button}
      >
        <Image source={require('../assets/logoutimg.png')} style={styles.image} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 738,
    left: 300,
    width: 50,
    height: 50,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 50,
    height: 50,
  },
});

export default Logoutbutton;
