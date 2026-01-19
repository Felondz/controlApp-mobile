/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 requires this
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Responsive breakpoints for tablets
      screens: {
        'sm': '375px',   // Phone
        'md': '768px',   // Tablet (iPad Mini)
        'lg': '1024px',  // Tablet Large (iPad Pro)
        'xl': '1280px',  // Desktop (web)
      },
    },
  },
  plugins: [],
}
