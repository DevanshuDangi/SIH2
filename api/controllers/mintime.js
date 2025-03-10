// Transport Routing Algorithm

class TransportRouter {
    constructor() {
        // Maps to store city names and references
        this.cityNotoName = {
            1: "New Delhi", 2: "Mumbai", 3: "Kolkata", 
            4: "Amritsar", 5: "Chennai", 6: "Noida", 
            7: "Gurgaon", 8: "Ghaziabad", 9: "Faridabad", 
            10: "Meerut", 11: "Thane", 12: "Navi Mumbai", 
            13: "Pune", 14: "Nagpur", 15: "Aurangabad", 
            16: "Howrah", 17: "Durgapur", 18: "Asansol", 
            19: "Siliguri", 20: "Kharagpur", 21: "Ludhiana", 
            22: "Jalandhar", 23: "Patiala", 24: "Bathinda", 
            25: "Rajpura", 26: "Coimbatore", 27: "Madurai", 
            28: "Trichy", 29: "Salem", 30: "Vellore"
        };

        this.cityNametoNo = Object.fromEntries(
            Object.entries(this.cityNotoName).map(([k, v]) => [v, parseInt(k)])
        );

        this.level2ToLevel1 = {
            6: 1, 7: 1, 8: 1, 9: 1, 10: 1,    // Delhi region
            11: 2, 12: 2, 13: 2, 14: 2, 15: 2, // Mumbai region
            16: 3, 17: 3, 18: 3, 19: 3, 20: 3, // Kolkata region
            21: 4, 22: 4, 23: 4, 24: 4, 25: 4, // Punjab region
            26: 5, 27: 5, 28: 5, 29: 5, 30: 5  // Chennai region
        };

        this.modeStringtoNum = {
            "Flight": 1, 
            "Train": 2, 
            "Truck": 3, 
            "Seaway": 4
        };
        
        this.modeNumtoString = {
            1: "Flight",
            2: "Train", 
            3: "Truck", 
            4: "Seaway"
        };

        this.storage = [];
        this.storage2 = Array.from({length: 500}, () => 
            Array.from({length: 500}, () => Array(5).fill(null))
        );
        this.graph = Array.from({length: 500}, () => []);

        // Route details object
        this.routeDetails = {
            origin: '',
            destination: '',
            totalCost: 0,
            arrivalTime: '',
            route: []
        };

        this.constructGraph();
    }

    // Parse time to minutes
    parseminutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Convert minutes back to HH:MM time
    convertMinutesToTime(minutes) {
        let hours = Math.floor(minutes / 60);
        let mins = minutes % 60;

        // Ensure hours are within 0-23 range
        hours = hours % 24;
        mins = Math.max(0, Math.min(59, mins));

        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    // Add an edge to the storage
    addEdge(from, to, arrivalTime, departureTime, cost, mode) {
        const at = this.parseminutes(arrivalTime);
        const dt = this.parseminutes(departureTime);
        const modeNum = this.modeStringtoNum[mode];

        // Ensure storage has enough space
        while (this.storage.length <= from) {
            this.storage.push([]);
        }
        while (this.storage[from].length <= to) {
            this.storage[from].push([]);
        }

        // Add edge to storage
        this.storage[from][to].push({
            arrivalTime: at, 
            departureTime: dt, 
            cost, 
            mode: modeNum
        });

        // Store in storage2
        this.storage2[from][to][modeNum] = {
            arrivalTime: at, 
            departureTime: dt, 
            cost
        };

        // Update graph connections
        if (!this.graph[from].includes(to)) {
            this.graph[from].push(to);
        }
    }

    // Construct the graph with connections
    constructGraph() {
        // Add connections between cities (same as original implementation)
        // Connections from Delhi (1) to Mumbai (2)
        this.addEdge(1, 2, "09:00", "10:00", 5500, "Flight");
        this.addEdge(1, 2, "10:00", "12:00", 1200, "Train");
        this.addEdge(1, 2, "14:00", "15:30", 800, "Truck");
        this.addEdge(1, 2, "17:00", "18:30", 350, "Seaway");

        // Add connections from Mumbai (2) to Delhi (1)
        this.addEdge(2, 1, "08:00", "09:00", 5500, "Flight");
        this.addEdge(2, 1, "11:00", "13:00", 1200, "Train");
        this.addEdge(2, 1, "15:00", "16:30", 800, "Truck");
        this.addEdge(2, 1, "18:00", "19:30", 350, "Seaway");

        // Level 2 to Level 1 connections
        for (const [level2, level1] of Object.entries(this.level2ToLevel1)) {
            // Bidirectional connections
            this.addEdge(level1, parseInt(level2), "09:30", "10:00", 50, "Train");
            this.addEdge(level1, parseInt(level2), "12:00", "12:30", 100, "Flight");
            this.addEdge(level1, parseInt(level2), "14:30", "15:00", 30, "Truck");
            this.addEdge(level1, parseInt(level2), "16:30", "17:00", 20, "Seaway");

            this.addEdge(parseInt(level2), level1, "10:00", "10:30", 50, "Train");
            this.addEdge(parseInt(level2), level1, "12:30", "13:00", 100, "Flight");
            this.addEdge(parseInt(level2), level1, "08:10", "09:00", 30, "Truck");
            this.addEdge(parseInt(level2), level1, "12:00", "09:00", 20, "Seaway");
        }
    }

    // Generate route details
    generateRouteDetails(path, modes, origin, dest, minArrivalTime) {
        // Reset route details
        this.routeDetails = {
            origin: this.cityNotoName[origin],
            destination: this.cityNotoName[dest],
            totalCost: 0,
            arrivalTime: this.convertMinutesToTime(minArrivalTime),
            route: []
        };

        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            const mode = modes[i];

            const routeSegment = {
                node: this.cityNotoName[from],
                nextNode: this.cityNotoName[to],
                mode: this.modeNumtoString[mode],
                price: this.storage2[from][to][mode].cost,
                startTime: this.convertMinutesToTime(this.storage2[from][to][mode].arrivalTime),
                endTime: this.convertMinutesToTime(this.storage2[from][to][mode].departureTime)
            };

            this.routeDetails.totalCost += routeSegment.price;
            this.routeDetails.route.push(routeSegment);
        }

        return this.routeDetails;
    }

