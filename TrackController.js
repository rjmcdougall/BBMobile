import React, { Component } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from "react-native";
import PropTypes from "prop-types";
import StateBuilder from "./StateBuilder";
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import StyleSheet from "./StyleSheet";
import Constants from "./Constants";
import _ from 'lodash';

 
export default class TrackController extends Component {
	constructor(props) {
		super(props);
		this.state = {
			modalVisible: false
		};
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

	getPickerItems() {
		if (this.props.mediaType == "Audio" && this.props.audio) {
			return this.props.audio.map((obj, index) => {
				return {
					label: obj.localName ? obj.localName.replace(".m4a","") : `Audio ${index + 1}`,
					value: index
				};
			});
		}

		else if (this.props.mediaType == "Video" && this.props.video) {
			return this.props.video.map((obj, index) => {
				return {
					label: obj.algorithm ? obj.algorithm.replace("mode","").replace("()","") : (obj.localName ? obj.localName.replace(".mp4","") : `Video ${index + 1}`),
					value: index
				};
			});
		}
		return [];
	}

	render() {
		const pickerItems = this.getPickerItems();
		console.log(`TrackController: ${this.props.mediaType} items:`, pickerItems);

		return (

			<View style={{flex:1}}>
				<View style={{flex: 1}}> 
						<Text style={StyleSheet.rowText}>{this.props.mediaType} Track</Text>
					
				</View>
				<View style={{flex: 5, justifyContent: 'center', paddingHorizontal: 10}}>
					{pickerItems.length > 0 ? (
						<>
							<TouchableOpacity
								style={{
									width: '100%',
									height: 50,
									marginVertical: 10,
									borderWidth: 1,
									borderColor: '#007AFF',
									borderRadius: 8,
									backgroundColor: '#ffffff',
									justifyContent: 'center',
									paddingHorizontal: 15,
									flexDirection: 'row',
									alignItems: 'center'
								}}
								onPress={() => this.setState({ modalVisible: true })}
							>
								<Text style={{
									flex: 1,
									fontSize: 16,
									color: '#000000'
								}}>
									{pickerItems[this.getSelectedIndex()]?.label || 'Select track'}
								</Text>
								<Text style={{
									fontSize: 18,
									color: '#007AFF'
								}}>▼</Text>
							</TouchableOpacity>

							<Modal
								animationType="slide"
								transparent={true}
								visible={this.state.modalVisible}
								onRequestClose={() => this.setState({ modalVisible: false })}
							>
								<View style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
									backgroundColor: 'rgba(0,0,0,0.5)'
								}}>
									<View style={{
										width: '80%',
										maxHeight: '60%',
										backgroundColor: '#ffffff',
										borderRadius: 12,
										padding: 20,
										shadowColor: '#000',
										shadowOffset: { width: 0, height: 2 },
										shadowOpacity: 0.25,
										shadowRadius: 4,
										elevation: 5
									}}>
										<Text style={{
											fontSize: 18,
											fontWeight: 'bold',
											marginBottom: 15,
											textAlign: 'center',
											color: '#000000'
										}}>Select {this.props.mediaType} Track</Text>
										
										<ScrollView style={{ maxHeight: 200 }}>
											{pickerItems.map((item) => (
												<TouchableOpacity
													key={item.value}
													style={{
														padding: 15,
														borderBottomWidth: 1,
														borderBottomColor: '#e0e0e0',
														backgroundColor: item.value === this.getSelectedIndex() ? '#f0f8ff' : '#ffffff'
													}}
													onPress={async () => {
														this.setState({ modalVisible: false });
														try {
															await this.props.sendCommand(this.props.mediaType, item.value);
															console.log("Selected track: " + item.value);
														} catch (error) {
															console.log(error);
														}
													}}
												>
													<Text style={{
														fontSize: 16,
														color: item.value === this.getSelectedIndex() ? '#007AFF' : '#000000',
														fontWeight: item.value === this.getSelectedIndex() ? 'bold' : 'normal'
													}}>{item.label}</Text>
												</TouchableOpacity>
											))}
										</ScrollView>

										<TouchableOpacity
											style={{
												marginTop: 15,
												padding: 12,
												backgroundColor: '#007AFF',
												borderRadius: 8,
												alignItems: 'center'
											}}
											onPress={() => this.setState({ modalVisible: false })}
										>
											<Text style={{
												color: '#ffffff',
												fontSize: 16,
												fontWeight: 'bold'
											}}>Cancel</Text>
										</TouchableOpacity>
									</View>
								</View>
							</Modal>
						</>
					) : (
						<Text style={{
							textAlign: 'center',
							fontSize: 16,
							color: '#666',
							padding: 20
						}}>No {this.props.mediaType?.toLowerCase()} tracks available</Text>
					)}
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
