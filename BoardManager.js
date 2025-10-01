import React, { Component } from "react";
import { View, NativeEventEmitter, NativeModules, ScrollView,PermissionsAndroid, AppState, Text, Image, YellowBox, TouchableOpacity } from "react-native";
//import BleManager from "react-native-ble-manager";
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
  PeripheralInfo,
} from 'react-native-ble-manager';
import Cache from "./Cache";
import MediaManagement from "./MediaManagement";
import AdminManagement from "./AdminManagement";
import AppManagement from "./AppManagement";
import Diagnostic from "./Diagnostic";
import BoardStatusPanel from "./BoardStatusPanel";
import Touchable from "react-native-platform-touchable";
import StateBuilder from "./StateBuilder";
import Constants from "./Constants";
import LeftNav from "./LeftNav";
import MapController from "./MapController";
import BatteryController from "./BatteryController";
import BatteryListItem from "./BatteryListItem";
import StyleSheet, { Colors } from "./StyleSheet";
import DiscoverController from "./DiscoverController";
import StatsControl from "./StatsControl";
import PropTypes from "prop-types";
import { Buffer } from "buffer";
import ContentResolver from "./ContentResolver";
import CloudDatastoreService from "./CloudDatastoreService";
import { Mutex } from "async-mutex";
const mutex = new Mutex();
var bleMutex;

// eslint-disable-next-line no-unused-vars
var cr = new ContentResolver();

import { stringToBytes } from "convert-string";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


export default class BoardManager extends Component {
	constructor() {
		super();

		this.state = {
			scanning: false,
			boardBleDevices: new Map(),
			appState: "",
			connectedPeripheral: StateBuilder.blankPeripheral(),
			boardState: StateBuilder.blankBoardState(),
			showScreen: Constants.MAP,
			automaticallyConnect: true,
			backgroundLoop: null,
			rxBuffers: [],
			logLines: StateBuilder.blankLogLines(),
			map: StateBuilder.blankMap(),
			boardData: StateBuilder.blankBoardData(),
			locations: StateBuilder.blankLocations(),
			audio: StateBuilder.blankAudio(),
			video: StateBuilder.blankVideo(),
			devices: StateBuilder.blankDevices(),
			wifi: StateBuilder.blankWifi(),
			isMonitor: false,
			currentCommandTimeout: null,
			currentCommand: "",
			cloudConnectionStatus: Constants.CLOUD_DISCONNECTED,
			isCloudConnected: false,
		};

		this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
		this.handleStopScan = this.handleStopScan.bind(this);
		this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
		this.handleAppStateChange = this.handleAppStateChange.bind(this);
		this.handleNewData = this.handleNewData.bind(this);
		this.sendCommand = this.sendCommand.bind(this);
		this.onSelectAudioTrack = this.onSelectAudioTrack.bind(this);
		this.onPressSearchForBoards = this.onPressSearchForBoards.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
		this.onSelectPeripheral = this.onSelectPeripheral.bind(this);
		this.startScan = this.startScan.bind(this);
		this.setMap = this.setMap.bind(this);
		this.clearCache = this.clearCache.bind(this);
		this.updateMonitor = this.updateMonitor.bind(this);
		this.onSelectCloudConnection = this.onSelectCloudConnection.bind(this);
		this.handleCloudDataUpdate = this.handleCloudDataUpdate.bind(this);
		this.handleCloudConnectionStatusChange = this.handleCloudConnectionStatusChange.bind(this);
		this.handleCloudError = this.handleCloudError.bind(this);
		
		// Initialize cloud service
		this.cloudService = new CloudDatastoreService();
		this.cloudService.setCallbacks({
			onDataUpdate: this.handleCloudDataUpdate,
			onConnectionStatusChange: this.handleCloudConnectionStatusChange,
			onError: this.handleCloudError,
		});
	}


	setMap(map) {
		this.setState({ map: map });
	}

	async clearCache() {
		await Cache.clear();
		this.setState({
			connectedPeripheral: StateBuilder.blankPeripheral(),
			boardState: StateBuilder.blankBoardState(),
			video: StateBuilder.blankVideo(),
			audio: StateBuilder.blankAudio(),
			boardData: StateBuilder.blankBoardData(),
		});
		await this.sleep(500);
	}

