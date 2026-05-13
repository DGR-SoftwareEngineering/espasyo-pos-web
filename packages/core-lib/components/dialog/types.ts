// The authoritative DialogContentType lives in `api/content/types/common.ts`
// (it's derived from `keyof DialogDataType`, so it stays in sync with the dialog
// data map). Re-export here for backwards compatibility with existing consumers.
export type { DialogContentType } from "../../api/content/types/common";
