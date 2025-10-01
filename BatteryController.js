import React from "react";
import { View, Text, StyleSheet, Image, ImageBackground } from "react-native";
import PropTypes from "prop-types";
import AnimatedBar from "./AnimatedBar";
import Constants from "./Constants";
import { Colors } from "./StyleSheet";

export default class BatteryController extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		var barColor;
		if (this.props.b <= Constants.BATTERY_RED)
			barColor = "red";
		else if (this.props.b <= Constants.BATTERY_YELLOW)
			barColor = "yellow";
		else
			barColor = "green";

		var b = 0;
		var displayText = "battery level unknown";
		
		if (this.props.b === -1) {
			b = 0;
			displayText = "battery level unknown";
			barColor = "gray";
		} else if (this.props.b <= 100) {
			b = this.props.b;
			displayText = Math.round(b) + "%";
		} else {
			b = 0;
			displayText = "0%";
		}
		
	return (
			<View style={styles.container}>
				<View style={styles.batteryContainer}>
					{/* Battery main body */}
					<View style={styles.batteryShell}>
						{/* Battery fill - positioned inside the battery shell */}
						<View style={styles.batteryFillContainer}>
							{/* Gray background for empty portion */}
							<View style={styles.batteryEmptyFill} />
							{/* Colored fill for battery level */}
							<View style={[
								styles.batteryFill,
								{
									width: `${b}%`,
									backgroundColor: barColor,
								}
							]} />
						</View>
						{/* Battery text overlay */}
						<View style={[styles.row, styles.center, styles.textOverlay]}>
							<Text key={this.props.id + "t"} style={[styles.barText, { fontSize: displayText.includes('battery level') ? 12 : 16 }]}>
								{displayText}
							</Text>
						</View>
					</View>
					{/* Battery positive terminal */}
					<View style={styles.batteryTerminal} />
				</View>
			</View>
		);
	}
}

BatteryController.propTypes = {
	b: PropTypes.number,
	id: PropTypes.string,
};

BatteryController.defaultProps = {
	b: 0,
};

const styles = StyleSheet.create({
	container: {
		paddingTop: 0,
		paddingBottom: 0,
		paddingHorizontal: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: 'transparent', // Transparent background
	},
	batteryContainer: {
		height: 47, // Additional 10% higher (43 * 1.1 = 47.3)
		width: '76.5%', // 10% narrower (85% * 0.9 = 76.5%)
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: 'transparent', // Transparent background
	},
	batteryShell: {
		flex: 1,
		height: 37, // Additional 10% higher (34 * 1.1 = 37.4)
		borderWidth: 2,
		borderColor: Colors.borderPrimary,
		borderRadius: 4,
		backgroundColor: Colors.surfaceSecondary,
		position: 'relative',
		overflow: 'hidden',
	},
	batteryTerminal: {
		width: 4,
		height: 21, // Additional 10% higher (19 * 1.1 = 20.9)
		backgroundColor: Colors.borderPrimary,
		borderRadius: 2,
		marginLeft: 2,
	},
	batteryFillContainer: {
		position: 'absolute',
		top: 2,
		left: 2,
		right: 2,
		bottom: 2,
		overflow: 'hidden',
		borderRadius: 2,
	},
	batteryEmptyFill: {
		height: '100%',
		width: '100%',
		borderRadius: 2,
		position: 'absolute',
		backgroundColor: Colors.surfaceTertiary,
	},
	batteryFill: {
		height: '100%',
		borderRadius: 2,
		position: 'absolute',
		left: 0,
		top: 0,
		minWidth: 2,
	},
	textOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
	row: {
		flexDirection: "row",
	},
	center: {
		justifyContent: "center",
		alignItems: "center",
	},
	barText: {
		backgroundColor: "transparent",
		color: Colors.textPrimary,
		fontWeight: '600',
		textAlign: 'center',
		textShadowColor: 'rgba(0,0,0,0.8)',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
});