	async componentDidMount() {
		AppState.addEventListener("change", this.handleAppStateChange);

		await BleManager.start({
			showAlert: false
		});

		var boards = await Cache.get(Constants.BOARDS);

		if (boards) {
			this.setState({
				boardData: boards,
			});
			this.l("Loading Board Data from Cache", false, boards);
		}
		else
			this.l("No Board Data found in cache", false, null);

		this.handlerDiscover = bleManagerEmitter.addListener("BleManagerDiscoverPeripheral", this.handleDiscoverPeripheral);
		this.handlerStop = bleManagerEmitter.addListener("BleManagerStopScan", this.handleStopScan);
		this.handlerDisconnect = bleManagerEmitter.addListener("BleManagerDisconnectPeripheral", this.handleDisconnectedPeripheral);
		this.handlerNewData = bleManagerEmitter.addListener("BleManagerDidUpdateValueForCharacteristic", this.handleNewData);

		// this is a hack for android permissions. Not required for IOS.
		if (Constants.IS_ANDROID && Constants.HAS_ANDROID_VERSION) {
			PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
				if (result) {
					this.l("Permission is OK", false, null);
				} else {
					PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
						if (result) {
							this.l("User accept", false, null);
						} else {
							this.l("User refuse", true, null);
						}
					});
				}
			});

			PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
				if (result) {
					this.l("Permission is OK", false, null);
				} else {
					PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
						if (result) {
							this.l("User accept", false, null);
						} else {
							this.l("User refuse", true, null);
						}
					});
				}
			});
 
			PermissionsAndroid.requestMultiple([
				PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
				PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
				PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
				PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
			]).then((result) => {
				if (result) {
				console.log('BBM: User accept')
				} else {
				console.log('BBM: User refuse')
				}
			})
			 
		}

		// if there is a default BleDevice saved, scan and attempt to load that board.
		var config = await Cache.get(Constants.DEFAULT_PERIPHERAL);
		if (config) {
			this.setState({
				boardName: config.name,
			});

			await this.startScan(true);
		}

		// Kick off a per-second location reader 
		this.l("Begin Background Location Loop", false, null);
		await this.readLocationLoop();

	}

	handleAppStateChange(nextAppState) {
		if (this.state.appState.match(/inactive|background/) && nextAppState === "active") {
			console.log("BBM: App has come to the foreground!");
			BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
				console.log("BBM: Connected boards: " + peripheralsArray.length);
			});
		}
		
		// Release any held locks when app goes to background
		// This prevents permanent deadlocks after suspend/resume cycles
		if (nextAppState.match(/inactive|background/) && this.state.appState === "active") {
			if (mutex.isLocked()) {
				this.l("App backgrounding - releasing mutex lock to prevent deadlock (mutex locked: " + mutex.isLocked() + ")", false);
				this.cancelCommand();
			}
		}
		
		this.setState({
			appState: nextAppState
		});
	}

	cancelCommand() {
		clearTimeout(this.state.currentCommandTimeout);
		this.l(this.state.currentCommand + " data found, release lock (mutex locked: " + mutex.isLocked() + ")", false);
		
		// CRITICAL FIX: Improved mutex release safety
		// Only release if we have the release function and mutex is actually locked
		if (bleMutex && mutex.isLocked()) {
			try {
				bleMutex();
				this.l("Mutex successfully released", false);
			} catch (error) {
				this.l("Error releasing mutex: " + error, true);
			}
			bleMutex = null;
		} else if (bleMutex) {
			// If we have the release function but mutex isn't locked, just clear the reference
			this.l("Mutex not locked, clearing release function reference", false);
			bleMutex = null;
		}
	}

	handleNewData(newData) {
		try {
			
			var rxBuffers = this.state.rxBuffers;
			// Convert bytes array to string
			var data = newData.value;
			var tmpData = Buffer.alloc(data.length);
			var tmpDataLen = 0;
			for (var i = 0; i < data.length; i++) {
				var oneChar = data[i];
				// Do we have the end-of-json delimeter?
				if (oneChar == ";".charCodeAt(0)) {
					if (tmpData.length > 0) {
						// Push the new bytes avail
						var tmpDataBuffer = Buffer.alloc(tmpDataLen);
						tmpData.copy(tmpDataBuffer, 0, 0, tmpDataLen);
						rxBuffers.push(tmpDataBuffer);
					}
					this.l("logging state buffer:", false);
					this.l(Buffer.concat(rxBuffers).toString("ascii"), false);
					try {
						var newMessage = Buffer.concat(rxBuffers);
						var newState = JSON.parse(newMessage.toString("ascii"));
						// Setup the app-specific ble state structure
						this.updateBLEState(newState);
						if (mutex.isLocked()) {
							this.cancelCommand();
						}
					}
					catch (error) {
						this.l("Bad JSON detected. Update succeeded but the app does not reflect that.  slow down pushing commads!", true, newState);
					}
					rxBuffers = [];
					this.setState({ rxBuffers: rxBuffers });
					tmpData = Buffer.alloc(1024);
					tmpDataLen = 0;
				} else {
					// Add characters to buffer
					if (oneChar > 0) {
						tmpData[tmpDataLen] = oneChar;
						tmpDataLen++;
					}
				}
			}
			tmpDataBuffer = Buffer.alloc(tmpDataLen);
			tmpData.copy(tmpDataBuffer, 0, 0, tmpDataLen);
			if (tmpDataLen > 0) {
				if (!rxBuffers) {
					rxBuffers = [tmpDataBuffer];
				} else {
					rxBuffers.push(tmpDataBuffer);
				}
			}
		} catch (error) {
			this.l("handleNewData error: " + error, true, newMessage);
			rxBuffers = [];
			this.setState({ rxBuffers: rxBuffers });
			if (mutex.isLocked()) {
				this.l("handleNewData error - releasing mutex (locked: " + mutex.isLocked() + ")", true);
				this.cancelCommand();
			}
		}
	}

	componentWillUnmount() {
		// CRITICAL FIX: Release any held locks before unmounting
		// This prevents memory leaks and app-wide deadlocks
		if (mutex.isLocked()) {
			this.l("Component unmounting - releasing mutex lock to prevent memory leak (mutex locked: " + mutex.isLocked() + ")", false);
			this.cancelCommand();
		}
		
		// Clear background timer to prevent continued execution after unmount
		if (this.state.backgroundLoop) {
			clearInterval(this.state.backgroundLoop);
		}
		
		this.handlerDiscover.remove();
		this.handlerStop.remove();
		this.handlerDisconnect.remove();
		this.handlerNewData.remove();
	}

	async handleDisconnectedPeripheral(data) {

		let peripheral = data.peripheral;

		try {
			if (mutex.isLocked()) {
				this.cancelCommand();
			}
			
			// Update state 
			var dev = this.state.boardBleDevices.get(peripheral);
			if (dev != null) {
				this.l("Disconnected from " + dev.name, false, dev);
				dev.connectionStatus = Constants.DISCONNECTED;
			}
			if (this.state.connectedPeripheral) {
				if (peripheral == this.state.connectedPeripheral.id) {
					this.l("Disconnected from active peripheral after " + (((new Date()) - dev.connectionStartTime) / 1000) + " seconds", true, dev);
					this.setState({
						connectedPeripheral: StateBuilder.blankPeripheral(),
						boardState: StateBuilder.blankBoardState(),
						video: StateBuilder.blankVideo(),
						audio: StateBuilder.blankAudio(),
						devices: StateBuilder.blankDevices(),
					});
				}
			}
		}
		catch (error) {
			this.l("Disconnect Error ", true, data);
		}

	}

	handleStopScan() {
		this.l("Scan is stopped", false, null);
		this.setState({
			scanning: false
		});
	}

	async sleep(ms) {
		await this._sleep(ms);
	}

	_sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async startScan(automaticallyConnect) {

		if (!this.state.scanning) {
			try {

				if (this.state.connectedPeripheral)
					if (this.state.connectedPeripheral.id != "12345") {
						await BleManager.disconnect(this.state.connectedPeripheral.id);
					}

				// you wont find a peripheral you are already connected to. So... readd those.
				var boardBleDevices = new Map();
				var peripherals = await BleManager.getConnectedPeripherals();
				peripherals.map((peripheral) => {
					boardBleDevices.set(peripheral.id, peripheral);
				});
				
				this.setState({
					connectedPeripheral: StateBuilder.blankPeripheral(),
					boardState: StateBuilder.blankBoardState(),
					video: StateBuilder.blankVideo(),
					audio: StateBuilder.blankAudio(),
					devices: StateBuilder.blankDevices(),
					scanning: true,
					boardBleDevices: boardBleDevices,
					automaticallyConnect: automaticallyConnect
				});

				this.l("Scanning with automatic connect: " + automaticallyConnect, false, null);
				await BleManager.scan([Constants.bbUUID], 5, true, {
        matchMode: BleScanMatchMode.Aggressive,
        scanMode: BleScanMode.Balanced,
        callbackType: BleScanCallbackType.AllMatches,
      });
// scan([], 2, true, {
//        matchMode: BleScanMatchMode.Aggressive,
//        scanMode: BleScanMode.Balanced,
//        callbackType: BleScanCallbackType.AllMatches,
//      })
			}
			catch (error) {
				this.l("Failed to Scan: " + error, true, null);
			}
		}
	}

	onNavigate(nav) {
		this.setState({ showScreen: nav });
	}

	async onSelectPeripheral(peripheral) {
		if (peripheral) {

			var boardBLEDevices = this.state.boardBleDevices;

			if (peripheral.connectionStatus != Constants.DISCONNECTED) {
				try {
					this.l("Disconnecting BLE From " + peripheral.name, false, null);
					await BleManager.disconnect(peripheral.id);
					// eslint-disable-next-line require-atomic-updates
					peripheral.connectionStatus = Constants.DISCONNECTED;
					boardBLEDevices.set(peripheral.id, peripheral);
				}
				catch (error) {
					this.l("Failed to Disconnect" + error, true, null);
				}
			}
			try {
				// store default in filesystem.
				await Cache.set(Constants.DEFAULT_PERIPHERAL, peripheral);

				var boardName = peripheral.name;

				this.setState({
					boardBLEDevices: boardBLEDevices,
					boardState: StateBuilder.blankBoardState(),
					video: StateBuilder.blankVideo(),
					audio: StateBuilder.blankAudio(),
					devices: StateBuilder.blankDevices(),
					showScreen: Constants.MAP,
					boardName: boardName,
					scanning: false,
				});

				// Directly connect to the selected peripheral instead of just scanning
				await this.connectToPeripheral(peripheral);
			}
			catch (error) {
				this.l("Connection error" + error, true, null);
			}

		}
	}

	// Upload the JSON from the brain to the local BLE state
	updateBLEState(newMedia) {

		try {
			// Batch all state updates together to ensure a single render
			let stateUpdate = {};
			
			if (newMedia.boards) {
				Cache.set(Constants.BOARDS, newMedia.boards);
				stateUpdate.boardData = newMedia.boards;
			}
			if (newMedia.video) {
				stateUpdate.video = newMedia.video;
				Cache.set(Constants.VIDEOPREFIX + this.state.connectedPeripheral.name, newMedia.video);
			}
			if (newMedia.audio) {
				stateUpdate.audio = newMedia.audio;
				Cache.set(Constants.AUDIOPREFIX + this.state.connectedPeripheral.name, newMedia.audio);
			}
			if (newMedia.state) {
				stateUpdate.boardState = newMedia.state;
			}
			if (newMedia.wifi) {
				stateUpdate.wifi = newMedia.wifi;
			}
			if (newMedia.btdevs) {
				stateUpdate.devices = newMedia.btdevs;
			}
			if (newMedia.locations) {
				stateUpdate.locations = newMedia.locations;
			}
			
			// Apply all state updates at once
			if (Object.keys(stateUpdate).length > 0) {
				this.setState(stateUpdate);
			}
			
			if (newMedia.messages) {
				// Forward messages to MapController if it exists
				if (this.mapControllerRef && this.mapControllerRef.addReceivedMessages) {
					this.mapControllerRef.addReceivedMessages(newMedia.messages);
				}
			}
		}
		catch (error) {
			this.l("Error Updating Media State " + error, true, null);
		}
	}

	l(logLine, isError, body) {
		if (logLine != null && isError != null) {
			var logArray = this.state.logLines;
			if (logArray.length > Constants.MAX_DIAGNOSTIC_LINES)
				logArray.splice(0, 1);
			logArray.push({ logLine: logLine, isError: isError, body: body });
			console.log("BBM: " + logLine);
			if (body != null) console.log("BBM: ", body);
			this.setState({ logLines: logArray });
		}
	}

	async refreshBLEState() {

		if (this.state.connectedPeripheral) {

			this.l("requesting media state ", false, null);

			this.setState({
				boardState: StateBuilder.blankBoardState(),
				audio: StateBuilder.blankAudio(),
				video: StateBuilder.blankVideo(),
				devices: StateBuilder.blankDevices(),
			});

			try {
				var boards = await Cache.get(Constants.BOARDS);
				if (boards) {
					this.l("boards found in cache, updating state", false, boards);
					this.setState({ boardData: boards });
				} else {
					// Check if we have default/blank boardData that needs refreshing
					var hasValidBoardData = this.state.boardData.length > 0 && 
						!(this.state.boardData.length === 1 && this.state.boardData[0]?.name === 'none');
					
					if (!hasValidBoardData) {
						this.l("No boards in cache and current boardData is empty/default, fetching from device", false);
						await this.sendCommand("getboards", "");
					} else {
						this.l("No boards in cache but current boardData seems valid, keeping existing data", false);
					}
				}
			}
			catch (error) {
				this.l("Refresh Media Error: " + error, true);
			}

			try {
				var audio = await Cache.get(Constants.AUDIOPREFIX + this.state.connectedPeripheral.name);
				if (audio) {
					this.l("audio found in cache, skipping", false, audio);
					this.setState({ audio: audio });
				}
				else
					await this.sendCommand("getaudio", "");
			}
			catch (error) {
				this.l("Refresh Media Error: " + error, true);
			}

			try {
				var video = await Cache.get(Constants.VIDEOPREFIX + this.state.connectedPeripheral.name);
				if (video) {
					this.l("video found in cache, skipping", false, video);
					this.setState({ video: video });
				}
				else
					await this.sendCommand("getvideo", "");
			}
			catch (error) {
				this.l("Refresh Media Error: " + error, true);
			}

			try {
				await this.sendCommand("getstate", "");
			}
			catch (error) {
				this.l("Get State Error: " + error, true);
			}

		}
	}
 
	async sendCommand(command, arg) {

		// Send request command
		if (this.state.connectedPeripheral.connectionStatus == Constants.CONNECTED) {

			var bm = this;

			try {

		this.l("trying lock and request " + command + " on device " + this.state.connectedPeripheral.name + " (mutex locked: " + mutex.isLocked() + ")", false);
		bleMutex = await mutex.acquire();

		this.l("locked and request " + command + " on device " + this.state.connectedPeripheral.name + " (mutex locked: " + mutex.isLocked() + ")", false);

				var commandTimeout = setTimeout( () => {
				if (mutex.isLocked()) {
					this.l(this.state.currentCommand + " timeout (mutex locked: " + mutex.isLocked() + ")", true);
					if (bleMutex) {
						bleMutex();
						bleMutex = null;
					}
					return;
				}
				},  30000);

				this.setState({currentCommandTimeout: commandTimeout,
					currentCommand: command + " " + arg});
	

				if (mutex.isLocked()) { // last chance. if the mutex unlocks that means a timeout occured and 
					//we should skip.
					const data = stringToBytes("{command:\"" + command + "\", arg:\"" + arg + "\"};\n");
					await BleManager.write(bm.state.connectedPeripheral.id,
						Constants.UARTservice,
						Constants.txCharacteristic,
						data,
						18); // MTU Size
				}

			}
			catch (error) {
				if (mutex.isLocked()) {
					this.l("SendCommand error - releasing mutex (locked: " + mutex.isLocked() + ")", true);
					this.cancelCommand();
				}

				// eslint-disable-next-line require-atomic-updates
				bm.state.connectedPeripheral.connectionStatus = Constants.DISCONNECTED;
				bm.l("SendCommand failed for '" + command + "' with arg '" + arg + "': " + error, true);
			}
			return true;
		}
		else {
			console.log("BBM: SendCommand blocked - not connected. Status:", this.state.connectedPeripheral.connectionStatus);
			this.l("Command '" + command + "' blocked - device not connected", true);
			return false;
		}
	}
	async fetchMessages() {
		if (this.state.connectedPeripheral.connectionStatus == Constants.CONNECTED) {
			try {
				await this.sendCommand("getmessages", "");
				// Messages will be handled in updateBLEState when response comes back
			} catch (error) {
				this.l("Failed to fetch messages: " + error, true);
			}
		}
	}

	async sendMessageToBLE(message) {
		if (this.state.connectedPeripheral.connectionStatus == Constants.CONNECTED) {
			try {
				await this.sendCommand("sendmessage", message);
				return true;
			} catch (error) {
				this.l("Failed to send message: " + error, true);
				return false;
			}
		}
		return false;
	}

	onSelectAudioTrack = async function (idx) {
		await this.sendCommand("Audio", idx);
	}

	async onPressSearchForBoards() {

		if (!this.state.scanning) {

			try {
				await BleManager.disconnect(this.state.connectedPeripheral.id);

				this.setState({
					//	boardBleDevices: new Map(),
					appState: "",
				connectedPeripheral: StateBuilder.blankPeripheral(),
					boardState: StateBuilder.blankBoardState(),
					video: StateBuilder.blankVideo(),
					audio: StateBuilder.blankAudio(),
					devices: StateBuilder.blankDevices(),
					showScreen: Constants.DISCOVER
				});
			}
			catch (error) {
				this.l("Pressed Search For Boards: " + error, true, null);
			}
		}
	}

	async handleDiscoverPeripheral(peripheral) {
		try {

			// update the list of boardBleDevices for the board picker.
			var boardBleDevices = this.state.boardBleDevices;

			if (!boardBleDevices.has(peripheral.id)) {

				this.l("Found New Peripheral:" + peripheral.name, false, null);

				peripheral.connectionStatus = Constants.DISCONNECTED;

				// Check for existing devices with same name but different ID (duplicates)
				var boardBleDeviceArray = Array.from(boardBleDevices.values());
				var duplicateDevices = boardBleDeviceArray.filter((board) => {
					return board.name == peripheral.name && board.id != peripheral.id;
				});

				// Remove all duplicate devices with the same name
				duplicateDevices.forEach((duplicate) => {
					this.l("Removing duplicate device: " + duplicate.name + " (ID: " + duplicate.id + ")", false, null);
					boardBleDevices.delete(duplicate.id);
				});

				boardBleDevices.set(peripheral.id, peripheral);
				this.setState({ boardBleDevices: boardBleDevices });
			}

			// if it is your default peripheral, connect automatically.
			if (this.state.automaticallyConnect && peripheral.name == this.state.boardName) {
				await this.connectToPeripheral(peripheral);
			}

		}
		catch (error) {
			this.l("BoardManager Found Peripheral Error:" + error, true, null);
		}
	}

	async connectToPeripheral(peripheral) {

		// Update state 
		var boardBleDevices = this.state.boardBleDevices;
		var boardBleDevice = boardBleDevices.get(peripheral.id);

		try {

			if (boardBleDevice.connectionStatus == Constants.DISCONNECTED) {
				this.l("Automatically Connecting To: " + peripheral.name, false, null);

				// Update status 
				boardBleDevice.connectionStatus = Constants.CONNECTING;
				boardBleDevices.set(boardBleDevice.id, boardBleDevice);

				this.setState({
					connectedPeripheral: boardBleDevice,
					boardBleDevices: boardBleDevices,
				});

				try {
					await BleManager.connect(boardBleDevice.id);
					await this.sleep(Constants.CONNECT_SLEEP());
					this.l("Retreiving services", false, null);
					await BleManager.retrieveServices(boardBleDevice.id);
					await this.sleep(Constants.RETRIEVE_SERVICES_SLEEP());

					// Can't await setNotificatoon due to a bug in blemanager (missing callback)
					this.setNotificationRx(boardBleDevice.id);
					// Sleep until it's done (guess)
					await this.sleep(Constants.SET_NOTIFICATIONS_SLEEP());

					// Update status 
					boardBleDevice.connectionStatus = Constants.CONNECTED;
					boardBleDevice.connectionStartTime = new Date();
					boardBleDevices.set(boardBleDevice.id, boardBleDevice);

					// Now go setup and read all the state for the first time
					await this.refreshBLEState(boardBleDevice);
					this.setState({
						connectedPeripheral: boardBleDevice,
						boardBleDevices: boardBleDevices,
					});

				} catch (error) {
					this.l("Error connecting: " + error, true, null);
					
					// CRITICAL FIX: Release any held locks on connection failure
					// Connection errors during refreshBLEState can leave locks held
					if (mutex.isLocked()) {
						this.l("Connection error - releasing mutex lock (locked: " + mutex.isLocked() + ")", false);
						this.cancelCommand();
					}

					// Update status 
					boardBleDevice.connectionStatus = Constants.DISCONNECTED;
					boardBleDevices.set(boardBleDevice.id, boardBleDevice);

					this.setState({
						connectedPeripheral: boardBleDevice,
						boardBleDevices: boardBleDevices,
					});
				}
			}
		}
		catch (error) {
			this.l(error, true, null);
		}
	}

	async setNotificationRx(peripheralId) {
		try {
			var e = await BleManager.startNotification(peripheralId,
				Constants.UARTservice,
				Constants.rxCharacteristic);
			if (e == null) {
				this.l("successfully set notificationon rx", false);
			} else {
				this.l("error " + e, true, null);
			}
		} catch (error) {
			this.l("error setting notification on rx:" + error, true, null);
		}
	}

	updateMonitor(isMonitor) {
		this.setState({ isMonitor: isMonitor });
	}

	async readLocationLoop() {
 
		var backgroundTimer = setInterval(async () => {
 
			if (this.state.isMonitor) {
				try {
					var boardsJSON = await cr.getLocationJSON();
					console.log("BBM: Content Resolver JSON");
					console.log("BBM: ", boardsJSON);
					this.setState({ locations: JSON.parse(boardsJSON)});
				}
				catch (error) {
					this.l("Attempted to get locations via ContentResolver since we are in Monitor Mode, but failed", true, error);
				}
			}
			else {
			if (this.state.connectedPeripheral
					&& this.state.connectedPeripheral.connectionStatus == Constants.CONNECTED
					&& this.completionPercentage() == 100) {
					try {
						// CRITICAL FIX: Execute commands sequentially with proper awaiting
						// This prevents race conditions where multiple commands compete for the mutex
						await this.sendCommand("Location", this.props.userPrefs.locationHistoryMinutes);
						await this.sleep(1000);  // Fixed: Now properly awaited
						await this.sendCommand("getstate", this.props.userPrefs.locationHistoryMinutes);
						await this.sleep(500);   // Fixed: Now properly awaited
						await this.sendCommand("getmessages", this.props.userPrefs.locationHistoryMinutes);
					}
					catch (error) {
						this.l("Location Loop Failed:" + error, true, null);
						// Ensure any held locks are released on error
						if (mutex.isLocked()) {
							this.l("Location Loop error - releasing mutex lock (locked: " + mutex.isLocked() + ")", true);
							this.cancelCommand();
						}
					}
				}
			}
		}, 8000);
		this.setState({ backgroundLoop: backgroundTimer });
	}

	completionPercentage() {
		var completionPercent = 0;
		if (this.state.boardData.length > 0) completionPercent += 25;
		if (this.state.video.length > 0) completionPercent += 25;
		if (this.state.audio.length > 0) completionPercent += 25;
		if (this.state.boardState.v != -1) completionPercent += 25;
		
		
		return completionPercent;
	}
	render() {

		var color = "#fff";
		var enableControls = "none";
		var connectionButtonText = "";
		var boardName = "board";
 
	if (this.state.boardName)
		boardName = this.state.boardName;

	// Check for cloud connection first
	if (this.state.isCloudConnected && this.state.cloudConnectionStatus === Constants.CLOUD_CONNECTED) {
		color = "green";
		enableControls = "auto";
		connectionButtonText = "Connected to Cloud";
	}
	else if (this.state.connectedPeripheral) {
		const completion = this.completionPercentage();
		const isConnected = this.state.connectedPeripheral.connectionStatus == Constants.CONNECTED;

		if (completion == 100 && isConnected) {
			color = "green";
			enableControls = "auto";
			connectionButtonText = "Loaded " + boardName;
		}
		else {
			switch (this.state.connectedPeripheral.connectionStatus) {
			case Constants.DISCONNECTED:
				color = "#fff";
				enableControls = "none";
				connectionButtonText = "Connect to " + boardName;
				break;
			case Constants.CONNECTING:
				color = "yellow";
				enableControls = "none";
				connectionButtonText = "Connecting To " + boardName;
				break;
			case Constants.CONNECTED:
				color = "yellow";
				enableControls = "none";
				connectionButtonText = "Loading " + boardName + " " + completion + "%";
				break;
			}
		}

	}
	else {
		color = "#fff";
		enableControls = "none";
		connectionButtonText = "Select Board";
	}

		if (!this.state.isMonitor)
			return (
				<View style={{ flex: 1, backgroundColor: Colors.primary }}>
					<View style={{ backgroundColor: Colors.surfacePrimary, height: 60, borderBottomWidth: 1, borderBottomColor: Colors.borderPrimary }}></View>
					<View style={{ flexDirection: "row", backgroundColor: Colors.primary }}>
						{(!this.props.userPrefs.isDevilsHand) ?
							<View style={{ margin: 2 }}>
							<Image style={{ width: 50, height: 51 }} source={require("./images/BurnerBoardIcon-1026-dark.png")} />
							</View>
							: <View></View>
						}
						<View style={{ flex: 1, alignItems: 'center', margin: 2 }}>
							<View style={{ width: '88%' }}>
								<BatteryController b={this.state.boardState.b} />
							</View>
						</View>
						{(this.props.userPrefs.isDevilsHand) ?
							<View style={{ margin: 2}}>
								<Image style={{ width: 50, height: 51, }} source={require("./images/BurnerBoardIcon-1026-dark.png")} />
							</View>
							: <View></View>
						}
					</View>
					<View style={{ flex: 1, flexDirection: "row" }}>
						{(!this.props.userPrefs.isDevilsHand) ? <LeftNav onNavigate={this.onNavigate} showScreen={this.state.showScreen} onPressSearchForBoards={this.onPressSearchForBoards} /> : <View></View>}
						<View style={{ flex: 1 }}>
							<View style={{ flex: 1 }}>
								{(this.state.showScreen == Constants.DIAGNOSTIC) ? <Diagnostic pointerEvents={enableControls} logLines={this.state.logLines} boardState={this.state.boardState} /> : <View></View>}
								{(this.state.showScreen == Constants.ADMINISTRATION) ? <AdminManagement wifi={this.state.wifi} devices={this.state.devices} setUserPrefs={this.props.setUserPrefs} userPrefs={this.props.userPrefs} pointerEvents={enableControls} boardState={this.state.boardState} sendCommand={this.sendCommand} /> : <View></View>}
								{(this.state.showScreen == Constants.APP_MANAGEMENT) ? <AppManagement updateMonitor={this.updateMonitor} clearCache={this.clearCache} setUserPrefs={this.props.setUserPrefs} userPrefs={this.props.userPrefs} /> : <View></View>}
								{(this.state.showScreen == Constants.MAP) ? <MapController ref={ref => this.mapControllerRef = ref} isMonitor={this.state.isMonitor} updateMonitor = {this.updateMonitor} userPrefs={this.props.userPrefs} boardState={this.state.boardState} locations={this.state.locations} setMap={this.setMap} map={this.state.map} boardData={this.state.boardData} setUserPrefs={this.props.setUserPrefs} sendMessageToBLE={this.sendMessageToBLE.bind(this)} fetchMessages={this.fetchMessages.bind(this)} audio={this.state.audio} video={this.state.video} sendCommand={this.sendCommand} /> : <View></View>}
								{(this.state.showScreen == Constants.DISCOVER) ? <DiscoverController startScan={this.startScan} boardBleDevices={this.state.boardBleDevices} scanning={this.state.scanning} boardData={this.state.boardData} onSelectPeripheral={this.onSelectPeripheral} onSelectCloudConnection={this.onSelectCloudConnection} /> : <View></View>}
								{(this.state.showScreen == Constants.BOARD_STATUS) ? <BoardStatusPanel boardData={this.state.boardData} onRefreshBoards={this.startScan.bind(this, false)} /> : <View></View>}
								{(this.state.showScreen == Constants.STATS_CONTROL) ? <StatsControl pointerEvents={enableControls} boardState={this.state.boardState} sendCommand={this.sendCommand} /> : <View></View>}
							</View>
							<View style={StyleSheet.footer}>
								<TouchableOpacity
									onPress={async () => {
										try {
											await this.startScan(true);
										}
										catch (error) {
											this.l("Failed to Connext " + error);
										}
									}
									}
									style={{
									backgroundColor: color === "green" ? Colors.accentSecondary : color === "yellow" ? Colors.accentWarning : Colors.surfaceSecondary,
									flex: 1,
									borderRadius: 12,
									borderWidth: 1,
									borderColor: Colors.borderPrimary,
								}}>
									<Text style={StyleSheet.connectButtonTextCenter}>{connectionButtonText} {this.state.scanning ? "(s)" : ""}</Text>
								</TouchableOpacity>
							</View>
						</View>
						{(this.props.userPrefs.isDevilsHand) ? <LeftNav onNavigate={this.onNavigate} showScreen={this.state.showScreen} onPressSearchForBoards={this.onPressSearchForBoards} /> : <View></View>}
					</View>
				</View>
			);

		else {
			return (
				<View style={StyleSheet.monitorContainer}>
					<View style={StyleSheet.monitorMap}>
						<MapController ref={ref => this.mapControllerRef = ref} isMonitor={this.state.isMonitor} updateMonitor={this.updateMonitor} userPrefs={this.props.userPrefs} setUserPrefs={this.props.setUserPrefs} boardState={this.state.boardState} locations={this.state.locations} setMap={this.setMap} map={this.state.map} boardData={this.state.boardData} sendMessageToBLE={this.sendMessageToBLE.bind(this)} fetchMessages={this.fetchMessages.bind(this)} />
					</View>
					<View style={StyleSheet.batteryList}>
						<ScrollView>
							{this.buildBatteryList()}
						</ScrollView>
					</View>
				</View>
			);
		}
	}

	lastHeardBoardDate(board) {
		try {
			var locationHistory = board.locations.sort((a, b) => a.d - b.d);
			var lastLocation = locationHistory[locationHistory.length - 1];
			return new Date(lastLocation.d).toLocaleTimeString();
		}
		catch (error){
			console.log("BBM: ", error);
		}
	}

	buildBatteryList() {
		var a = new Array();
		var BM = this;

		//locations.map((board) => {
		this.state.locations.map((board) => {
			var color = StateBuilder.boardColor(board.board, BM.state.boardData);
			var textColor = StateBuilder.getTextColorForBackground(color);
			//color="pink";
			if(board.locations.length >0){
				var batteryGauge = (
					<View  key={board.board + "v6"} style={{ backgroundColor: color}}>
						<View key={board.board + "v1"} style={{ flexDirection: "row" }}>
							<View key={board.board + "v2"} style={{ flex: .25, justifyContent: "center", alignItems: "center"}}>
								<View key={board.board + "v3"}>
									<Text style={{ fontSize: 20, fontWeight: "bold", color: textColor }} key={board.board + "txt"} >{board.board}</Text>
								</View>
								<View key={board.board + "v4"}>
									<Text style={{ fontSize: 12, fontWeight: "bold", color: textColor }} key={board.board + "txt2"} >{this.lastHeardBoardDate(board)}</Text>
								</View>
							</View>
							<View key={board.board + "v5"} style={{ flex: 1.75}}><BatteryListItem key={board.board + "bat"} id={board.board + "bat"} b={board.b} /></View>
						</View>
					</View>
				);
				a.push(batteryGauge);
			}
		});

		return a;
	}

	// Cloud connection methods
	async onSelectCloudConnection() {
		try {
			this.l("Connecting to Google Cloud Datastore...", false, null);
			
			// Disconnect from any existing BLE connections
			if (this.state.connectedPeripheral && this.state.connectedPeripheral.id !== "12345") {
				await BleManager.disconnect(this.state.connectedPeripheral.id);
			}
			
			// Reset state for cloud connection
			this.setState({
				connectedPeripheral: StateBuilder.blankPeripheral(),
				boardState: StateBuilder.blankBoardState(),
				video: StateBuilder.blankVideo(),
				audio: StateBuilder.blankAudio(),
				devices: StateBuilder.blankDevices(),
				showScreen: Constants.MAP,
				scanning: false,
			});
			
			// Connect to cloud service
			const cloudData = await this.cloudService.connect();
			
			if (cloudData) {
				this.handleCloudDataUpdate(cloudData);
				this.l("Successfully connected to cloud!", false, null);
			}
			
		} catch (error) {
			this.l("Failed to connect to cloud: " + error.message, true, null);
		}
	}

	handleCloudDataUpdate(cloudData) {
		try {
			if (cloudData.boards && cloudData.boards.length > 0) {
				// Merge cloud boards with existing board data
				let mergedBoardData = [...this.state.boardData];
				
				// Remove any existing cloud boards to avoid duplicates
				mergedBoardData = mergedBoardData.filter(board => !board.isCloud);
				
				// Add new cloud boards
				mergedBoardData = [...mergedBoardData, ...cloudData.boards];
				
				this.setState({
					boardData: mergedBoardData,
				});
				
				// Cache the updated board data
				Cache.set(Constants.BOARDS, mergedBoardData);
				
				this.l("Updated board data with " + cloudData.boards.length + " cloud boards", false, null);
			}
			
			if (cloudData.locations && cloudData.locations.length > 0) {
				// Merge cloud locations with existing locations
				let mergedLocations = [...this.state.locations];
				
				// Remove any existing cloud locations to avoid duplicates
				const cloudBoardNames = cloudData.boards.map(b => b.name);
				mergedLocations = mergedLocations.filter(loc => !cloudBoardNames.includes(loc.board));
				
				// Add new cloud locations
				mergedLocations = [...mergedLocations, ...cloudData.locations];
				
				this.setState({
					locations: mergedLocations,
				});
				
				this.l("Updated locations with " + cloudData.locations.length + " cloud locations", false, null);
			}
			
		} catch (error) {
			this.l("Error processing cloud data: " + error.message, true, null);
		}
	}

	handleCloudConnectionStatusChange(status) {
		this.setState({
			cloudConnectionStatus: status,
			isCloudConnected: status === Constants.CLOUD_CONNECTED,
		});
		
		const statusText = {
			[Constants.CLOUD_CONNECTING]: "Connecting to cloud...",
			[Constants.CLOUD_CONNECTED]: "Connected to cloud",
			[Constants.CLOUD_DISCONNECTED]: "Disconnected from cloud"
		}[status] || status;
		
		this.l("Cloud status: " + statusText, status === Constants.CLOUD_DISCONNECTED, null);
	}

	handleCloudError(errorMessage) {
		this.l("Cloud error: " + errorMessage, true, null);
	}
}

BoardManager.propTypes = {
	userPrefs: PropTypes.object,
	setUserPrefs: PropTypes.func,
};

BoardManager.defaultProps = {
	userPrefs: StateBuilder.blankUserPrefs(),
};
