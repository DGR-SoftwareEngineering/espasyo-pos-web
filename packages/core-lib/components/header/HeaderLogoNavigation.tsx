import { Box } from "@mui/material";
import { Link } from "..";

interface Props {
    id?: string;
    href?: string;
    shouldNavigateToNewTab: boolean;
    disableNavigation?: boolean;
}

export const HeaderLogoNavigation: React.FC<React.PropsWithChildren<Props>> = ({
    id,
    href,
    shouldNavigateToNewTab,
    children,
    disableNavigation = false
}) => {
    if (disableNavigation) {
        return <>{children}</>
    }

    
}