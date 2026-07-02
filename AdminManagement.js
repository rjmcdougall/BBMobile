import React, { Component } from "react";
import {
	View,
	ScrollView,
	Text
} from "react-native";
import Touchable from "react-native-platform-touchable";
import PropTypes from "prop-types";
import StyleSheet, { Colors, Spacing } from "./StyleSheet";

const UNLOCK_CODE = "6161b2838ffa6ce17b84db3b45b4f8437855ecf43e75de2d1ad0008eaae91aa0";

export default class AdminManagement extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isActive: false
		};
	}

	// A single full-width toggle row: accent-filled when active, with an ON/OFF
	// indicator. `danger` styles it as a destructive/emergency control.
	toggle(label, active, onPress, danger = false) {
		const onColor = danger ? Colors.accentError : Colors.accent;
		return (
			<Touchable
				onPress={onPress}
				style={[StyleSheet.card, {
					marginBottom: Spacing.md,
					backgroundColor: active ? onColor : Colors.surfaceSecondary,
					borderColor: active ? onColor : (danger ? Colors.accentError : Colors.borderPrimary),
				}]}
				background={Touchable.Ripple(Colors.borderSecondary)}>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={[StyleSheet.subheading, (danger && !active) ? { color: Colors.accentError } : null]}>{label}</Text>
					<Text style={[StyleSheet.caption, { color: active ? Colors.textPrimary : Colors.textTertiary }]}>{active ? "ON" : "OFF"}</Text>
				</View>
			</Touchable>
		);
	}

	render() {
		const bs = this.props.boardState;
		const unlocked = this.props.userPrefs.unlockCode === UNLOCK_CODE;

		return (
			<View style={StyleSheet.container}>
				<ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
					<Text style={[StyleSheet.title, { marginBottom: Spacing.lg }]}>Controls</Text>

					{this.toggle("GTFO", bs.g, () => this.props.sendCommand("EnableGTFO", !bs.g))}
					{this.toggle("Master Remote", bs.am, () => this.props.sendCommand("EnableMaster", !bs.am))}
					{this.toggle("Block Master Remote", bs.bm, () => this.props.sendCommand("BlockMaster", !bs.bm))}
					{this.toggle("Rotating Display", bs.rd, () => this.props.sendCommand("SetRotatingDisplay", !bs.rd))}

					{unlocked && (
						<View>
							{this.toggle("Fun Mode", bs.fm, () => this.props.sendCommand("FunMode", !bs.fm))}
							{this.toggle("Block Auto Rotation", bs.bar, () => this.props.sendCommand("BlockAutoRotation", !bs.bar))}
						</View>
					)}

					<View style={{ height: Spacing.xl }} />

					<Text style={[StyleSheet.label, { marginBottom: Spacing.sm }]}>Emergency</Text>
					{this.toggle("EMERGENCY", bs.r, () => this.props.sendCommand("SetCrisis", !bs.r), true)}
				</ScrollView>
			</View>
		);
	}
}

AdminManagement.propTypes = {
	boardState: PropTypes.object,
	sendCommand: PropTypes.func,
	devices: PropTypes.array,
	wifi: PropTypes.array,
	userPrefs: PropTypes.object,
};
