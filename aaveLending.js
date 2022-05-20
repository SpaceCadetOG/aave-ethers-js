const {
  ChainId,
  UiPoolDataProvider,
  UiIncentiveDataProvider
} = require("@aave/contract-helpers");
const { formatReserves, formatReservesAndIncentives, formatUserSummary } = require("@aave/math-utils");
const dayjs = require("dayjs");
const { ethers } = require("ethers");
const { parseEther } = require("ethers/lib/utils");
const rpcURL = "https://api.avax-test.network/ext/bc/C/rpc";
let provider = new ethers.providers.JsonRpcProvider(rpcURL);
// provider = new ethers.providers.JsonRpcProvider(rpcURL, ChainId.fuji);
const my_address = "YOUR_ADDRESS_HERE";
const privateKey1 =
  "PRIVATE_KEYS_HERE"; // Private key of account 1
const wallet = new ethers.Wallet(privateKey1, provider);

const erc20abi = [
  // Read-Only Functions
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
];
const aaveDebtabi = [
  " function approveDelegation(address delegatee, uint256 amount) external",
];
const aave_pool_provider_abi = [
  {
    inputs: [
      { internalType: "string", name: "marketId", type: "string" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "ACLAdminUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "ACLManagerUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "id", type: "bytes32" },
      {
        indexed: true,
        internalType: "address",
        name: "oldAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "AddressSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "id", type: "bytes32" },
      {
        indexed: true,
        internalType: "address",
        name: "proxyAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "oldImplementationAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newImplementationAddress",
        type: "address",
      },
    ],
    name: "AddressSetAsProxy",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "oldMarketId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "string",
        name: "newMarketId",
        type: "string",
      },
    ],
    name: "MarketIdSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "PoolConfiguratorUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "PoolDataProviderUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "PoolUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "PriceOracleSentinelUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "PriceOracleUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "id", type: "bytes32" },
      {
        indexed: true,
        internalType: "address",
        name: "proxyAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "implementationAddress",
        type: "address",
      },
    ],
    name: "ProxyCreated",
    type: "event",
  },
  {
    inputs: [],
    name: "getACLAdmin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getACLManager",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "id", type: "bytes32" }],
    name: "getAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMarketId",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPool",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolConfigurator",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolDataProvider",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPriceOracle",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPriceOracleSentinel",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newAclAdmin", type: "address" }],
    name: "setACLAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newAclManager", type: "address" },
    ],
    name: "setACLManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "id", type: "bytes32" },
      { internalType: "address", name: "newAddress", type: "address" },
    ],
    name: "setAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "id", type: "bytes32" },
      {
        internalType: "address",
        name: "newImplementationAddress",
        type: "address",
      },
    ],
    name: "setAddressAsProxy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "newMarketId", type: "string" }],
    name: "setMarketId",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newPoolConfiguratorImpl",
        type: "address",
      },
    ],
    name: "setPoolConfiguratorImpl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newDataProvider", type: "address" },
    ],
    name: "setPoolDataProvider",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newPoolImpl", type: "address" }],
    name: "setPoolImpl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newPriceOracle", type: "address" },
    ],
    name: "setPriceOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newPriceOracleSentinel",
        type: "address",
      },
    ],
    name: "setPriceOracleSentinel",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const aave_pool_abi = [
  {
    inputs: [
      {
        internalType: "contract IPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reserve",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "backer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" },
    ],
    name: "BackUnbacked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reserve",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "onBehalfOf",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum DataTypes.InterestRateMode",
        name: "interestRateMode",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "borrowRate",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint16",
        name: "referralCode",
        type: "uint16",
      },
    ],
    name: "Borrow",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "initiator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum DataTypes.InterestRateMode",
        name: "interestRateMode",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "premium",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint16",
        name: "referralCode",
        type: "uint16",
      },
    ],
    name: "FlashLoan",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalDebt",
        type: "uint256",
      },
    ],
    name: "IsolationModeTotalDebtUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "collateralAsset",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "debtAsset",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "debtToCover",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "liquidatedCollateralAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "liquidator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "receiveAToken",
        type: "bool",
      },
    ],
    name: "LiquidationCall",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reserve",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "onBehalfOf",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint16",
        name: "referralCode",
        type: "uint16",
      },
    ],
    name: "MintUnbacked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reserve",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountMinted",
        type: "uint256",
      },
    ],
    name: "MintedToTreasury",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reserve",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "RebalanceStableBorrowRate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reserve",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "address",
        name: "repayer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "useATokens",
        type: "bool",
      },
    ],
    name: "Repay",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reserve",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "liquidityRate",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "stableBorrowRate",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "variableBorrowRate",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "liquidityIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "variableBorrowIndex",
        type: "uint256",
      },
    ],
    name: "ReserveDataUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reserve",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "ReserveUsedAsCollateralDisabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reserve",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "ReserveUsedAsCollateralEnabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reserve",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "onBehalfOf",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint16",
        name: "referralCode",
        type: "uint16",
      },
    ],
    name: "Supply",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reserve",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "enum DataTypes.InterestRateMode",
        name: "interestRateMode",
        type: "uint8",
      },
    ],
    name: "SwapBorrowRateMode",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint8",
        name: "categoryId",
        type: "uint8",
      },
    ],
    name: "UserEModeSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "reserve",
        type: "address",
      },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [],
    name: "ADDRESSES_PROVIDER",
    outputs: [
      {
        internalType: "contract IPoolAddressesProvider",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "BRIDGE_PROTOCOL_FEE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "FLASHLOAN_PREMIUM_TOTAL",
    outputs: [{ internalType: "uint128", name: "", type: "uint128" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "FLASHLOAN_PREMIUM_TO_PROTOCOL",
    outputs: [{ internalType: "uint128", name: "", type: "uint128" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_NUMBER_RESERVES",
    outputs: [{ internalType: "uint16", name: "", type: "uint16" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_STABLE_RATE_BORROW_SIZE_PERCENT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "POOL_REVISION",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "fee", type: "uint256" },
    ],
    name: "backUnbacked",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "interestRateMode", type: "uint256" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
    ],
    name: "borrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint8", name: "id", type: "uint8" },
      {
        components: [
          { internalType: "uint16", name: "ltv", type: "uint16" },
          {
            internalType: "uint16",
            name: "liquidationThreshold",
            type: "uint16",
          },
          { internalType: "uint16", name: "liquidationBonus", type: "uint16" },
          { internalType: "address", name: "priceSource", type: "address" },
          { internalType: "string", name: "label", type: "string" },
        ],
        internalType: "struct DataTypes.EModeCategory",
        name: "category",
        type: "tuple",
      },
    ],
    name: "configureEModeCategory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "dropReserve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "balanceFromBefore", type: "uint256" },
      { internalType: "uint256", name: "balanceToBefore", type: "uint256" },
    ],
    name: "finalizeTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "receiverAddress", type: "address" },
      { internalType: "address[]", name: "assets", type: "address[]" },
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
      {
        internalType: "uint256[]",
        name: "interestRateModes",
        type: "uint256[]",
      },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "bytes", name: "params", type: "bytes" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "flashLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "receiverAddress", type: "address" },
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bytes", name: "params", type: "bytes" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "flashLoanSimple",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getConfiguration",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "data", type: "uint256" },
        ],
        internalType: "struct DataTypes.ReserveConfigurationMap",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "id", type: "uint8" }],
    name: "getEModeCategoryData",
    outputs: [
      {
        components: [
          { internalType: "uint16", name: "ltv", type: "uint16" },
          {
            internalType: "uint16",
            name: "liquidationThreshold",
            type: "uint16",
          },
          { internalType: "uint16", name: "liquidationBonus", type: "uint16" },
          { internalType: "address", name: "priceSource", type: "address" },
          { internalType: "string", name: "label", type: "string" },
        ],
        internalType: "struct DataTypes.EModeCategory",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint16", name: "id", type: "uint16" }],
    name: "getReserveAddressById",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveData",
    outputs: [
      {
        components: [
          {
            components: [
              { internalType: "uint256", name: "data", type: "uint256" },
            ],
            internalType: "struct DataTypes.ReserveConfigurationMap",
            name: "configuration",
            type: "tuple",
          },
          { internalType: "uint128", name: "liquidityIndex", type: "uint128" },
          {
            internalType: "uint128",
            name: "currentLiquidityRate",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "variableBorrowIndex",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentVariableBorrowRate",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "currentStableBorrowRate",
            type: "uint128",
          },
          {
            internalType: "uint40",
            name: "lastUpdateTimestamp",
            type: "uint40",
          },
          { internalType: "uint16", name: "id", type: "uint16" },
          { internalType: "address", name: "aTokenAddress", type: "address" },
          {
            internalType: "address",
            name: "stableDebtTokenAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "variableDebtTokenAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "interestRateStrategyAddress",
            type: "address",
          },
          {
            internalType: "uint128",
            name: "accruedToTreasury",
            type: "uint128",
          },
          { internalType: "uint128", name: "unbacked", type: "uint128" },
          {
            internalType: "uint128",
            name: "isolationModeTotalDebt",
            type: "uint128",
          },
        ],
        internalType: "struct DataTypes.ReserveData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveNormalizedIncome",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveNormalizedVariableDebt",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getReservesList",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserAccountData",
    outputs: [
      { internalType: "uint256", name: "totalCollateralBase", type: "uint256" },
      { internalType: "uint256", name: "totalDebtBase", type: "uint256" },
      {
        internalType: "uint256",
        name: "availableBorrowsBase",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "currentLiquidationThreshold",
        type: "uint256",
      },
      { internalType: "uint256", name: "ltv", type: "uint256" },
      { internalType: "uint256", name: "healthFactor", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserConfiguration",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "data", type: "uint256" },
        ],
        internalType: "struct DataTypes.UserConfigurationMap",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserEMode",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "address", name: "aTokenAddress", type: "address" },
      { internalType: "address", name: "stableDebtAddress", type: "address" },
      { internalType: "address", name: "variableDebtAddress", type: "address" },
      {
        internalType: "address",
        name: "interestRateStrategyAddress",
        type: "address",
      },
    ],
    name: "initReserve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "collateralAsset", type: "address" },
      { internalType: "address", name: "debtAsset", type: "address" },
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "debtToCover", type: "uint256" },
      { internalType: "bool", name: "receiveAToken", type: "bool" },
    ],
    name: "liquidationCall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address[]", name: "assets", type: "address[]" }],
    name: "mintToTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "mintUnbacked",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "rebalanceStableBorrowRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "interestRateMode", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
    ],
    name: "repay",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "interestRateMode", type: "uint256" },
    ],
    name: "repayWithATokens",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "interestRateMode", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "permitV", type: "uint8" },
      { internalType: "bytes32", name: "permitR", type: "bytes32" },
      { internalType: "bytes32", name: "permitS", type: "bytes32" },
    ],
    name: "repayWithPermit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "rescueTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "resetIsolationModeTotalDebt",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      {
        components: [
          { internalType: "uint256", name: "data", type: "uint256" },
        ],
        internalType: "struct DataTypes.ReserveConfigurationMap",
        name: "configuration",
        type: "tuple",
      },
    ],
    name: "setConfiguration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "address", name: "rateStrategyAddress", type: "address" },
    ],
    name: "setReserveInterestRateStrategyAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "categoryId", type: "uint8" }],
    name: "setUserEMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "bool", name: "useAsCollateral", type: "bool" },
    ],
    name: "setUserUseReserveAsCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "permitV", type: "uint8" },
      { internalType: "bytes32", name: "permitR", type: "bytes32" },
      { internalType: "bytes32", name: "permitS", type: "bytes32" },
    ],
    name: "supplyWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "interestRateMode", type: "uint256" },
    ],
    name: "swapBorrowRateMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "protocolFee", type: "uint256" }],
    name: "updateBridgeProtocolFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint128",
        name: "flashLoanPremiumTotal",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "flashLoanPremiumToProtocol",
        type: "uint128",
      },
    ],
    name: "updateFlashloanPremiums",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const aave_wgw_abi = [
  {
    inputs: [
      { internalType: "address", name: "weth", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    inputs: [{ internalType: "address", name: "pool", type: "address" }],
    name: "authorizePool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "interesRateMode", type: "uint256" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "borrowETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool", type: "address" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
    ],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "emergencyEtherTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "emergencyTokenTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getWETHAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "rateMode", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
    ],
    name: "repayETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
    ],
    name: "withdrawETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pool", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "permitV", type: "uint8" },
      { internalType: "bytes32", name: "permitR", type: "bytes32" },
      { internalType: "bytes32", name: "permitS", type: "bytes32" },
    ],
    name: "withdrawETHWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];
