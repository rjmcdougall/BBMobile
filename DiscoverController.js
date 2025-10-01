import React from "react";
import { View, Text, ScrollView} from "react-native";
import ListView from "deprecated-react-native-listview";
import PropTypes from "prop-types";
import Touchable from "react-native-platform-touchable";
import StyleSheet, { Colors } from "./StyleSheet";
import StateBuilder from "./StateBuilder";
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
MaterialCommunityIcon.loadFont();

const ds = new ListView.DataSource({
	rowHasChanged: (r1, r2) => r1 !== r2
});

export default class DiscoverController extends React.Component {
	constructor(props) {
		super(props);

	}
	render() {

		try {
			const list = Array.from(this.props.boardBleDevices.values());
			const dataSource = ds.cloneWithRows(list);

			var DC = this;

		return (
			<View style={{ flex: 1, margin: 30 }}>
				<Touchable
					onPress={async () => {
						await this.props.startScan(false);
					}}
					style={StyleSheet.button}
					background={Touchable.Ripple("blue")}>
					<Text style={StyleSheet.connectButtonTextCenter}>Scan for Burner Boards ({this.props.scanning ? "scanning" : "paused"})</Text>
				</Touchable>

				{/* Cloud Connection Button */}
				{this.props.onSelectCloudConnection && (
					<Touchable
						onPress={async () => {
							await this.props.onSelectCloudConnection();
						}}
						style={[
							StyleSheet.button,
							{
								backgroundColor: Colors.accent,
								height: 60,
								marginBottom: 8,
								alignItems: 'center',
								justifyContent: 'center'
							}
						]}
						background={Touchable.Ripple("white")}>
						<Text style={[
							StyleSheet.connectButtonTextCenter,
							{ fontSize: 18, fontWeight: 'bold' }
						]}>☁️ Connect to Cloud</Text>
					</Touchable>
				)}

				<View style={{ marginTop: 16, marginBottom: 8 }}>
					<Text style={[
						StyleSheet.connectButtonTextCenter,
						{ 
							fontSize: 16, 
							fontWeight: '600',
							color: Colors.textSecondary
						}
					]}>Bluetooth Devices</Text>
				</View>

				<ScrollView>
					{(list.length == 0) &&
						<Text style={StyleSheet.connectButtonTextCenter}>No Boards Found</Text>
					}
					<ListView
						enableEmptySections={true}
						dataSource={dataSource}
						renderRow={(item) => {

							if (item) {
								if (item.name) {
									try {
 
										var color = StateBuilder.boardColor(item.name, DC.props.boardData);
										var textColor = StateBuilder.getTextColorForBackground(color);

										return (
											<Touchable
												onPress={async () => {
													try {
														await this.props.onSelectPeripheral(item);
													}
													catch (error) {
														console.log(error);
													}
												}
												}
												style={[StyleSheet.button, { 
													height: 60, 
													backgroundColor: color,
													alignItems: 'center',
													justifyContent: 'center'
												}]}

												background={Touchable.Ripple("blue")}>
												<Text style={[
													StyleSheet.connectButtonTextCenter, 
													{ padding: 8, color: textColor }
												]}>{item.name}</Text>
											</Touchable>
										);
									}
									catch (error) {
										console.log(error);
										return null;
									}
								}
							}
							return null;
						}}
					/>
				</ScrollView>
			</View>
		);
		}
		catch (error) {
			console.log(error);
			return (
				<View style={{ flex: 1, margin: 30, justifyContent: 'center', alignItems: 'center' }}>
					<Text style={StyleSheet.connectButtonTextCenter}>Error loading discovery panel</Text>
				</View>
			);
		}
	}
}

DiscoverController.propTypes = {
	peripherals: PropTypes.object,
	scanning: PropTypes.bool,
	boardData: PropTypes.array,
	onSelectPeripheral: PropTypes.func,
	startScan: PropTypes.func,
	boardBleDevices: PropTypes.object,
	onSelectCloudConnection: PropTypes.func,
};

