// tailwind.config.js
// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  // Modo oscuro basado en clase (para control manual)
  darkMode: 'class',
  
  // Contenido a analizar para clases de Tailwind
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.html",
    "./src/**/*.md",
    "./public/**/*.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}"
  ],
  
  // Seguridad: evitar que Tailwind elimine clases dinámicas
  safelist: [
    // Colores de texto dinámicos
    'text-primary',
    'text-secondary',
    'text-success',
    'text-error',
    'text-warning',
    'text-info',
    
    // Colores de fondo dinámicos
    'bg-primary',
    'bg-secondary',
    'bg-success',
    'bg-error',
    'bg-warning',
    'bg-info',
    
    // Estados de productos
    'in-stock',
    'out-of-stock',
    'low-stock',
    'pre-order',
    
    // Badges de pedidos
    'status-pending',
    'status-processing',
    'status-shipped',
    'status-delivered',
    'status-completed',
    'status-cancelled',
    'status-refunded',
    
    // Animaciones
    'animate-fade-in',
    'animate-slide-up',
    'animate-slide-down',
    'animate-pulse-slow',
    
    // Patrones de grid
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'grid-cols-5',
    'grid-cols-6',
    'grid-cols-7',
    'grid-cols-8',
    'grid-cols-9',
    'grid-cols-10',
    'grid-cols-11',
    'grid-cols-12',
    
    // Spacing dinámico
    ...[...Array(20)].map((_, i) => `space-y-${i + 1}`),
    ...[...Array(20)].map((_, i) => `space-x-${i + 1}`),
    ...[...Array(20)].map((_, i) => `gap-${i + 1}`),
    ...[...Array(20)].map((_, i) => `m-${i + 1}`),
    ...[...Array(20)].map((_, i) => `p-${i + 1}`),
    ...[...Array(20)].map((_, i) => `mt-${i + 1}`),
    ...[...Array(20)].map((_, i) => `mb-${i + 1}`),
    ...[...Array(20)].map((_, i) => `ml-${i + 1}`),
    ...[...Array(20)].map((_, i) => `mr-${i + 1}`),
    
    // Tamaños de texto dinámicos
    ...[...Array(10)].map((_, i) => `text-${i + 1}xl`),
  ],
  
  theme: {
    // Pantallas/breakpoints responsive
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    
    // Colores personalizados
    colors: {
      // Colores base (usando variables CSS para soporte de modo oscuro)
      transparent: 'transparent',
      current: 'currentColor',
      
      // Sistema de colores principal
      primary: {
        50: 'var(--primary-50)',
        100: 'var(--primary-100)',
        200: 'var(--primary-200)',
        300: 'var(--primary-300)',
        400: 'var(--primary-400)',
        500: 'var(--primary-500)',
        600: 'var(--primary-600)',
        700: 'var(--primary-700)',
        800: 'var(--primary-800)',
        900: 'var(--primary-900)',
        DEFAULT: 'var(--primary-500)',
      },
      secondary: {
        50: 'var(--secondary-50)',
        100: 'var(--secondary-100)',
        200: 'var(--secondary-200)',
        300: 'var(--secondary-300)',
        400: 'var(--secondary-400)',
        500: 'var(--secondary-500)',
        600: 'var(--secondary-600)',
        700: 'var(--secondary-700)',
        800: 'var(--secondary-800)',
        900: 'var(--secondary-900)',
        DEFAULT: 'var(--secondary-500)',
      },
      success: {
        50: 'var(--success-50)',
        100: 'var(--success-100)',
        200: 'var(--success-200)',
        300: 'var(--success-300)',
        400: 'var(--success-400)',
        500: 'var(--success-500)',
        600: 'var(--success-600)',
        700: 'var(--success-700)',
        800: 'var(--success-800)',
        900: 'var(--success-900)',
        DEFAULT: 'var(--success-500)',
      },
      error: {
        50: 'var(--error-50)',
        100: 'var(--error-100)',
        200: 'var(--error-200)',
        300: 'var(--error-300)',
        400: 'var(--error-400)',
        500: 'var(--error-500)',
        600: 'var(--error-600)',
        700: 'var(--error-700)',
        800: 'var(--error-800)',
        900: 'var(--error-900)',
        DEFAULT: 'var(--error-500)',
      },
      warning: {
        50: 'var(--warning-50)',
        100: 'var(--warning-100)',
        200: 'var(--warning-200)',
        300: 'var(--warning-300)',
        400: 'var(--warning-400)',
        500: 'var(--warning-500)',
        600: 'var(--warning-600)',
        700: 'var(--warning-700)',
        800: 'var(--warning-800)',
        900: 'var(--warning-900)',
        DEFAULT: 'var(--warning-500)',
      },
      info: {
        50: 'var(--info-50)',
        100: 'var(--info-100)',
        200: 'var(--info-200)',
        300: 'var(--info-300)',
        400: 'var(--info-400)',
        500: 'var(--info-500)',
        600: 'var(--info-600)',
        700: 'var(--info-700)',
        800: 'var(--info-800)',
        900: 'var(--info-900)',
        DEFAULT: 'var(--info-500)',
      },
      
      // Colores neutros
      white: '#ffffff',
      black: '#000000',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
        DEFAULT: '#6b7280',
      },
      
      // Colores de fondo y texto (con variables CSS)
      background: {
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        tertiary: 'var(--bg-tertiary)',
        card: 'var(--bg-card)',
        input: 'var(--bg-input)',
      },
      text: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        disabled: 'var(--text-disabled)',
        inverse: 'var(--text-inverse)',
      },
      border: {
        DEFAULT: 'var(--border-color)',
        light: 'var(--border-light)',
        dark: 'var(--border-dark)',
      },
    },
    
    // Extensión de la configuración base
    extend: {
      // Fuentes
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      
      // Tamaños de fuente
      fontSize: {
        'xxs': '0.625rem',     // 10px
        'xs': '0.75rem',       // 12px
        'sm': '0.875rem',      // 14px
        'base': '1rem',        // 16px
        'lg': '1.125rem',      // 18px
        'xl': '1.25rem',       // 20px
        '2xl': '1.5rem',       // 24px
        '3xl': '1.875rem',     // 30px
        '4xl': '2.25rem',      // 36px
        '5xl': '3rem',         // 48px
        '6xl': '3.75rem',      // 60px
        '7xl': '4.5rem',       // 72px
        '8xl': '6rem',         // 96px
        '9xl': '8rem',         // 128px
      },
      
      // Espaciado
      spacing: {
        '0': '0px',
        'px': '1px',
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '3.5': '0.875rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
        '18': '4.5rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '44': '11rem',
        '48': '12rem',
        '52': '13rem',
        '56': '14rem',
        '60': '15rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
      },
      
      // Border radius
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'full': '9999px',
      },
      
      // Sombras
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': 'none',
        
        // Sombras personalizadas
        'card': '0 2px 4px rgba(0,0,0,0.1)',
        'card-hover': '0 10px 20px rgba(0,0,0,0.1)',
        'dropdown': '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        'modal': '0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)',
        'button': '0 1px 2px rgba(0,0,0,0.05)',
        'button-hover': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
      },
      
      // Animaciones
      animation: {
        // Fade
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'fade-in-left': 'fadeInLeft 0.5s ease-out',
        'fade-in-right': 'fadeInRight 0.5s ease-out',
        
        // Slide
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        
        // Scale
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
        
        // Rotate
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 0.5s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        
        // Shimmer/Loading
        'shimmer': 'shimmer 2s infinite',
        'loading': 'loading 1.5s ease-in-out infinite',
        
        // Notification
        'toast-in': 'toastIn 0.3s ease-out',
        'toast-out': 'toastOut 0.3s ease-in',
        
        // Modal
        'modal-in': 'modalIn 0.2s ease-out',
        'modal-out': 'modalOut 0.2s ease-out',
        
        // Hover
        'hover-grow': 'hoverGrow 0.3s ease-in-out',
        'hover-shrink': 'hoverShrink 0.3s ease-in-out',
        
        // Skeleton
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      
      // Keyframes para animaciones
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        loading: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        toastIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        toastOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        modalIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        modalOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        hoverGrow: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        hoverShrink: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.95)' },
        },
        skeleton: {
          '0%': { backgroundColor: 'var(--bg-secondary)' },
          '50%': { backgroundColor: 'var(--bg-tertiary)' },
          '100%': { backgroundColor: 'var(--bg-secondary)' },
        },
      },
      
      // Transiciones
      transitionProperty: {
        'height': 'height',
        'width': 'width',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        '0': '0ms',
        '2000': '2000ms',
        '3000': '3000ms',
      },
      transitionDelay: {
        '0': '0ms',
      },
      
      // Z-index
      zIndex: {
        '0': 0,
        '10': 10,
        '20': 20,
        '30': 30,
        '40': 40,
        '50': 50,
        'auto': 'auto',
        'dropdown': 1000,
        'sticky': 1020,
        'modal': 1050,
        'popover': 1060,
        'tooltip': 1070,
        'toast': 1080,
      },
      
      // Opacidad
      opacity: {
        '0': '0',
        '5': '0.05',
        '10': '0.1',
        '20': '0.2',
        '25': '0.25',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '75': '0.75',
        '80': '0.8',
        '90': '0.9',
        '95': '0.95',
        '100': '1',
      },
      
      // Backdrop blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      
      // Gradientes
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': "url('/images/hero-pattern.svg')",
        'dot-pattern': "url('/images/dot-pattern.svg')",
      },
      
      // Contenedor
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      
      // Variantes
      variants: {
        extend: {
          backgroundColor: ['active', 'group-hover', 'focus-within'],
          opacity: ['disabled', 'group-hover'],
          cursor: ['disabled'],
          scale: ['active', 'group-hover'],
          transform: ['hover', 'focus'],
        },
      },
    },
  },
  
  // Plugins de Tailwind
  plugins: [
    // Formas (para componentes más complejos)
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
    
    // Plugin personalizado para scrollbar
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-default': {
          '-ms-overflow-style': 'auto',
          'scrollbar-width': 'auto',
          '&::-webkit-scrollbar': {
            display: 'block',
          },
        },
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        '.text-shadow-md': {
          textShadow: '0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
        },
        '.text-shadow-lg': {
          textShadow: '0 15px 30px rgba(0,0,0,0.11), 0 5px 15px rgba(0,0,0,0.08)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      });
    },
  ],
};