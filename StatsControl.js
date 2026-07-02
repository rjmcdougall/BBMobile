import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Touchable from "react-native-platform-touchable";
import StyleSheet, { Colors, Spacing, Radius, Metrics } from "./StyleSheet";

// The board does not report LED/amp on/off status, so we track the intended
// state here. Keeping it at module scope preserves it across screen switches
// (the component unmounts when you navigate away).
let ledsState = false;
let ampState = false;

const StatsControl = ({ boardState, sendCommand }) => {
  const [ledsOn, setLedsOn] = useState(ledsState);
  const [ampOn, setAmpOn] = useState(ampState);

  const toggleLeds = () => {
    const newState = !ledsOn;
    ledsState = newState;
    setLedsOn(newState);
    // Board expects: {command:"power", subcmd:"leds", arg:<bool>} (BluetoothCommands.java)
    sendCommand('power', newState ? 'true' : 'false', 'leds');
  };

  const toggleAmp = () => {
    const newState = !ampOn;
    ampState = newState;
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

  // Stateful on/off toggle: accent-filled when on, with an explicit ON/OFF badge.
  const powerToggle = (label, active, onPress) => (
    <Touchable
      onPress={onPress}
      style={[StyleSheet.card, {
        marginBottom: Spacing.md,
        backgroundColor: active ? Colors.accent : Colors.surfaceSecondary,
        borderColor: active ? Colors.accent : Colors.borderPrimary,
      }]}
      background={Touchable.Ripple(Colors.borderSecondary)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={StyleSheet.subheading}>{label}</Text>
        <View style={{
          paddingHorizontal: Spacing.md,
          paddingVertical: Metrics.scale(3),
          borderRadius: Radius.pill,
          backgroundColor: active ? 'rgba(255,255,255,0.25)' : Colors.surfaceTertiary,
        }}>
          <Text style={{ fontSize: Metrics.fontScale(12), fontWeight: '800', letterSpacing: 0.5, color: active ? Colors.textPrimary : Colors.textTertiary }}>
            {active ? 'ON' : 'OFF'}
          </Text>
        </View>
      </View>
    </Touchable>
  );

  // Momentary action (no persistent state): distinct outlined/warning look.
  const momentaryBtn = (label, onPress) => (
    <Touchable
      onPress={onPress}
      style={[StyleSheet.card, {
        alignItems: 'center',
        backgroundColor: Colors.surfaceSecondary,
        borderColor: Colors.accentWarning,
      }]}
      background={Touchable.Ripple(Colors.borderSecondary)}>
      <Text style={[StyleSheet.subheading, { color: Colors.accentWarning }]}>{label}</Text>
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
        {powerToggle('LEDs', ledsOn, toggleLeds)}
        {powerToggle('Amp', ampOn, toggleAmp)}

        <Text style={[StyleSheet.label, { marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>Actions</Text>
        {momentaryBtn('Restart Board App (FUD)', () => sendCommand('power', '', 'fud'))}
      </ScrollView>
    </View>
  );
};

export default StatsControl;