const ui_pool_data_abi = [
  {
    inputs: [
      {
        internalType: "contract IEACAggregatorProxy",
        name: "_networkBaseTokenPriceInUsdProxyAggregator",
        type: "address",
      },
      {
        internalType: "contract IEACAggregatorProxy",
        name: "_marketReferenceCurrencyPriceInUsdProxyAggregator",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ETH_CURRENCY_UNIT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MKR_ADDRESS",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_bytes32", type: "bytes32" }],
    name: "bytes32ToString",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
    ],
    name: "getReservesData",
    outputs: [
      {
        components: [
          { internalType: "address", name: "underlyingAsset", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "uint256", name: "decimals", type: "uint256" },
          {
            internalType: "uint256",
            name: "baseLTVasCollateral",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveLiquidationThreshold",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveLiquidationBonus",
            type: "uint256",
          },
          { internalType: "uint256", name: "reserveFactor", type: "uint256" },
          {
            internalType: "bool",
            name: "usageAsCollateralEnabled",
            type: "bool",
          },
          { internalType: "bool", name: "borrowingEnabled", type: "bool" },
          {
            internalType: "bool",
            name: "stableBorrowRateEnabled",
            type: "bool",
          },
          { internalType: "bool", name: "isActive", type: "bool" },
          { internalType: "bool", name: "isFrozen", type: "bool" },
          { internalType: "uint128", name: "liquidityIndex", type: "uint128" },
          {
            internalType: "uint128",
            name: "variableBorrowIndex",
            type: "uint128",
          },
          { internalType: "uint128", name: "liquidityRate", type: "uint128" },
          {
            internalType: "uint128",
            name: "variableBorrowRate",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "stableBorrowRate",
            type: "uint128",
          },
          {
            internalType: "uint40",
            name: "lastUpdateTimestamp",
            type: "uint40",
          },
          { internalType: "address", name: "aTokenAddress", type: "address" },
          {
            internalType: "address",
            name: "stableDebtTokenAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "variableDebtTokenAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "interestRateStrategyAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "availableLiquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalPrincipalStableDebt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "averageStableRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stableDebtLastUpdateTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalScaledVariableDebt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "priceInMarketReferenceCurrency",
            type: "uint256",
          },
          { internalType: "address", name: "priceOracle", type: "address" },
          {
            internalType: "uint256",
            name: "variableRateSlope1",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "variableRateSlope2",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stableRateSlope1",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stableRateSlope2",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "baseStableBorrowRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "baseVariableBorrowRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "optimalUsageRatio",
            type: "uint256",
          },
          { internalType: "bool", name: "isPaused", type: "bool" },
          {
            internalType: "uint128",
            name: "accruedToTreasury",
            type: "uint128",
          },
          { internalType: "uint128", name: "unbacked", type: "uint128" },
          {
            internalType: "uint128",
            name: "isolationModeTotalDebt",
            type: "uint128",
          },
          { internalType: "uint256", name: "debtCeiling", type: "uint256" },
          {
            internalType: "uint256",
            name: "debtCeilingDecimals",
            type: "uint256",
          },
          { internalType: "uint8", name: "eModeCategoryId", type: "uint8" },
          { internalType: "uint256", name: "borrowCap", type: "uint256" },
          { internalType: "uint256", name: "supplyCap", type: "uint256" },
          { internalType: "uint16", name: "eModeLtv", type: "uint16" },
          {
            internalType: "uint16",
            name: "eModeLiquidationThreshold",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "eModeLiquidationBonus",
            type: "uint16",
          },
          {
            internalType: "address",
            name: "eModePriceSource",
            type: "address",
          },
          { internalType: "string", name: "eModeLabel", type: "string" },
          { internalType: "bool", name: "borrowableInIsolation", type: "bool" },
        ],
        internalType: "struct IUiPoolDataProviderV3.AggregatedReserveData[]",
        name: "",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "marketReferenceCurrencyUnit",
            type: "uint256",
          },
          {
            internalType: "int256",
            name: "marketReferenceCurrencyPriceInUsd",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "networkBaseTokenPriceInUsd",
            type: "int256",
          },
          {
            internalType: "uint8",
            name: "networkBaseTokenPriceDecimals",
            type: "uint8",
          },
        ],
        internalType: "struct IUiPoolDataProviderV3.BaseCurrencyInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
    ],
    name: "getReservesList",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getUserReservesData",
    outputs: [
      {
        components: [
          { internalType: "address", name: "underlyingAsset", type: "address" },
          {
            internalType: "uint256",
            name: "scaledATokenBalance",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "usageAsCollateralEnabledOnUser",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "stableBorrowRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "scaledVariableDebt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "principalStableDebt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stableBorrowLastUpdateTimestamp",
            type: "uint256",
          },
        ],
        internalType: "struct IUiPoolDataProviderV3.UserReserveData[]",
        name: "",
        type: "tuple[]",
      },
      { internalType: "uint8", name: "", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "marketReferenceCurrencyPriceInUsdProxyAggregator",
    outputs: [
      {
        internalType: "contract IEACAggregatorProxy",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "networkBaseTokenPriceInUsdProxyAggregator",
    outputs: [
      {
        internalType: "contract IEACAggregatorProxy",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const ui_incentive_data_abi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [
      {
        internalType: "contract IPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getFullReservesIncentiveData",
    outputs: [
      {
        components: [
          { internalType: "address", name: "underlyingAsset", type: "address" },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "emissionPerSecond",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "incentivesLastUpdateTimestamp",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenIncentivesIndex",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "emissionEndTimestamp",
                    type: "uint256",
                  },
                  {
                    internalType: "int256",
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    internalType: "uint8",
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                  { internalType: "uint8", name: "precision", type: "uint8" },
                  {
                    internalType: "uint8",
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                ],
                internalType: "struct IUiIncentiveDataProviderV3.RewardInfo[]",
                name: "rewardsTokenInformation",
                type: "tuple[]",
              },
            ],
            internalType: "struct IUiIncentiveDataProviderV3.IncentiveData",
            name: "aIncentiveData",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "emissionPerSecond",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "incentivesLastUpdateTimestamp",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenIncentivesIndex",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "emissionEndTimestamp",
                    type: "uint256",
                  },
                  {
                    internalType: "int256",
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    internalType: "uint8",
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                  { internalType: "uint8", name: "precision", type: "uint8" },
                  {
                    internalType: "uint8",
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                ],
                internalType: "struct IUiIncentiveDataProviderV3.RewardInfo[]",
                name: "rewardsTokenInformation",
                type: "tuple[]",
              },
            ],
            internalType: "struct IUiIncentiveDataProviderV3.IncentiveData",
            name: "vIncentiveData",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "emissionPerSecond",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "incentivesLastUpdateTimestamp",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenIncentivesIndex",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "emissionEndTimestamp",
                    type: "uint256",
                  },
                  {
                    internalType: "int256",
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    internalType: "uint8",
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                  { internalType: "uint8", name: "precision", type: "uint8" },
                  {
                    internalType: "uint8",
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                ],
                internalType: "struct IUiIncentiveDataProviderV3.RewardInfo[]",
                name: "rewardsTokenInformation",
                type: "tuple[]",
              },
            ],
            internalType: "struct IUiIncentiveDataProviderV3.IncentiveData",
            name: "sIncentiveData",
            type: "tuple",
          },
        ],
        internalType:
          "struct IUiIncentiveDataProviderV3.AggregatedReserveIncentiveData[]",
        name: "",
        type: "tuple[]",
      },
      {
        components: [
          { internalType: "address", name: "underlyingAsset", type: "address" },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "userUnclaimedRewards",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenIncentivesUserIndex",
                    type: "uint256",
                  },
                  {
                    internalType: "int256",
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    internalType: "uint8",
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                ],
                internalType:
                  "struct IUiIncentiveDataProviderV3.UserRewardInfo[]",
                name: "userRewardsInformation",
                type: "tuple[]",
              },
            ],
            internalType: "struct IUiIncentiveDataProviderV3.UserIncentiveData",
            name: "aTokenIncentivesUserData",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "userUnclaimedRewards",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenIncentivesUserIndex",
                    type: "uint256",
                  },
                  {
                    internalType: "int256",
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    internalType: "uint8",
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                ],
                internalType:
                  "struct IUiIncentiveDataProviderV3.UserRewardInfo[]",
                name: "userRewardsInformation",
                type: "tuple[]",
              },
            ],
            internalType: "struct IUiIncentiveDataProviderV3.UserIncentiveData",
            name: "vTokenIncentivesUserData",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "userUnclaimedRewards",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenIncentivesUserIndex",
                    type: "uint256",
                  },
                  {
                    internalType: "int256",
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    internalType: "uint8",
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                ],
                internalType:
                  "struct IUiIncentiveDataProviderV3.UserRewardInfo[]",
                name: "userRewardsInformation",
                type: "tuple[]",
              },
            ],
            internalType: "struct IUiIncentiveDataProviderV3.UserIncentiveData",
            name: "sTokenIncentivesUserData",
            type: "tuple",
          },
        ],
        internalType:
          "struct IUiIncentiveDataProviderV3.UserReserveIncentiveData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
    ],
    name: "getReservesIncentivesData",
    outputs: [
      {
        components: [
          { internalType: "address", name: "underlyingAsset", type: "address" },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "emissionPerSecond",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "incentivesLastUpdateTimestamp",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenIncentivesIndex",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "emissionEndTimestamp",
                    type: "uint256",
                  },
                  {
                    internalType: "int256",
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    internalType: "uint8",
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                  { internalType: "uint8", name: "precision", type: "uint8" },
                  {
                    internalType: "uint8",
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                ],
                internalType: "struct IUiIncentiveDataProviderV3.RewardInfo[]",
                name: "rewardsTokenInformation",
                type: "tuple[]",
              },
            ],
            internalType: "struct IUiIncentiveDataProviderV3.IncentiveData",
            name: "aIncentiveData",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "emissionPerSecond",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "incentivesLastUpdateTimestamp",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenIncentivesIndex",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "emissionEndTimestamp",
                    type: "uint256",
                  },
                  {
                    internalType: "int256",
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    internalType: "uint8",
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                  { internalType: "uint8", name: "precision", type: "uint8" },
                  {
                    internalType: "uint8",
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                ],
                internalType: "struct IUiIncentiveDataProviderV3.RewardInfo[]",
                name: "rewardsTokenInformation",
                type: "tuple[]",
              },
            ],
            internalType: "struct IUiIncentiveDataProviderV3.IncentiveData",
            name: "vIncentiveData",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "emissionPerSecond",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "incentivesLastUpdateTimestamp",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenIncentivesIndex",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "emissionEndTimestamp",
                    type: "uint256",
                  },
                  {
                    internalType: "int256",
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    internalType: "uint8",
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                  { internalType: "uint8", name: "precision", type: "uint8" },
                  {
                    internalType: "uint8",
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                ],
                internalType: "struct IUiIncentiveDataProviderV3.RewardInfo[]",
                name: "rewardsTokenInformation",
                type: "tuple[]",
              },
            ],
            internalType: "struct IUiIncentiveDataProviderV3.IncentiveData",
            name: "sIncentiveData",
            type: "tuple",
          },
        ],
        internalType:
          "struct IUiIncentiveDataProviderV3.AggregatedReserveIncentiveData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getUserReservesIncentivesData",
    outputs: [
      {
        components: [
          { internalType: "address", name: "underlyingAsset", type: "address" },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "userUnclaimedRewards",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenIncentivesUserIndex",
                    type: "uint256",
                  },
                  {
                    internalType: "int256",
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    internalType: "uint8",
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                ],
                internalType:
                  "struct IUiIncentiveDataProviderV3.UserRewardInfo[]",
                name: "userRewardsInformation",
                type: "tuple[]",
              },
            ],
            internalType: "struct IUiIncentiveDataProviderV3.UserIncentiveData",
            name: "aTokenIncentivesUserData",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "userUnclaimedRewards",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenIncentivesUserIndex",
                    type: "uint256",
                  },
                  {
                    internalType: "int256",
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    internalType: "uint8",
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                ],
                internalType:
                  "struct IUiIncentiveDataProviderV3.UserRewardInfo[]",
                name: "userRewardsInformation",
                type: "tuple[]",
              },
            ],
            internalType: "struct IUiIncentiveDataProviderV3.UserIncentiveData",
            name: "vTokenIncentivesUserData",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "incentiveControllerAddress",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "rewardTokenSymbol",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "rewardOracleAddress",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "rewardTokenAddress",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "userUnclaimedRewards",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "tokenIncentivesUserIndex",
                    type: "uint256",
                  },
                  {
                    internalType: "int256",
                    name: "rewardPriceFeed",
                    type: "int256",
                  },
                  {
                    internalType: "uint8",
                    name: "priceFeedDecimals",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "rewardTokenDecimals",
                    type: "uint8",
                  },
                ],
                internalType:
                  "struct IUiIncentiveDataProviderV3.UserRewardInfo[]",
                name: "userRewardsInformation",
                type: "tuple[]",
              },
            ],
            internalType: "struct IUiIncentiveDataProviderV3.UserIncentiveData",
            name: "sTokenIncentivesUserData",
            type: "tuple",
          },
        ],
        internalType:
          "struct IUiIncentiveDataProviderV3.UserReserveIncentiveData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// This can be an address or an ENS name
