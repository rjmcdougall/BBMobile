import React, { Component } from "react";
import { Text, View, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import Mapbox from "@rnmapbox/maps";
import StateBuilder from "./StateBuilder";
import PropTypes from "prop-types";
import Touchable from "react-native-platform-touchable";
import StyleSheet from "./StyleSheet";
import Constants from "./Constants";
import Bubble from "./Bubble";
import Cache from "./Cache";

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
		};

		this.onPressCircle = this.onPressCircle.bind(this);
		this.lastHeardBoardDate = this.lastHeardBoardDate.bind(this);
		this.onUserLocationUpdate = this.onUserLocationUpdate.bind(this);
		this.calculateDistance = this.calculateDistance.bind(this);
		this.updateMapBasedOnLocation = this.updateMapBasedOnLocation.bind(this);
		this.addMessage = this.addMessage.bind(this);
		this.handleSubmitMessage = this.handleSubmitMessage.bind(this);
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
		if (location) {
			const userLocation = [location.coords.longitude, location.coords.latitude];
			
			// Update map based on location and user preferences
			if (this.props.userPrefs.mapMode === 'me') {
				// Always center on user
				this.props.setMap({
					center: userLocation,
					zoom: 13,
					userLocation: userLocation
				});
			} else if (this.props.userPrefs.mapMode === 'playa') {
				// Always center on Burning Man
				this.props.setMap({
					center: Constants.MAN_LOCATION,
					zoom: 13,
					userLocation: userLocation
				});
			} else {
				// Auto mode - use distance algorithm
				this.updateMapBasedOnLocation(userLocation);
			}
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

		if (e.nativeEvent.payload.geometry.type != "Point")
			return;

		var boardPicked = this.props.locations.filter((board) => {
			return board.board == e.nativeEvent.payload.properties.board;
		})[0];

		this.setState({
			boardPicked: boardPicked
		});
		await this.sleep(3000);
		this.setState({
			boardPicked: null
		});
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
			// Clear the input field
			if (this.messageInput) {
				this.messageInput.clear();
			}
		}
	}
	buildMap() {
		try {
			var a = new Array();
			var MP = this;
			var shapeSource;

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
						<Mapbox.ShapeSource id={"C" + board.board} key={"C" + board.board}
							shape={this.makePoint(board)}
							onPress={MP.onPressCircle}>
							<Mapbox.CircleLayer id={"CL" + board.board} key={"CL" + board.board}
								style={{
									circleRadius: 8,
									circleColor: StateBuilder.boardColor(board.board, this.props.boardData),
									circleStrokeColor: "black",
									circleStrokeWidth: 2
								}} />
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

	return (
			<View style={StyleSheet.container}>
				<View style={{ flex: 1 }}>
					<Mapbox.MapView
						styleURL={Mapbox.StyleURL.Street}
						ref={c => (this._map = c)}
						style={{ flex: 1 }}>
						<Mapbox.Camera
							zoomLevel={MP.props.map.zoom}
							animationMode={"flyTo"}
							animationDuration={1000}
							centerCoordinate={MP.props.map.center}
							followUserLocation={this.state.followUserLocation}
							followUserMode="compass"
							followZoomLevel={MP.props.map.zoom}
							showUserLocation={true} />
						{(!this.props.isMonitor) ? (<Mapbox.UserLocation onUpdate={this.onUserLocationUpdate} />) : <View></View>}
						{this.buildMap()}
					</Mapbox.MapView>

					{(this.state.boardPicked) ? (
						<Bubble>
							<Text>{this.state.boardPicked.board}</Text>
							<Text>last heard: {this.lastHeardBoardDate()}</Text>
							<Text>battery: {this.state.boardPicked.b}%</Text>
						</Bubble>
					) : <View />}
				</View>

				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
					<ScrollView
						style={{ maxHeight: 120, padding: 5 }}
						ref={ref => { this.scrollView = ref; }}
						onContentSizeChange={() => this.scrollView && this.scrollView.scrollToEnd({ animated: true })}>
						{this.state.messages.map((msg, index) => (
							<Text key={index} style={{ color: "white", fontSize: 10, marginBottom: 2 }}>
								{msg}
							</Text>
						))}
					</ScrollView>
					<TextInput
						ref={ref => { this.messageInput = ref; }}
						style={{ height: 40, borderColor: "gray", borderWidth: 1, color: "white", margin: 5, paddingHorizontal: 10, backgroundColor: "rgba(255,255,255,0.1)" }}
						onSubmitEditing={this.handleSubmitMessage}
						onChangeText={(text) => this.setState({ currentMessage: text })}
						value={this.state.currentMessage}
						placeholder="Type a message..."
						placeholderTextColor="gray"
						returnKeyType="send"
					/>
				</KeyboardAvoidingView>

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
};
