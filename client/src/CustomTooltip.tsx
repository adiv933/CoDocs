import { Tooltip, TooltipProps, tooltipClasses } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ReactElement } from "react";

interface CustomTooltipProps {
    title: string;
    children: ReactElement;
}

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: "black",
        color: "white",
        fontSize: "0.875rem",
        padding: "0.25rem 0.75rem",
        borderRadius: "0.5rem",
        fontFamily: `"IBM Plex Mono", monospace`,
    },
}));

function CustomTooltip({ title, children }: CustomTooltipProps) {
    return (
        <StyledTooltip title={title}>
            {children}
        </StyledTooltip>
    );
}

export default CustomTooltip;
