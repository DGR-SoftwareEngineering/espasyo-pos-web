import React from "react";
import { BrandedLoader } from "./BrandedLoader";

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message,
  fullScreen = false,
  className,
  style,
}) => {
  if (fullScreen) {
    return <BrandedLoader fullScreen withBackdrop message={message} />;
  }
  return (
    <div className={className} style={{ width: "100%", ...(style ?? {}) }}>
      <BrandedLoader fullScreen={false} message={message} />
    </div>
  );
};
