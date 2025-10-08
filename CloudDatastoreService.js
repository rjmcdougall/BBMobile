import Constants from "./Constants";

export default class CloudDatastoreService {
    constructor() {
        this.isConnected = false;
        this.pollingInterval = null;
        this.lastFetchTime = null;
        
        // Cloud configuration - Your actual Burner Board API
        this.config = {
            // Boards URL - contains board names, colors, configurations
            boardsUrl: 'https://us-central1-burner-board.cloudfunctions.net/boards',
            
            // Status URL - contains locations, battery levels, timestamps
            statusUrl: 'https://us-central1-burner-board.cloudfunctions.net/boards/status',
            
            pollInterval: 30000, // 30 seconds
        };
        
        this.onDataUpdate = null;
        this.onConnectionStatusChange = null;
        this.onError = null;
    }

    // Set callback functions
    setCallbacks(callbacks) {
        this.onDataUpdate = callbacks.onDataUpdate;
        this.onConnectionStatusChange = callbacks.onConnectionStatusChange;
        this.onError = callbacks.onError;
    }

    // Connect to cloud datastore
    async connect() {
        try {
            if (this.onConnectionStatusChange) {
                this.onConnectionStatusChange(Constants.CLOUD_CONNECTING);
            }

            // Test connection by making a simple query
            const testData = await this.fetchMeshData();
            
            if (testData) {
                this.isConnected = true;
                if (this.onConnectionStatusChange) {
                    this.onConnectionStatusChange(Constants.CLOUD_CONNECTED);
                }
                
                // Start periodic polling
                this.startPolling();
                
                // Return initial data
                return testData;
            } else {
                throw new Error('Failed to connect to Cloud Datastore');
            }
        } catch (error) {
            this.isConnected = false;
            if (this.onConnectionStatusChange) {
                this.onConnectionStatusChange(Constants.CLOUD_DISCONNECTED);
            }
            if (this.onError) {
                this.onError('Cloud connection failed: ' + error.message);
            }
            throw error;
        }
    }

    // Disconnect from cloud datastore
    disconnect() {
        this.isConnected = false;
        this.stopPolling();
        
        if (this.onConnectionStatusChange) {
            this.onConnectionStatusChange(Constants.CLOUD_DISCONNECTED);
        }
    }

