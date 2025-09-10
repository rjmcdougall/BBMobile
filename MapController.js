import React, { Component } from "react";
import { Text, View, TextInput, Platform, TouchableOpacity, Modal, ScrollView } from "react-native";
import Mapbox from "@rnmapbox/maps";
import StateBuilder from "./StateBuilder";
import PropTypes from "prop-types";
import Touchable from "react-native-platform-touchable";
import StyleSheet, { Colors } from "./StyleSheet";
import Constants from "./Constants";
import Bubble from "./Bubble";
import Cache from "./Cache";
import VolumeController from "./VolumeController";

Mapbox.setAccessToken(
	"sk.eyJ1IjoiZGFuaWVsa2VpdGh3IiwiYSI6ImNqdzhlbHUwZTJvdmUzenFramFmMTQ4bXIifQ.9EXJnBcsrsKyS-veb_dlNg"
);
export default class MapController extends Component {

	constructor(props) {
		super(props);
		this.state = {
			flyTo: 0,
			showBubble: false,
			followUserLocation: false,
			isFetchingAndroidPermission: Constants.IS_ANDROID,
			isAndroidPermissionGranted: false,
			messages: [],
			currentMessage: '',
			audioModalVisible: false,
			videoModalVisible: false,
		};

		// Use class property to persist across renders
		this.hasAutoZoomedOnce = false;

		this.onPressCircle = this.onPressCircle.bind(this);
		this.lastHeardBoardDate = this.lastHeardBoardDate.bind(this);
		this.onUserLocationUpdate = this.onUserLocationUpdate.bind(this);
		this.calculateDistance = this.calculateDistance.bind(this);
		this.updateMapBasedOnLocation = this.updateMapBasedOnLocation.bind(this);
		this.addMessage = this.addMessage.bind(this);
		this.handleSubmitMessage = this.handleSubmitMessage.bind(this);
		this.getAudioPickerItems = this.getAudioPickerItems.bind(this);
		this.getVideoPickerItems = this.getVideoPickerItems.bind(this);
		this.getSelectedAudioIndex = this.getSelectedAudioIndex.bind(this);
		this.getSelectedVideoIndex = this.getSelectedVideoIndex.bind(this);
	}

	async componentDidMount() {
		if (Constants.IS_ANDROID) {
			const isGranted = await Mapbox.requestAndroidLocationPermissions();
			this.setState({
				isAndroidPermissionGranted: isGranted,
				isFetchingAndroidPermission: false,
			});
		}
		
		// Load cached messages
		try {
			const cachedMessages = await Cache.get(Constants.MESSAGES);
			if (cachedMessages && Array.isArray(cachedMessages)) {
				this.setState({ messages: cachedMessages });
				console.log('Loaded', cachedMessages.length, 'messages from cache');
			}
		} catch (error) {
			console.log('Error loading cached messages:', error);
		}
		
		// Fetch messages from BLE on component mount if available
		if (this.props.fetchMessages) {
			this.props.fetchMessages();
		}
	}

	componentWillUnmount() {
		// Clean up references to prevent memory leaks
		if (this.bubbleTimeout) {
			clearTimeout(this.bubbleTimeout);
		}
	}

	// Calculate distance between two coordinates in miles using Haversine formula
	calculateDistance(lat1, lon1, lat2, lon2) {
		const R = 3959; // Earth's radius in miles
		const dLat = this.toRadians(lat2 - lat1);
		const dLon = this.toRadians(lon2 - lon1);
		const a = 
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c;
		return distance;
	}

	toRadians(degrees) {
		return degrees * (Math.PI / 180);
	}

