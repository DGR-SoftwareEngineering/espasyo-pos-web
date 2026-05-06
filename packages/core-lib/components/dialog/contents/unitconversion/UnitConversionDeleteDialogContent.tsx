import React, {useState} from "react";
import {Box, Button, Stack, Typography, alpha, useTheme} from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
import { useToastContext } from "../../../../core/contexts";
import { useApiCallback } from "../../../../core/hooks";
import { formatNumber } from "../../../../business";
import type {
    UnitConversionResponse as UnitConversionResponseType,
} from "core-lib/api/commons/types";

export const UnitConversionDeleteDialog: React.FC<{
    conversion: UnitConversionResponseType;
    onSuccess: () => void;
    onClose: () => void;
}> = ({
    conversion,
    onSuccess,
    onClose,
}) => {
    const [loading, setLoading] = useState(false);
    const {showToast} = useToastContext();
    const theme = useTheme();
    const deleteCb = useApiCallback(
        async (api, deleteId: string) => await api.commons.DeleteUnitConversion(deleteId),
    );

    async function handleDelete () {
        try {
            setLoading(true);

            const result = await deleteCb.execute(conversion.unitConversionID);

            if (result?.data?.success){
                showToast("Unit conversion deleted successfully", "success");
                onSuccess();
                onClose();
            } else {
                showToast(
                    result?.data?.message ?? (result?.data?.errors as string)?.[0] ??
                    "Failed to delete unit conversion",
                    "error",
                );
            }
        } catch (error: any) {
            showToast(
                error?.response?.data?.message ??
                (error?.response?.data?.errors as string[] | undefined)?.[0] ??
                error?.message ??
                "Failed to delete unit conversion:", "error");
        } finally {
            setLoading(false);
        }
    };
    return(
        
        <Stack spacing={2.5}>
            <Box
            sx={{
                P: 3,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
                border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.14)}`,
            }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <DeleteOutline color="error" />
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Delete Unit Conversion
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            This action cannot be undone.
                        </Typography>
                    </Box>
                </Stack>
            </Box>
            <Box>
                <Typography variant="body1" sx={{mb: 3, color: theme.palette.text.secondary}}>
                    Are you sure you want to delete this conversion?
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} sx={{mt:1}}>
                    {conversion.fromUnitName} → {conversion.toUnitName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    1 {conversion.fromUnitName} = {formatNumber(conversion.conversionRate, 4)} {""}
                    {conversion.toUnitName}
                </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button variant="outlined" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                </Button>
            </Stack>
            </Stack>
            
    );
};