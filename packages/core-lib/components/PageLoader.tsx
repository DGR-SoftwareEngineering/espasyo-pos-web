import React from "react";
import { BrandedLoader } from "./radix/BrandedLoader";

interface Props {
  message?: string;
}

export const PageLoader: React.FC<Props> = ({ message }) => (
  <BrandedLoader fullScreen withBackdrop message={message} />
);
