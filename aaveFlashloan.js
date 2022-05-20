const {
  ChainId,
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  LendingPool,
} = require("@aave/contract-helpers");
const { formatReserves, formatReservesAndIncentives, formatUserSummary } = require("@aave/math-utils");
const dayjs = require("dayjs");
const { ethers } = require("ethers");
const rpcURL = "https://api.avax-test.network/ext/bc/C/rpc";
let provider = new ethers.providers.JsonRpcProvider(rpcURL);
provider = new ethers.providers.JsonRpcProvider(rpcURL, ChainId.fuji);
const user = "0x5AC42D67bab747677FD5B5156258bB65fFB1e275";
const privateKey1 =
  "7aa1eea0195e3755bd6949ade6686fd8a3e8adcefa7c6797c0efbf473e88322e"; // Private key of account 1
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
// dai reserve
const dai_reserve = "".toLowerCase();
// weth abi

async function main(){
    
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
    
    }

main();
