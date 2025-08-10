import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";
import Touchable from "react-native-platform-touchable";
import Constants from "./Constants.js";
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import StyleSheet from "./StyleSheet";
MaterialCommunityIcon.loadFont(); 

export default class LeftNav extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View style={{ width: 50, backgroundColor: "powderblue", margin: 2, position: 'relative' }}>
				{/* Top section - Main navigation */}
				<View style={[{ backgroundColor: this.props.showScreen == Constants.MAP ? "green" : "lightblue" }]}>
					<Touchable
						onPress={() => {
							this.props.onNavigate(Constants.MAP);
						}}
						style={StyleSheet.icon}>
						<MaterialCommunityIcon name="map-marker-multiple" size={40} color="black" />
					</Touchable>
				</View>
				<View style={[{ backgroundColor: this.props.showScreen == Constants.ADMINISTRATION ? "green" : "lightblue" }]}>
					<Touchable
						onPress={() => {
							this.props.onNavigate(Constants.ADMINISTRATION);
						}}
						style={StyleSheet.icon}>
						<MaterialCommunityIcon name="cog" size={40} color="black" />
					</Touchable>
				</View>
				<View style={[{ backgroundColor: this.props.showScreen == Constants.DISCOVER ? "green" : "lightblue" }]}>
					<Touchable
						onPress={ () => {
							this.props.onNavigate(Constants.DISCOVER);
						}}
						style={StyleSheet.icon}>
						<MaterialCommunityIcon name="magnify" size={40} color="black" />
					</Touchable>
				</View>
				
				{/* Bottom section - Secondary/Admin functions - Absolutely positioned */}
				<View style={{ position: 'absolute', bottom: 0, left: 0, width: 50 }}>
					<View style={[{ backgroundColor: this.props.showScreen == Constants.APP_MANAGEMENT  ? "green" : "lightblue" }]}>
						<Touchable
							onPress={() => {
								this.props.onNavigate(Constants.APP_MANAGEMENT);
							}}
							style={StyleSheet.icon}>
							<MaterialCommunityIcon name="cellphone" size={40} color="black" />
						</Touchable>
					</View>
					<View style={[{ backgroundColor: this.props.showScreen == Constants.DIAGNOSTIC ? "green" : "lightblue" }]}>
						<Touchable
							onPress={() => {
								this.props.onNavigate(Constants.DIAGNOSTIC);
							}}
							style={StyleSheet.icon}>
							<MaterialCommunityIcon name="help-network" size={40} color="black" />
						</Touchable>
					</View>
					<View style={[{ backgroundColor: this.props.showScreen == Constants.STATS_CONTROL ? "green" : "lightblue" }]}>
						<Touchable
							onPress={() => {
								this.props.onNavigate(Constants.STATS_CONTROL);
							}}
							style={StyleSheet.icon}>
							<MaterialCommunityIcon name="chart-bar" size={40} color="black" />
						</Touchable>
					</View>
				</View>
			</View>
		);
	}
}

LeftNav.propTypes = {
	onPressSearchForBoards: PropTypes.func,
	onNavigate: PropTypes.func,
	showScreen: PropTypes.string,
};
