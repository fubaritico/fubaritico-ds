import clsx from 'clsx'

export interface SpinnerProps {
  className?: string
}

function Spinner({ className }: Readonly<SpinnerProps>) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'ui:size-12 ui:rounded-full ui:border-4 ui:border-white/20 ui:border-t-white ui:animate-spin',
        className
      )}
    />
  )
}

export default Spinner
