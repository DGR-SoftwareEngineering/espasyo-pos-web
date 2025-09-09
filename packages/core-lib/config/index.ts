import getConfig from 'next/config'

const {
    publicRuntimeConfig: { processEnv },
    serverRuntimeConfig
} = getConfig();

export const config = {
    get value() {
        return {
            NODE_ENV: process.env.NODE_ENV!
        }
    }
}