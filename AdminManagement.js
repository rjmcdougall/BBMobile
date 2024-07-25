import React, { Component } from "react";
import {
	View,
	ScrollView,
	Text,
	TextInput
} from "react-native";  
import Touchable from "react-native-platform-touchable";
import PropTypes from "prop-types";
import StyleSheet from "./StyleSheet";

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
				<ScrollView>
					<View style={{ height: 10 }}></View>
					<View style={StyleSheet.button}>
						<Touchable
							onPress={async () => {
								await this.props.sendCommand("EnableGTFO", !this.props.boardState.g);
								return true;
							}}
							style={[{ backgroundColor: (this.props.boardState.g) ? "green" : "skyblue" }]}
							background={Touchable.Ripple("blue")}>
							<Text style={StyleSheet.buttonTextCenter}> GTFO </Text>
						</Touchable>
					</View>
					<View style={{ height: 10 }}></View>
					<View style={StyleSheet.button}>
						<Touchable
							onPress={async () => {
								await this.props.sendCommand("EnableMaster", !this.props.boardState.am);
								return true;
							}}
							style={[{ backgroundColor: (this.props.boardState.am) ? "green" : "skyblue" }]}
							background={Touchable.Ripple("blue")}>
							<Text style={StyleSheet.buttonTextCenter}> Master Remote
							</Text>
						</Touchable>
					</View>
					<View style={{ height: 10 }}></View>
					<View style={StyleSheet.button}>
						<Touchable
							onPress={async () => {
								await this.props.sendCommand("BlockMaster", !this.props.boardState.bm);
								return true;
							}}
							style={[{ backgroundColor: (this.props.boardState.bm) ? "green" : "skyblue" }]}
							background={Touchable.Ripple("blue")}>
							<Text style={StyleSheet.buttonTextCenter}> Block Master Remote
							</Text>
						</Touchable>
					</View>
					<View style={{ height: 10 }}></View>
					<View style={StyleSheet.button}>
						<Touchable
							onPress={async () => {
								var i = 1;
								console.log("rd " + this.props.boardState.rd);
								await this.props.sendCommand("SetRotatingDisplay", !this.props.boardState.rd);
								return true;
							}}
							style={[{ backgroundColor: (this.props.boardState.rd) ? "green" : "skyblue" }]}
							background={Touchable.Ripple("blue")}>
							<Text style={StyleSheet.buttonTextCenter}> Rotating Display
							</Text>
						</Touchable>
					</View>
					<View style={{ height: 10 }}></View>
					<View style={{ display: this.props.userPrefs.unlockCode=="6161b2838ffa6ce17b84db3b45b4f8437855ecf43e75de2d1ad0008eaae91aa0" ? 'flex' : 'none' }}>
						<View style={StyleSheet.button}>
							<Touchable
								onPress={async () => {
									var i = 1;
									console.log("fm " + this.props.boardState.fm);
									await this.props.sendCommand("FunMode", !this.props.boardState.fm);
									return true;
								}}
								style={[{ backgroundColor: (this.props.boardState.rd) ? "green" : "skyblue" }]}
								background={Touchable.Ripple("blue")}>
								<Text style={StyleSheet.buttonTextCenter}> Fun Mode
								</Text>
							</Touchable>
						</View>
					</View>
					<View style={{ height: 150 }}></View>
					<View style={StyleSheet.button}>
						<Touchable
							onPress={async () => {
								await this.props.sendCommand("SetCrisis", !this.props.boardState.r);
								return true;
							}}
							style={[{ backgroundColor: (this.props.boardState.r) ? "red" : "skyblue" }]}
							background={Touchable.Ripple("blue")}>
							<Text style={StyleSheet.buttonTextCenter}> EMERGENCY!
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

