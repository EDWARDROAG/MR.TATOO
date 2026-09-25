# CoreX

Proyecto de ventas y mantenimiento.
# 🚀 MiApp - Frontend

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-1.9-764ABC?logo=redux)](https://redux-toolkit.js.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📋 Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts Disponibles](#scripts-disponibles)
- [Variables de Entorno](#variables-de-entorno)
- [Desarrollo](#desarrollo)
- [Build y Despliegue](#build-y-despliegue)
- [Pruebas](#pruebas)
- [Estilos](#estilos)
- [API Integration](#api-integration)
- [Autenticación](#autenticación)
- [PWA](#pwa)
- [Solución de Problemas](#solución-de-problemas)
- [Contribución](#contribución)
- [Licencia](#licencia)

## 🎯 Descripción General

Frontend moderno de MiApp, una plataforma de comercio electrónico construida con React 18, TypeScript y Vite. Proporciona una experiencia de usuario fluida y responsiva con características como carrito de compras, autenticación, paneles de administración, y procesamiento de pagos.

### Demo en Vivo
- **Producción**: [https://miapp.com](https://miapp.com)
- **Staging**: [https://staging.miapp.com](https://staging.miapp.com)

## ✨ Características

### Core Features
- ✅ **Autenticación completa** (Login, Registro, Recuperación de contraseña)
- ✅ **Panel de administración** con métricas y gestión
- ✅ **Carrito de compras** persistente
- ✅ **Procesamiento de pagos** (Stripe, PayPal)
- ✅ **Búsqueda avanzada** con filtros
- ✅ **Sistema de reseñas** y calificaciones
- ✅ **Dashboard de usuario** con historial de pedidos
- ✅ **Gestión de productos** y categorías
- ✅ **Modo oscuro/claro** (persistente)
- ✅ **PWA** (Progressive Web App)
- ✅ **Notificaciones en tiempo real** (WebSockets)
- ✅ **Internacionalización** (Español/Inglés)
- ✅ **Diseño responsivo** (Mobile First)

### Performance
- ⚡ **Code splitting** automático
- 🚀 **Lazy loading** de rutas y componentes
- 📦 **Optimización de imágenes** (WebP, lazy loading)
- 🎯 **Core Web Vitals** optimizados
- 🔍 **SEO friendly** con meta tags dinámicos

### Seguridad
- 🔒 **JWT** para autenticación
- 🛡️ **CSRF protection**
- 📝 **Rate limiting** en peticiones API
- 🔐 **HTTPS** forzado en producción
- 🚫 **Protección XSS y XSRF**

## 🛠️ Tecnologías

### Frontend Framework
- **React 18** - Biblioteca UI
- **TypeScript 5** - Tipado estático
- **Vite 5** - Build tool y dev server

### State Management
- **Redux Toolkit** - Estado global
- **React Query** - Caché de API
- **Zustand** - Estado local complejo (optativo)

### Routing
- **React Router DOM v6** - Enrutamiento

### UI & Styling
- **TailwindCSS 3** - Framework CSS
- **Material-UI (MUI)** - Componentes UI (opcional)
- **Framer Motion** - Animaciones

### Formularios
- **React Hook Form** - Manejo de formularios
- **Yup** - Validación de esquemas

### API & HTTP
- **Axios** - Cliente HTTP
- **Socket.io-client** - WebSockets

### Testing
- **Vitest** - Framework de pruebas
- **React Testing Library** - Testing de componentes
- **Jest** - Testing unitario

### PWA & Optimización
- **Vite PWA Plugin** - Service Worker
- **Workbox** - Estrategias de caché

## 📋 Requisitos Previos

- **Node.js**: v18.0.0 o superior
- **npm**: v8.0.0 o superior (o yarn/pnpm)
- **Git**: Para clonar el repositorio

## 🚀 Instalación

### Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/mi-app-frontend.git
cd mi-app-frontend# CoreX
