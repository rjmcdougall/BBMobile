import React, { Component } from "react";
import { View, Text, ScrollView } from "react-native";
import PropTypes from "prop-types";
import StateBuilder from "./StateBuilder";
import WheelPicker from "react-native-wheely";
import StyleSheet from "./StyleSheet";
import Constants from "./Constants";

var PickerItem = WheelPicker.Item;

export default class TrackController extends Component {
	constructor(props) {
		super(props);
	}

	// // nasty hack. the wheel picker is two different platform-specific controls
	// // which have quirks on how they handle updates after state change events.
	// static getDerivedStateFromProps(props, state) {
	// 	if (Constants.IS_ANDROID && props.mediaType == "Audio"){
	// 		return {
	// 			selectedTrack: props.boardState.acn,
	// 			tracks: props.audio,
	// 		};
	// 	}
	// 	else if (Constants.IS_ANDROID && props.mediaType == "Video"){
	// 		return {
	// 			selectedTrack: props.boardState.vcn,
	// 			tracks: props.video,
	// 		};
	// 	}
	// 	else if (Constants.IS_IOS && props.mediaType == "Audio"){
	// 		// if the state track has never been set before.
	// 		if(state.selectedTrack==29999 || state.selectedTrack == 9999){
	// 			// if the props track is a real track.
	// 			if (props.boardState.acn<9999){
	// 				return {
	// 					selectedTrack: props.boardState.acn,
	// 					tracks: props.audio,
	// 				};
	// 			}
	// 			else {
	// 				return state;
	// 			}				
	// 		}
	// 		else {
	// 			return state;
	// 		}
	// 	}
	// 	else if (Constants.IS_IOS && props.mediaType == "Video"){
	// 		// if the state track has never been set before.
	// 		if(state.selectedTrack==29999 || state.selectedTrack == 9999){
	// 			// if the props track is a real track.
	// 			if (props.boardState.vcn<9999){
	// 				console.log(props.boardState.vcn + "Found video for the first time!!!");
	// 				return {
	// 					selectedTrack: props.boardState.vcn,
	// 					tracks: props.video,
	// 				};
	// 			}
	// 			else {
	// 				return state;
	// 			}				
	// 		}
	// 		else {
	// 			return state;
	// 		}
	// 	}
	// }

	findTrackNo(tracks, val) {
		return tracks.find(function (item, i) {
			if (item.localName === val) {
				return i;
			}
		});
	}

	getSelectedIndex() {
		console.log(this.props.boardState.acn);
		console.log(this.props.boardState.vcn);
		// if(this.props.mediaType == "Audio")
		// 	return this.props.boardState.acn;
		// else if (this.props.mediaType == "Video")
		// 	return this.props.boardState.avn;
	}

	getWheelyItems() {
		if (this.props.mediaType == "Audio") {
			let it = this.props.audio.map(obj => obj.localName);
			it.unshift("---");
			return it;
		}

		else if (this.props.mediaType == "Video") {
			let it = this.props.video.map(obj => obj.algorithm ? obj.algorithm : obj.localName);
			it.unshift("---");
			return it;
		}
	}

	render() {

		return (

			<View style={{flex:1}}>
				<View style={{flex: 1}}> 
						<Text style={StyleSheet.rowText}>{this.props.mediaType} Track</Text>
					
				</View>
				<View style={{flex: 5}}>
					<WheelPicker
						itemTextStyle={{ color: "black", fontSize: 26 }}
						selectedIndex={0}
						options={this.getWheelyItems()}
						onChange={async (value) => {
							try {
								await this.props.sendCommand(this.props.mediaType, value-1);
								console.log("Selected track: " + value-1);
							}
							catch (error) {
								console.log(error);
							}
						}}
					/>
				</View>
			</View>
		);
	}
}

TrackController.defaultProps = {
	boardState: StateBuilder.blankBoardState(),
};

TrackController.propTypes = {
	mediaType: PropTypes.string,
	boardState: PropTypes.object,
	onSelectTrack: PropTypes.func,
	refreshFunction: PropTypes.func,
	displayRefreshButton: PropTypes.bool,
	sendCommand: PropTypes.func,
	audio: PropTypes.array,
	video: PropTypes.array,
};
