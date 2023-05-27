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
					<View style={{ height: 50 }}></View>
					<View style={{
						margin: 10,
						padding: 10,
						borderColor: "black",
						borderWidth: 2
					}}>
						<Text style={StyleSheet.smallButtonTextCenter}>
							Display Sections
						</Text>
						<View style={{
							flex: 1,
						}}>
							<View style={{ height: 40 }}>
								<TextInput keyboardType="number-pad"
									style={{ height: 40, width: 200, borderColor: "gray", borderWidth: 1 }}
									value={0}
									onChangeText={async (value) => {
										this.setState({ displayMode: value });
										console.log(this.state);
									}}
								/>
								<Text style={StyleSheet.label}>Display Sections</Text>

							</View>
						</View>

						<View style={StyleSheet.button}>
							<Touchable
								onPress={async () => {
									console.log("pressed for " + this.state.displayMode);
									await this.props.sendCommand("DisplayMode", this.state.displayMode);
								}}
								background={Touchable.Ripple("blue")}>
								<Text style={StyleSheet.smallButtonTextCenter}>Update</Text>
							</Touchable>
						</View>

					</View>
					<View style={{ height: 50 }}></View>
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

