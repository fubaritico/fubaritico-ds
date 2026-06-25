import type { PropsWithChildren, ReactElement, ReactNode } from 'react'

/** Props of the {@link ConditionalWrapper} utility component. */
export interface ConditionalWrapperProps {
  /** When true, `children` are wrapped with {@link ConditionalWrapperProps.wrapper}. */
  condition: boolean
  /** Optional wrapper used when `condition` is false (otherwise children render bare). */
  defaultWrapper?: (children: ReactNode) => ReactElement
  /** Wrapper applied when `condition` is true. */
  wrapper: (children: ReactNode) => ReactElement
}

/**
 * Conditionally wraps its children in a wrapper component without duplicating the children markup.
 *
 * Useful to apply a wrapper (e.g. a Tooltip) only in some cases — such as wrapping truncated text in a
 * tooltip while leaving non-truncated text untouched.
 *
 * @param props - {@link ConditionalWrapperProps} plus `children`.
 * @returns The wrapped children when `condition` is true, the `defaultWrapper` output when provided,
 * else the bare children.
 */
export function ConditionalWrapper({
  children,
  condition,
  defaultWrapper,
  wrapper,
}: Readonly<PropsWithChildren<ConditionalWrapperProps>>): ReactElement {
  if (condition) return wrapper(children)
  if (defaultWrapper) return defaultWrapper(children)

  return <>{children}</>
}

export default ConditionalWrapper
