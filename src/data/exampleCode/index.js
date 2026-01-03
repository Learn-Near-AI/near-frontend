// Main export file for all example code
import { basicsCode } from './basics.js'
import { securityCode } from './security.js'
import { collectionsCode } from './collections.js'
import { advancedCode } from './advanced.js'
import { crossContractCode } from './crossContract.js'
import { nftsCode } from './nfts.js'
import { COMING_SOON_TEMPLATE } from '../constants.js'

// List of example IDs that have working implementations (30 total)
export const WORKING_EXAMPLES = [
  // Basics (12)
  'hello-world',
  'contract-structure',
  'view-methods',
  'change-methods',
  'storage-basics',
  'state-management',
  'input-validation',
  'access-control',
  'error-handling',
  'events',
  'collections-vector',
  'collections-map',
  // Security (5)
  'owner-pattern',
  'role-based-access',
  'pausable-contract',
  'multi-signature',
  'reentrancy-guard',
  // Collections (4)
  'storage-keys',
  'todo-list',
  'user-profiles',
  'voting-system',
  // Advanced (6)
  'testing',
  'panic-handling',
  'event-patterns',
  'initialization',
  'gas-optimization',
  'complete-example',
  // Cross-Contract (2)
  'simple-calls',
  'promises',
  // NFTs (1)
  'nft-transfer',
]

// Combine all code examples
const allCode = {
  ...basicsCode,
  ...securityCode,
  ...collectionsCode,
  ...advancedCode,
  ...crossContractCode,
  ...nftsCode,
}

// Export exampleCode with coming soon template for missing examples
export const exampleCode = new Proxy(allCode, {
  get(target, prop) {
    if (prop in target) {
      return target[prop]
    }
    // Return coming soon template for examples without code
    return COMING_SOON_TEMPLATE
  }
})

