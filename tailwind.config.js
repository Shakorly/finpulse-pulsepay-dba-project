/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}','./components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:   { 950:'#020509',900:'#050A14',800:'#0A1220',700:'#111B2E',600:'#182540' },
        slate: { wire:'#253A55',muted:'#3D5A7A',ghost:'#5A7A9A',soft:'#7A9AB8' },
        pulse: { DEFAULT:'#0EA5E9',dim:'#0284C7',dark:'#075985' },
        green: { DEFAULT:'#10B981',dim:'#059669',dark:'#065F46' },
        red:   { DEFAULT:'#EF4444',dim:'#DC2626',dark:'#991B1B' },
        gold:  { DEFAULT:'#F59E0B',dim:'#D97706',dark:'#92400E' },
        volt:  { DEFAULT:'#00E5A0',dim:'#00B87D' }
      },
      fontFamily: {
        sans: ['Inter','sans-serif'],
        mono: ['JetBrains Mono','monospace']
      }
    }
  },
  plugins: []
}
