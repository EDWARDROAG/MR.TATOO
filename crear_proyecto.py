#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys

# Estructura completa del proyecto
ESTRUCTURA = {
    # BACKEND
    "backend/src/controllers": [
        "authController.js",
        "productController.js",
        "categoryController.js",
        "saleController.js",
        "userController.js",
        "reportController.js",
        "uploadController.js",
        "backupController.js"
    ],
    "backend/src/routes": [
        "authRoutes.js",
        "productRoutes.js",
        "categoryRoutes.js",
        "saleRoutes.js",
        "userRoutes.js",
        "reportRoutes.js",
        "backupRoutes.js"
    ],
    "backend/src/middlewares": [
        "authMiddleware.js",
        "roleMiddleware.js",
        "uploadMiddleware.js",
        "validationMiddleware.js",
        "errorMiddleware.js"
    ],
    "backend/src/models": [
        "index.js",
        "User.js",
        "Product.js",
        "Category.js",
        "Sale.js",
        "SaleItem.js",
        "Log.js"
    ],
    "backend/src/utils": [
        "generateToken.js",
        "hashPassword.js",
        "comparePassword.js",
        "imageOptimizer.js",
        "invoiceGenerator.js",
        "whatsappLink.js",
        "logger.js",
        "backupManager.js",
        "validators.js"
    ],
    "backend/src/config": [
        "database.js",
        "multer.js",
        "sharp.js",
        "printer.js"
    ],
    "backend/src/seeds": [
        "adminSeeder.js"
    ],
    "backend/uploads/productos": [],
    "backend/uploads/comprobantes": [],
    "backend/backups/database": [],
    "backend/backups/uploads": [],
    "backend/logs": [],
    
    # FRONTEND
    "frontend/public": [
        "logo.png",
        "favicon.ico",
        "index.html"
    ],
    "frontend/src/pages/Public": [
        "HomePage.jsx",
        "ProductsPage.jsx",
        "ProductDetailPage.jsx",
        "MaintenancePage.jsx",
        "ContactPage.jsx"
    ],
    "frontend/src/pages/Admin": [
        "AdminDashboard.jsx",
        "AdminProducts.jsx",
        "AdminCategories.jsx",
        "AdminUsers.jsx",
        "AdminSales.jsx",
        "AdminReports.jsx",
        "AdminLogs.jsx",
        "AdminBackup.jsx",
        "AdminSettings.jsx"
    ],
    "frontend/src/pages/Cajero": [
        "CajeroPOS.jsx",
        "CajeroCart.jsx",
        "CajeroPaymentModal.jsx",
        "CajeroUploadReceipt.jsx",
        "CajeroHistory.jsx"
    ],
    "frontend/src/components/common": [
        "Navbar.jsx",
        "Footer.jsx",
        "Sidebar.jsx",
        "ProductCard.jsx",
        "FilterBar.jsx",
        "SearchBar.jsx",
        "ThemeToggle.jsx",
        "LoadingSpinner.jsx",
        "ErrorAlert.jsx",
        "SuccessToast.jsx"
    ],
    "frontend/src/components/admin": [
        "ProductForm.jsx",
        "CategoryForm.jsx",
        "UserForm.jsx",
        "SalesTable.jsx",
        "ReportFilters.jsx",
        "StatsCard.jsx"
    ],
    "frontend/src/components/cajero": [
        "ProductSearch.jsx",
        "CartItem.jsx",
        "PaymentSelector.jsx",
        "ReceiptUploader.jsx"
    ],
    "frontend/src/context": [
        "AuthContext.jsx",
        "ThemeContext.jsx",
        "CartContext.jsx",
        "ProductContext.jsx"
    ],
    "frontend/src/hooks": [
        "useAuth.js",
        "useProducts.js",
        "useSales.js",
        "useCategories.js",
        "useWhatsApp.js"
    ],
    "frontend/src/services": [
        "api.js",
        "authService.js",
        "productService.js",
        "saleService.js",
        "userService.js",
        "reportService.js",
        "uploadService.js"
    ],
    "frontend/src/utils": [
        "formatters.js",
        "validators.js",
        "constants.js",
        "whatsappHelper.js"
    ],
    "frontend/src/styles": [
        "globals.css",
        "theme.css"
    ],
    
    # DATABASE
    "database/migrations": [
        "20260521000001_create_users.sql",
        "20260521000002_create_categories.sql",
        "20260521000003_create_products.sql",
        "20260521000004_create_sales.sql",
        "20260521000005_create_sale_items.sql",
        "20260521000006_create_logs.sql"
    ],
    "database/seeds": [
        "01_categories.sql",
        "02_admin_user.sql",
        "03_sample_products.sql"
    ],
    "database/scripts": [
        "backup.sh",
        "restore.sh",
        "migrate.sh"
    ],
    
    # SCRIPTS PRINCIPALES
    "scripts": [
        "deploy.sh",
        "setup.sh",
        "monitor.sh"
    ],
    
    # DOCUMENTACIÓN
    "docs": [
        "INSTALLATION.md",
        "ADMIN_GUIDE.md",
        "CAJERO_GUIDE.md",
        "API_DOCS.md",
        "DEPLOYMENT.md",
        "TROUBLESHOOTING.md"
    ],
    
    # DOCKER (opcional)
    "docker": [
        "Dockerfile.backend",
        "Dockerfile.frontend",
        "docker-compose.yml",
        "nginx.conf"
    ]
}

