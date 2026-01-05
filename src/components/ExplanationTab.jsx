import React from 'react'
import { getContractExplanation } from '../data/contractExplanations'

function ExplanationTab({ example }) {
  const explanation = getContractExplanation(example.id)
  
  return (
    <div className="space-y-4 flex-1 overflow-auto">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          {example.name}
        </h2>
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Contract Explanation
        </p>
      </div>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
        {explanation}
      </p>
    </div>
  )
}

export default ExplanationTab

