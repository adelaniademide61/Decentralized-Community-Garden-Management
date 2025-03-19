# Decentralized Community Garden Management

A blockchain-based system for transparent, equitable, and efficient management of community gardens through decentralized governance and resource tracking.

## Overview

This project implements a suite of smart contracts to facilitate the operation of community gardens in a transparent, fair, and collaborative manner. By leveraging blockchain technology, we create a system where garden members can equitably share resources, track contributions, and distribute harvests while building a knowledge base for sustainable urban agriculture.

## Key Features

- **Transparent plot allocation** - Fair and verifiable assignment of garden spaces
- **Efficient resource sharing** - Equitable tracking of common resources like water and tools
- **Collective knowledge building** - Shared records of crop yields and growing techniques
- **Equitable work distribution** - Transparent tracking of member contributions
- **Community governance** - Decentralized decision-making for garden management
- **Seasonal planning** - Data-driven crop rotation and planting schedules

## Smart Contracts

### 1. Plot Allocation Contract

Manages the assignment and transfer of garden plots to community members.

**Functionality:**
- Plot registration with size, location, and features
- Member application and waitlist management
- Fair allocation algorithms based on community rules
- Plot transfer and reassignment processes
- Seasonal plot rotation management
- Dispute resolution mechanisms

### 2. Resource Sharing Contract

Tracks the usage and availability of shared garden resources.

**Functionality:**
- Tool and equipment inventory management
- Water usage tracking and quota systems
- Compost and soil amendment accounting
- Seed library management
- Resource reservation system
- Maintenance scheduling for shared assets
- Contribution tracking for communal supplies

### 3. Harvest Tracking Contract

Records and analyzes crop yields to build community knowledge.

**Functionality:**
- Crop planting registration and tracking
- Harvest quantity and quality documentation
- Seasonal yield comparisons
- Successful growing techniques documentation
- Pest and disease incident reporting
- Community knowledge base development
- Surplus produce sharing management

### 4. Work Contribution Contract

Monitors and ensures equitable participation in community tasks.

**Functionality:**
- Task creation and assignment
- Work hour tracking and verification
- Skill and expertise registration
- Contribution balance calculation
- Community service recognition
- Alternative contribution options
- Seasonal work requirement adjustments

## Technical Architecture

The system uses a combination of on-chain and off-chain components:

- **Smart Contracts**: Deployed on Ethereum (or compatible blockchain)
- **Front-end Interface**: Web and mobile applications for garden members
- **IPFS Storage**: For storing growing guides, photos, and documentation
- **Weather API Integration**: For climate data and watering recommendations
- **Optional IoT Connectivity**: For soil sensors and automated irrigation systems

## Getting Started

### Prerequisites

- Node.js (v16+)
- Truffle Suite
- MetaMask or similar web3 wallet
- Ganache (for local development)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/community-garden-blockchain.git
   cd community-garden-blockchain
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Compile smart contracts:
   ```
   truffle compile
   ```

4. Deploy to local network:
   ```
   truffle migrate --reset
   ```

### Testing

Run the automated test suite:
```
truffle test
```

## Deployment

### Local Development
1. Start Ganache local blockchain
2. Deploy contracts with `truffle migrate`
3. Connect MetaMask to your local Ganache instance
4. Run the front-end with `npm start`

### Testnet/Mainnet Deployment
1. Configure your `.env` file with appropriate network credentials
2. Run `truffle migrate --network [network_name]`
3. Verify contracts on Etherscan (optional but recommended)

## Usage Examples

### Registering for a Plot

```javascript
// Connect to the plot allocation contract
const plotContract = await PlotAllocation.deployed();

// Apply for a garden plot
await plotContract.applyForPlot(
  preferredSize,
  hasAccessibilityNeeds,
  experienceLevel,
  "QmW2WQi7j...",  // IPFS hash of application details
  { from: memberAddress }
);
```

### Borrowing a Community Tool

```javascript
// Connect to the resource sharing contract
const resourceContract = await ResourceSharing.deployed();

// Borrow a community tool
await resourceContract.borrowTool(
  toolId,
  estimatedDuration,
  { from: memberAddress }
);
```

### Recording a Harvest

```javascript
// Connect to the harvest tracking contract
const harvestContract = await HarvestTracking.deployed();

// Record a crop harvest
await harvestContract.recordHarvest(
  plotId,
  cropType,
  harvestQuantity,
  harvestDate,
  "QmT2WQ...",  // IPFS hash of harvest notes and photos
  { from: memberAddress }
);
```

### Logging Work Hours

```javascript
// Connect to the work contribution contract
const workContract = await WorkContribution.deployed();

// Log completed work hours
await workContract.logWorkHours(
  taskId,
  hoursWorked,
  "QmR5Tf3k...",  // IPFS hash of work documentation
  { from: memberAddress }
);
```

## Community Benefits

### For Garden Members
- Fair plot allocation process
- Transparent resource sharing
- Knowledge sharing for better harvests
- Equitable work distribution
- Community recognition for contributions

### For Garden Coordinators
- Reduced administrative overhead
- Simplified record-keeping
- Data-driven garden planning
- Transparent governance
- Conflict resolution mechanisms

### For the Wider Community
- Increased food security
- Verifiable sustainable practices
- Education on urban agriculture
- Model for community resource management
- Connection to local food systems

## Seasonal Features

The system supports the natural cycles of gardening:

- **Spring**: Plot allocation, planting plans, seedling swaps
- **Summer**: Watering schedules, harvest tracking, pest management
- **Fall**: Yield analysis, community harvest events, compost collection
- **Winter**: Work credit accounting, seasonal planning, skill sharing

## Future Development

- Integration with IoT soil sensors and automated irrigation
- Mobile app with garden map and notification system
- AI-powered crop recommendations based on local climate data
- Community seed bank management
- Integration with local food donation networks
- Carbon sequestration tracking and verification

## Governance

The system implements a decentralized governance model:

- Community voting on garden policies
- Transparent decision-making processes
- Multi-signature requirements for major changes
- Democratic proposal and amendment systems
- Tiered access rights based on contribution history

## Contributing

We welcome contributions to the Decentralized Community Garden Management project!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the Urban Agriculture Coalition for domain expertise
- Built with support from the Community Food Systems Alliance
- Special thanks to the community gardeners who provided feedback during development
