/**
 * The former shadcn-style table primitives (`Table`, `TableVirtualized`, `TableHeader`, `TableBody`,
 * `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`) have been extracted, one folder
 * each, to `DataTable/components/*` and modernized (React 19 ref-as-prop + `ComponentProps`, the
 * hand-rolled `elementProps` helper dropped in favour of destructuring).
 *
 * This file is kept intentionally (not deleted yet): the `cn` class-name utility still lives beside it
 * in `./utils` and is imported by the extracted primitives. A follow-up step will move the pure utility
 * functions into a dedicated `DataTable/utils/` sub-directory, after which this `ui/` folder can go.
 */
export {}
