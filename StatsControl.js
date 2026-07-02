import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Touchable from "react-native-platform-touchable";
import StyleSheet, { Colors, Spacing, Radius, Metrics } from "./StyleSheet";

const StatsControl = ({ boardState, sendCommand }) => {
  const [ledsOn, setLedsOn] = useState(false);
  const [ampOn, setAmpOn] = useState(false);

  const toggleLeds = () => {
    const newState = !ledsOn;
    setLedsOn(newState);
    // Board expects: {command:"power", subcmd:"leds", arg:<bool>} (BluetoothCommands.java)
    sendCommand('power', newState ? 'true' : 'false', 'leds');
  };

  const toggleAmp = () => {
    const newState = !ampOn;
    setAmpOn(newState);
    // Board expects: {command:"power", subcmd:"amp", arg:<bool>}
    sendCommand('power', newState ? 'true' : 'false', 'amp');
  };

  const fmt = (v, unit, dec = 1) =>
    (v !== undefined && v !== null && !isNaN(parseFloat(v))) ? `${parseFloat(v).toFixed(dec)}${unit}` : 'N/A';

  const stat = (label, value, last) => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: Colors.borderPrimary,
    }}>
      <Text style={[StyleSheet.body, { color: Colors.textSecondary }]}>{label}</Text>
      <Text style={StyleSheet.body}>{value}</Text>
    </View>
  );

  const controlBtn = (label, active, onPress, accent = Colors.accent) => (
    <Touchable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: Metrics.scale(56),
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: active ? accent : Colors.borderPrimary,
        backgroundColor: active ? accent : Colors.surfaceSecondary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      background={Touchable.Ripple(Colors.borderSecondary)}>
      <Text style={[StyleSheet.body, { fontWeight: '700' }]}>{label}</Text>
    </Touchable>
  );

  return (
    <View style={StyleSheet.container}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
        <Text style={[StyleSheet.title, { marginBottom: Spacing.lg }]}>Board Control</Text>

        <View style={StyleSheet.card}>
          {stat('Voltage', fmt(boardState?.pv, ' V'))}
          {stat('LED Power', fmt(boardState?.pw, ' W'))}
          {stat('Regulator Temp', fmt(boardState?.pt, ' °C'))}
          {stat('Music Leader', boardState?.as || 'N/A')}
          {stat('Music Age', (boardState?.ah !== undefined && boardState?.ah !== null) ? String(boardState.ah) : 'N/A')}
          {stat('Music Cluster Size', (boardState?.an !== undefined && boardState?.an !== null) ? String(boardState.an) : 'N/A', true)}
        </View>

        <Text style={[StyleSheet.label, { marginTop: Spacing.xl, marginBottom: Spacing.sm }]}>Power</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {controlBtn('LEDs', ledsOn, toggleLeds)}
          {controlBtn('Amp', ampOn, toggleAmp)}
          {controlBtn('FUD', false, () => sendCommand('power', '', 'fud'), Colors.accentWarning)}
        </View>
      </ScrollView>
    </View>
  );
};

export default StatsControl;
