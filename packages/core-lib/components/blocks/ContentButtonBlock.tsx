import { Box, LinkProps, SxProps, Theme } from "@mui/material";
import qs from "query-string";
import React, { MouseEvent } from "react";
import { Button, LinkButton } from "../buttons";
import { getHrefLink } from "../../business/links";
import { openInNewTab, openInNewWindow } from "../../business/navigation";
import { useResolution } from "../../core/hooks";
import { useRouter } from "../../core/router";
import { ContentButtonText } from "./ContentButtonText";
import { ButtonType } from "../../api/content/types/common";

interface Props {
  id?: string;
  link?: string;
  anchor?: string;
  linkKey?: string;
  type?: ButtonType;
  text?: string | React.ReactNode;
  disabled?: boolean;
  disabledReason?: string;
  queryParams?: { [key: string]: string };
  reuseUrlParameters?: boolean;
  openInTheNewTab?: boolean;
  iconName?: string;
  rightSideIcon?: boolean;
  widthPercentage?: number;
  linkFontSize?: LinkProps["fontSize"];
  largeIcon?: boolean;
  onAsyncCallback?(): Promise<void>;
  buttonRef?: React.RefObject<HTMLAnchorElement | HTMLButtonElement>;
  sxProps?: SxProps<Theme>;
  loading?: boolean;
  customActionParams?: string;
  customActionKey?: string;
}

export const ContentButtonBlock: React.FC<Props> = ({
  id,
  iconName,
  rightSideIcon,
  anchor,
  type,
  text,
  link,
  linkKey,
  disabled,
  disabledReason,
  queryParams,
  widthPercentage,
  openInTheNewTab,
  reuseUrlParameters,
  loading,
  linkFontSize,
  onAsyncCallback,
  largeIcon,
  buttonRef,
  sxProps,
  customActionParams,
  customActionKey,
}) => {
  const router = useRouter();
  const { isMobile } = useResolution();
  const width = widthPercentage
    ? `${widthPercentage}%`
    : isMobile
    ? " 100%"
    : "unset";
  const href = "" + (getHrefLink(link) || link) + anchor;
  const hrefProp = href !== "undefined" && href ? { href } : {};
  const hasIcon = !!iconName;

  if (type === "Link") {
    return (
      <LinkButton
        id={id}
        linkRef={buttonRef as React.RefObject<HTMLAnchorElement>}
        data-testid="content-button-block"
        width={width}
        variant="body1"
        disabled={disabled}
        href={href}
        onClick={onLinkClick}
        customActionKey={customActionKey}
        customActionParams={customActionParams}
        sx={
          hasIcon
            ? { display: "inline-flex", alignItems: "center", ...sxProps }
            : { ...sxProps }
        }
        fontSize={linkFontSize}
        text={
          <ContentButtonText
            text={text}
            iconName={iconName}
            isRightSided={rightSideIcon}
            isLargeIcon={largeIcon}
          />
        }
      />
    );
  }

  if (type === "ButtonWithIcon") {
    return (
      <Box
        display="flex"
        sx={
          hasIcon
            ? { display: "inline-flex", alignItems: "center", ...sxProps }
            : { ...sxProps }
        }
      >
        <LinkButton
          id={id}
          linkRef={buttonRef as React.RefObject<HTMLAnchorElement>}
          data-testid="content-button-block"
          width={width}
          variant="body1"
          disabled={disabled}
          customActionKey={customActionKey}
          customActionParams={customActionParams}
          href={href}
          onClick={onLinkClick}
          fontSize={linkFontSize}
          sx={{
            textDecoration: "none",
            "&:hover": {
              textDecoration: "none",
            },
          }}
          text={text}
        />
        <ContentButtonText
          text={text}
          iconName={iconName}
          isRightSided={rightSideIcon}
          isLargeIcon={largeIcon}
          onClick={onLinkClick}
        />
      </Box>
    );
  }

  return (
    <Button
      id={id}
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      data-testid="content-button-block"
      loading={loading || router.loading}
      customActionKey={customActionKey}
      disabled={disabled}
      disabledReason={disabledReason}
      onClick={navigate}
      width={width}
      type={type}
      sx={{ whiteSpace: { md: "nowrap" }, ...sxProps }}
      {...hrefProp}
    >
      <ContentButtonText
        text={text}
        iconName={iconName}
        isRightSided={rightSideIcon}
        isLargeIcon={largeIcon}
      />
    </Button>
  );

  async function onLinkClick(
    e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) {
    if (
      (e.target as HTMLAnchorElement).href?.startsWith("mailto:") ||
      (e.target as HTMLAnchorElement).href?.startsWith("tel:")
    ) {
      window.open((e.target as HTMLAnchorElement).href);
      return;
    }
    e.preventDefault();
    await navigate();
  }

  async function navigate() {
    if (onAsyncCallback) {
      return await onAsyncCallback();
    }

    if (getHrefLink(href)) {
      return null;
    }

    if (openInTheNewTab) {
      return openInNewWindow("file-url-here");
    }

    if (!link || getHrefLink(link)) {
      return;
    }

    if (link) {
      return navigateToPage("/" + link + anchor);
    }
  }

  async function navigateToPage(redirectUrl: string) {
    const fullLink = reuseUrlParameters
      ? qs.stringifyUrl({ url: redirectUrl, query: queryParams })
      : redirectUrl;
    openInTheNewTab ? openInNewTab(fullLink) : await router.push(fullLink);
  }
};
