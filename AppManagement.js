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
import StyleSheet, { Colors } from "./StyleSheet";
import Mapbox from "@rnmapbox/maps";
import Constants from "./Constants";
import {sha256} from 'js-sha256';

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
	render() {
		var downloadText;
		var downloadBackgroundColor;
		var pointerEvents;

		if (this.props.userPrefs.offlineMapPercentage==100){
			downloadText = "Playa Map Downloaded";
			downloadBackgroundColor = "green";
			pointerEvents = "none";
		}
		else if (this.props.userPrefs.offlineMapPercentage > 0 && this.props.userPrefs.offlineMapPercentage<100){
			downloadText = "Downloading " + Math.round(this.props.userPrefs.offlineMapPercentage) + "%";
			downloadBackgroundColor = "yellow";
			pointerEvents = "auto";
		}
		else {
			downloadText = "Download Playa Map";
			downloadBackgroundColor = "skyblue";
			pointerEvents = "auto";
		}

		var AM = this;

		return (
			<View style={StyleSheet.container}>
				<ScrollView style={{ backgroundColor: Colors.backgroundPrimary }}>
					<View style={{ height: 10 }}></View>
					<View style={[StyleSheet.button, { 
						backgroundColor: Colors.surfaceSecondary,
						borderRadius: 12,
						borderWidth: 1,
						borderColor: Colors.borderPrimary,
						margin: 8,
						padding: 4
					}]}>
						<Touchable
							onPress={async () => {
								await this.clearCache();
							}}
							style={[{ 
								backgroundColor: this.state.cacheButton === "green" ? Colors.accentSecondary : Colors.surfaceSecondary,
								borderRadius: 8,
								padding: 16
							}]}
							background={Touchable.Ripple(Colors.accentSecondary, false)}>
							<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary }]}> Clear Cache </Text>
						</Touchable>
					</View>
					<View style={{ height: 10 }}></View>
					<View style={[StyleSheet.button, { 
						backgroundColor: Colors.surfaceSecondary,
						borderRadius: 12,
						borderWidth: 1,
						borderColor: Colors.borderPrimary,
						margin: 8,
						padding: 4
					}]}>
						<Touchable
							onPress={async () => {
								this.props.userPrefs.isDevilsHand = !this.props.userPrefs.isDevilsHand;
								this.props.setUserPrefs(this.props.userPrefs);
							}}
							style={[{ 
							backgroundColor: (this.props.userPrefs.isDevilsHand) ? Colors.accent : Colors.surfaceSecondary,
								borderRadius: 8,
								padding: 16
							}]}
							background={Touchable.Ripple(Colors.accentSecondary, false)}>
							<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary }]}>Left Handed</Text>
						</Touchable>
					</View>
					<View style={{ height: 10 }}></View>
					<View style={[StyleSheet.button, { 
						backgroundColor: Colors.surfaceSecondary,
						borderRadius: 12,
						borderWidth: 1,
						borderColor: Colors.borderPrimary,
						margin: 8,
						padding: 12
					}]}>
						<Text style={[StyleSheet.rowText, { color: Colors.textPrimary, textAlign: 'center' }]}>Map Mode</Text>
					</View>
					<View style={{ height: 5 }}></View>
					<View style={[StyleSheet.horizontalButtonBar, {
						backgroundColor: Colors.surfaceSecondary,
						borderRadius: 12,
						borderWidth: 1,
						borderColor: Colors.borderPrimary,
						margin: 8,
						padding: 4
					}]}>
						<View style={[StyleSheet.horizonralButton, { flex: 1, margin: 2 }]}>
							<Touchable
								onPress={async () => {
									this.props.userPrefs.mapMode = 'me';
									this.props.setUserPrefs(this.props.userPrefs);
								}}
								style={[{ 
								backgroundColor: (this.props.userPrefs.mapMode === 'me') ? Colors.accent : Colors.surfaceSecondary,
									borderRadius: 8,
									paddingVertical: 10,
									paddingHorizontal: 8
								}]}
								background={Touchable.Ripple(Colors.accentSecondary, false)}>
								<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary, fontSize: 14 }]}>Me</Text>
							</Touchable>
						</View>
						<View style={[StyleSheet.horizonralButton, { flex: 1, margin: 2 }]}>
							<Touchable
								onPress={async () => {
									this.props.userPrefs.mapMode = 'playa';
									this.props.setUserPrefs(this.props.userPrefs);
								}}
								style={[{ 
								backgroundColor: (this.props.userPrefs.mapMode === 'playa') ? Colors.accent : Colors.surfaceSecondary,
									borderRadius: 8,
									paddingVertical: 10,
									paddingHorizontal: 8
								}]}
								background={Touchable.Ripple(Colors.accentSecondary, false)}>
								<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary, fontSize: 14 }]}>Playa</Text>
							</Touchable>
						</View>
						<View style={[StyleSheet.horizonralButton, { flex: 1, margin: 2 }]}>
							<Touchable
								onPress={async () => {
									this.props.userPrefs.mapMode = 'auto';
									this.props.setUserPrefs(this.props.userPrefs);
								}}
								style={[{ 
								backgroundColor: (this.props.userPrefs.mapMode === 'auto' || !this.props.userPrefs.mapMode) ? Colors.accent : Colors.surfaceSecondary,
									borderRadius: 8,
									paddingVertical: 10,
									paddingHorizontal: 8
								}]}
								background={Touchable.Ripple(Colors.accentSecondary, false)}>
								<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary, fontSize: 14 }]}>Auto</Text>
							</Touchable>
						</View>
					</View>
					{(Constants.IS_ANDROID) ?
						<View>
							<View style={{ height: 10 }}></View>
							<View style={[StyleSheet.button, { 
								backgroundColor: Colors.surfaceSecondary,
								borderRadius: 12,
								borderWidth: 1,
								borderColor: Colors.borderPrimary,
								margin: 8,
								padding: 4
							}]}>
								<Touchable
									onPress={async () => {
										this.props.updateMonitor(!this.props.isMonitor);
									}}
									style={[{ 
										backgroundColor: (this.state.isMonitor) ? Colors.accent : Colors.surfaceSecondary,
										borderRadius: 8,
										padding: 16
									}]}
									background={Touchable.Ripple(Colors.accentSecondary, false)}>
									<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary }]}>Monitor Mode</Text>
								</Touchable>
							</View>
						</View>
						: <View />}
					<View style={{ height: 10 }}></View>
					<View style={[StyleSheet.button, { 
						backgroundColor: Colors.surfaceSecondary,
						borderRadius: 12,
						borderWidth: 1,
						borderColor: Colors.borderPrimary,
						margin: 8,
						padding: 4
					}]} pointerEvents={pointerEvents}>
						<Touchable
							onPress={async () => {

								await Mapbox.offlineManager.deletePack("Playa");

								await Mapbox.offlineManager.createPack({
									name: "Playa",
									styleURL: Mapbox.StyleURL.Street,
									minZoom: 5,
									maxZoom: 20,
									bounds: Constants.PLAYA_BOUNDS()
								}, AM.progressListener, AM.errorListener);
							}}
							style={[{ 
								backgroundColor: downloadBackgroundColor === "green" ? Colors.accentSecondary : 
												 downloadBackgroundColor === "yellow" ? Colors.accentWarning : Colors.surfaceSecondary,
								borderRadius: 8,
								padding: 16
							}]}
							background={Touchable.Ripple(Colors.accentSecondary, false)}
						>
							<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary }]}>{downloadText}</Text>
						</Touchable>
					</View>
					<View style={{ height: 10 }}></View>
					<View style={[StyleSheet.button, { 
						backgroundColor: Colors.surfaceSecondary,
						borderRadius: 12,
						borderWidth: 1,
						borderColor: Colors.borderPrimary,
						margin: 8,
						padding: 4
					}]}>
						<Touchable
							onPress={async () => {
								await this.bbCom();
							}}
							style={[{ 
								backgroundColor: this.state.bbComButton === "green" ? Colors.accentSecondary : Colors.surfaceSecondary,
								borderRadius: 8,
								padding: 16
							}]}
							background={Touchable.Ripple(Colors.accentSecondary, false)}>
							<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary }]}>Go To BB.Com</Text>
						</Touchable>
					</View>
					<View style={{ height: 10 }}></View>
					<View style={{
						margin: 10,
						padding: 15,
						borderColor: Colors.borderPrimary,
						borderWidth: 1,
						borderRadius: 12,
						backgroundColor: Colors.surfaceSecondary
					}}>
						<View style={{ minHeight: 50, justifyContent: 'center' }}>
							<Text style={[StyleSheet.rowText, { color: Colors.textPrimary, fontSize: 16 }]}>Location History Minutes (max 15)</Text>
						</View>
						<View style={{ minHeight: 50, justifyContent: 'center' }}>
							<TextInput keyboardType="number-pad"
								style={{ 
									height: 45, 
									width: 200, 
									borderColor: Colors.borderSecondary, 
									borderWidth: 1,
									borderRadius: 8,
									backgroundColor: Colors.backgroundPrimary,
									color: Colors.textPrimary,
									paddingHorizontal: 12,
									fontSize: 16,
									textAlignVertical: 'center'
								}}
								onChangeText={async (p) => {
									this.props.userPrefs.locationHistoryMinutes = p;
									this.props.setUserPrefs(this.props.userPrefs);

									this.setState({ p: p });
								}}
								value={this.props.userPrefs.locationHistoryMinutes}
							/>
						</View>
						<View style={{ minHeight: 50, justifyContent: 'center' }}>
							<Text style={[StyleSheet.rowText, { color: Colors.textPrimary, fontSize: 16 }]}>Other Input</Text>
						</View>
						<View style={{ minHeight: 50, justifyContent: 'center' }}>
							<TextInput keyboardType="default"
								style={{ 
									height: 45, 
									width: 200, 
									borderColor: Colors.borderSecondary, 
									borderWidth: 1,
									borderRadius: 8,
									backgroundColor: Colors.backgroundPrimary,
									color: Colors.textPrimary,
									paddingHorizontal: 12,
									fontSize: 16,
									textAlignVertical: 'center'
								}}
								onChangeText={async (visibleUnlockCode) => {
									this.props.userPrefs.unlockCode = sha256(visibleUnlockCode);
									this.props.userPrefs.visibleUnlockCode = visibleUnlockCode;
											
									this.props.setUserPrefs(this.props.userPrefs);
								}}
								value={this.props.userPrefs.visibleUnlockCode}
							/>
						</View>
					</View>
					<View style={{ height: 10 }}></View>
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

