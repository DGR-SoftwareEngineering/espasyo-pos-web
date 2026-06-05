import { MessageType } from "./types";

export const messageRole = (type: MessageType) =>
  ({
    [MessageType.Info]: "mark",
    [MessageType.Success]: "mark",
    [MessageType.Problem]: "alert",
    [MessageType.Warning]: "alert",
    [MessageType.Note]: "mark",
  })[type];
