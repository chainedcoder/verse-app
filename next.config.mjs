/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/dash/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/settings/profile',
        destination: '/dash/account/basic-info',
        permanent: true,
      },
      {
        source: '/settings/account',
        destination: '/dash/account/basic-info',
        permanent: true,
      },
      {
        source: '/settings/preferences',
        destination: '/dash/account/preferences',
        permanent: true,
      },
      {
        source: '/settings/sessions',
        destination: '/dash/account/recent-devices',
        permanent: true,
      },
      {
        source: '/settings/support',
        destination: '/dash/support/tickets',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/dash/account/basic-info',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
