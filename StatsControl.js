import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Touchable from "react-native-platform-touchable";
import StyleSheet, { Colors } from "./StyleSheet";

const StatsControl = ({ pointerEvents, boardState, sendCommand }) => {
  const [ledsOn, setLedsOn] = useState(false);
  const [ampOn, setAmpOn] = useState(false);

  const toggleLeds = () => {
    const newState = !ledsOn;
    setLedsOn(newState);
    // Send command in the format: {"command": "leds", "arg": "on/off"}
    sendCommand('leds', newState ? 'on' : 'off');
  };

  const toggleAmp = () => {
    const newState = !ampOn;
    setAmpOn(newState);
    // Send command in the format: {"command": "amp", "arg": "on/off"}
    sendCommand('amp', newState ? 'on' : 'off');
  };

  return (
    <View style={[StyleSheet.container, { backgroundColor: Colors.backgroundPrimary }]}>
      <ScrollView style={{ backgroundColor: Colors.backgroundPrimary }} contentContainerStyle={{ padding: 20 }}>
        <View style={{
          backgroundColor: Colors.surfaceSecondary,
          borderRadius: 12,
          padding: 15,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: Colors.borderPrimary
        }}>
          <Text style={{ fontSize: 24, marginBottom: 20, color: Colors.textPrimary, textAlign: 'center', fontWeight: 'bold' }}>Board Control</Text>
      
          {/* Stats Display */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', marginBottom: 12, paddingVertical: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', width: 150, textAlign: 'left', color: Colors.textSecondary }}>Voltage:</Text>
              <Text style={{ fontSize: 16, flex: 1, textAlign: 'left', color: Colors.textPrimary }}>{boardState?.pv ? `${parseFloat(boardState.pv).toFixed(1)} Volts` : 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 12, paddingVertical: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', width: 150, textAlign: 'left', color: Colors.textSecondary }}>LED Power:</Text>
              <Text style={{ fontSize: 16, flex: 1, textAlign: 'left', color: Colors.textPrimary }}>{boardState?.pw ? `${parseFloat(boardState.pw).toFixed(1)} Watts` : 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 12, paddingVertical: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', width: 150, textAlign: 'left', color: Colors.textSecondary }}>Regulator Temp:</Text>
              <Text style={{ fontSize: 16, flex: 1, textAlign: 'left', color: Colors.textPrimary }}>{boardState?.pt ? `${parseFloat(boardState.pt).toFixed(1)} C` : 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 12, paddingVertical: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', width: 150, textAlign: 'left', color: Colors.textSecondary }}>Music Leader:</Text>
              <Text style={{ fontSize: 16, flex: 1, textAlign: 'left', color: Colors.textPrimary }}>{boardState?.as || 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 12, paddingVertical: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', width: 150, textAlign: 'left', color: Colors.textSecondary }}>Music Age:</Text>
              <Text style={{ fontSize: 16, flex: 1, textAlign: 'left', color: Colors.textPrimary }}>{boardState?.ah || 'N/A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 12, paddingVertical: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', width: 150, textAlign: 'left', color: Colors.textSecondary }}>Music Cluster Size:</Text>
              <Text style={{ fontSize: 16, flex: 1, textAlign: 'left', color: Colors.textPrimary }}>{boardState?.an || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
          <View style={[StyleSheet.button, { 
            backgroundColor: Colors.surfaceSecondary,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.borderPrimary,
            flex: 1,
            margin: 4,
            padding: 2
          }]}>
            <Touchable
              onPress={toggleLeds}
              style={[{ 
                backgroundColor: ledsOn ? Colors.accent : Colors.surfaceSecondary,
                borderRadius: 8,
                paddingVertical: 4,
                paddingHorizontal: 2
              }]}
              background={Touchable.Ripple(Colors.accentSecondary, false)}>
              <Text numberOfLines={1} style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary, fontSize: 16 }]}>LEDs</Text>
            </Touchable>
          </View>

          <View style={[StyleSheet.button, { 
            backgroundColor: Colors.surfaceSecondary,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.borderPrimary,
            flex: 1,
            margin: 4,
            padding: 2
          }]}>
            <Touchable
              onPress={toggleAmp}
              style={[{ 
                backgroundColor: ampOn ? Colors.accent : Colors.surfaceSecondary,
                borderRadius: 8,
                paddingVertical: 4,
                paddingHorizontal: 2
              }]}
              background={Touchable.Ripple(Colors.accentSecondary, false)}>
              <Text numberOfLines={1} style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary, fontSize: 16 }]}>Amp</Text>
            </Touchable>
          </View>

          <View style={[StyleSheet.button, { 
            backgroundColor: Colors.surfaceSecondary,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.borderPrimary,
            flex: 1,
            margin: 4,
            padding: 2
          }]}>
            <Touchable
              onPress={() => sendCommand('fud')}
              style={[{ 
                backgroundColor: Colors.surfaceSecondary,
                borderRadius: 8,
                paddingVertical: 4,
                paddingHorizontal: 2
              }]}
              background={Touchable.Ripple(Colors.accentSecondary, false)}>
              <Text numberOfLines={1} style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary, fontSize: 16 }]}>FUD</Text>
            </Touchable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default StatsControl;
