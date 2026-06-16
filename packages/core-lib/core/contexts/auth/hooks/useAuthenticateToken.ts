import React, { useEffect, useState } from 'react'
import { useAccessToken } from '../hooks'
import { useApi } from '../../../hooks'

export const useAuthenticateToken = () => {
    const [accessToken] = useAccessToken();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const validateTokenCb = useApi(
        async (api) =>
        accessToken ? await api.authentication.validateToken() : null,
        [accessToken],
    );

    useEffect(() => {
        if (validateTokenCb.result?.data.success !== undefined) {
            setIsAuthenticated(!!(accessToken && validateTokenCb.result.data.success));
        }
      }, [accessToken, validateTokenCb.result]);

    return {
        isAuthenticated,
        loading: validateTokenCb.loading,
    }
}