	updateMapBasedOnLocation(userLocation) {
		// Only auto-switch if map mode is set to 'auto'
		if (this.props.userPrefs.mapMode !== 'auto') {
			return;
		}

		// Prevent auto-zoom after the first time using class property
		if (this.hasAutoZoomedOnce) {
			console.log('Auto-zoom already occurred, only updating user location');
			// Just update user location without changing center or zoom
			this.props.setMap({
				center: this.props.map.center,
				zoom: this.props.map.zoom,
				userLocation: userLocation
			});
			return;
		}

		console.log('Performing first and only auto-zoom');
		// Mark that we're about to auto-zoom (immediate update)
		this.hasAutoZoomedOnce = true;

		const distance = this.calculateDistance(
			userLocation[1], // latitude
			userLocation[0], // longitude
			Constants.MAN_LOCATION[1], // Burning Man latitude
			Constants.MAN_LOCATION[0]  // Burning Man longitude
		);

		// If more than 100 miles from Burning Man, center on user location
		// Otherwise, center on Burning Man
		const newCenter = distance > 100 ? userLocation : Constants.MAN_LOCATION;
		const newZoom = distance > 100 ? 13 : 13;

		this.props.setMap({
			center: newCenter,
			zoom: newZoom,
			userLocation: userLocation
		});
	}

	onUserLocationUpdate(location) {
		console.log('Location update received:', location);
		if (location) {
			const userLocation = [location.coords.longitude, location.coords.latitude];
			console.log('User location updated to:', userLocation);
			
			// Update map based on location and user preferences
			if (this.props.userPrefs.mapMode === 'me') {
				// Always center on user (this mode continues to follow)
				console.log('Map mode: me - centering on user location');
				this.props.setMap({
					center: userLocation,
					zoom: 13,
					userLocation: userLocation
				});
			} else if (this.props.userPrefs.mapMode === 'playa') {
				// Always center on Burning Man (just update user location)
				console.log('Map mode: playa - updating user location only');
				this.props.setMap({
					center: Constants.MAN_LOCATION,
					zoom: 13,
					userLocation: userLocation
				});
			} else {
				// Auto mode - use distance algorithm (with one-time auto-zoom)
				console.log('Map mode: auto - using distance algorithm');
				this.updateMapBasedOnLocation(userLocation);
			}
		} else {
			console.log('Location update called but location is null');
		}
	}

	makeLineCollection(board) {

		var featureCollection = {
			"type": "FeatureCollection",
			"features": []
		};
		var route = {
			"type": "Feature",
			"geometry": {
				"type": "LineString",
				"coordinates": []
			}
		};

		//locations.locations :) ascending order
		var locationHistory = board.locations.sort((a, b) => a.d - b.d);

		locationHistory.map((location) => {
			route.geometry.coordinates.push([location.o, location.a]);
		});

		// debug
		if (Constants.debug)
			for (var i = 0; i < route.geometry.coordinates.length - 1; i++) {
				route.geometry.coordinates[i] = [route.geometry.coordinates[i][0] + (Math.random() * .01), route.geometry.coordinates[i][1] + (Math.random() * .01)];
			}

		featureCollection.features.push(route);
		return featureCollection;
	}

	makePoint(board) {

		//locations.locations :) ascending order
		var locationHistory = board.locations.sort((a, b) => a.d - b.d);
		var lastLocation = locationHistory[locationHistory.length - 1];

		var featureCollection = {
			"type": "FeatureCollection",
			"features": []
		};
		var point = {
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"coordinates": [lastLocation.o, lastLocation.a]
			},
			"properties": {
				"board": board.board
			}
		};

