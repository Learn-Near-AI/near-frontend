import React, { useState, useEffect } from 'react'
import { CheckCircle2, ExternalLink, Copy, ArrowLeft, Loader2 } from 'lucide-react'
import { getActiveAccountId, getNearConfig } from '../near/near'

function SuccessPage({ onBack }) {
  const [txHash, setTxHash] = useState(null)
  const [contractId, setContractId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadTransactionData = async () => {
      try {
        // Get transaction hash from URL
        const urlParams = new URLSearchParams(window.location.search)
        const transactionHashes = urlParams.get('transactionHashes')
        
        if (!transactionHashes) {
          setError('No transaction hash found in URL')
          setLoading(false)
          return
        }

        const hash = transactionHashes.split(',')[0]
        setTxHash(hash)

        // Try to get contract ID from localStorage first
        const pendingAccountId = localStorage.getItem('pendingDeploymentAccountId')
        if (pendingAccountId) {
          setContractId(pendingAccountId)
          localStorage.removeItem('pendingDeploymentAccountId')
          setLoading(false)
        }

        // Try to fetch transaction details
        try {
          const accountId = await getActiveAccountId()
          const { nodeUrl } = getNearConfig()
          const txResponse = await fetch(nodeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 'dontcare',
              method: 'tx',
              params: [hash, accountId || ''],
            }),
          })
          
          const txResult = await txResponse.json()
          
          if (txResult.result && txResult.result.transaction) {
            const receiverId = txResult.result.transaction.receiver_id
            
            // Check if this is a DeployContract action
            const actions = txResult.result.transaction.actions || []
            const hasDeployAction = actions.some(action => 
              action.DeployContract || 
              (action.enum === 'deployContract') ||
              (action.type === 'DeployContract')
            )
            
            if (hasDeployAction && receiverId) {
              setContractId(receiverId)
            }
          }
        } catch (err) {
          console.error('Error fetching transaction details:', err)
          // Continue even if fetch fails
        } finally {
          setLoading(false)
        }
      } catch (err) {
        console.error('Error loading transaction data:', err)
        setError('Failed to load transaction data')
        setLoading(false)
      }
    }

    loadTransactionData()
  }, [])

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-near-darker">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-near-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading transaction details...</p>
        </div>
      </div>
    )
  }

  if (error && !txHash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-near-darker">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-red-500 mb-4">{error}</p>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-near-primary hover:bg-[#00D689] text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-near-darker py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-near-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Examples</span>
          </button>
        )}

        {/* Success Card */}
        <div className="bg-white dark:bg-near-dark rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Deployment Successful!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your contract has been deployed to NEAR TestNet
            </p>
          </div>

          {/* Transaction Hash */}
          <div className="bg-gray-50 dark:bg-near-darker rounded-lg p-4 space-y-2">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Transaction Hash
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-100 break-all">
                {txHash}
              </code>
              <button
                onClick={() => handleCopy(txHash)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title="Copy hash"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Contract ID */}
          {contractId && (
            <div className="bg-gray-50 dark:bg-near-darker rounded-lg p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Contract ID
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-100 break-all">
                  {contractId}
                </code>
                <button
                  onClick={() => handleCopy(contractId)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  title="Copy contract ID"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            {txHash && (
              <a
                href={`https://testnet.nearblocks.io/txns/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-near-primary hover:bg-[#00D689] text-white rounded-lg font-medium transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
                View Transaction on NearBlocks
              </a>
            )}
            
          </div>

          {/* Info */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Your contract is now live on NEAR TestNet. You can interact with it using the contract ID above.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessPage

