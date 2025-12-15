import React, { useState, useEffect } from 'react'
import { ArrowLeft, Code2, Play, Rocket, ExternalLink, TimerResetIcon, CopyIcon, Loader2 } from 'lucide-react'
import { difficultyColors, languageIcons, exampleCode } from '../data/examples'
import { initWalletSelector, getActiveAccountId, getNearConfig } from '../near/near'
import { Buffer } from 'buffer'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function ExampleDetail({ example, onBack }) {
  const difficultyClass = difficultyColors[example.difficulty] || difficultyColors['Beginner']
  const [activeLanguage, setActiveLanguage] = useState(example.language || 'Rust')
  const languageIcon = languageIcons[activeLanguage] || '📄'
  const [activeInfoTab, setActiveInfoTab] = useState('ai')
  const [code, setCode] = useState('')
  const [consoleOutput, setConsoleOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedContractId, setDeployedContractId] = useState(null)
  const [deploymentTxHash, setDeploymentTxHash] = useState(null)

  const initialCode =
    exampleCode[example.id]?.[activeLanguage] ||
    `// No ${activeLanguage} code sample is available yet for "${example.name}".
// Try switching language tabs, or pick another example from the sidebar.`

  useEffect(() => {
    setCode(initialCode)
  }, [example.id, activeLanguage, initialCode])

  const addConsoleOutput = (message) => {
    setConsoleOutput((prev) => prev + message + '\n')
  }

  const clearConsole = () => {
    setConsoleOutput('')
  }

  const handleRun = async () => {
    if (!code.trim()) {
      addConsoleOutput('❌ Error: No code to run')
      return
    }

    setIsRunning(true)
    clearConsole()
    addConsoleOutput('▶ Compiling contract...')

    try {
      // Compile contract
      const compileResponse = await fetch(`${API_BASE_URL}/api/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: activeLanguage }),
      })

      const compileResult = await compileResponse.json()

      if (!compileResponse.ok) {
        throw new Error(compileResult.error || 'Compilation failed')
      }

      addConsoleOutput('✓ Contract compiled successfully')
      addConsoleOutput(`✓ WASM size: ${(compileResult.size / 1024).toFixed(2)} KB`)

      // For now, just show compilation success
      // In a full implementation, you'd deploy to a sandbox and call methods
      addConsoleOutput('\n💡 Note: Full execution requires deployment.')
      addConsoleOutput('   Click "Deploy" to deploy and test your contract on TestNet.')

    } catch (error) {
      addConsoleOutput(`❌ Error: ${error.message}`)
      console.error('Run error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleDeploy = async () => {
    if (!code.trim()) {
      addConsoleOutput('❌ Error: No code to deploy')
      return
    }

    const accountId = await getActiveAccountId()
    if (!accountId) {
      addConsoleOutput('❌ Error: Please connect your wallet first')
      return
    }

    setIsDeploying(true)
    clearConsole()
    addConsoleOutput('▶ Starting deployment process...')
    addConsoleOutput('▶ Compiling contract...')

    try {
      // Compile contract
      const compileResponse = await fetch(`${API_BASE_URL}/api/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: activeLanguage }),
      })

      const compileResult = await compileResponse.json()

      if (!compileResponse.ok) {
        throw new Error(compileResult.error || 'Compilation failed')
      }

      addConsoleOutput('✓ Contract compiled successfully')
      addConsoleOutput(`✓ WASM size: ${(compileResult.size / 1024).toFixed(2)} KB`)

      // Get wallet selector
      const selector = await initWalletSelector()
      const wallet = await selector.wallet()
      const accountId = await getActiveAccountId()

      if (!accountId) {
        throw new Error('Please connect your wallet first')
      }

      // Generate subaccount ID (e.g., hello-world-1234567890.testnet)
      const timestamp = Date.now()
      const subaccountName = `${example.id}-${timestamp}`
      const contractId = `${subaccountName}.${accountId.split('.')[1] || 'testnet'}`

      addConsoleOutput(`▶ Deploying to: ${contractId}`)
      addConsoleOutput('▶ Preparing deployment transaction...')

      const wasmBuffer = Buffer.from(compileResult.wasm, 'base64')
      const wasmUint8Array = Array.from(new Uint8Array(wasmBuffer))

      // Check if account exists
      const { nodeUrl } = getNearConfig()
      
      let accountExists = false
      try {
        const checkRes = await fetch(nodeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'dontcare',
            method: 'query',
            params: {
              request_type: 'view_account',
              finality: 'final',
              account_id: contractId,
            },
          }),
        })
        const checkJson = await checkRes.json()
        accountExists = !checkJson.error && checkJson.result
      } catch (e) {
        // Account doesn't exist, we'll deploy to it anyway
        accountExists = false
      }

      if (!accountExists) {
        addConsoleOutput(`ℹ️  Account ${contractId} will be created during deployment`)
        addConsoleOutput('   (Subaccount creation requires parent account balance)')
      }

      addConsoleOutput('▶ Uploading WASM contract...')
      addConsoleOutput('▶ Waiting for wallet approval...')

      // Import near-api-js for transaction building
      const { transactions, utils } = await import('near-api-js')
      
      // Build deploy contract action
      const deployAction = transactions.deployContract(wasmUint8Array)

      // For simplicity, deploy to user's account
      // (Subaccount creation requires additional transactions)
      const targetAccountId = accountExists ? contractId : accountId
      
      if (!accountExists) {
        addConsoleOutput(`ℹ️  Deploying to your account: ${targetAccountId}`)
        addConsoleOutput('   (To deploy to subaccount, create it first)')
      }

      // Sign and send transaction via Wallet Selector
      const deployResult = await wallet.signAndSendTransaction({
        signerId: accountId,
        receiverId: targetAccountId,
        actions: [deployAction],
      })

      addConsoleOutput('✓ Contract deployed successfully!')
      
      // Extract transaction hash
      const txHash = deployResult?.transaction?.hash || 
                    deployResult?.transactionHash ||
                    deployResult?.receipts_outcome?.[0]?.id ||
                    'pending'

      addConsoleOutput(`✓ Transaction hash: ${txHash}`)
      addConsoleOutput(`✓ Contract available at: ${targetAccountId}`)

      setDeployedContractId(targetAccountId)
      setDeploymentTxHash(txHash)

    } catch (error) {
      addConsoleOutput(`❌ Error: ${error.message}`)
      console.error('Deploy error:', error)
    } finally {
      setIsDeploying(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
  }

  const handleResetCode = () => {
    if (confirm('Reset code to original example?')) {
      setCode(initialCode)
      clearConsole()
    }
  }

  return (
    <div className="pl-4 py-6 md:py-4 max-w-5xl mx-auto space-y-6 ">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-near-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Back to Examples</span>
      </button>

      {/* Example Header */}
      <div className="bg-white dark:bg-near-dark rounded-xl p-5 md:p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{languageIcon}</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {example.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {example.category} • {activeLanguage}
              </p>
            </div>
          </div>
          <span
            className={`text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 rounded-full border ${difficultyClass} font-medium whitespace-nowrap`}
          >
            {example.difficulty}
          </span>
        </div>
      </div>

      {/* Main 3-panel learning interface */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT PANEL – Code Editor */}
        <div className="lg:basis-3/5 bg-white dark:bg-near-dark rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
          {/* Top toolbar */}
          <div className="border-b border-gray-200 dark:border-gray-800 px-3 md:px-4 py-2.5 md:py-3 flex flex-wrap items-center gap-2">
            {/* Language tabs */}
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-near-darker overflow-hidden text-[0.65rem] md:text-xs">
              <button
                className={`px-3 py-1.5 font-semibold ${
                  activeLanguage === 'Rust'
                    ? 'bg-near-primary text-near-darker'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setActiveLanguage('Rust')}
              >
                Rust
              </button>
              <button
                className={`px-3 py-1.5 ${
                  activeLanguage === 'JavaScript'
                    ? 'bg-near-primary text-near-darker font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setActiveLanguage('JavaScript')}
              >
                JavaScript
              </button>
              <button
                className={`px-3 py-1.5 ${
                  activeLanguage === 'TypeScript'
                    ? 'bg-near-primary text-near-darker font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setActiveLanguage('TypeScript')}
              >
                TypeScript
              </button>
            </div>

            <div className="flex-1" />

            {/* Action buttons */}
            <button
              onClick={handleResetCode}
              className="px-2.5 md:px-3 py-1.5 text-[0.65rem] md:text-xs border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              title="Reset code"
            >
              <TimerResetIcon className='h-4 w-4'/>
            </button>
            <button
              onClick={handleCopyCode}
              className="px-2.5 md:px-3 py-1.5 text-[0.65rem] md:text-xs border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              title="Copy code"
            >
              <CopyIcon className='h-4 w-4'/>
            </button>
            <button
              onClick={handleRun}
              disabled={isRunning || isDeploying}
              className="px-2.5 md:px-3 py-1.5 text-[0.65rem] md:text-xs bg-near-primary hover:bg-[#00D689] text-near-darker font-semibold rounded-lg inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Compiling...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run
                </>
              )}
            </button>
            <button
              onClick={handleDeploy}
              disabled={isRunning || isDeploying}
              className="px-2.5 md:px-3 py-1.5 text-[0.65rem] md:text-xs border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Deploy
                </>
              )}
            </button>
          </div>

          {/* Code editor area */}
          <div className="flex-1 bg-[#020617] text-gray-100 font-mono text-xs md:text-sm overflow-auto p-4 space-y-3">
            <div className="flex items-center justify-between text-[0.65rem] text-gray-400">
              <span>Code Editor • {activeLanguage}</span>
              <span>NEAR SDK</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-gray-100 font-mono text-xs md:text-sm outline-none resize-none whitespace-pre overflow-x-auto"
              spellCheck={false}
              style={{ minHeight: '300px' }}
            />
          </div>

          {/* Bottom status bar */}
          <div className="border-t border-gray-800 bg-[#020617] px-3 md:px-4 py-1.5 md:py-2 text-[0.7rem] text-gray-400 flex items-center justify-between">
            <span>Lines: 10 • Chars: 180 (approx)</span>
            <span>{activeLanguage} • Ready to run ✓</span>
          </div>
        </div>

        {/* MIDDLE PANEL – Docs & AI */}
        <div className="lg:basis-2/5 bg-white dark:bg-near-dark rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-800 px-3 pt-3 flex gap-1.5 md:gap-2 text-xs md:text-sm">
            {['Explanation', 'AI Assistant'].map((label) => {
              const key = label.toLowerCase().split(' ')[0] // explanation, ai, expected, tests
              const normalizedKey = key === 'ai' ? 'ai' : key === 'expected' ? 'output' : key
              const isActive = activeInfoTab === normalizedKey
              return (
                <button
                  key={label}
                  onClick={() => setActiveInfoTab(normalizedKey)}
                  className={`px-3 py-2 rounded-t-lg border-b-2 -mb-px ${
                    isActive
                      ? 'border-near-primary text-near-primary font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <div className="flex-1 p-4 text-sm flex flex-col">
            {/* Explanation Tab */}
            {activeInfoTab === 'explanation' && (
              <div className="space-y-4 flex-1 overflow-auto">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {example.name}
                  </h2>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    What this example covers
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  This example demonstrates key concepts in NEAR smart contract development for{' '}
                  <span className="font-medium">{example.category}</span>. Read the explanation,
                  experiment in the editor, then run and deploy your code.
                </p>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    What you'll learn
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                      <span className="text-near-primary mt-0.5">•</span>
                      <span>Understanding the core {example.name.toLowerCase()} pattern.</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                      <span className="text-near-primary mt-0.5">•</span>
                      <span>How it fits into {example.category.toLowerCase()} workflows on NEAR.</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                      <span className="text-near-primary mt-0.5">•</span>
                      <span>Best practices for {example.difficulty.toLowerCase()}-level developers.</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Related examples
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Explore more in the <span className="font-medium">{example.category}</span> category
                    from the sidebar to deepen your understanding.
                  </p>
                </div>
              </div>
            )}

            {/* AI Assistant Tab */}
            {activeInfoTab === 'ai' && (
              <div className="flex flex-col flex-1 gap-4">
                <div className="bg-gray-50 dark:bg-near-darker rounded-lg p-3 text-xs text-gray-600 dark:text-gray-300 space-y-2 flex-1 overflow-auto">
                  <p className="font-semibold mb-2">Ask about this code...</p>
                  <div className="space-y-1">
                    <p className="text-gray-500 dark:text-gray-400">Suggested questions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>What does line 7 do?</li>
                      <li>How does this contract return "Hello, NEAR!"?</li>
                      <li>Why would I use promises in cross-contract calls?</li>
                    </ul>
                  </div>
                </div>

                {/* Chat input (static UI placeholder) fixed at bottom */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 flex flex-col gap-2 bg-white dark:bg-near-dark">
                  <textarea
                    rows={3}
                    className="w-full bg-transparent text-xs text-gray-800 dark:text-gray-100 outline-none resize-none"
                    placeholder="💬 Ask a question about this example..."
                  />
                  <div className="flex justify-end pt-1">
                    <button className="px-3 py-1.5 text-xs bg-near-primary text-near-darker font-semibold rounded-md hover:bg-[#00D689]">
                      Ask AI
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        
      </div>
      {/* RIGHT PANEL – Execution & Results */}
      <div className="bg-white dark:bg-near-dark rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col gap-4">
          {/* Console Output */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-3 px-4 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Console Output
            </h3>
            <div className="bg-gray-50 dark:bg-near-darker rounded-lg p-3 text-[0.7rem] font-mono text-gray-800 dark:text-gray-100 max-h-60 overflow-auto whitespace-pre-wrap">
              {consoleOutput || 'Console output will appear here when you run or deploy...'}
            </div>
          </div>

          {/* Deployment status */}
          <div className="px-4 pb-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Deployment
            </h3>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              {deployedContractId ? (
                <>
                  <p>
                    Status:{' '}
                    <span className="inline-flex items-center gap-1 text-green-500 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Deployed to TestNet
                    </span>
                  </p>
                  <p>
                    Contract ID:{' '}
                    <span className="font-mono text-[0.7rem] text-gray-800 dark:text-gray-100">
                      {deployedContractId}
                    </span>
                  </p>
                  {deploymentTxHash && (
                    <p>
                      Tx Hash:{' '}
                      <span className="font-mono text-[0.7rem] text-gray-800 dark:text-gray-100">
                        {deploymentTxHash}
                      </span>
                    </p>
                  )}
                  <a
                    href={`https://explorer.testnet.near.org/accounts/${deployedContractId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-near-primary hover:text-[#00D689]"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on Explorer
                  </a>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No contract deployed yet. Click "Deploy" to deploy your contract.
                </p>
              )}
            </div>
          </div>
        </div>
    </div>
  )
}

export default ExampleDetail

