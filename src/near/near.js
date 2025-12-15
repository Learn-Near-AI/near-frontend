import { Buffer } from 'buffer'
import { setupWalletSelector } from '@near-wallet-selector/core'
import { setupModal } from '@near-wallet-selector/modal-ui'
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet'

// Polyfill Buffer for any deps that still expect it (near-api-js, etc.)
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer
}

const TESTNET_NETWORK = 'testnet'
const CONTRACT_ID = 'example-contract.testnet' // you can change this later

let selectorPromise = null
let modal = null

export const getNearConfig = () => ({
  networkId: TESTNET_NETWORK,
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://app.mynearwallet.com',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
})

export async function initWalletSelector() {
  if (!selectorPromise) {
    selectorPromise = setupWalletSelector({
      network: TESTNET_NETWORK,
      debug: false,
      modules: [setupMeteorWallet()],
    }).then((selector) => {
      if (!modal) {
        modal = setupModal(selector, {
          contractId: CONTRACT_ID,
          theme: 'dark',
        })
      }
      return selector
    })
  }

  return selectorPromise
}

export function openWalletSelectorModal() {
  if (modal) {
    modal.show()
  }
}

export async function getActiveAccountId() {
  const selector = await initWalletSelector()
  const state = selector.store.getState()
  const active = state.accounts.find((it) => it.active)
  return active?.accountId || null
}

export async function getActiveAccountBalance() {
  const accountId = await getActiveAccountId()
  if (!accountId) return null

  const { nodeUrl } = getNearConfig()

  try {
    const res = await fetch(nodeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'query',
        params: {
          request_type: 'view_account',
          finality: 'final',
          account_id: accountId,
        },
      }),
    })

    const json = await res.json()
    const amountYocto = json?.result?.amount
    if (!amountYocto) return null

    // Convert yoctoNEAR (1e24) to NEAR, formatted to 3 decimal places
    const balance = Number(amountYocto) / 1e24
    return balance.toFixed(3)
  } catch (e) {
    console.error('Failed to fetch account balance', e)
    return null
  }
}

export async function disconnectWallet() {
  try {
    const selector = await initWalletSelector()
    const wallet = await selector.wallet()
    await wallet.signOut()
  } catch (e) {
    console.error('Failed to disconnect wallet', e)
  }
}