const wavax_address = "0x407287b03D1167593AF113d32093942be13A535f";
const aWavax_address = "0xC50E6F9E8e6CAd53c42ddCB7A42d616d7420fd3e";
const vWavax_address = "0xE21840302317b265dB7E530667ACb31188655cA2";
const vDai_address = "0xCB19d2C32cB4340C67273A5a4f5dD02BCceBbF97";
const dai_address = "0xFc7215C9498Fc12b22Bc0ed335871Db4315f03d3";
const aDai_address = "0xC42f40B7E22bcca66B3EE22F3ACb86d24C997CC2";
const usdc_address = "0x3E937B4881CBd500d05EeDAB7BA203f2b7B3f74f";
const aUsdc_address = "0xA79570641bC9cbc6522aA80E2de03bF9F7fd123a";
const pool_provider_address = "0x1775ECC8362dB6CaB0c7A9C0957cF656A5276c29";
const weth_gateway_address = "0x8f57153F18b7273f9A814b93b31Cb3f9b035e7C2";
const uiPoolDataProviderAddress = "0x1D01f7d8B42Ec47837966732f831E1D6321df499";
const uiIncentiveDataProviderAddress =
  "0x036dDd300B57F6a8A6A55e2ede8b50b517A5094f";

// pool address provider
const pool_provider = new ethers.Contract(
  pool_provider_address,
  aave_pool_provider_abi,
  provider
);
// Pool
const uiPool_provider = new ethers.Contract(
  uiPoolDataProviderAddress,
 ui_pool_data_abi,
  provider
);

