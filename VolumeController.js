import React from "react";
import { View, Image, Text, Platform } from "react-native";
import PropTypes from "prop-types";
import StyleSheet, { Colors } from "./StyleSheet";
import Slider from "@react-native-community/slider";
import Icon from "react-native-vector-icons/MaterialIcons";
import Constants from "./Constants";

export default class VolumeController extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			sliderWidth: 0,
			sliderValue: 0
		};
	}

	componentDidMount() {
		this.setState({ sliderValue: this.props.boardState.v || 0 });
	}

	componentDidUpdate(prevProps) {
		if (prevProps.boardState.v !== this.props.boardState.v) {
			this.setState({ sliderValue: this.props.boardState.v || 0 });
		}
	}

	handleSliderLayout = (event) => {
		const { width } = event.nativeEvent.layout;
		this.setState({ sliderWidth: width });
	}

	getThumbPosition() {
		if (this.state.sliderWidth === 0) return 0;
		// Calculate thumb position based on slider value and width
		// Account for thumb width (32px) and center it properly
		const thumbWidth = 32;
		const availableWidth = this.state.sliderWidth - thumbWidth;
		const percentage = this.state.sliderValue / 100;
		return (percentage * availableWidth);
	}

	render() {
		const thumbPosition = this.getThumbPosition();

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
				overflow: 'visible' // Changed to visible so the music note can show
			}}>
				<View 
					onLayout={this.handleSliderLayout}
					style={{ position: 'relative' }}
				>
					<Slider 
						value={this.props.boardState.v}
						trackStyle={StyleSheet.sliderTrack}
						thumbStyle={{ width: 0, height: 0, backgroundColor: 'transparent', opacity: 0 }}
						thumbTintColor="transparent"
						maximumThumbTintColor="transparent"
						minimumThumbTintColor="transparent"
						minimumTrackTintColor={Colors.accent}
						maximumTrackTintColor={Colors.surfaceTertiary}
						onValueChange={(value) => {
							this.setState({ sliderValue: value });
						}}
						onSlidingComplete={async (volume) => {
							try {
								await this.props.sendCommand("Volume", volume);
							}
							catch (error) {
								console.log("VolumeController Error: " + error);
							}
						}}
						minimumValue={0} 
						maximumValue={100} 
						step={10} 
					/>
					{/* Custom music note thumb */}
					<View style={{
						position: 'absolute',
						left: thumbPosition,
						top: Constants.IS_IOS ? -4 : -8, // iOS needs less vertical offset than Android
						width: 32,
						height: 32,
						borderRadius: 16,
						backgroundColor: Colors.accent,
						justifyContent: 'center',
						alignItems: 'center',
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.3,
						shadowRadius: 4,
						elevation: 5,
						pointerEvents: 'none' // Allow touches to pass through to slider
					}}>
						<Text style={{ 
							fontSize: 24, 
							color: 'white',
							textAlign: 'center',
							marginLeft: Constants.IS_ANDROID ? 4 : 2, // iOS needs less horizontal offset
							marginTop: Constants.IS_ANDROID ? -3 : -2 // iOS needs less vertical offset
						}}>♪</Text>
					</View>
				</View>
			</View>
		);
	}
}

VolumeController.propTypes = {
	boardState: PropTypes.object,
	sendCommand: PropTypes.func,
};