    // Dijkstra's algorithm to find minimum time route
    dijkstramintime(origin, dest, arrtime) {
        const minArrivalTime = Array(500).fill().map(() => [Infinity, Infinity]);
        const parent = Array(500).fill(-1);
        const travelMode = Array(500).fill(-1);

        // Using a custom priority queue implementation
        const pq = new MinPriorityQueue();
        
        minArrivalTime[origin] = [arrtime, 0];
        pq.insert({priority: arrtime, value: origin});

        while (!pq.isEmpty()) {
            const {value: currNode, priority: currTime} = pq.extractMin();
            const currCost = minArrivalTime[currNode][1];

            if (currTime > minArrivalTime[currNode][0]) {
                continue;
            }

            for (const neighbor of this.graph[currNode]) {
                if (!this.storage[currNode] || !this.storage[currNode][neighbor]) {
                    continue;
                }

                for (const edge of this.storage[currNode][neighbor]) {
                    if (edge.arrivalTime >= currTime && 
                        edge.departureTime < minArrivalTime[neighbor][0]) {
                        
                        minArrivalTime[neighbor] = [
                            edge.departureTime, 
                            currCost + edge.cost
                        ];
                        parent[neighbor] = currNode;
                        travelMode[neighbor] = edge.mode;
                        
                        pq.insert({
                            priority: edge.departureTime, 
                            value: neighbor
                        });
                    }
                }
            }
        }

        if (minArrivalTime[dest][0] === Infinity) {
            console.log(`No valid path found from ${this.cityNotoName[origin]} to ${this.cityNotoName[dest]}.`);
            return [-1, -1, null];
        }

        // Reconstruct path
        const path = [];
        const modes = [];
        let current = dest;
        while (current !== -1) {
            path.unshift(current);
            if (current !== origin) {
                modes.unshift(travelMode[current]);
            }
            current = parent[current];
        }

        // Generate route details
        const routeDetails = this.generateRouteDetails(path, modes, origin, dest, minArrivalTime[dest][0]);

        return [minArrivalTime[dest][0], minArrivalTime[dest][1], routeDetails];
    }
}

// Simple Min Priority Queue implementation (unchanged)
class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    insert(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        
        const min = this.heap[0];
        const last = this.heap.pop();
        
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        
        return min;
    }

    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].priority > this.heap[index].priority) {
                [this.heap[parentIndex], this.heap[index]] = 
                [this.heap[index], this.heap[parentIndex]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    bubbleDown(index) {
        const length = this.heap.length;
        while (true) {
            let smallest = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;

            if (leftChild < length && 
                this.heap[leftChild].priority < this.heap[smallest].priority) {
                smallest = leftChild;
            }

            if (rightChild < length && 
                this.heap[rightChild].priority < this.heap[smallest].priority) {
                smallest = rightChild;
            }

            if (smallest === index) break;

            [this.heap[index], this.heap[smallest]] = 
            [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}

// Exported function with error handling and type conversion
export const findMinTime = (origin, destination, arrivalTime) => {
    const router = new TransportRouter();
    
    // Convert city names to IDs
    const originID = router.cityNametoNo[origin];
    const destinationID = router.cityNametoNo[destination];
    
    // Validate input
    if (!originID || !destinationID) {
        return { error: "Invalid cities" };
    }

    // Find route
    const [arrivalTimeInMinutes, cost, routeDetails] = router.dijkstramintime(originID, destinationID, router.parseminutes(arrivalTime));
    
    // Check if route was found
    if (arrivalTimeInMinutes === -1) {
        return { error: "No valid path found" };
    }

    return routeDetails;
};
// console.log("HI");
// console.log(findMinTime("Ghaziabad","Mumbai","07:30"));
// export default { findMinTime };

