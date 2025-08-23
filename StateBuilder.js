import Constants from "./Constants";

var bEmptyUserPrefs = {
	isDevilsHand: false,
	isBurnerMode: false,
	wifiLocations: false,
	mapPoints: false,
	isMonitor: false,
	locationHistoryMinutes: "1",
	offlineMapPercentage: 0,
	unlockCode: "",
	visibleUnlockCode: "",
	mapMode: "auto",
	showMapOverlay: false
};

var bMap = {
	center: Constants.MAN_LOCATION,
	zoom: 13,
	userLocation: Constants.MAN_LOCATION,
};

var bEmptyLogLines = [{ logLine: "", isError: false }];

var bBoardData = [{ name: "none", address: 1234 }]; //    { "color": "coral", "address": 42424, "isProfileGlobal": true, "profile": "Small-Testing","name": "BLUE DASH M2",  "type": "tester"},

var bLocations = [];

var bPeripheral = {
	name: "loading...",
	id: "12345",
	connectionStatus: Constants.DISCONNECTED,
};
var bAudio = [{ localName: "loading..." }];
var bVideo = [{ localName: "loading..." }];
var bDevices = [{ name: "loading...", address: "loading...", isPaired: false, }];
var bWifi = [];

var bBoardState = {
	acn: 0, // audio channel number
	vcn: 0, // video channel number
	v: -1, // volume
	b: -1, // battery level
	am: 0, // audio master
	apkd: 0, // apk updated date
	apkv: 0, // apk version number
	ip: "0.0.0.0", // ip address
	g: false, // GTFO
	bm: false, //block master
	s: "", // SSID
	c: "zzzz", // configured ssid
	p: "", // configured password
	r: false, //crisis mode
	rd: false, //rotating display
	fm: false, // fun happens here
	bar: false, // block auto rotation
	pv: 0, // power-volts
	pw: 0, // power-watts
	pt: 0, // block auto rotation
	as: "unknown", // audio server
	ah: 0, // lastheard ago
	an: 0 // number of audio peers
};

exports.blankWifi = function() {
	return JSON.parse(JSON.stringify(bWifi));
};
exports.blankBoardState = function() {
	return JSON.parse(JSON.stringify(bBoardState));
};
exports.blankDevices = function() {
	return JSON.parse(JSON.stringify(bDevices));
};
exports.blankAudio = function() {
	return JSON.parse(JSON.stringify(bAudio));
};
exports.blankVideo = function() {
	return JSON.parse(JSON.stringify(bVideo));
};

exports.blankPeripheral = function() {
	return JSON.parse(JSON.stringify(bPeripheral));
};

exports.blankBoardData = function() {
	return JSON.parse(JSON.stringify(bBoardData));
};

exports.blankLocations = function() {
	return JSON.parse(JSON.stringify(bLocations));
};

exports.blankMap = function() {
	return JSON.parse(JSON.stringify(bMap));
};

exports.blankLogLines = function () {
	return JSON.parse(JSON.stringify(bEmptyLogLines));
};
exports.blankUserPrefs = function () {
	return JSON.parse(JSON.stringify(bEmptyUserPrefs));
};

exports.boardColor = function (item, boardData) {

	var color = "whitesmoke";

	var foundBoard = boardData.filter((board) => {
		if (board.name)
			return board.name == item;
		else if (board.bootName)
			return board.bootName == item;
		else
			return false;
	});
 
	if (foundBoard[0]) {
		if (foundBoard[0].color) {
			color = foundBoard[0].color;
		}
	}
	return color;
};

// Helper function to determine if a color is light or dark
// Returns true if the color is light and needs dark text
exports.isLightColor = function(colorString) {
	// Convert color names to RGB values for calculation
	const colorMap = {
		// Light colors that need dark text
		'white': [255, 255, 255],
		'whitesmoke': [245, 245, 245],
		'lightgray': [211, 211, 211],
		'lightgrey': [211, 211, 211],
		'silver': [192, 192, 192],
		'gainsboro': [220, 220, 220],
		'yellow': [255, 255, 0],
		'lightyellow': [255, 255, 224],
		'gold': [255, 215, 0],
		'orange': [255, 165, 0],
		'pink': [255, 192, 203],
		'lightpink': [255, 182, 193],
		'lightblue': [173, 216, 230],
		'lightcyan': [224, 255, 255],
		'lightgreen': [144, 238, 144],
		'lightcoral': [240, 128, 128],
		'lightsalmon': [255, 160, 122],
		'wheat': [245, 222, 179],
		'beige': [245, 245, 220],
		'khaki': [240, 230, 140],
		'lavender': [230, 230, 250],
		'plum': [221, 160, 221],
		'thistle': [216, 191, 216],
		// Add more light colors as needed
	};

	// Check if it's a named color first
	const lowerColor = colorString.toLowerCase();
	if (colorMap[lowerColor]) {
		const [r, g, b] = colorMap[lowerColor];
		// Calculate luminance using the standard formula
		const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
		return luminance > 128; // Return true if light color
	}

	// Handle hex colors (#RRGGBB or #RGB)
	if (colorString.startsWith('#')) {
		let hex = colorString.slice(1);
		
		// Convert 3-digit hex to 6-digit
		if (hex.length === 3) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}
		
		if (hex.length === 6) {
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			
			// Calculate luminance
			const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
			return luminance > 128;
		}
	}

	// Handle rgb() format
	const rgbMatch = colorString.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
	if (rgbMatch) {
		const r = parseInt(rgbMatch[1]);
		const g = parseInt(rgbMatch[2]);
		const b = parseInt(rgbMatch[3]);
		
		const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
		return luminance > 128;
	}

	// Default to false (dark text) for unknown colors
	return false;
};

// Helper function to get appropriate text color for a given background color
exports.getTextColorForBackground = function(backgroundColor) {
	return exports.isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
};

