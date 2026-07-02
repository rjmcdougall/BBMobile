import React, { Component } from "react";
import {
	View,
	ScrollView,
	Text,
	Linking,
	TextInput,
} from "react-native";

import Touchable from "react-native-platform-touchable";
import PropTypes from "prop-types";
import StyleSheet, { Colors, Spacing, Radius, Metrics } from "./StyleSheet";
import Mapbox from "@rnmapbox/maps";
import Constants from "./Constants";
import { sha256 } from 'js-sha256';

Mapbox.setAccessToken(
	"sk.eyJ1IjoiZGFuaWVsa2VpdGh3IiwiYSI6ImNqdzhlbHUwZTJvdmUzenFramFmMTQ4bXIifQ.9EXJnBcsrsKyS-veb_dlNg"
);

export default class AppManagement extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isActive: false
		};

		this.progressListener = this.progressListener.bind(this);
		this.errorListener = this.errorListener.bind(this);
	}

	async sleep(ms) {
		await this._sleep(ms);
	}

	_sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async clearCache() {
		this.setState({ cacheButton: "green" });
		await this.props.clearCache();
		this.setState({ cacheButton: "skyblue" });
	}

	async componentDidMount() {
		console.log(await Mapbox.offlineManager.getPacks());
		this.setState({ downloaded: await Mapbox.offlineManager.getPack("Playa") });
	}

	progressListener(offlineRegion, offlineRegionStatus) {
		var userPrefs = this.props.userPrefs;
		userPrefs.offlineMapPercentage = offlineRegionStatus.percentage;
		this.props.setUserPrefs(userPrefs);
	}

	errorListener(error) {
		console.log(error);
	}

	async bbCom() {
		this.setState({ bbComButton: "green" });
		var supported = await Linking.canOpenURL("https://burnerboard.com");
		if (supported) {
			await this.sleep(500);
			Linking.openURL("https://burnerboard.com");
		} else {
			console.log("Don't know how to open URI: " + "https://burnerboard.com");
		}
		this.setState({ bbComButton: "skyblue" });
	}

	// Full-width action button (single label). `color` overrides the surface.
	action(label, onPress, color, pointerEvents) {
		return (
			<View pointerEvents={pointerEvents || "auto"}>
				<Touchable
					onPress={onPress}
					style={[StyleSheet.card, {
						marginBottom: Spacing.md,
						alignItems: "center",
						backgroundColor: color || Colors.surfaceSecondary,
						borderColor: color || Colors.borderPrimary,
					}]}
					background={Touchable.Ripple(Colors.borderSecondary)}>
					<Text style={StyleSheet.subheading}>{label}</Text>
				</Touchable>
			</View>
		);
	}

	// Full-width toggle row with ON/OFF indicator.
	toggle(label, active, onPress) {
		return (
			<Touchable
				onPress={onPress}
				style={[StyleSheet.card, {
					marginBottom: Spacing.md,
					backgroundColor: active ? Colors.accent : Colors.surfaceSecondary,
					borderColor: active ? Colors.accent : Colors.borderPrimary,
				}]}
				background={Touchable.Ripple(Colors.borderSecondary)}>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={StyleSheet.subheading}>{label}</Text>
					<Text style={[StyleSheet.caption, { color: active ? Colors.textPrimary : Colors.textTertiary }]}>{active ? "ON" : "OFF"}</Text>
				</View>
			</Touchable>
		);
	}

	// One segment of the Map Mode control.
	segment(label, active, onPress) {
		return (
			<Touchable
				onPress={onPress}
				style={{
					flex: 1,
					minHeight: Metrics.scale(46),
					borderRadius: Radius.md,
					borderWidth: 1,
					borderColor: active ? Colors.accent : Colors.borderPrimary,
					backgroundColor: active ? Colors.accent : Colors.surfaceSecondary,
					alignItems: "center",
					justifyContent: "center",
				}}
				background={Touchable.Ripple(Colors.borderSecondary)}>
				<Text style={[StyleSheet.body, { fontWeight: "600" }]}>{label}</Text>
			</Touchable>
		);
	}

	render() {
		var downloadText;
		var downloadColor = null;
		var pointerEvents;

		if (this.props.userPrefs.offlineMapPercentage == 100) {
			downloadText = "Playa Map Downloaded";
			downloadColor = Colors.accentSecondary;
			pointerEvents = "none";
		}
		else if (this.props.userPrefs.offlineMapPercentage > 0 && this.props.userPrefs.offlineMapPercentage < 100) {
			downloadText = "Downloading " + Math.round(this.props.userPrefs.offlineMapPercentage) + "%";
			downloadColor = Colors.accentWarning;
			pointerEvents = "auto";
		}
		else {
			downloadText = "Download Playa Map";
			downloadColor = null;
			pointerEvents = "auto";
		}

		const AM = this;
		const prefs = this.props.userPrefs;
		const mode = prefs.mapMode;

		const inputStyle = {
			minHeight: Metrics.scale(46),
			borderColor: Colors.borderSecondary,
			borderWidth: 1,
			borderRadius: Radius.md,
			backgroundColor: Colors.backgroundPrimary,
			color: Colors.textPrimary,
			paddingHorizontal: Spacing.md,
			fontSize: Metrics.fontScale(16),
			textAlignVertical: 'center',
			marginTop: Spacing.sm,
		};

		return (
			<View style={StyleSheet.container}>
				<ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }} keyboardShouldPersistTaps="handled">
					<Text style={[StyleSheet.title, { marginBottom: Spacing.lg }]}>Settings</Text>

					{this.action("Clear Cache", () => this.clearCache(), this.state.cacheButton === "green" ? Colors.accentSecondary : null)}
					{this.toggle("Left Handed", prefs.isDevilsHand, () => {
						prefs.isDevilsHand = !prefs.isDevilsHand;
						this.props.setUserPrefs(prefs);
					})}

					<Text style={[StyleSheet.label, { marginBottom: Spacing.sm }]}>Map Mode</Text>
					<View style={{ flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.md }}>
						{this.segment("Me", mode === "me", () => { prefs.mapMode = "me"; this.props.setUserPrefs(prefs); })}
						{this.segment("Playa", mode === "playa", () => { prefs.mapMode = "playa"; this.props.setUserPrefs(prefs); })}
						{this.segment("Auto", mode === "auto" || !mode, () => { prefs.mapMode = "auto"; this.props.setUserPrefs(prefs); })}
					</View>

					{this.toggle("Map Overlay", prefs.showMapOverlay, () => {
						prefs.showMapOverlay = !prefs.showMapOverlay;
						this.props.setUserPrefs(prefs);
					})}

					{Constants.IS_ANDROID &&
						this.toggle("Monitor Mode", this.props.isMonitor, () => this.props.updateMonitor(!this.props.isMonitor))}

					{this.action(downloadText, async () => {
						await Mapbox.offlineManager.deletePack("Playa");
						await Mapbox.offlineManager.createPack({
							name: "Playa",
							styleURL: Mapbox.StyleURL.Street,
							minZoom: 5,
							maxZoom: 20,
							bounds: Constants.PLAYA_BOUNDS()
						}, AM.progressListener, AM.errorListener);
					}, downloadColor, pointerEvents)}

					{this.action("Go to burnerboard.com", () => this.bbCom(), this.state.bbComButton === "green" ? Colors.accentSecondary : null)}

					<View style={[StyleSheet.card, { marginTop: Spacing.sm }]}>
						<Text style={StyleSheet.subheading}>Location History (minutes, max 15)</Text>
						<TextInput
							keyboardType="number-pad"
							style={inputStyle}
							placeholderTextColor={Colors.textTertiary}
							onChangeText={(p) => {
								prefs.locationHistoryMinutes = p;
								this.props.setUserPrefs(prefs);
								this.setState({ p: p });
							}}
							value={prefs.locationHistoryMinutes}
						/>

						<Text style={[StyleSheet.subheading, { marginTop: Spacing.lg }]}>Unlock Code</Text>
						<TextInput
							keyboardType="default"
							style={inputStyle}
							placeholderTextColor={Colors.textTertiary}
							onChangeText={(visibleUnlockCode) => {
								prefs.unlockCode = sha256(visibleUnlockCode);
								prefs.visibleUnlockCode = visibleUnlockCode;
								this.props.setUserPrefs(prefs);
							}}
							value={prefs.visibleUnlockCode}
						/>
					</View>
				</ScrollView>
			</View>
		);
	}
}

AppManagement.propTypes = {
	userPrefs: PropTypes.object,
	setUserPrefs: PropTypes.func,
	clearCache: PropTypes.func,
	updateMonitor: PropTypes.func,
	isMonitor: PropTypes.bool,
};
