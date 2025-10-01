import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";
import Touchable from "react-native-platform-touchable";
import Constants from "./Constants.js";
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import StyleSheet, { Colors } from "./StyleSheet";
MaterialCommunityIcon.loadFont(); 

export default class LeftNav extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View style={{ width: 60, backgroundColor: Colors.surfacePrimary, margin: 4, borderRadius: 16, position: 'relative', borderWidth: 1, borderColor: Colors.borderPrimary }}>
				{/* Top section - Main navigation */}
					<View style={[{ 
						backgroundColor: this.props.showScreen == Constants.MAP ? Colors.accent : 'transparent',
						borderRadius: 12,
						margin: 2
					}]}>
						<Touchable
							onPress={() => {
								this.props.onNavigate(Constants.MAP);
							}}
							style={[StyleSheet.icon, { padding: 4 }]}>
							<MaterialCommunityIcon name="map-marker-multiple" size={28} color={this.props.showScreen == Constants.MAP ? Colors.textPrimary : Colors.textSecondary} />
						</Touchable>
					</View>
					<View style={[{ 
						backgroundColor: this.props.showScreen == Constants.ADMINISTRATION ? Colors.accent : 'transparent',
						borderRadius: 12,
						margin: 2
					}]}>
						<Touchable
							onPress={() => {
								this.props.onNavigate(Constants.ADMINISTRATION);
							}}
							style={[StyleSheet.icon, { padding: 4 }]}>
							<MaterialCommunityIcon name="cog" size={28} color={this.props.showScreen == Constants.ADMINISTRATION ? Colors.textPrimary : Colors.textSecondary} />
						</Touchable>
					</View>
					<View style={[{ 
						backgroundColor: this.props.showScreen == Constants.DISCOVER ? Colors.accent : 'transparent',
						borderRadius: 12,
						margin: 2
					}]}>
						<Touchable
							onPress={ () => {
								this.props.onNavigate(Constants.DISCOVER);
							}}
							style={[StyleSheet.icon, { padding: 4 }]}>
							<MaterialCommunityIcon name="magnify" size={28} color={this.props.showScreen == Constants.DISCOVER ? Colors.textPrimary : Colors.textSecondary} />
						</Touchable>
					</View>
					<View style={[{ 
						backgroundColor: this.props.showScreen == Constants.BOARD_STATUS ? Colors.accent : 'transparent',
						borderRadius: 12,
						margin: 2
					}]}>
						<Touchable
							onPress={() => {
								this.props.onNavigate(Constants.BOARD_STATUS);
							}}
							style={[StyleSheet.icon, { padding: 4 }]}>
							<MaterialCommunityIcon name="battery-medium" size={28} color={this.props.showScreen == Constants.BOARD_STATUS ? Colors.textPrimary : Colors.textSecondary} />
						</Touchable>
					</View>
				
				{/* Bottom section - Secondary/Admin functions - Absolutely positioned */}
					<View style={{ position: 'absolute', bottom: 0, left: 0, width: 60 }}>
						<View style={[{ 
							backgroundColor: this.props.showScreen == Constants.APP_MANAGEMENT ? Colors.accent : 'transparent',
							borderRadius: 12,
							margin: 2
						}]}>
							<Touchable
								onPress={() => {
									this.props.onNavigate(Constants.APP_MANAGEMENT);
								}}
								style={[StyleSheet.icon, { padding: 4 }]}>
								<MaterialCommunityIcon name="cellphone" size={24} color={this.props.showScreen == Constants.APP_MANAGEMENT ? Colors.textPrimary : Colors.textTertiary} />
							</Touchable>
						</View>
						<View style={[{ 
							backgroundColor: this.props.showScreen == Constants.DIAGNOSTIC ? Colors.accent : 'transparent',
							borderRadius: 12,
							margin: 2
						}]}>
							<Touchable
								onPress={() => {
									this.props.onNavigate(Constants.DIAGNOSTIC);
								}}
								style={[StyleSheet.icon, { padding: 4 }]}>
								<MaterialCommunityIcon name="help-network" size={24} color={this.props.showScreen == Constants.DIAGNOSTIC ? Colors.textPrimary : Colors.textTertiary} />
							</Touchable>
						</View>
						<View style={[{ 
							backgroundColor: this.props.showScreen == Constants.STATS_CONTROL ? Colors.accent : 'transparent',
							borderRadius: 12,
							margin: 2
						}]}>
							<Touchable
								onPress={() => {
									this.props.onNavigate(Constants.STATS_CONTROL);
								}}
								style={[StyleSheet.icon, { padding: 4 }]}>
								<MaterialCommunityIcon name="chart-bar" size={24} color={this.props.showScreen == Constants.STATS_CONTROL ? Colors.textPrimary : Colors.textTertiary} />
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
