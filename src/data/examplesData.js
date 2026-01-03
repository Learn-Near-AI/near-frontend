// Examples metadata - organized from basic to advanced
export const examplesData = {
  Basics: [
    // Beginner - Foundation
    { id: 'hello-world', name: 'Hello World', difficulty: 'Beginner', language: 'Rust' },
    { id: 'contract-structure', name: 'Contract Structure', difficulty: 'Beginner', language: 'Rust' },
    { id: 'view-methods', name: 'View Methods', difficulty: 'Beginner', language: 'Rust' },
    { id: 'change-methods', name: 'Change Methods', difficulty: 'Beginner', language: 'Rust' },
    { id: 'storage-basics', name: 'Storage Basics', difficulty: 'Beginner', language: 'Rust' },
    { id: 'state-management', name: 'State Management', difficulty: 'Beginner', language: 'Rust' },
    { id: 'input-validation', name: 'Input Validation', difficulty: 'Beginner', language: 'Rust' },
    { id: 'access-control', name: 'Access Control', difficulty: 'Beginner', language: 'Rust' },
    // Intermediate - Building on Basics
    { id: 'error-handling', name: 'Error Handling', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'events', name: 'Events', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'collections-vector', name: 'Collections: Vector', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'collections-map', name: 'Collections: Map', difficulty: 'Intermediate', language: 'Rust' },
  ],
  'Access Control & Security': [
    // Intermediate - Basic Security Patterns
    { id: 'owner-pattern', name: 'Owner Pattern', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'role-based-access', name: 'Role-Based Access', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'pausable-contract', name: 'Pausable Contract', difficulty: 'Intermediate', language: 'Rust' },
    // Advanced - Advanced Security
    { id: 'multi-signature', name: 'Multi-Signature', difficulty: 'Advanced', language: 'Rust' },
    { id: 'upgrade-pattern', name: 'Upgrade Pattern', difficulty: 'Advanced', language: 'Rust' },
    { id: 'reentrancy-guard', name: 'Reentrancy Guard', difficulty: 'Advanced', language: 'Rust' },
  ],
  'Collections & Data': [
    // Intermediate - Data Structures and Applications
    { id: 'storage-keys', name: 'Storage Keys', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'todo-list', name: 'Todo List', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'user-profiles', name: 'User Profiles', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'voting-system', name: 'Voting System', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'simple-marketplace', name: 'Simple Marketplace', difficulty: 'Intermediate', language: 'Rust' },
    // Advanced - Complex Operations
    { id: 'batch-operations', name: 'Batch Operations', difficulty: 'Advanced', language: 'Rust' },
  ],
  NFTs: [
    // Beginner - NFT Basics
    { id: 'nft-transfer', name: 'NFT Transfer', difficulty: 'Beginner', language: 'Rust' },
    // Intermediate - NFT Operations
    { id: 'nft-standard', name: 'NFT Standard', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'nft-metadata', name: 'NFT Metadata', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'nft-minting', name: 'NFT Minting', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'nft-approval', name: 'NFT Approval', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'nft-enumeration', name: 'NFT Enumeration', difficulty: 'Intermediate', language: 'Rust' },
    // Advanced - Complex NFT Features
    { id: 'nft-royalties', name: 'NFT Royalties', difficulty: 'Advanced', language: 'Rust' },
    { id: 'nft-marketplace', name: 'NFT Marketplace', difficulty: 'Advanced', language: 'Rust' },
  ],
  'Cross-Contract': [
    // Beginner - Basic Cross-Contract Calls
    { id: 'simple-calls', name: 'Simple Calls', difficulty: 'Beginner', language: 'Rust' },
    // Intermediate - Promise and Callback Patterns
    { id: 'promises', name: 'Promises', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'callbacks', name: 'Callbacks', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'cross-call-ft', name: 'Cross-Call FT', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'cross-call-nft', name: 'Cross-Call NFT', difficulty: 'Intermediate', language: 'Rust' },
    // Advanced - Complex Patterns
    { id: 'batch-calls', name: 'Batch Calls', difficulty: 'Advanced', language: 'Rust' },
    { id: 'promise-results', name: 'Promise Results', difficulty: 'Advanced', language: 'Rust' },
    { id: 'async-patterns', name: 'Async Patterns', difficulty: 'Advanced', language: 'Rust' },
    { id: 'callback-patterns', name: 'Callback Patterns', difficulty: 'Advanced', language: 'Rust' },
    { id: 'error-propagation', name: 'Error Propagation', difficulty: 'Advanced', language: 'Rust' },
  ],
  'Chain Signatures': [
    // Intermediate - Chain Signatures Basics
    { id: 'chain-signatures-basics', name: 'Chain Signatures Basics', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'signature-verification', name: 'Signature Verification', difficulty: 'Intermediate', language: 'Rust' },
    // Advanced - Complex Chain Signature Patterns
    { id: 'signature-requests', name: 'Signature Requests', difficulty: 'Advanced', language: 'Rust' },
    { id: 'multi-chain-signing', name: 'Multi-chain Signing', difficulty: 'Advanced', language: 'Rust' },
    { id: 'cross-chain-auth', name: 'Cross-Chain Auth', difficulty: 'Advanced', language: 'Rust' },
    { id: 'signature-callbacks', name: 'Signature Callbacks', difficulty: 'Advanced', language: 'Rust' },
  ],
  Indexing: [
    // Intermediate - Indexing Basics
    { id: 'indexer-setup', name: 'Indexer Setup', difficulty: 'Intermediate', language: 'JS' },
    { id: 'queryapi-basics', name: 'QueryAPI Basics', difficulty: 'Intermediate', language: 'JS' },
    { id: 'data-indexing', name: 'Data Indexing', difficulty: 'Intermediate', language: 'JS' },
    { id: 'queryapi-queries', name: 'QueryAPI Queries', difficulty: 'Intermediate', language: 'JS' },
    // Advanced - Advanced Indexing
    { id: 'indexer-filters', name: 'Indexer Filters', difficulty: 'Advanced', language: 'JS' },
    { id: 'indexer-aggregation', name: 'Indexer Aggregation', difficulty: 'Advanced', language: 'JS' },
    { id: 'indexer-performance', name: 'Indexer Performance', difficulty: 'Advanced', language: 'JS' },
    { id: 'indexer-monitoring', name: 'Indexer Monitoring', difficulty: 'Advanced', language: 'JS' },
  ],
  'Advanced Patterns': [
    // Intermediate - Testing and Patterns
    { id: 'testing', name: 'Unit Testing', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'panic-handling', name: 'Panic Handling', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'event-patterns', name: 'Event Patterns', difficulty: 'Intermediate', language: 'Rust' },
    { id: 'initialization', name: 'Contract Initialization', difficulty: 'Intermediate', language: 'Rust' },
    // Advanced - Optimization and Complete Examples
    { id: 'gas-optimization', name: 'Gas Optimization', difficulty: 'Advanced', language: 'Rust' },
    { id: 'complete-example', name: 'Complete Example', difficulty: 'Advanced', language: 'Rust' },
  ],
}

