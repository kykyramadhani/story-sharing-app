module.exports = {
  content: ['./src/**/*.{html,js}', './public/index.html'],
  safelist: [
    'translate-x-0',
    '-translate-x-full'
  ],
  theme: {
    extend: {
      colors: {
        'custom-light-pink': '#FF8282', 
        'custom-dark-pink': '#FF6363',  
        'custom-light-green': '#BEE4D0',
        'custom-lighter-green': '#DBFFCB', 
      },
    },
  },
  plugins: [],
};