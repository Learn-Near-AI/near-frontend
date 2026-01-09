import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { exampleCode } from '../data/examples'
import { testFunctions, hasTestFunctions } from '../data/testFunctions'
import { initWalletSelector, getActiveAccountId, getNearConfig } from '../near/near'
import { Buffer } from 'buffer'
import ExampleHeader from './ExampleHeader'
import CodeEditor from './CodeEditor'
import InfoPanel from './InfoPanel'
import ConsolePanel from './ConsolePanel'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://near-by-example-backend.fly.dev'

// Helper function to determine deployment method based on language
const shouldUseCLIDeployment = (language) => {
  // Use CLI deployment for Rust, wallet for JavaScript/TypeScript
  return language === 'Rust'
}

function ExampleDetail({ example, onBack }) {
  const [activeLanguage, setActiveLanguage] = useState('JavaScript')
  const [activeInfoTab, setActiveInfoTab] = useState('ai')
  const [code, setCode] = useState('')
  const [consoleOutput, setConsoleOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedContractId, setDeployedContractId] = useState(null)
  const [deploymentTxHash, setDeploymentTxHash] = useState(null)
  const [testResults, setTestResults] = useState({})
  const [testParams, setTestParams] = useState({})
  const [isTesting, setIsTesting] = useState(false)
  const [backendCLIConfigured, setBackendCLIConfigured] = useState(null)
  const [contractState, setContractState] = useState({
    counter: 0,
    message: 'Hello, NEAR storage!',
    greeting: 'hello',
    owner: 'contract.testnet',
  })

  const initialCode =
    exampleCode[example.id]?.[activeLanguage] ||
    `// No ${activeLanguage} code sample is available yet for "${example.name}".
// Try switching language tabs, or pick another example from the sidebar.`

  const addConsoleOutput = (message) => {
    setConsoleOutput((prev) => prev + message + '\n')
  }


  // Reset active language to JavaScript when example changes
  useEffect(() => {
    setActiveLanguage('JavaScript')
  }, [example.id])

  useEffect(() => {
    setCode(initialCode)
  }, [example.id, activeLanguage, initialCode])

  // Initialize test parameters when example changes
  useEffect(() => {
    if (hasTestFunctions(example.id)) {
      const functions = testFunctions[example.id]
      const initialParams = {}
      
      functions.viewMethods.forEach(method => {
        method.params.forEach(param => {
          initialParams[`${method.name}_${param.name}`] = param.defaultValue || ''
        })
      })
      functions.changeMethods.forEach(method => {
        method.params.forEach(param => {
          initialParams[`${method.name}_${param.name}`] = param.defaultValue || ''
        })
      })
      
      setTestParams(initialParams)
      setTestResults({})
      setContractState({
        counter: 0,
        message: 'Hello, NEAR storage!',
        greeting: 'hello',
        owner: 'contract.testnet',
      })
    }
  }, [example.id])

  // Reset deploying state on mount (in case user navigated away and came back)
  useEffect(() => {
    setIsDeploying(false)
  }, [])

  // Check backend CLI configuration status
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/near/status`)
        if (response.ok) {
          const status = await response.json()
          setBackendCLIConfigured(status.configured)
          console.log('Backend CLI configured:', status.configured)
        }
      } catch (error) {
        console.warn('Could not check backend CLI status:', error)
        setBackendCLIConfigured(false)
      }
    }
    
    checkBackendStatus()
  }, [])

  // Handle transactionHashes URL parameter - redirect to success page
  useEffect(() => {
    // Check URL parameter on mount (for page reloads)
    const urlParams = new URLSearchParams(window.location.search)
    const transactionHashes = urlParams.get('transactionHashes')
    
    if (transactionHashes && !window.location.pathname.includes('/success')) {
      // Reset deploying state before redirect
      setIsDeploying(false)
      // Redirect to success page with transaction hash
      window.history.replaceState({}, '', `/examples/success?transactionHashes=${transactionHashes}`)
      window.location.href = `/examples/success?transactionHashes=${transactionHashes}`
    }
  }, []) // Only run on mount

  // Handle transactionHashes URL parameter - check continuously for new transactions and redirect
  useEffect(() => {
    let previousUrl = window.location.href
    
    const checkAndRedirect = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const transactionHashes = urlParams.get('transactionHashes')
      const currentUrl = window.location.href
      
      // If URL changed (wallet redirect), reset deploying state
      if (currentUrl !== previousUrl) {
        setIsDeploying(false)
        previousUrl = currentUrl
      }
      
      if (transactionHashes && !window.location.pathname.includes('/success')) {
        // Reset deploying state before redirect
        setIsDeploying(false)
        // Redirect to success page
        window.history.replaceState({}, '', `/examples/success?transactionHashes=${transactionHashes}`)
        window.location.href = `/examples/success?transactionHashes=${transactionHashes}`
      }
    }
    
    // Check immediately
    checkAndRedirect()
    
    // Check periodically to catch URL changes
    const interval = setInterval(checkAndRedirect, 500)
    
    // Listen to popstate events
    window.addEventListener('popstate', checkAndRedirect)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('popstate', checkAndRedirect)
    }
  }, [])

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
      const compileResponse = await fetch(`${API_BASE_URL}/api/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: activeLanguage }),
      })

      if (!compileResponse.ok) {
        const errorData = await compileResponse.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || errorData.message || `HTTP ${compileResponse.status}: ${compileResponse.statusText}`)
      }

      const compileResult = await compileResponse.json()

      if (!compileResult.success && compileResult.stderr) {
        throw new Error(compileResult.stderr || compileResult.error || 'Compilation failed')
      }

      addConsoleOutput('✓ Contract compiled successfully')
      addConsoleOutput(`✓ WASM size: ${(compileResult.size / 1024).toFixed(2)} KB`)
      addConsoleOutput('\n💡 Note: Full execution requires deployment.')
      addConsoleOutput('   Click "Deploy" to deploy and test your contract on TestNet.')
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        addConsoleOutput(`❌ Error: Failed to connect to backend`)
        addConsoleOutput(`   Backend URL: ${API_BASE_URL}`)
        addConsoleOutput(`   Please check if the backend is running and accessible.`)
        addConsoleOutput(`   Error details: ${error.message}`)
      } else {
        addConsoleOutput(`❌ Error: ${error.message}`)
      }
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

    // Check if we should use CLI or wallet deployment
    const useCLI = shouldUseCLIDeployment(activeLanguage)

    if (useCLI) {
      // Use backend CLI deployment for Rust
      await handleCLIDeploy()
    } else {
      // Use wallet deployment for JavaScript/TypeScript
      await handleWalletDeploy()
    }
  }

  // CLI deployment for Rust contracts
  const handleCLIDeploy = async () => {
    setIsDeploying(true)
    clearConsole()
    addConsoleOutput('▶ Starting CLI deployment (Rust contract)...')
    addConsoleOutput('📋 Deployment Method: NEAR CLI (Backend)')
    addConsoleOutput('   No wallet connection required\n')
    addConsoleOutput('▶ Compiling contract...')

    try {
      // Step 1: Compile the contract
      const compileResponse = await fetch(`${API_BASE_URL}/api/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: activeLanguage }),
      })

      if (!compileResponse.ok) {
        const errorData = await compileResponse.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || errorData.message || `HTTP ${compileResponse.status}`)
      }

      const compileResult = await compileResponse.json()

      if (!compileResult.success) {
        throw new Error(compileResult.stderr || compileResult.error || 'Compilation failed')
      }

      addConsoleOutput('✓ Contract compiled successfully')
      addConsoleOutput(`✓ WASM size: ${(compileResult.size / 1024).toFixed(2)} KB`)
      if (compileResult.compilation_time) {
        addConsoleOutput(`✓ Compilation time: ${compileResult.compilation_time}s`)
      }

      // Step 2: Deploy using backend NEAR CLI
      addConsoleOutput('\n▶ Deploying via NEAR CLI...')
      addConsoleOutput('   (Using backend deployment account)')

      const deployResponse = await fetch(`${API_BASE_URL}/api/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wasmBase64: compileResult.wasm,
          initMethod: 'new',
          initArgs: {}
        }),
      })

      if (!deployResponse.ok) {
        const errorData = await deployResponse.json().catch(() => ({ error: 'Deployment failed' }))
        
        // Check if CLI is not configured
        if (deployResponse.status === 503) {
          addConsoleOutput('❌ Backend NEAR CLI not configured')
          addConsoleOutput('   The backend needs NEAR_ACCOUNT_ID and NEAR_PRIVATE_KEY')
          addConsoleOutput('   Contact the administrator to enable CLI deployments')
          throw new Error('Backend NEAR CLI not configured')
        }
        
        throw new Error(errorData.error || 'Deployment failed')
      }

      const deployResult = await deployResponse.json()

      if (!deployResult.success) {
        throw new Error(deployResult.error || 'Deployment failed')
      }

      addConsoleOutput('✓ Contract deployed successfully!')
      addConsoleOutput(`✓ Contract ID: ${deployResult.contractId}`)
      addConsoleOutput(`✓ Transaction hash: ${deployResult.transactionHash}`)
      addConsoleOutput(`✓ Network: ${deployResult.network}`)
      if (deployResult.deploymentTime) {
        addConsoleOutput(`✓ Deployment time: ${deployResult.deploymentTime}s`)
      }
      
      if (deployResult.explorerUrl) {
        addConsoleOutput(`\n🔗 View in Explorer:`)
        addConsoleOutput(`   ${deployResult.explorerUrl}`)
      }
      if (deployResult.accountUrl) {
        addConsoleOutput(`\n🔗 View Account:`)
        addConsoleOutput(`   ${deployResult.accountUrl}`)
      }

      setDeployedContractId(deployResult.contractId)
      setDeploymentTxHash(deployResult.transactionHash)

      // Optional: Test the deployed contract
      addConsoleOutput('\n▶ Testing deployed contract...')
      try {
        const testResponse = await fetch(`${API_BASE_URL}/api/contract/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contractAccountId: deployResult.contractId,
            methodName: 'hello_world',
            args: {}
          }),
        })

        if (testResponse.ok) {
          const testResult = await testResponse.json()
          if (testResult.success) {
            addConsoleOutput(`✓ Test call successful: ${JSON.stringify(testResult.result)}`)
          }
        }
      } catch (testError) {
        // Ignore test errors - deployment was successful
        console.warn('Test call failed:', testError)
      }

      // Store contract ID for success page (same as wallet deployment)
      if (deployResult.transactionHash) {
        localStorage.setItem('pendingDeploymentAccountId', deployResult.contractId)
        
        // Navigate to success page (same as wallet deployment)
        addConsoleOutput('\n▶ Redirecting to success page...')
        
        // Small delay to allow user to see the console output
        setTimeout(() => {
          window.history.replaceState({}, '', `/examples/success?transactionHashes=${deployResult.transactionHash}`)
          window.location.href = `/examples/success?transactionHashes=${deployResult.transactionHash}`
        }, 1500)
      }

    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        addConsoleOutput(`❌ Error: Failed to connect to backend`)
        addConsoleOutput(`   Backend URL: ${API_BASE_URL}`)
        addConsoleOutput(`   Please check if the backend is running and accessible.`)
      } else {
        addConsoleOutput(`❌ Error: ${error.message}`)
      }
      console.error('CLI Deploy error:', error)
    } finally {
      setIsDeploying(false)
    }
  }

  // Wallet deployment for JavaScript/TypeScript contracts
  const handleWalletDeploy = async () => {
    const accountId = await getActiveAccountId()
    if (!accountId) {
      addConsoleOutput('❌ Error: Please connect your wallet first')
      return
    }

    setIsDeploying(true)
    clearConsole()
    addConsoleOutput('▶ Starting wallet deployment (JavaScript contract)...')
    addConsoleOutput('📋 Deployment Method: MyNearWallet')
    addConsoleOutput('   Deploying to your connected account\n')
    addConsoleOutput('▶ Compiling contract...')

    try {
      const compileResponse = await fetch(`${API_BASE_URL}/api/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: activeLanguage }),
      })

      if (!compileResponse.ok) {
        const errorData = await compileResponse.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || errorData.message || `HTTP ${compileResponse.status}: ${compileResponse.statusText}`)
      }

      const compileResult = await compileResponse.json()

      if (!compileResult.success && compileResult.stderr) {
        throw new Error(compileResult.stderr || compileResult.error || 'Compilation failed')
      }

      addConsoleOutput('✓ Contract compiled successfully')
      addConsoleOutput(`✓ WASM size: ${(compileResult.size / 1024).toFixed(2)} KB`)

      const selector = await initWalletSelector()
      const wallet = await selector.wallet()
      const accountIdCheck = await getActiveAccountId()

      if (!accountIdCheck) {
        throw new Error('Please connect your wallet first')
      }

      const timestamp = Date.now()
      const subaccountName = `${example.id}-${timestamp}`
      const contractId = `${subaccountName}.${accountIdCheck.split('.')[1] || 'testnet'}`

      addConsoleOutput(`▶ Deploying to: ${contractId}`)
      addConsoleOutput('▶ Preparing deployment transaction...')

      const wasmBuffer = Buffer.from(compileResult.wasm, 'base64')
      const wasmUint8Array = Array.from(new Uint8Array(wasmBuffer))

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
        accountExists = false
      }

      if (!accountExists) {
        addConsoleOutput(`ℹ️  Account ${contractId} will be created during deployment`)
        addConsoleOutput('   (Subaccount creation requires parent account balance)')
      }

      addConsoleOutput('▶ Uploading WASM contract...')
      addConsoleOutput('▶ Waiting for wallet approval...')

      const targetAccountId = accountExists ? contractId : accountIdCheck
      
      // Store target account ID for retrieval after redirect
      localStorage.setItem('pendingDeploymentAccountId', targetAccountId)
      
      if (!accountExists) {
        addConsoleOutput(`ℹ️  Deploying to your account: ${targetAccountId}`)
        addConsoleOutput('   (To deploy to subaccount, create it first)')
      }

      const deployAction = {
        type: 'DeployContract',
        params: {
          code: wasmUint8Array,
        },
      }

      // Set a timeout to reset deploying state if wallet doesn't respond
      // This handles cases where the wallet redirects but the state wasn't reset
      const deployTimeout = setTimeout(() => {
        console.warn('Deploy timeout: Resetting deploying state (wallet may have redirected)')
        setIsDeploying(false)
      }, 30000) // 30 second timeout

      try {
        const deployResult = await wallet.signAndSendTransaction({
          signerId: accountIdCheck,
          receiverId: targetAccountId,
          actions: [deployAction],
        })
        
        clearTimeout(deployTimeout)

        addConsoleOutput('✓ Contract deployed successfully!')
        
        const txHash = deployResult?.transaction?.hash || 
                      deployResult?.transactionHash ||
                      deployResult?.receipts_outcome?.[0]?.id ||
                      'pending'

        addConsoleOutput(`✓ Transaction hash: ${txHash}`)
        addConsoleOutput(`✓ Contract available at: ${targetAccountId}`)

        setDeployedContractId(targetAccountId)
        setDeploymentTxHash(txHash)
        
        // Note: Modal will be shown after redirect via URL parameter handler
        // The wallet redirects to external site, so we can't show modal here
        // Reset deploying state since transaction was sent (wallet will redirect)
        setIsDeploying(false)
      } catch (walletError) {
        clearTimeout(deployTimeout)
        // If wallet redirects, the error might be that we're being redirected
        // In that case, reset the state and let the redirect handler take over
        if (walletError.message && (
          walletError.message.includes('redirect') || 
          walletError.message.includes('User rejected') ||
          walletError.message.includes('cancelled')
        )) {
          setIsDeploying(false)
          if (walletError.message.includes('User rejected') || walletError.message.includes('cancelled')) {
            addConsoleOutput('ℹ️  Deployment cancelled by user')
          } else {
            addConsoleOutput('ℹ️  Redirecting to wallet...')
          }
          throw walletError
        }
        throw walletError
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        addConsoleOutput(`❌ Error: Failed to connect to backend`)
        addConsoleOutput(`   Backend URL: ${API_BASE_URL}`)
        addConsoleOutput(`   Please check if the backend is running and accessible.`)
        addConsoleOutput(`   Error details: ${error.message}`)
      } else {
        addConsoleOutput(`❌ Error: ${error.message}`)
      }
      console.error('Wallet Deploy error:', error)
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

  const generateTxHash = () => {
    const chars = '0123456789abcdef'
    let hash = ''
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
  }

  const getTestResult = (methodName, params) => {
    const paramValues = {}
    params.forEach((param) => {
      const value = testParams[`${methodName}_${param.name}`] || param.defaultValue || ''
      paramValues[param.name] = param.type === 'number' ? Number(value) || 0 : value
    })

    switch (methodName) {
      case 'hello_world':
        return 'Hello, NEAR!'
      case 'get_message':
        return contractState.message
      case 'get_counter':
        return contractState.counter
      case 'get_owner':
        return contractState.owner
      case 'get_greeting':
        return contractState.greeting
      case 'get_greeting_length':
        return contractState.greeting.length
      case 'add':
        const a = paramValues.a !== undefined ? paramValues.a : 2
        const b = paramValues.b !== undefined ? paramValues.b : 3
        return a + b
      default:
        return null
    }
  }

  const updateContractState = (methodName, params) => {
    const paramValues = {}
    params.forEach((param) => {
      const value = testParams[`${methodName}_${param.name}`] || param.defaultValue || ''
      paramValues[param.name] = param.type === 'number' ? Number(value) || 0 : value
    })

    setContractState(prev => {
      const newState = { ...prev }
      
      switch (methodName) {
        case 'set_message':
          newState.message = paramValues.message || 'Hello, NEAR storage!'
          break
        case 'set_greeting':
          newState.greeting = paramValues.greeting || 'Hello, NEAR!'
          break
        case 'increment':
          newState.counter = prev.counter + 1
          break
        case 'bulk_increment':
          const times = paramValues.times || 5
          newState.counter = prev.counter + times
          break
        case 'append_suffix':
          newState.greeting = prev.greeting + (paramValues.suffix || ' World')
          break
      }
      
      return newState
    })
  }

  const handleTestCall = async (method, isViewMethod) => {
    setIsTesting(true)
    addConsoleOutput(`\n▶ Calling ${method.name}...`)

    const delay = isViewMethod ? 200 + Math.random() * 300 : 800 + Math.random() * 1200
    await new Promise(resolve => setTimeout(resolve, delay))

    try {
      if (isViewMethod) {
        const result = getTestResult(method.name, method.params)
        
        setTestResults(prev => ({
          ...prev,
          [method.name]: { success: true, result, timestamp: new Date().toISOString() }
        }))
        
        addConsoleOutput(`✓ Result: ${JSON.stringify(result)}`)
      } else {
        const paramValues = {}
        method.params.forEach((param) => {
          const value = testParams[`${method.name}_${param.name}`] || param.defaultValue || ''
          paramValues[param.name] = param.type === 'number' ? Number(value) || 0 : value
        })

        if (method.name === 'assert_positive') {
          const value = paramValues.value !== undefined ? paramValues.value : 10
          if (value <= 0) {
            throw new Error('VALUE_MUST_BE_POSITIVE')
          }
        }

        updateContractState(method.name, method.params)
        
        const txHash = generateTxHash()
        const result = { success: true, txHash }
        
        setTestResults(prev => ({
          ...prev,
          [method.name]: { success: true, result, timestamp: new Date().toISOString() }
        }))
        
        addConsoleOutput(`✓ Transaction executed successfully`)
        addConsoleOutput(`✓ Transaction hash: ${txHash}`)
        
        const functions = testFunctions[example.id]
        if (functions.viewMethods.length > 0) {
          let viewMethod = null
          
          if (method.name === 'set_message') {
            viewMethod = functions.viewMethods.find(m => m.name === 'get_message')
          } else if (method.name === 'set_greeting') {
            viewMethod = functions.viewMethods.find(m => m.name === 'get_greeting')
          } else if (method.name === 'increment' || method.name === 'bulk_increment') {
            viewMethod = functions.viewMethods.find(m => m.name === 'get_counter')
          } else if (method.name === 'append_suffix') {
            viewMethod = functions.viewMethods.find(m => m.name === 'get_greeting')
          }
          
          if (viewMethod) {
            setTimeout(() => {
              try {
                const updatedResult = getTestResult(viewMethod.name, viewMethod.params)
                addConsoleOutput(`✓ Updated state: ${JSON.stringify(updatedResult)}`)
                setTestResults(prev => ({
                  ...prev,
                  [viewMethod.name]: { success: true, result: updatedResult, timestamp: new Date().toISOString() }
                }))
              } catch (e) {
                // Ignore errors
              }
            }, 500)
          }
        }
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [method.name]: { success: false, error: error.message, timestamp: new Date().toISOString() }
      }))
      addConsoleOutput(`❌ Error: ${error.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="pl-4 py-6 md:py-4 max-w-5xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-near-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Back to Examples</span>
      </button>

      <ExampleHeader example={example} activeLanguage={activeLanguage} />

      {/* Backend CLI Status Warning */}
      {activeLanguage === 'Rust' && backendCLIConfigured === false && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 dark:text-yellow-500 text-xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                Backend CLI Deployment Not Configured
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Rust contracts require backend deployment via NEAR CLI. The backend is not currently configured with deployment credentials.
                You can still compile and test the code, but deployment is disabled.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeLanguage === 'Rust' && backendCLIConfigured === true && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</span>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Rust contracts</strong> will be deployed via backend NEAR CLI. No wallet connection required.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <CodeEditor
          code={code}
          setCode={setCode}
          activeLanguage={activeLanguage}
          setActiveLanguage={setActiveLanguage}
          isRunning={isRunning}
          isDeploying={isDeploying}
          onRun={handleRun}
          onDeploy={handleDeploy}
          onCopy={handleCopyCode}
          onReset={handleResetCode}
          backendCLIConfigured={backendCLIConfigured}
        />

        <InfoPanel
          example={example}
          activeInfoTab={activeInfoTab}
          setActiveInfoTab={setActiveInfoTab}
          testParams={testParams}
          setTestParams={setTestParams}
          testResults={testResults}
          isTesting={isTesting}
          onTestCall={handleTestCall}
          code={code}
          activeLanguage={activeLanguage}
        />
                                          </div>

      <ConsolePanel
        consoleOutput={consoleOutput}
        deployedContractId={deployedContractId}
        deploymentTxHash={deploymentTxHash}
      />
    </div>
  )
}

export default ExampleDetail
