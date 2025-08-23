import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";

const styles = StyleSheet.create({
	container: {
		borderRadius: 30,
		position: "absolute",
		bottom: 48,
		left: 48,
		right: 48,
		paddingVertical: 16,
		minHeight: 40,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "white",
		// Enhanced visibility for Android
		elevation: 8, // Android shadow
		shadowColor: '#000', // iOS shadow
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 4.65,
		borderWidth: 1,
		borderColor: '#e0e0e0',
		zIndex: 1000, // High z-index for Android
	},
});

class Bubble extends React.PureComponent {
	static propTypes = {
		onPress: PropTypes.func,
	};

	render() {
		let innerChildView = this.props.children;

		if (this.props.onPress) {
			innerChildView = (
				<TouchableOpacity onPress={this.props.onPress}>
					{this.props.children}
				</TouchableOpacity>
			);
		}

		return (
			<View style={[styles.container, this.props.style]}>{innerChildView}</View>
		);
	}
}

Bubble.propTypes = {
	children: PropTypes.array,
	style: PropTypes.object,
};

export default Bubble;