    // Fetch both boards and status data
    async fetchMeshData() {
        try {
            console.log('Fetching boards data from:', this.config.boardsUrl);
            console.log('Fetching status data from:', this.config.statusUrl);
            
            // Fetch both URLs in parallel
            const [boardsResponse, statusResponse] = await Promise.all([
                fetch(this.config.boardsUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(this.config.statusUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            ]);

            if (!boardsResponse.ok) {
                throw new Error(`Boards API error! status: ${boardsResponse.status}`);
            }
            if (!statusResponse.ok) {
                throw new Error(`Status API error! status: ${statusResponse.status}`);
            }

            const boardsData = await boardsResponse.json();
            const statusData = await statusResponse.json();
            
            // Parse and combine the data
            return this.parseCombinedData(boardsData, statusData);
        } catch (error) {
            console.error('Error fetching mesh data:', error);
            if (this.onError) {
                this.onError('Failed to fetch mesh data: ' + error.message);
            }
            throw error;
        }
    }

    // Parse and combine boards and status data
    parseCombinedData(boardsData, statusData) {
        const boardData = [];
        const status = [];
        const locations = []; // Keep for backward compatibility with BLE
        
        try {
            // Create a map of boards by address for quick lookup
            const boardsMap = new Map();
            
            // Process boards data (from /boards endpoint)
            if (Array.isArray(boardsData)) {
                boardsData.forEach((board) => {
                    // Create boardData entry (compatible with existing BoardManager structure)
                    const boardDataEntry = {
                        name: board.name,
                        color: board.color,
                        address: board.address,
                        bootName: board.bootName || board.name,
                        type: board.type,
                        isActive: board.isActive,
                        isProfileGlobal: board.isProfileGlobal,
                        profile: board.profile,
                        targetAPKVersion: board.targetAPKVersion,
                        createdDate: board.createdDate,
                        displayTeensy: board.displayTeensy,
                        videoContrastMultiplier: board.videoContrastMultiplier,
                        isCloud: true // Mark as cloud board
                    };
                    
                    boardData.push(boardDataEntry);
                    boardsMap.set(board.address, boardDataEntry);
                    
                    console.log(`Added board: ${board.name} (address: ${board.address}, color: ${board.color})`);
                });
            }
            
            // Process status data (from /boards/status endpoint)
            let statusArray = [];
            if (statusData.mesh && Array.isArray(statusData.mesh)) {
                statusArray = statusData.mesh;
            } else if (Array.isArray(statusData)) {
                statusArray = statusData;
            }
            
            statusArray.forEach((item, index) => {
                const nodeId = item.node_id;
                const longName = item.longname || `Board ${index + 1}`;
                const shortName = item.shortname || `BB${index.toString().padStart(2, '0')}`;
                
                // Try to find corresponding board data by matching shortname to address
                // Extract numeric part from shortname (e.g., "BB33" -> 33)
                let boardAddress = null;
                const shortNameMatch = shortName.match(/BB(\d+)/);
                if (shortNameMatch) {
                    boardAddress = parseInt(shortNameMatch[1]);
                }
                
                const boardInfo = boardAddress ? boardsMap.get(boardAddress) : null;
                const boardName = boardInfo ? boardInfo.name : longName;
                const boardColor = boardInfo ? boardInfo.color : this.getCloudBoardColor(index);
                
                // Get battery level - handle null values
                let batteryLevel = item.last_known_battery_percent;
                if (batteryLevel === null || batteryLevel === undefined) {
                    batteryLevel = -1; // Unknown battery
                } else {
                    batteryLevel = Math.round(batteryLevel); // Round to integer
                }
                
                // Get coordinates - handle null values
                const latitude = item.latitude;
                const longitude = item.longitude;
                
                // Handle timestamps
                const lastSeenStr = item.last_seen;
                let lastHeard = Date.now();
                if (lastSeenStr) {
                    lastHeard = new Date(lastSeenStr).getTime();
                }

                let lastSeenBattery = null;
                if (item.last_seen_battery) {
                    lastSeenBattery = new Date(item.last_seen_battery).getTime();
                }

                let lastSeenLocation = null;
                if (item.last_seen_location) {
                    lastSeenLocation = new Date(item.last_seen_location).getTime();
                }

                // Log processing for debugging
                console.log(`Processing cloud status: ${boardName} (${longName})`);
                console.log(`  Address: ${boardAddress}, Color: ${boardColor}`);
                console.log(`  Battery: ${batteryLevel}%`);
                console.log(`  Voltage: ${item.last_known_voltage}V`);
                console.log(`  Coordinates: ${latitude}, ${longitude}`);
                console.log(`  Last seen: ${lastSeenStr}`);
                console.log(`  Last seen battery: ${item.last_seen_battery}`);
                console.log(`  Last seen location: ${item.last_seen_location}`);

                // Create status entry (new structure for BoardStatusPanel)
                const statusEntry = {
                    nodeId: nodeId,
                    longname: longName,
                    shortname: shortName,
                    board: boardName,
                    boardAddress: boardAddress,
                    last_known_battery_percent: batteryLevel >= 0 ? batteryLevel : null,
                    last_known_voltage: item.last_known_voltage,
                    latitude: latitude,
                    longitude: longitude,
                    last_seen: lastHeard,
                    last_seen_battery: lastSeenBattery,
                    last_seen_location: lastSeenLocation,
                    // For filtering in BoardStatusPanel
                    last_known_battery: batteryLevel >= 0 ? batteryLevel : 0,
                    b: batteryLevel,
                    lastHeard: lastSeenBattery || lastHeard // Use battery timestamp if available
                };

                // Add location data if available
                if (latitude !== null && latitude !== undefined && 
                    longitude !== null && longitude !== undefined) {
                    statusEntry.locations = [{
                        a: parseFloat(latitude),   // 'a' for latitude (MapController format)
                        o: parseFloat(longitude),  // 'o' for longitude (MapController format) 
                        d: lastSeenLocation || lastHeard // Use location timestamp or fallback to general timestamp
                    }];
                    console.log(`  ✅ Added location for ${boardName}: ${latitude}, ${longitude}`);
                } else {
                    console.log(`  ❌ No coordinates for ${boardName}, but added to status`);
                }
                
                status.push(statusEntry);

                // Create location entry for backward compatibility with existing code
                const location = {
                    board: boardName,
                    b: batteryLevel,
                    last_known_battery: batteryLevel >= 0 ? batteryLevel : 0,
                    last_known_voltage: item.last_known_voltage || 0,
                    last_seen_battery: lastSeenBattery,
                    lastHeard: lastHeard,
                };

                if (latitude !== null && latitude !== undefined && 
                    longitude !== null && longitude !== undefined) {
                    location.locations = [{
                        a: parseFloat(latitude),
                        o: parseFloat(longitude),
                        d: lastSeenLocation || lastHeard
                    }];
                }
                
                locations.push(location);
            });
            
            console.log(`Parsed ${boardData.length} board configs and ${status.length} status entries`);
            
        } catch (error) {
            console.error('Error parsing combined board data:', error);
            throw error;
        }

        return {
            boardData, // Renamed from 'boards' to match BoardManager state
            status, // New status structure
            locations, // Keep for backward compatibility
            fetchTime: Date.now()
        };
    }


    // Get color for cloud boards
    getCloudBoardColor(index) {
        const colors = ['lightblue', 'lightgreen', 'lightyellow', 'lightcoral', 'lightpink', 'lightcyan'];
        return colors[index % colors.length];
    }

    // Start periodic polling
    startPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.pollingInterval = setInterval(async () => {
            try {
                if (this.isConnected) {
                    const data = await this.fetchMeshData();
                    if (data && this.onDataUpdate) {
                        this.onDataUpdate(data);
                    }
                }
            } catch (error) {
                console.error('Error during polling:', error);
                if (this.onError) {
                    this.onError('Polling error: ' + error.message);
                }
            }
        }, this.config.pollInterval);
    }

    // Stop periodic polling
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    // Check if currently connected to cloud
    isCloudConnected() {
        return this.isConnected;
    }

    // Get connection status
    getConnectionStatus() {
        if (this.isConnected) {
            return Constants.CLOUD_CONNECTED;
        }
        return Constants.CLOUD_DISCONNECTED;
    }

    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    // Get last fetch time
    getLastFetchTime() {
        return this.lastFetchTime;
    }
}
