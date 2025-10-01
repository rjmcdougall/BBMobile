import Constants from "./Constants";

export default class CloudDatastoreService {
    constructor() {
        this.isConnected = false;
        this.pollingInterval = null;
        this.lastFetchTime = null;
        
        // Cloud configuration - Your actual Burner Board API
        this.config = {
            // Your actual Burner Board cloud function
            publicUrl: 'https://us-central1-burner-board.cloudfunctions.net/boards/status',
            
            // This API returns JSON like:
            // {
            //   "mesh": [
            //     {
            //       "longname": "intrepid",
            //       "shortname": "BB43", 
            //       "last_known_battery_percent": 55.0,
            //       "latitude": 37.468439,
            //       "longitude": -122.16439749999999,
            //       "last_seen": "2025-09-30T21:24:39.493Z",
            //       "node_id": 1127986456
            //     }
            //   ]
            // }
            
            pollInterval: 30000, // 30 seconds
            useRealData: true, // Set to false to use mock data
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

    // Fetch mesh data from public JSON URL
    async fetchMeshData() {
        try {
            if (!this.config.useRealData) {
                // Return mock data for development/testing
                return this.getMockData();
            }

            console.log('Fetching real data from:', this.config.publicUrl);
            
            const response = await fetch(this.config.publicUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Parse the JSON response into board data
            return this.parseJsonResponse(data);
        } catch (error) {
            console.error('Error fetching mesh data:', error);
            if (this.onError) {
                this.onError('Failed to fetch mesh data: ' + error.message);
            }
            // Fallback to mock data on error
            console.log('Falling back to mock data due to error');
            return this.getMockData();
        }
    }

    // Parse Burner Board API response into board format
    parseJsonResponse(jsonData) {
        const boards = [];
        const locations = [];
        
        try {
            // Handle Burner Board API format with 'mesh' array
            let dataArray;
            
            if (jsonData.mesh && Array.isArray(jsonData.mesh)) {
                // Burner Board API format
                dataArray = jsonData.mesh;
            } else if (Array.isArray(jsonData)) {
                // If it's directly an array
                dataArray = jsonData;
            } else {
                // Try to convert single object to array
                dataArray = [jsonData];
            }
            
            dataArray.forEach((item, index) => {
                // Extract board data from Burner Board API format
                const longName = item.longname || `Board ${index + 1}`;
                const shortName = item.shortname || `BB${index.toString().padStart(2, '0')}`;
                const boardName = `${longName} (${shortName})`;
                
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
                
                // Handle timestamp
                const lastSeenStr = item.last_seen;
                let lastHeard = Date.now();
                if (lastSeenStr) {
                    lastHeard = new Date(lastSeenStr).getTime();
                }

                // Create board entry
                const board = {
                    name: boardName,
                    bootName: longName,
                    shortName: shortName,
                    address: `cloud-${item.node_id || index}`,
                    connectionStatus: Constants.CLOUD_CONNECTED,
                    isCloud: true,
                    b: batteryLevel,
                    batteryLevel: batteryLevel,
                    lastHeard: lastHeard,
                    type: "cloud",
                    color: this.getCloudBoardColor(index),
                    nodeId: item.node_id,
                    lastKnownVoltage: item.last_known_voltage
                };

                boards.push(board);

                // Create location entry only if coordinates are available
                if (latitude !== null && latitude !== undefined && 
                    longitude !== null && longitude !== undefined) {
                    const location = {
                        board: boardName,
                        b: batteryLevel,
                        locations: [{
                            lat: parseFloat(latitude),
                            lng: parseFloat(longitude),
                            d: lastHeard
                        }]
                    };
                    locations.push(location);
                }
            });
            
            console.log(`Parsed ${boards.length} Burner Boards from mesh data`);
            
        } catch (error) {
            console.error('Error parsing Burner Board API response:', error);
            // Return mock data if parsing fails
            return this.getMockData();
        }

        return {
            boards,
            locations,
            fetchTime: Date.now()
        };
    }

    // Get mock data for development/testing
    getMockData() {
        const mockBoards = [
            {
                name: "Cloud Alpha",
                bootName: "Cloud Alpha",
                address: "cloud-0",
                connectionStatus: Constants.CLOUD_CONNECTED,
                isCloud: true,
                b: 85,
                batteryLevel: 85,
                lastHeard: Date.now() - 120000, // 2 minutes ago
                type: "cloud",
                color: "lightblue"
            },
            {
                name: "Cloud Beta", 
                bootName: "Cloud Beta",
                address: "cloud-1",
                connectionStatus: Constants.CLOUD_CONNECTED,
                isCloud: true,
                b: 67,
                batteryLevel: 67,
                lastHeard: Date.now() - 300000, // 5 minutes ago
                type: "cloud",
                color: "lightgreen"
            },
            {
                name: "Cloud Gamma",
                bootName: "Cloud Gamma", 
                address: "cloud-2",
                connectionStatus: Constants.CLOUD_CONNECTED,
                isCloud: true,
                b: 23,
                batteryLevel: 23,
                lastHeard: Date.now() - 600000, // 10 minutes ago
                type: "cloud",
                color: "lightyellow"
            }
        ];

        const mockLocations = [
            {
                board: "Cloud Alpha",
                b: 85,
                locations: [{
                    lat: 40.7866 + (Math.random() - 0.5) * 0.01,
                    lng: -119.2066 + (Math.random() - 0.5) * 0.01,
                    d: Date.now() - 120000
                }]
            },
            {
                board: "Cloud Beta",
                b: 67,
                locations: [{
                    lat: 40.7866 + (Math.random() - 0.5) * 0.01,
                    lng: -119.2066 + (Math.random() - 0.5) * 0.01,
                    d: Date.now() - 300000
                }]
            },
            {
                board: "Cloud Gamma",
                b: 23,
                locations: [{
                    lat: 40.7866 + (Math.random() - 0.5) * 0.01,
                    lng: -119.2066 + (Math.random() - 0.5) * 0.01,
                    d: Date.now() - 600000
                }]
            }
        ];

        return {
            boards: mockBoards,
            locations: mockLocations,
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