# Archivos en la raíz del proyecto
ARCHIVOS_RAIZ = [
    "backend/.env",
    "backend/.gitignore",
    "backend/package.json",
    "backend/package-lock.json",
    "backend/README.md",
    "frontend/.env",
    "frontend/.gitignore",
    "frontend/package.json",
    "frontend/package-lock.json",
    "frontend/tailwind.config.js",
    "frontend/postcss.config.js",
    "frontend/vite.config.js",
    "frontend/README.md",
    ".gitignore",
    "README.md"
]

def crear_estructura(base_path):
    """Crea todas las carpetas y archivos según la estructura definida"""
    
    # Crear carpetas y archivos vacíos
    for carpeta, archivos in ESTRUCTURA.items():
        ruta_carpeta = os.path.join(base_path, carpeta)
        os.makedirs(ruta_carpeta, exist_ok=True)
        
        for archivo in archivos:
            ruta_archivo = os.path.join(ruta_carpeta, archivo)
            if not os.path.exists(ruta_archivo):
                with open(ruta_archivo, 'w', encoding='utf-8') as f:
                    # Agregar comentario inicial en archivos .js y .jsx
                    if archivo.endswith('.js') or archivo.endswith('.jsx'):
                        f.write(f"// Archivo: {archivo}\n// CoreX - Generado automáticamente\n\n")
                    elif archivo.endswith('.css'):
                        f.write(f"/* {archivo} - CoreX */\n\n")
                    elif archivo.endswith('.sh'):
                        f.write(f"#!/bin/bash\n# {archivo}\n")
                    elif archivo.endswith('.md'):
                        f.write(f"# {archivo.replace('.md', '')}\n\nDocumentación pendiente.\n")
                    elif archivo.endswith('.sql'):
                        f.write(f"-- {archivo}\n-- CoreX Database\n\n")
                    elif archivo.endswith('.yml') or archivo.endswith('.conf'):
                        f.write(f"# {archivo}\n")
                    else:
                        f.write("")
    
    # Crear archivos en la raíz
    for archivo_ruta in ARCHIVOS_RAIZ:
        ruta_completa = os.path.join(base_path, archivo_ruta)
        carpeta_padre = os.path.dirname(ruta_completa)
        os.makedirs(carpeta_padre, exist_ok=True)
        
        if not os.path.exists(ruta_completa):
            with open(ruta_completa, 'w', encoding='utf-8') as f:
                nombre_archivo = os.path.basename(archivo_ruta)
                if nombre_archivo.endswith('.js'):
                    f.write(f"// {nombre_archivo}\n")
                elif nombre_archivo.endswith('.json'):
                    f.write("{\n  \"name\": \"corex\"\n}\n")
                elif nombre_archivo.endswith('.sh'):
                    f.write("#!/bin/bash\n")
                elif nombre_archivo.endswith('.md'):
                    f.write(f"# CoreX\n\nProyecto de ventas y mantenimiento.\n")
                elif nombre_archivo.endswith('.config.js'):
                    f.write("// Configuración\nmodule.exports = {}\n")
                else:
                    f.write("")

def main():
    # Determinar directorio donde se ejecuta el script
    base_dir = os.getcwd()
    
    print(f"📁 Creando estructura del proyecto en: {base_dir}")
    print("⏳ Esto puede tomar unos segundos...")
    
    try:
        crear_estructura(base_dir)
        print("✅ ¡Estructura creada exitosamente!")
        print(f"\n📊 Resumen:")
        print(f"   - Carpetas creadas: {len(ESTRUCTURA)}")
        
        # Contar archivos creados
        total_archivos = sum(len(archivos) for archivos in ESTRUCTURA.values()) + len(ARCHIVOS_RAIZ)
        print(f"   - Archivos creados: {total_archivos}")
        
        print("\n🚀 Próximos pasos:")
        print("   1. cd backend && npm init -y")
        print("   2. cd ../frontend && npm init -y")
        print("   3. Configurar variables de entorno en backend/.env y frontend/.env")
        print("   4. Ejecutar migraciones de base de datos")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()