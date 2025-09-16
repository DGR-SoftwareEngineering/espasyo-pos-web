import { Box, Typography } from "@mui/material";
import { useResolution } from "../../core/hooks";
import Image from 'next/image';
import { externalImageLoader } from "../../business/images";

interface Props {
    disableNavigation?: boolean;
    useRawLogoUrl?: boolean;
}

export const HeaderLogo: React.FC<Props> = ({ useRawLogoUrl ,disableNavigation = false }) => {
    const { isMobile } = useResolution();
    // define logo implementation for this generic header.
    const cursorIcon = disableNavigation ? 'default' : 'pointer';
    const imageSrc = useRawLogoUrl ? "logo-url" : isMobile ? "mobile-logo-src" : "desktop-logo-src"

    return (
        <Box
            position='relative'
            sx={{ cursor: cursorIcon }}
            width="100%"
            height="auto"
            role="button"
        >
            {/* Add condition if logo and image source is present. Show <Image /> */}
            {imageSrc ? (
                <Image 
                    data-testid="header_logo_image"
                    src={imageSrc || ''}
                    loader={externalImageLoader}
                    key={`${isMobile ? 'mobile' : 'desktop'}-logo`}
                    height={isMobile ? 28 : 0 || 46}
                    width={100}
                    alt={'logo-alt'}
                    style={{ objectFit: 'contain', objectPosition: 'position', width: 'auto' }}
                />
            ): (
                <Typography
                    variant="h3"
                    component="span"
                    fontWeight="bold"
                    color="primary"
                    noWrap
                    fontSize={theme => ({
                        xs: theme.typography.h6.fontSize,
                        sm: theme.typography.h4.fontSize,
                        md: theme.typography.h3.fontSize
                    })}
                >
                    Header Text Value
                </Typography>
            )}
        </Box>
    )
}