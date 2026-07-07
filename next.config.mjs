/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Optional peer deps pulled in by wagmi connectors/WalletConnect/viem that
    // we don't use (React Native storage, pino-pretty, dynamic chain configs).
    config.externals = [...(config.externals ?? []), "pino-pretty", "@react-native-async-storage/async-storage"];
    config.ignoreWarnings = [{ message: /Critical dependency: the request of a dependency is an expression/ }];
    return config;
  },
};

export default nextConfig;
