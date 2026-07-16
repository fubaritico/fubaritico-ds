import type { ButtonVisualProps } from '../Button/Button.shared'
import type { LinkProps } from 'react-router-dom'

/** Props for {@link LinkButton}: Button visual props + react-router `<Link>` props (requires `to`). */
export type LinkButtonProps = ButtonVisualProps & LinkProps
