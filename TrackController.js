import React, { Component } from "react";
import { View, Text} from "react-native";
import PropTypes from "prop-types";
import StateBuilder from "./StateBuilder";
import {WheelPicker,WheelPickerAlign,Colors} from 'react-native-ui-lib';
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import StyleSheet from "./StyleSheet";
import Constants from "./Constants";
import _ from 'lodash';

 
export default class TrackController extends Component {
	constructor(props) {
		super(props);
	}

	getSelectedIndex() {
		if(this.props.mediaType == "Audio"){
			//console.log("audio " + this.props.boardState.acn )
			return this.props.boardState.acn >= 0 ? this.props.boardState.acn : 0;
		}
			
		else if (this.props.mediaType == "Video"){
		//	console.log("video " + this.props.boardState.vcn )
			return this.props.boardState.vcn >= 0 ? this.props.boardState.vcn : 0;
		}
	}

	getWheelyItems() {

		if (this.props.mediaType == "Audio") {
			let it = this.props.audio.map((obj, index) => { return {label:obj.localName.replace(".m4a",""),
												value:index,
												align: WheelPickerAlign.CENTER};
			});
			return it;
		}

		else if (this.props.mediaType == "Video") {
			let it = this.props.video.map((obj, index)  => { return {label:obj.algorithm ? obj.algorithm.replace("mode","").replace("()","") : obj.localName.replace(".mp4",""),
				value:index,
				align: WheelPickerAlign.CENTER};
			});
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
					<GestureHandlerRootView>
						<WheelPicker
							initialValue={0}
							activeTextColor={Colors.blue30}
							inactiveTextColor={Colors.black}
							items={this.getWheelyItems()}
							textStyle={{ fontWeight:"bold"}}
							numberOfVisibleRows={5} 
							onChange={async (value) => {
								try {
									await this.props.sendCommand(this.props.mediaType, (value));
									console.log("Selected track: " + (value));
								}
								catch (error) {
									console.log(error);
								}
							}}
						/>
				</GestureHandlerRootView>
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
