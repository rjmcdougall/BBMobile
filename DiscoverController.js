import React from "react";
import { View, Text, ScrollView} from "react-native";
import ListView from "deprecated-react-native-listview";
import PropTypes from "prop-types";
import Touchable from "react-native-platform-touchable";
import StyleSheet, { Colors, Spacing, Radius, Metrics } from "./StyleSheet";
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
			<View style={{ flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }}>
				<Text style={[StyleSheet.title, { marginBottom: Spacing.lg }]}>Boards</Text>

				<Touchable
					onPress={async () => {
						await this.props.startScan(false);
					}}
					style={StyleSheet.pill}
					background={Touchable.Ripple(Colors.borderSecondary)}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<MaterialCommunityIcon name={this.props.scanning ? "bluetooth-connect" : "bluetooth"} size={Metrics.scale(20)} color={Colors.textPrimary} style={{ marginRight: Spacing.sm }} />
						<Text style={StyleSheet.pillText}>Scan for Boards{this.props.scanning ? "  •••" : ""}</Text>
					</View>
				</Touchable>

				{/* Cloud Connection Button */}
				{this.props.onSelectCloudConnection && (
					<Touchable
						onPress={async () => {
							await this.props.onSelectCloudConnection();
						}}
						style={[StyleSheet.pill, StyleSheet.pillPrimary]}
						background={Touchable.Ripple("white")}>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<MaterialCommunityIcon name="cloud-outline" size={Metrics.scale(20)} color={Colors.textPrimary} style={{ marginRight: Spacing.sm }} />
							<Text style={StyleSheet.pillText}>Connect to Cloud</Text>
						</View>
					</Touchable>
				)}

				<Text style={[StyleSheet.label, { marginTop: Spacing.xl, marginBottom: Spacing.sm }]}>Bluetooth Devices</Text>

				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
					{(list.length == 0) &&
						<View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
							<MaterialCommunityIcon name="radar" size={Metrics.scale(32)} color={Colors.textTertiary} />
							<Text style={[StyleSheet.body, { color: Colors.textTertiary, marginTop: Spacing.sm }]}>No boards found</Text>
						</View>
					}
					<ListView
						enableEmptySections={true}
						dataSource={dataSource}
						renderRow={(item) => {

							if (item) {
								if (item.name) {
									try {

										var color = StateBuilder.boardColor(item.name, DC.props.boardData);

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
												style={[StyleSheet.card, {
													paddingVertical: Spacing.md,
													marginBottom: Spacing.sm,
												}]}
												background={Touchable.Ripple(Colors.borderSecondary)}>
												<View style={{ flexDirection: 'row', alignItems: 'center' }}>
													<View style={{ width: Metrics.scale(12), height: Metrics.scale(12), borderRadius: Metrics.scale(6), backgroundColor: color, marginRight: Spacing.md }} />
													<Text style={[StyleSheet.subheading, { flex: 1 }]} numberOfLines={1}>{item.name}</Text>
													<MaterialCommunityIcon name="chevron-right" size={Metrics.scale(24)} color={Colors.textTertiary} />
												</View>
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

