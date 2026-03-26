import { useEffect, useState } from 'react'
import clsx from 'clsx'

const NETWORKS = {
  1:        { name: 'Ethereum'  },
  5:        { name: 'Goerli'    },
  11155111: { name: 'Sepolia'   },
  1337:     { name: 'Localhost'  },
  5777:     { name: 'Ganache'   },
  31337:    { name: 'Hardhat'   },
}

export default function NetworkBadge({ className }) {
  const [chainId, setChainId] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      if (!window.ethereum) return
      try {
        const id = await window.ethereum.request({ method: 'eth_chainId' })
        setChainId(parseInt(id, 16))
      } catch { /* ignore */ }
    }
    fetch()

    const onChange = (id) => setChainId(parseInt(id, 16))
    window.ethereum?.on('chainChanged', onChange)
    return () => window.ethereum?.removeListener('chainChanged', onChange)
  }, [])

  if (!chainId) return null

  const net = NETWORKS[chainId]
  const name = net?.name ?? `Chain ${chainId}`

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 text-xs font-medium text-text-muted px-2.5 py-1 rounded-lg bg-surface-400',
      className,
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-green-chain" />
      {name}
    </span>
  )
}
