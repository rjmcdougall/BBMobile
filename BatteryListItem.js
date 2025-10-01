import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import PropTypes from "prop-types";
import Constants from "./Constants";
import { Colors } from "./StyleSheet";

export default class BatteryListItem extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		console.log('BatteryListItem rendering with battery level:', this.props.b);
		
		var barColor;
		if (this.props.b <= Constants.BATTERY_RED)
			barColor = "red";
		else if (this.props.b <= Constants.BATTERY_YELLOW)
			barColor = "yellow";
		else
			barColor = "green";

		var b = 0;
		var displayText = "?";
		
		if (this.props.b === -1) {
			b = 0;
			displayText = "?";
			barColor = "gray";
		} else if (this.props.b <= 100) {
			b = this.props.b;
			displayText = Math.round(b) + "%";
		} else {
			b = 0;
			displayText = "0%";
		}
		
		console.log('BatteryListItem will display:', displayText, 'with color:', barColor);
		
	return (
		<View style={styles.container}>
			<View style={styles.batteryContainer}>
				{/* Battery outer shell */}
				<View style={styles.batteryShell}>
					{/* Battery fill bar */}
					<View style={[
						styles.batteryFill,
						{
							width: `${b}%`,
							backgroundColor: barColor
						}
					]} />
					{/* Battery percentage text */}
					<View style={styles.textOverlay}>
						<Text style={styles.batteryText}>
							{displayText}
						</Text>
					</View>
				</View>
				{/* Battery tip */}
				<View style={styles.batteryTip} />
			</View>
		</View>
	);
	}
}

BatteryListItem.propTypes = {
	b: PropTypes.number,
	id: PropTypes.string,
};

BatteryListItem.defaultProps = {
	b: 0,
};

const styles = StyleSheet.create({
	container: {
		paddingTop: 0,
		paddingBottom: 0,
		paddingHorizontal: 0,
		justifyContent: "center",
		alignItems: "center",
	},
	batteryContainer: {
		height: 26, // 10% higher (24 * 1.1 = 26.4)
		width: '90%',
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'center',
	},
	batteryShell: {
		flex: 1,
		height: 22, // 10% higher (20 * 1.1 = 22)
		borderWidth: 1,
		borderColor: Colors.borderSecondary,
		borderRadius: 3,
		backgroundColor: Colors.surfaceTertiary,
		position: 'relative',
		overflow: 'hidden',
	},
	batteryFill: {
		height: '100%',
		borderRadius: 1,
		position: 'absolute',
		left: 0,
		top: 0,
		minWidth: 2,
	},
	batteryTip: {
		width: 3,
		height: 13, // 10% higher (12 * 1.1 = 13.2)
		backgroundColor: Colors.borderSecondary,
		borderRadius: 2,
		marginLeft: 2,
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
	batteryText: {
		backgroundColor: "transparent",
		color: Colors.textPrimary,
		fontWeight: '600',
		fontSize: 12,
		textAlign: 'center',
		textShadowColor: 'rgba(0,0,0,0.8)',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
});
