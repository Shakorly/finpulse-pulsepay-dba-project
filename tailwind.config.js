/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}','./components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:    { 950:'#03060C', 900:'#060C18', 800:'#0D1526', 700:'#162035', 600:'#1F2E48' },
        slate:  { wire:'#2A3D55', muted:'#4A6280', ghost:'#6B8098', soft:'#8FA4B8' },
        volt:   { DEFAULT:'#00E5A0', dim:'#00B87D', dark:'#007A52' },
        plasma: { DEFAULT:'#4A9EFF', dim:'#2B6FCE', dark:'#1A4A9A' },
        ember:  { DEFAULT:'#FF6B35', dim:'#CC4D1F', dark:'#8A2F0E' },
        gold:   { DEFAULT:'#FFB800', dim:'#CC8F00', dark:'#7A5500' },
        rose:   { DEFAULT:'#FF4560', dim:'#CC2640', dark:'#8A0F25' }
      },
      fontFamily: {
        display: ['var(--font-display)','sans-serif'],
        mono:    ['var(--font-mono)','monospace']
      }
    }
  },
  plugins: []
}