		featureCollection.features.push(point);
		return featureCollection;
	}

	async sleep(ms) {
		await this._sleep(ms);
	}

	_sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async onPressCircle(e) {
		// Enhanced logging for Android debugging
		if (Constants.debug || Constants.IS_ANDROID) {
			console.log('Map marker clicked - Platform:', Platform.OS);
			console.log('Event structure:', JSON.stringify(e, null, 2));
		}

		// Handle different event structures between iOS and Android
		let payload;
		if (e.nativeEvent && e.nativeEvent.payload) {
			payload = e.nativeEvent.payload;
		} else if (e.features && e.features.length > 0) {
			// Android sometimes uses features array
			payload = e.features[0];
		} else if (e.geometry) {
			// Direct feature object
			payload = e;
		} else {
			console.log('Unknown event structure on', Platform.OS);
			return;
		}

		if (!payload || !payload.geometry || payload.geometry.type !== "Point") {
			console.log('Not a point geometry or missing payload');
			return;
		}

		// Extract board name from properties
		const boardName = payload.properties && payload.properties.board;
		if (!boardName) {
			console.log('No board name in properties:', payload.properties);
			return;
		}

		// Find the clicked board
		var boardPicked = this.props.locations.filter((board) => {
			return board.board === boardName;
		})[0];

		if (!boardPicked) {
			console.log('Board not found:', boardName);
			return;
		}

		console.log('Board selected:', boardName);

		// Clear any existing timeout
		if (this.bubbleTimeout) {
			clearTimeout(this.bubbleTimeout);
		}

		// Show the board information bubble
		this.setState({
			boardPicked: boardPicked
		});

		// Auto-hide after 5 seconds (increased for better Android UX)
		this.bubbleTimeout = setTimeout(() => {
			this.setState({
				boardPicked: null
			});
		}, 5000);
	}

	lastHeardBoardDate() {
		var locationHistory = this.state.boardPicked.locations.sort((a, b) => a.d - b.d);
		var lastLocation = locationHistory[locationHistory.length - 1];
		return new Date(lastLocation.d).toLocaleString();
	}

	async addMessage(message) {
		const timestamp = new Date().toLocaleTimeString();
		const formattedMessage = `${timestamp}: ${message}`;
		const newMessages = [...this.state.messages, formattedMessage];
		
		// Keep only last 8 messages
		if (newMessages.length > 8) {
			newMessages.shift();
		}
		
		this.setState({ messages: newMessages });
		
		// Save messages to cache
		try {
			await Cache.set(Constants.MESSAGES, newMessages);
			console.log('Messages saved to cache');
		} catch (error) {
			console.log('Error saving messages to cache:', error);
		}
	}

	// Method to be called from BoardManager when BLE messages are received
	addReceivedMessages(messages) {
		if (Array.isArray(messages)) {
			// Add each message from the BLE response
			messages.forEach(message => {
				this.addMessage(message);
			});
		} else if (typeof messages === 'string') {
			// Single message
			this.addMessage(messages);
		}
	}

	async handleSubmitMessage(event) {
		const message = event.nativeEvent.text.trim();
		if (message) {
			// Add message to local display
			this.addMessage(message);
			
			// Send message via Bluetooth if available
			if (this.props.sendMessageToBLE) {
				const success = await this.props.sendMessageToBLE(message);
				if (!success) {
					// Could show an error indicator here
					console.log('Failed to send message via BLE');
				}
			}
			
		this.setState({ currentMessage: '' });
		}
	}

	getSelectedAudioIndex() {
		return this.props.boardState && this.props.boardState.acn >= 0 ? this.props.boardState.acn : 0;
	}

	getSelectedVideoIndex() {
		return this.props.boardState && this.props.boardState.vcn >= 0 ? this.props.boardState.vcn : 0;
	}

	getAudioPickerItems() {
		if (this.props.audio) {
			return this.props.audio.map((obj, index) => {
				return {
					label: obj.localName ? obj.localName.replace(".m4a","") : `Audio ${index + 1}`,
					value: index
				};
			});
		}
		return [];
	}

	getVideoPickerItems() {
		if (this.props.video) {
			return this.props.video.map((obj, index) => {
				return {
					label: obj.algorithm ? obj.algorithm.replace("mode","").replace("()","") : (obj.localName ? obj.localName.replace(".mp4","") : `Video ${index + 1}`),
					value: index
				};
			});
		}
		return [];
	}
	buildMap() {
		try {
			var a = new Array();
			var MP = this;
			var shapeSource;

			// Add Burning Man 2025 overlay if enabled
			if (this.props.userPrefs && this.props.userPrefs.showMapOverlay) {
				const burningManOverlay = (
					<Mapbox.ShapeSource 
						id="burning-man-overlay" 
						key="burning-man-overlay"
						shape={require('./maps/burning-mesh-overlay-2025.json')}
					>
						{/* Street outlines */}
						<Mapbox.LineLayer 
							id="street-outlines" 
							filter={['==', ['get', 'layer_id'], 'streetOutlines']}
							style={{
								lineColor: ['get', 'stroke'],
								lineWidth: 2,
								lineOpacity: 0.8
							}} 
						/>
						{/* Trash fence */}
						<Mapbox.LineLayer 
							id="trash-fence" 
							filter={['==', ['get', 'layer_id'], 'trashFence']}
							style={{
								lineColor: '#FFA500',
								lineWidth: 3,
								lineOpacity: 0.9,
								lineDasharray: [2, 2]
							}} 
						/>
						{/* CPNS (Communication Point Nodes) */}
						<Mapbox.CircleLayer 
							id="cpns" 
							filter={['==', ['get', 'layer_id'], 'cpns']}
							style={{
								circleRadius: 6,
								circleColor: '#FFA500',
								circleStrokeColor: '#333333',
								circleStrokeWidth: 2,
								circleOpacity: 0.9
							}} 
						/>
					</Mapbox.ShapeSource>
				);
				a.push(burningManOverlay);
			}

			this.props.locations.map((board) => {

				if (board.locations.length > 1) {
					shapeSource = (
						<Mapbox.ShapeSource id={"SS" + board.board} key={"SS" + board.board} shape={this.makeLineCollection(board)}>
							<Mapbox.LineLayer id={"LL" + board.board} key={"LL" + board.board} style={{
								lineColor: StateBuilder.boardColor(board.board, this.props.boardData),
								lineWidth: 5,
								lineOpacity: .7,
								lineJoin: "round",
								lineCap: "round",
							}} />
						</Mapbox.ShapeSource>);

					a.push(shapeSource);
				}
				if (board.locations.length > 0) {

					shapeSource = (
						<Mapbox.ShapeSource 
							id={"C" + board.board} 
							key={"C" + board.board}
							shape={this.makePoint(board)}
							onPress={MP.onPressCircle}
							hitbox={{width: 50, height: 50}} // Larger hit area for Android
							tolerance={10} // Tap tolerance
						>
							<Mapbox.CircleLayer 
								id={"CL" + board.board} 
								key={"CL" + board.board}
								style={{
									circleRadius: Constants.IS_ANDROID ? 10 : 8, // Slightly larger on Android
									circleColor: StateBuilder.boardColor(board.board, this.props.boardData),
									circleStrokeColor: "black",
									circleStrokeWidth: 2,
									circleOpacity: 0.9
								}} 
							/>
							{/* Board name text label - appears when zoomed in close */}
							<Mapbox.SymbolLayer 
								id={"TL" + board.board} 
								key={"TL" + board.board}
								style={{
									// Text styling
									textField: board.board,
									textFont: ['Open Sans Semibold', 'Arial Unicode MS Bold'],
									textSize: 12,
									textColor: '#FFFFFF',
									textHaloColor: '#000000',
									textHaloWidth: 1,
									textHaloBlur: 1,
									// Position relative to the circle
									textOffset: [0, 2], // Offset below the circle
									textAnchor: 'top',
									// Show only at high zoom levels (approximately 30 feet visibility)
									textOpacity: [
										'interpolate',
										['linear'],
										['zoom'],
										16, 0,    // Invisible below zoom 16
										17, 0.7,  // Fade in at zoom 17
										18, 1     // Fully visible at zoom 18+
									],
									// Prevent label collisions
									textAllowOverlap: false,
									textIgnorePlacement: false,
									// Additional styling for better readability
									textPitchAlignment: 'viewport',
									textRotationAlignment: 'viewport'
								}} 
							/>
						</Mapbox.ShapeSource>);

					a.push(shapeSource);
				}
			});
			return a;
		}
		catch (error) {
			console.log(error);
		}

	}

	render() {

		if (Constants.IS_ANDROID && !this.state.isAndroidPermissionGranted) {
			if (this.state.isFetchingAndroidPermission) {
				return null;
			}
		}

		var MP = this;

	const audioPickerItems = this.getAudioPickerItems();
	const videoPickerItems = this.getVideoPickerItems();

	return (
			<View style={StyleSheet.container}>
				{/* Volume Control at top */}
				{this.props.boardState && (
					<View style={{
						backgroundColor: Colors.primary + 'CC', // 80% opacity
						paddingHorizontal: 10,
						paddingTop: 10,
						paddingBottom: 5
					}}>
						<VolumeController 
							boardState={this.props.boardState}
							sendCommand={this.props.sendCommand}
						/>
					</View>
				)}
				
				{/* Audio and Video Controls */}
				<View style={{ 
					flexDirection: 'row', 
					padding: 10, 
					backgroundColor: Colors.primary + 'CC', // 80% opacity
					justifyContent: 'space-around' 
				}}>
					{/* Audio Dropdown */}
					<View style={{ flex: 1, marginRight: 5 }}>
						<TouchableOpacity
							style={{
								height: 40,
								borderWidth: 1,
								borderColor: Colors.borderPrimary,
								borderRadius: 8,
								backgroundColor: Colors.surfaceSecondary,
								justifyContent: 'center',
								paddingHorizontal: 10,
								flexDirection: 'row',
								alignItems: 'center'
							}}
							onPress={() => this.setState({ audioModalVisible: true })}
						>
							<Text style={{
								flex: 1,
								fontSize: 12,
								color: Colors.textPrimary
							}}>
								{audioPickerItems.length > 0 ? audioPickerItems[this.getSelectedAudioIndex()]?.label || 'None' : 'None'}
							</Text>
							<Text style={{
								fontSize: 14,
								color: Colors.accent
							}}>▼</Text>
						</TouchableOpacity>
					</View>

					{/* Video Dropdown */}
					<View style={{ flex: 1, marginLeft: 5 }}>
						<TouchableOpacity
						style={{
							height: 40,
							borderWidth: 1,
							borderColor: Colors.borderPrimary,
							borderRadius: 8,
							backgroundColor: Colors.surfaceSecondary,
							justifyContent: 'center',
							paddingHorizontal: 10,
							flexDirection: 'row',
							alignItems: 'center'
						}}
							onPress={() => this.setState({ videoModalVisible: true })}
						>
							<Text style={{
								flex: 1,
								fontSize: 12,
								color: Colors.textPrimary
							}}>
								{videoPickerItems.length > 0 ? videoPickerItems[this.getSelectedVideoIndex()]?.label || 'None' : 'None'}
							</Text>
							<Text style={{
								fontSize: 14,
								color: Colors.accent
							}}>▼</Text>
						</TouchableOpacity>
					</View>
				</View>
				
				<View style={{ flex: 1, flexDirection: 'row' }}>
					{/* Map Container */}
					<View style={{ 
						flex: (this.state.audioModalVisible || this.state.videoModalVisible) ? 0 : 1,
						width: (this.state.audioModalVisible || this.state.videoModalVisible) ? 0 : '100%',
						overflow: 'hidden'
					}}>
						<Mapbox.MapView
							styleURL={Mapbox.StyleURL.Street}
							ref={c => (this._map = c)}
							style={{ 
								flex: 1,
								opacity: (this.state.audioModalVisible || this.state.videoModalVisible) ? 0 : 1
							}}>
							<Mapbox.Camera
								zoomLevel={MP.props.map.zoom}
								animationMode={"flyTo"}
								animationDuration={1000}
								centerCoordinate={MP.props.map.center}
								followUserLocation={this.state.followUserLocation}
								followUserMode="compass"
								followZoomLevel={MP.props.map.zoom}
								showUserLocation={true} />
							{(!this.props.isMonitor) ? (
								<Mapbox.UserLocation onUpdate={this.onUserLocationUpdate} />
							) : <View></View>}
							{this.buildMap()}
						</Mapbox.MapView>

						{(this.state.boardPicked && !(this.state.audioModalVisible || this.state.videoModalVisible)) ? (
							<Bubble>
								<Text>{this.state.boardPicked.board}</Text>
								<Text>last heard: {this.lastHeardBoardDate()}</Text>
								<Text>battery: {this.state.boardPicked.b === -1 ? 'unknown' : this.state.boardPicked.b + '%'}</Text>
							</Bubble>
						) : <View />}
					</View>

					{/* Media Selection Pane */}
					{(this.state.audioModalVisible || this.state.videoModalVisible) && (
						<View style={{
							flex: 1,
							backgroundColor: Colors.surfaceSecondary,
							borderLeftWidth: 1,
							borderLeftColor: Colors.borderPrimary,
							padding: 20
						}}>
							<Text style={{
								fontSize: 18,
								fontWeight: 'bold',
								marginBottom: 15,
								textAlign: 'center',
								color: Colors.textPrimary
							}}>
								Select {this.state.audioModalVisible ? 'Audio' : 'Video'} Track
							</Text>
							
							<ScrollView style={{ flex: 1, marginBottom: 15 }}>
								{(this.state.audioModalVisible ? audioPickerItems : videoPickerItems).map((item) => (
									<TouchableOpacity
										key={item.value}
										style={{
											padding: 15,
											borderBottomWidth: 1,
											borderBottomColor: Colors.borderSecondary,
											backgroundColor: item.value === (this.state.audioModalVisible ? this.getSelectedAudioIndex() : this.getSelectedVideoIndex()) ? Colors.accent + '20' : Colors.surfaceSecondary
										}}
										onPress={async () => {
											this.setState({ 
												audioModalVisible: false, 
												videoModalVisible: false 
											});
											if (this.props.sendCommand) {
												try {
													await this.props.sendCommand(this.state.audioModalVisible ? "Audio" : "Video", item.value);
													console.log(`Selected ${this.state.audioModalVisible ? 'audio' : 'video'} track:`, item.value);
												} catch (error) {
													console.log("Track selection error:", error);
												}
											}
										}}
									>
										<Text style={{
											fontSize: 16,
											color: item.value === (this.state.audioModalVisible ? this.getSelectedAudioIndex() : this.getSelectedVideoIndex()) ? Colors.accent : Colors.textPrimary,
											fontWeight: item.value === (this.state.audioModalVisible ? this.getSelectedAudioIndex() : this.getSelectedVideoIndex()) ? 'bold' : 'normal'
										}}>{item.label}</Text>
									</TouchableOpacity>
								))}
							</ScrollView>

							<TouchableOpacity
								style={{
									padding: 12,
									backgroundColor: Colors.accent,
									borderRadius: 8,
									alignItems: 'center'
								}}
								onPress={() => this.setState({ 
									audioModalVisible: false, 
									videoModalVisible: false 
								})}
							>
								<Text style={{
									color: '#ffffff',
									fontSize: 16,
									fontWeight: 'bold'
								}}>Close</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>

				<View style={{ backgroundColor: Colors.primary + 'E6', position: "absolute", bottom: 0, left: 0, right: 0 }}>
					<View style={{ maxHeight: 120, padding: 5 }}>
					{this.state.messages.slice(-4).map((msg, index) => (
						<Text key={index} style={{ color: Colors.textPrimary, fontSize: 14, marginBottom: 2 }}>
							{msg}
						</Text>
					))}
					</View>
					<TextInput
						style={{ 
							height: 44, 
							borderColor: Colors.borderPrimary, 
							borderWidth: 1, 
							color: Colors.textPrimary, 
							margin: 5, 
							paddingHorizontal: 12, 
							paddingVertical: 10,
							backgroundColor: Colors.surfaceSecondary,
							borderRadius: 8,
							fontSize: 16,
							textAlignVertical: 'center'
						}}
						onSubmitEditing={this.handleSubmitMessage}
						onChangeText={(text) => this.setState({ currentMessage: text })}
						value={this.state.currentMessage}
						placeholder="Type a message..."
						placeholderTextColor={Colors.textSecondary}
						returnKeyType="send"
					/>
				</View>


			</View>
		);
	}
}

MapController.propTypes = {
	locations: PropTypes.array,
	userPrefs: PropTypes.object,
	setMap: PropTypes.func,
	map: PropTypes.object,
	boardData: PropTypes.any,
	setUserPrefs: PropTypes.func,
	isMonitor: PropTypes.bool,
	updateMonitor: PropTypes.func,
	sendMessageToBLE: PropTypes.func,
	fetchMessages: PropTypes.func,
	audio: PropTypes.array,
	video: PropTypes.array,
	boardState: PropTypes.object,
	sendCommand: PropTypes.func,
};
