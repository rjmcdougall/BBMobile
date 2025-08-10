import React from "react";
import { View, Text } from "react-native";
import PropTypes from "prop-types";
import StyleSheet, { Colors } from "./StyleSheet";
import Slider from "@react-native-community/slider";

export default class VolumeController extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {

	return (
			<View style={{ 
				margin: 4, 
				backgroundColor: Colors.surfaceSecondary,
				borderRadius: 12,
				borderWidth: 1,
				borderColor: Colors.borderPrimary,
				paddingHorizontal: 16,
				paddingVertical: 12,
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.3,
				shadowRadius: 4,
				elevation: 3,
				overflow: 'hidden'
			}}>
				<Slider value={this.props.boardState.v}
					trackStyle={StyleSheet.sliderTrack}
					thumbStyle={StyleSheet.sliderThumb}
					minimumTrackTintColor={Colors.accent}
					maximumTrackTintColor={Colors.surfaceTertiary}
					onSlidingComplete={async (volume) => {
						try {
							await this.props.sendCommand("Volume", volume);
						}
						catch (error) {
							console.log("VolumeController Error: " + error);
						}
					}}
					minimumValue={0} maximumValue={100} step={10} />
			</View>
		);
	}
}

VolumeController.propTypes = {
	boardState: PropTypes.object,
	sendCommand: PropTypes.func,
};