const uiIncentive_provider = new ethers.Contract(
  uiIncentiveDataProviderAddress,
  ui_incentive_data_abi,
  provider
);

// weth_gateway
const weth_gateway = new ethers.Contract(
  weth_gateway_address,
  aave_wgw_abi,
  provider
);

const aWavax = new ethers.Contract(aWavax_address, erc20abi, provider);
const wavax = new ethers.Contract(wavax_address, erc20abi, provider);
const vWavax = new ethers.Contract(vWavax_address, aaveDebtabi, provider);
const vDai = new ethers.Contract(vDai_address, aaveDebtabi, provider);
const dai = new ethers.Contract(dai_address, erc20abi, provider);
const aDai = new ethers.Contract(aDai_address, erc20abi, provider);
const usdc = new ethers.Contract(usdc_address, erc20abi, provider);
const aUsdc = new ethers.Contract(aUsdc_address, erc20abi, provider);
// const erc20_rw = new ethers.Contract(aWavax_address, abi, signer);

const main = async () => {
  let amount = ethers.utils.parseEther("2");
  let b_amount = ethers.utils.parseEther("1");
  // Getters
  ////////////////
  // await userAaveBalances(my_address);
  // await getUserData(my_address);
  ////////////////
  // Actions
  // ////////////////
  // await depositETH();
  // await borrowETH(b_amount);
  // await borrow_dai(amount);
  // await repayETH(); *Must Fix*
  // await supply_dai( amount, my_address)
  // await withdraw_dai(amount, my_address)

  // await repay_dai(amount);
  // await withdrawETH();

  ////////////////
};
// aave balance for user = my_address
const userAaveBalances = async (user) => {
  const balance = await provider.getBalance(user);
  console.log("Avax Balance:", ethers.utils.formatEther(balance));

  const name_Wavax = await wavax.name();
  const symbol_Wavax = await wavax.symbol();
  const wavax_balance = await wavax.balanceOf(user);
  console.log(
    `${name_Wavax}, ${symbol_Wavax}\n`,
    ethers.utils.formatUnits(wavax_balance, 18)
  );

  const name_aWavax = await aWavax.name();
  const symbol_aWavax = await aWavax.symbol();
  const aWavax_balance = await aWavax.balanceOf(user);
  console.log(
    `${name_aWavax}, ${symbol_aWavax}\n`,
    ethers.utils.formatUnits(aWavax_balance, 18)
  );

  const name_dai = await dai.name();
  const symbol_dai = await dai.symbol();
  const dai_balance = await dai.balanceOf(user);
  console.log(
    `${name_dai}, ${symbol_dai}\n`,
    ethers.utils.formatUnits(dai_balance, 18)
  );

  const name_aDai = await aDai.name();
  const symbol_aDai = await aDai.symbol();
  const aDai_balance = await aDai.balanceOf(user);
  console.log(
    `${name_aDai}, ${symbol_aDai}\n`,
    ethers.utils.formatUnits(aDai_balance, 18)
  );

  const name_usdc = await usdc.name();
  const symbol_usdc = await usdc.symbol();
  const usdc_balance = await usdc.balanceOf(user);
  console.log(
    `${name_usdc}, ${symbol_usdc}\n`,
    ethers.utils.formatUnits(usdc_balance, 6)
  );

  const name_aUsdc = await aUsdc.name();
  const symbol_aUsdc = await aUsdc.symbol();
  const aUsdc_balance = await aUsdc.balanceOf(user);
  console.log(
    `${name_aUsdc}, ${symbol_aUsdc}\n`,
    ethers.utils.formatUnits(aUsdc_balance, 6)
  );
};
const getUserData = async (user) =>
{

// uiPoolData
const uiPoolDataProviderAddress =
"0x1D01f7d8B42Ec47837966732f831E1D6321df499".toLowerCase();
// uiIncentiveDataProv
const uiIncentiveDataProviderAddress =
"0x036dDd300B57F6a8A6A55e2ede8b50b517A5094f".toLowerCase();
//LendingPoolAddressProvider
const lendingPoolAddressProvider =
"0x1775ECC8362dB6CaB0c7A9C0957cF656A5276c29".toLowerCase();
// pool address
const pool_address = "0xb47673b7a73D78743AFF1487AF69dBB5763F00cA".toLowerCase();
    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress,
      provider,
    });
    
    
    const incentiveDataProviderContract = new UiIncentiveDataProvider({
      uiIncentiveDataProviderAddress,
      provider,
    });
    
    
    const reserves = await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider,
    });
    
    
    let paramter={
        lendingPoolAddressProvider,
        user
      }
      console.log(paramter)
    const userReserves = await poolDataProviderContract.getUserReservesHumanized(paramter);

    
    
    // // Array of incentive tokens with price feed and emission APR
     const reserveIncentives =
      await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
        lendingPoolAddressProvider,
      });
    
    // Dictionary of claimable user incentives
    const userIncentives =
      await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
        lendingPoolAddressProvider,
        user,
      });
    
    const reservesArray = reserves.reservesData;
    const baseCurrencyData = reserves.baseCurrencyData;
    
    const currentTimestamp = dayjs().unix();
    
    /*
    - @param `reserves` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.reservesArray`
    - @param `currentTimestamp` Current UNIX timestamp in seconds
    - @param `marketReferencePriceInUsd` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.baseCurrencyData.marketReferencePriceInUsd`
    - @param `marketReferenceCurrencyDecimals` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.baseCurrencyData.marketReferenceCurrencyDecimals`
    */
    const formattedReserves = formatReserves({
      reserves: reservesArray,
      currentTimestamp,
      marketReferenceCurrencyDecimals:
        baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    });
    
    
    
    const formatReservesAndIncent = formatReservesAndIncentives({
        reserves: reservesArray,
        currentTimestamp,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        reserveIncentives,
      });
    
      const userReservesArray = userReserves.userReserves;
      const userSummary = formatUserSummary({
        currentTimestamp,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        userReserves: userReservesArray,
        formattedReserves,
        userEmodeCategoryId: userReserves.userEmodeCategoryId,
      });
    
      console.log("userSummary",userSummary)
    
    
};
// supplyETH(address pool, address onBehalfOf, uint16 referralCode)
const depositETH = async () => {
  console.log("Now Depositing AVAX...");
  const pool_address = await pool_provider.getPool();
  const deposit_eth = weth_gateway.connect(wallet);
  const tx = await deposit_eth.depositETH(pool_address, my_address, 0, {
    value: ethers.utils.parseEther("3"),
  });
  await tx.wait(1);
  console.log(tx);

  console.log("DepositEth: https://testnet.snowtrace.io/tx/" + tx.hash);
  await getUserData(my_address);
};
// supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
const supply_dai = async (amount, supplier) => {
  const name_dai = await dai.name();
  const symbol_dai = await dai.symbol();
  const dai_balance = await dai.balanceOf(supplier);
  const name_aDai = await aDai.name();
  const symbol_aDai = await aDai.symbol();
  const aDai_balance = await aDai.balanceOf(supplier);

  console.log(
    `${name_dai}, ${symbol_dai}\n`,
    ethers.utils.formatUnits(dai_balance, 18)
  );

  console.log(
    `${name_aDai}, ${symbol_aDai}\n`,
    ethers.utils.formatUnits(aDai_balance, 18)
  );

  console.log("Now Approving...");
  const pool_address = await pool_provider.getPool();

  const approve_dai = dai.connect(wallet);
  const approve = await approve_dai.approve(pool_address, amount);
  await approve.wait(1);
  console.log(approve);
  console.log("Approve tx: https://testnet.snowtrace.io/tx/" + approve.hash);

  console.log("Now Supplying...");
  const pool = new ethers.Contract(pool_address, aave_pool_abi, provider);

  const supply_tokens = pool.connect(wallet);
  const tx = await supply_tokens.supply(dai_address, amount, supplier, 0);
  await tx.wait(1);
  console.log(tx);

  console.log("https://testnet.snowtrace.io/tx/" + tx.hash);

  console.log(
    `${name_dai}, ${symbol_dai}\n`,
    ethers.utils.formatUnits(dai_balance, 18)
  );

  console.log(
    `${name_aDai}, ${symbol_aDai}\n`,
    ethers.utils.formatUnits(aDai_balance, 18)
  );
  await getUserData(my_address);
};
// withdrawETH(address pool, uint256 amount, address to)
const withdrawETH = async () => {
  console.log("Now Approving...");
  const pool_address = await pool_provider.getPool();
  let amount = ethers.utils.parseEther("1");

  const approve_aWAvax = aWavax.connect(wallet);
  const approve = await approve_aWAvax.approve(pool_address, amount);
  await approve.wait(1);
  console.log(approve);
  console.log("Approve tx: https://testnet.snowtrace.io/tx/" + approve.hash);

  console.log("Now Withdrawing...");
  const withdraw_eth = weth_gateway.connect(wallet);
  const tx = await withdraw_eth.withdrawETH(pool_address, amount, my_address);

  await tx.wait(1);
  console.log(tx);
  console.log("Withdrawal tx: https://testnet.snowtrace.io/tx/" + tx.hash);
  await getUserData(my_address);
};
// withdraw(address asset, uint256 amount, address to)
const withdraw_dai = async (amount, supplier) => {
  const name_dai = await dai.name();
  const symbol_dai = await dai.symbol();
  const dai_balance = await dai.balanceOf(supplier);
  const name_aDai = await aDai.name();
  const symbol_aDai = await aDai.symbol();
  const aDai_balance = await aDai.balanceOf(supplier);

  console.log(
    `${name_dai}, ${symbol_dai}\n`,
    ethers.utils.formatUnits(dai_balance, 18)
  );

  console.log(
    `${name_aDai}, ${symbol_aDai}\n`,
    ethers.utils.formatUnits(aDai_balance, 18)
  );

  // console.log("Now Approving...");
  const pool_address = await pool_provider.getPool();

  // const approve_dai = dai.connect(wallet);
  // const approve = await approve_dai.approve(pool_address, amount);
  // await approve.wait();
  // console.log(approve);
  // console.log("Approve tx: https://testnet.snowtrace.io/tx/" + approve.hash);

  console.log("Now Withdrawing...");
  const pool = new ethers.Contract(pool_address, aave_pool_abi, provider);

  const supply_tokens = pool.connect(wallet);
  const tx = await supply_tokens.withdraw(dai_address, amount, supplier);
  await tx.wait(1);
  console.log(tx);

  console.log("https://testnet.snowtrace.io/tx/" + tx.hash);

  console.log(
    `${name_dai}, ${symbol_dai}\n`,
    ethers.utils.formatUnits(dai_balance, 18)
  );

  console.log(
    `${name_aDai}, ${symbol_aDai}\n`,
    ethers.utils.formatUnits(aDai_balance, 18)
  );
  await getUserData(my_address);
};
const withdraw = async () => { };
// borrowETH(address pool, uint256 amount, uint256 interestRateMode, uint16 referralCode) || amount to be borrowed, expressed in wei units
const borrowETH = async (amount) => {
  console.log("Now Borrowing...ETH");
  const pool_address = await pool_provider.getPool();


  // amount to borrow
  // total eth debt
  const approve_wavax = vWavax.connect(wallet);
  const approve = await approve_wavax.approveDelegation(my_address, amount);
  await approve.wait(1);
  console.log(approve);
  console.log("approve https://testnet.snowtrace.io/tx/" + approve.hash);

  const borrow_eth = weth_gateway.connect(wallet);
  const tx = await borrow_eth.borrowETH(pool_address, amount, 2, 0);
  await tx.wait(1);
  console.log(tx);
  console.log("BorrowETH: https://testnet.snowtrace.io/tx/" + tx.hash);
  await getUserData(my_address);
};
// borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)
const borrow_dai = async (amount) =>
{

// pool address
  const pool_address = "0xb47673b7a73D78743AFF1487AF69dBB5763F00cA".toLowerCase();
  const pool = new ethers.Contract(pool_address, aave_pool_abi, provider);

  console.log("Approving vDai...");
  const approve_dai = vDai.connect(wallet);
  const approve = await approve_dai.approveDelegation(my_address, amount);
  await approve.wait(1);
  console.log(approve);
  console.log("https://testnet.snowtrace.io/tx/" + approve.hash);

  console.log("Now Borrowing Dai...");
  const borrow_tokens = pool.connect(wallet);
  const tx = await borrow_tokens.borrow(dai_address, amount, 2, 0, my_address);
  await tx.wait(1);
  console.log(tx);
  console.log("BorrowDai: https://testnet.snowtrace.io/tx/" + tx.hash);
  await getUserData(my_address);
};
// repayETH(address pool, uint256 amount, uint256 rateMode, address onBehalfOf)
const repayETH = async () => {
  const pool_address = await pool_provider.getPool();
  let amount = ethers.utils.parseEther("1.1");
  console.log("Now Approving...");
  const approve_wavax = vWavax.connect(wallet);
  const approve = await approve_wavax.approveDelegation(my_address, amount);
  await approve.wait();
  console.log(approve);
  console.log("https://testnet.snowtrace.io/tx/" + approve.hash);

  console.log("Now Repaying ETH...");
  const repay_eth = weth_gateway.connect(wallet);
  const tx = await repay_eth.repayETH(pool_address, ethers.utils.parseEther("1.1"), 2, my_address);
  await tx.wait();
  console.log(tx);
  console.log("Repaid: https://testnet.snowtrace.io/tx/" + tx.hash);
  userAaveBalances(my_address);
};
// repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf)
const repay_dai = async (amount) => {
  const pool_address = await pool_provider.getPool();

  console.log("Approving Dai...");
  const approve_dai = dai.connect(wallet);
  const approve = await approve_dai.approve(pool_address, amount);
  await approve.wait(1);
  console.log(approve);
  console.log("Approve tx: https://testnet.snowtrace.io/tx/" + approve.hash);


  console.log("Now Repaying...");
  const pool = new ethers.Contract(pool_address, aave_pool_abi, provider);
  // repay func
  const repay_tokens = pool.connect(wallet);
  const tx = await repay_tokens.repay(dai_address, amount, 2, my_address);
  await tx.wait(1);
  console.log(tx);
  console.log("RepayTx: https://testnet.snowtrace.io/tx/" + tx.hash);
  await getUserData(my_address);
};
// flashloan(address receiverAddress, address[] calldata assets, uint256[] calldata amounts, uint256[] interestRateModes, address onBehalfOf, bytes calldata params, uint16 referralCode)
const flashloan = async () => {};
// liquidationCall(address collateral, address debt, address user, uint256 debtToCover, bool receiveAToken)
const liquidationCall = async () => {};

main();
// https://blog.blockmagnates.com/how-to-build-your-own-defi-application-using-aaves-sdk-and-v3-smart-contracts-662818ffde88
