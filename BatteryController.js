import React from "react";
import { View, Text, StyleSheet, Image, ImageBackground } from "react-native";
import PropTypes from "prop-types";
import AnimatedBar from "./AnimatedBar";
import Constants from "./Constants";

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
					{/* Battery shell background */}
					<ImageBackground 
						source={require('./images/batteryicon.jpg')} 
						style={styles.batteryBackground}
						resizeMode="stretch"
					>
						{/* Battery fill - positioned inside the battery shell */}
						<View style={styles.batteryFillContainer}>
							{/* Gray background for empty portion */}
							<View style={[
								styles.batteryEmptyFill,
								{
									backgroundColor: '#404040',
								}
							]} />
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
							<Text key={this.props.id + "t"} style={[styles.barText, { fontSize: displayText.includes('battery level') ? 16 : 20 }]}>
								{displayText}
							</Text>
						</View>
					</ImageBackground>
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
		justifyContent: "space-around",
	},
	batteryContainer: {
		height: 51,
		width: '100%',
		position: 'relative',
	},
	batteryBackground: {
		height: 51,
		width: '100%',
		position: 'relative',
	},
	batteryFillContainer: {
		position: 'absolute',
		top: 4,
		left: '8%',
		right: '12%',
		bottom: 4,
		overflow: 'hidden',
		borderRadius: 2,
	},
	batteryEmptyFill: {
		height: '100%',
		width: '100%',
		borderRadius: 2,
		position: 'absolute',
	},
	batteryFill: {
		height: '100%',
		borderRadius: 2,
		position: 'absolute',
		left: 0,
		top: 0,
	},
	textOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
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
		color: "#FFF",
		fontWeight: 'bold',
		textShadowColor: '#000',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
});
