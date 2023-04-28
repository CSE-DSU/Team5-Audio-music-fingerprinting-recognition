import React from 'react';
import { TouchableOpacity, StyleSheet,  Image} from 'react-native';
import * as Animatable from "react-native-animatable";

const CircleButton = ({ onPress, title }) => {
  return (
    <Animatable.View 
            animation={"pulse"}
            easing="ease-in-out"
            iterationCount={"infinite"}
            className="w-[200px] h-[200px] items-center justify-center rounded-full bg-[#289792]"
          >
            <TouchableOpacity
              onPress={onPress}
              style={styles.button}
            >
            <Image source={require('../assets/mic.png')} style={styles.image} />
      
            </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 170,
    height: 170,
    borderRadius: 170/2,
    backgroundColor: '#ec729c',
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  image: {
    width: 50,
    height: 50,
  },
});

export default CircleButton;
