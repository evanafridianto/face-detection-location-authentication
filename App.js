import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextBase, View } from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication';

import React, { useEffect, useState } from 'react';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';

import * as Location from 'expo-location';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [faceData, setFaceData] = useState([]);
  const [hasPermission, setHasPermission] = useState();

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // expo auth
  useEffect(() => {
    const authenticate = async () => {
      const result = await LocalAuthentication.authenticateAsync();
      setIsAuthenticated(result.success);
    };
    authenticate();
  }, []);

  // expo camera & face detection
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission == false) {
    return <Text>No access to camera</Text>;
  }

  // expo location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  // let text = 'Waiting..';
  // if (errorMsg) {
  //   text = errorMsg;
  // } else if (location) {
  //   text = JSON.stringify(location);
  // }

  function getFaceDataView() {
    if (faceData.length === 0) {
      return (
        <View style={styles.faces}>
          <Text style={styles.faceDesc}>No faces :(</Text>
        </View>
      );
    } else {
      return faceData.map((face, index) => {
        const eyesShut =
          face.rightEyeOpenProbability < 0.4 &&
          face.leftEyeOpenProbability < 0.4;
        const winking =
          !eyesShut &&
          (face.rightEyeOpenProbability < 0.4 ||
            face.leftEyeOpenProbability < 0.4);
        const smiling = face.smilingProbability > 0.7;
        return (
          <View key={index} style={styles.faces}>
            <Text style={styles.faceDesc}>
              Mata Tertutup : {eyesShut.toString()}
            </Text>

            <Text style={styles.faceDesc}>
              Mata Berkedip : {winking.toString()}
            </Text>
            <Text style={styles.faceDesc}>
              Tersenyum : {smiling.toString()}
            </Text>
          </View>
        );
      });
    }
  }
  const handledFacesDetected = ({ faces }) => {
    setFaceData(faces);
    // console.log(faces);
  };

  return (
    <>
      {isAuthenticated ? (
        <Camera
          type={Camera.Constants.Type.front}
          style={styles.camera}
          onFacesDetected={handledFacesDetected}
          faceDetectorSettings={{
            mode: FaceDetector.FaceDetectorMode.fast,
            detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
            runClassifications: FaceDetector.FaceDetectorClassifications.all,
            minDetectionInterval: 100,
            tracking: true,
          }}
        >
          <View>
            <Text style={styles.faceDesc}>
              Lokasi :{errorMsg ? { errorMsg } : JSON.stringify(location)}
            </Text>
            {/* {location.map((loc, index) => {
              <TextBase></Text>;
            })} */}
          </View>
          {getFaceDataView()}
        </Camera>
      ) : (
        <Text style={styles.faceDesc}>No Auth</Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  faces: {
    // backgroundColor: '#ffff',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
  },
  faceDesc: {
    fontSize: 15,
    color: '#fff',
  },
});
