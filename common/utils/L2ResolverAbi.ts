export default [
  {
    inputs: [
      { internalType: "contract ENS", name: "ens_", type: "address" },
      {
        internalType: "address",
        name: "registrarController_",
        type: "address",
      },
      { internalType: "address", name: "reverseRegistrar_", type: "address" },
      { internalType: "address", name: "owner_", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "AlreadyInitialized", type: "error" },
  { inputs: [], name: "CantSetSelfAsDelegate", type: "error" },
  { inputs: [], name: "CantSetSelfAsOperator", type: "error" },
  { inputs: [], name: "NewOwnerIsZeroAddress", type: "error" },
  { inputs: [], name: "NoHandoverRequest", type: "error" },
  { inputs: [], name: "Unauthorized", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "node", type: "bytes32" },
      {
        indexed: true,
        internalType: "uint256",
        name: "contentType",
        type: "uint256",
      },
    ],
    name: "ABIChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "node", type: "bytes32" },
      { indexed: false, internalType: "address", name: "a", type: "address" },
    ],
    name: "AddrChanged",
    type: "event",
  },
  // Read function to get the Ethereum address for a node
  {
    inputs: [{ internalType: "bytes32", name: "node", type: "bytes32" }],
    name: "addr",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // Read function to get the address for a specific coin type (multi-chain support)
  {
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "uint256", name: "coinType", type: "uint256" },
    ],
    name: "addr",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "view",
    type: "function",
  },
  // Read function to get the name for a node (reverse resolution)
  {
    inputs: [{ internalType: "bytes32", name: "node", type: "bytes32" }],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  // Write function to set the address
  {
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "address", name: "a", type: "address" },
    ],
    name: "setAddr",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Write function to set the name
  {
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "string", name: "newName", type: "string" },
    ],
    name: "setName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Support for interface detection
  {
    inputs: [{ internalType: "bytes4", name: "interfaceID", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const; 