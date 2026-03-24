const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/shop.php", destination: "/shop", permanent: true },
      { source: "/cart.php", destination: "/cart", permanent: true },
      { source: "/upload.php", destination: "/upload", permanent: true },
      { source: "/about.php", destination: "/about", permanent: true },
      { source: "/contact.php", destination: "/contact", permanent: true },
      { source: "/login.php", destination: "/login", permanent: true },
      { source: "/logout.php", destination: "/logout", permanent: true },
      {
        source: "/admin/dashboard.php",
        destination: "/admin",
        permanent: true,
      },
      { source: "/admin/products.php", destination: "/admin", permanent: true },
      { source: "/get_products.php", destination: "/shop", permanent: true },
      { source: "/setup.php", destination: "/", permanent: true },
      { source: "/process_order.php", destination: "/upload", permanent: true },
    ];
  },
};

export default nextConfig;
