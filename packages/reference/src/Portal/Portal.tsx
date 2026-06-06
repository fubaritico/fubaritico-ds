import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import type { FC, PropsWithChildren } from 'react'

export interface PortalProps {
  /** Optional id for the portal child container */
  id?: string
}

const Portal: FC<PropsWithChildren<PortalProps>> = ({ children, id }) => {
  const [container] = useState(() => {
    const el = document.createElement('div')
    if (id) el.id = id
    return el
  })

  useEffect(() => {
    let portalRoot = document.getElementById('portal')
    if (!portalRoot) {
      portalRoot = document.createElement('div')
      portalRoot.id = 'portal'
      document.body.appendChild(portalRoot)
    }

    portalRoot.appendChild(container)

    return () => {
      container.remove()
      if (portalRoot.childNodes.length === 0) {
        portalRoot.remove()
      }
    }
  }, [container, id])

  return createPortal(children, container)
}

export default Portal
