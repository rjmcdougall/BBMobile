import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 30 }}>Stats Screen</Text>
      
      {/* Stats Display */}
      <View style={{ marginBottom: 30, alignSelf: 'stretch', paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', width: 180, textAlign: 'left' }}>Voltage:</Text>
          <Text style={{ fontSize: 18, flex: 1, textAlign: 'left' }}>{boardState?.pv ? `${parseFloat(boardState.pv).toFixed(1)} Volts` : 'N/A'}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', width: 180, textAlign: 'left' }}>LED Power:</Text>
          <Text style={{ fontSize: 18, flex: 1, textAlign: 'left' }}>{boardState?.pw ? `${parseFloat(boardState.pw).toFixed(1)} Watts` : 'N/A'}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', width: 180, textAlign: 'left' }}>Regulator Temp:</Text>
          <Text style={{ fontSize: 18, flex: 1, textAlign: 'left' }}>{boardState?.pt ? `${parseFloat(boardState.pt).toFixed(1)} C` : 'N/A'}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', width: 180, textAlign: 'left' }}>Music Leader:</Text>
          <Text style={{ fontSize: 18, flex: 1, textAlign: 'left' }}>{boardState?.as || 'N/A'}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', width: 180, textAlign: 'left' }}>Music Age:</Text>
          <Text style={{ fontSize: 18, flex: 1, textAlign: 'left' }}>{boardState?.ah || 'N/A'}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', width: 180, textAlign: 'left' }}>Music Cluster Size:</Text>
          <Text style={{ fontSize: 18, flex: 1, textAlign: 'left' }}>{boardState?.an || 'N/A'}</Text>
        </View>
      </View>
      
      {/* Control Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
        <Button 
          title={`LEDs ${ledsOn ? 'ON' : 'OFF'}`} 
          onPress={toggleLeds}
          color={ledsOn ? 'green' : 'gray'}
        />
        <Button 
          title={`AMP ${ampOn ? 'ON' : 'OFF'}`} 
          onPress={toggleAmp}
          color={ampOn ? 'green' : 'gray'}
        />
        <Button 
          title="FU-Dan" 
          onPress={() => sendCommand('fud')}
          color="blue"
        />
      </View>
    </View>
  );
};

export default StatsControl;
