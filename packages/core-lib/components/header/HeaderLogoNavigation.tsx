import { Box } from "@mui/material";
import { Link } from "..";
import { useDialogContext } from "../../core/contexts";

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

    return (
        <Link naked href={href} as={href} target={shouldNavigateToNewTab ? '_blank' : '_self'}>
            {children}
        </Link>
    )
}