import { type Row } from '@tanstack/react-table'
import { decode } from 'html-entities'
import { Fragment } from 'react'

import { TableCell } from '../../primitives/TableCell'

/**
 * Cell factory rendering an HTML-encoded string value: decodes entities and converts `<br>` tags into
 * line breaks. Uses `html-entities` for decoding.
 *
 * @param keyName - Key to read the HTML string from the row.
 * @param className - Optional extra classes for the cell.
 * @returns A TanStack cell renderer for an HTML-string column.
 */
const HtmlCell =
  (keyName: string, className?: string) =>
  <TData,>({ row }: Readonly<{ row: Row<TData> }>) => {
    const value = row.getValue<string>(keyName).replace(/&amp;/g, '&')
    const parts = decode(value).split(/<br\s*\/?>/g)

    return (
      <TableCell className={className}>
        {parts.map((part, index) => (
          <Fragment key={`${keyName}-${String(index)}`}>
            {part.trim()}
            {index < parts.length - 1 ? <br /> : null}
          </Fragment>
        ))}
      </TableCell>
    )
  }

export default HtmlCell
