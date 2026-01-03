// Category order based on learning complexity (basic to advanced)
export const categoryOrder = [
  'Basics',
  'Access Control & Security',
  'Collections & Data',
  'NFTs',
  'Cross-Contract',
  'Chain Signatures',
  'Indexing',
  'Advanced Patterns',
]

export const categoryIcons = {
  'Basics': '📚',
  'Access Control & Security': '🔒',
  'Collections & Data': '📦',
  'Advanced Patterns': '⚡',
  'Fungible Tokens': '💰',
  'NFTs': '🎨',
  'Cross-Contract': '🔗',
  'Chain Signatures': '🔐',
  'Indexing': '📊',
  'Real-World': '🎮',
}

export const difficultyColors = {
  'Beginner': 'bg-green-500/20 text-green-500 border-green-500/30',
  'Intermediate': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  'Advanced': 'bg-red-500/20 text-red-500 border-red-500/30',
}

export const languageIcons = {
  'Rust': '⚽',
  'JS': '📜',
  'JavaScript': '📜',
}

// Coming soon template for examples without code
export const COMING_SOON_TEMPLATE = {
  Rust: `// Coming Soon
// This example is under development.
// Check back soon for a complete implementation!

use near_sdk::near_bindgen;

#[near_bindgen]
#[derive(Default)]
pub struct Contract {}

#[near_bindgen]
impl Contract {
    pub fn placeholder(&self) -> String {
        "Coming soon!".to_string()
    }
}`,
  JavaScript: `// Coming Soon
// This example is under development.
// Check back soon for a complete implementation!

import { NearBindgen, view } from "near-sdk-js";

@NearBindgen({})
class Contract {
  @view({})
  placeholder() {
    return "Coming soon!";
  }
}

export default Contract;`,
}

