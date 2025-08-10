import React, { Component } from "react";
import {
	View,
	ScrollView,
	Text,
	TextInput
} from "react-native";  
import Touchable from "react-native-platform-touchable";
import PropTypes from "prop-types";
import StyleSheet, { Colors } from "./StyleSheet";

export default class AdminManagement extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isActive: false
		};
	}

	render() {

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
								await this.props.sendCommand("EnableGTFO", !this.props.boardState.g);
								return true;
							}}
							style={[{ 
								backgroundColor: (this.props.boardState.g) ? Colors.success : Colors.accent,
								borderRadius: 8,
								padding: 16
							}]}
							background={Touchable.Ripple(Colors.accentSecondary, false)}>
							<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary }]}> GTFO </Text>
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
								await this.props.sendCommand("EnableMaster", !this.props.boardState.am);
								return true;
							}}
							style={[{ 
								backgroundColor: (this.props.boardState.am) ? Colors.success : Colors.accent,
								borderRadius: 8,
								padding: 16
							}]}
							background={Touchable.Ripple(Colors.accentSecondary, false)}>
							<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary }]}> Master Remote
							</Text>
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
								await this.props.sendCommand("BlockMaster", !this.props.boardState.bm);
								return true;
							}}
							style={[{ 
								backgroundColor: (this.props.boardState.bm) ? Colors.success : Colors.accent,
								borderRadius: 8,
								padding: 16
							}]}
							background={Touchable.Ripple(Colors.accentSecondary, false)}>
							<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary }]}> Block Master Remote
							</Text>
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
								var i = 1;
								console.log("rd " + this.props.boardState.rd);
								await this.props.sendCommand("SetRotatingDisplay", !this.props.boardState.rd);
								return true;
							}}
							style={[{ 
								backgroundColor: (this.props.boardState.rd) ? Colors.success : Colors.accent,
								borderRadius: 8,
								padding: 16
							}]}
							background={Touchable.Ripple(Colors.accentSecondary, false)}>
							<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary }]}> Rotating Display
							</Text>
						</Touchable>
					</View>
					<View style={{ height: 10 }}></View>
					<View style={{ display: this.props.userPrefs.unlockCode=="6161b2838ffa6ce17b84db3b45b4f8437855ecf43e75de2d1ad0008eaae91aa0" ? 'flex' : 'none' }}>
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
									var i = 1;
									console.log("fm " + this.props.boardState.fm);
									await this.props.sendCommand("FunMode", !this.props.boardState.fm);
									return true;
								}}
								style={[{ 
									backgroundColor: (this.props.boardState.fm) ? Colors.success : Colors.accent,
									borderRadius: 8,
									padding: 16
								}]}
								background={Touchable.Ripple(Colors.accentSecondary, false)}>
								<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary }]}> Fun Mode
								</Text>
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
									var i = 1;
									console.log("bar " + this.props.boardState.bar);
									await this.props.sendCommand("BlockAutoRotation", !this.props.boardState.bar);
									return true;
								}}
								style={[{ 
									backgroundColor: (this.props.boardState.bar) ? Colors.success : Colors.accent,
									borderRadius: 8,
									padding: 16
								}]}
								background={Touchable.Ripple(Colors.accentSecondary, false)}>
								<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary }]}> Block Auto Rotation
								</Text>
							</Touchable>
						</View>
					</View>
					<View style={{ height: 80 }}></View>
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
								await this.props.sendCommand("SetCrisis", !this.props.boardState.r);
								return true;
							}}
							style={[{ 
								backgroundColor: (this.props.boardState.r) ? Colors.error : Colors.accent,
								borderRadius: 8,
								padding: 16
							}]}
							background={Touchable.Ripple(Colors.accentSecondary, false)}>
							<Text style={[StyleSheet.buttonTextCenter, { color: Colors.textPrimary }]}> EMERGENCY!
							</Text>
						</Touchable>
					</View>
					<View style={{ height: 150 }}></View>
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
};

