#!/bin/bash
# setup.sh
#!/bin/bash

# ============================================
# SCRIPT: scripts/setup.sh
# DESCRIPCIÓN: Script de configuración inicial del proyecto
# FECHA: 2026-05-21
# AUTOR: Sistema de Configuración
# ============================================

# ============================================
# CONFIGURACIÓN
# ============================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuración del proyecto
PROJECT_NAME="${PROJECT_NAME:-MiApp}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENVIRONMENT="${ENVIRONMENT:-development}" # development, staging, production

# Versiones requeridas
NODE_VERSION_REQUIRED="${NODE_VERSION_REQUIRED:-18}"
PHP_VERSION_REQUIRED="${PHP_VERSION_REQUIRED:-8.1}"
MYSQL_VERSION_REQUIRED="${MYSQL_VERSION_REQUIRED:-8.0}"
COMPOSER_VERSION_REQUIRED="${COMPOSER_VERSION_REQUIRED:-2}"

# Configuración de base de datos
DB_NAME="${DB_NAME:-mi_app_db}"
DB_USER="${DB_USER:-mi_app_user}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD:-}"

# Configuración de aplicación
APP_URL="${APP_URL:-http://localhost:8000}"
APP_TIMEZONE="${APP_TIMEZONE:-Europe/Madrid}"
APP_LOCALE="${APP_LOCALE:-es}"

# Directorios
LOG_DIR="${PROJECT_ROOT}/logs"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TEMP_DIR="${PROJECT_ROOT}/tmp"
CACHE_DIR="${PROJECT_ROOT}/cache"

# Opciones
INSTALL_DEPENDENCIES="${INSTALL_DEPENDENCIES:-true}"
SETUP_DATABASE="${SETUP_DATABASE:-true}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
RUN_SEEDERS="${RUN_SEEDERS:-false}"
GENERATE_KEY="${GENERATE_KEY:-true}"
SETUP_STORAGE="${SETUP_STORAGE:-true}"
SETUP_QUEUE="${SETUP_QUEUE:-false}"
SETUP_SCHEDULER="${SETUP_SCHEDULER:-false}"
INSTALL_DEV_TOOLS="${INSTALL_DEV_TOOLS:-false}"

# ============================================
# FUNCIONES DE UTILIDAD
# ============================================

# Función para imprimir banner
print_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║   ${WHITE}${PROJECT_NAME} - Script de Configuración${CYAN}                        ║"
    echo "║                                                               ║"
    echo "║   Entorno: ${YELLOW}${ENVIRONMENT}${CYAN}                                              ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Función para imprimir mensajes
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} ${timestamp} - ${message}"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} ${timestamp} - ${message}"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${timestamp} - ${message}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[✓]${NC} ${message}"
            ;;
        "SECTION")
            echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${WHITE}  ${message}${NC}"
            echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
            ;;
        *)
            echo "${timestamp} - ${message}"
            ;;
    esac
}

# Función para preguntar sí/no
ask_yes_no() {
    local question=$1
    local default=${2:-"no"}
    
    while true; do
        if [ "$default" = "yes" ]; then
            read -p "$question (Y/n): " answer
            answer=${answer:-Y}
        else
            read -p "$question (y/N): " answer
            answer=${answer:-N}
        fi
        
        case $answer in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Por favor responde yes o no.";;
        esac
    done
}

# Función para verificar comandos
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================
# VERIFICACIONES DEL SISTEMA
# ============================================

# Función para verificar sistema operativo
check_os() {
    log "SECTION" "VERIFICANDO SISTEMA OPERATIVO"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        log "SUCCESS" "Sistema operativo: Linux"
        
        # Detectar distribución
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            log "INFO" "Distribución: $NAME $VERSION"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        log "SUCCESS" "Sistema operativo: macOS"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        log "WARNING" "Sistema operativo: Windows (soporte limitado)"
    else
        log "ERROR" "Sistema operativo no soportado: $OSTYPE"
        return 1
    fi
    
    return 0
}

# Función para verificar memoria
check_memory() {
    log "SECTION" "VERIFICANDO RECURSOS DEL SISTEMA"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        local total_mem=$(free -m | awk '/^Mem:/{print $2}')
        local available_mem=$(free -m | awk '/^Mem:/{print $7}')
        
        log "INFO" "Memoria total: ${total_mem}MB"
        log "INFO" "Memoria disponible: ${available_mem}MB"
        
        if [ $available_mem -lt 512 ]; then
            log "WARNING" "Memoria baja (menos de 512MB disponible)"
        fi
    fi
    
    return 0
}

# ============================================
# VERIFICACIÓN DE DEPENDENCIAS
# ============================================

# Función para verificar Node.js
check_node() {
    log "SECTION" "VERIFICANDO NODE.JS"
    
    if command_exists node; then
        local node_version=$(node -v | cut -d'v' -f2)
        local major_version=$(echo $node_version | cut -d'.' -f1)
        
        log "SUCCESS" "Node.js encontrado: v$node_version"
        
        if [ $major_version -lt $NODE_VERSION_REQUIRED ]; then
            log "WARNING" "Versión de Node.js antigua. Recomendado: v${NODE_VERSION_REQUIRED}+"
        fi
        
        if command_exists npm; then
            local npm_version=$(npm -v)
            log "SUCCESS" "npm encontrado: v$npm_version"
        fi
        
        return 0
    else
        log "ERROR" "Node.js no encontrado"
        log "INFO" "Instalar Node.js: https://nodejs.org/"
        return 1
    fi
}

# Función para verificar PHP
check_php() {
    log "SECTION" "VERIFICANDO PHP"
    
    if command_exists php; then
        local php_version=$(php -v | head -n 1 | cut -d' ' -f2 | cut -d'-' -f1)
        local major_minor=$(echo $php_version | cut -d'.' -f1,2)
        
        log "SUCCESS" "PHP encontrado: v$php_version"
        
        if [ "$(printf '%s\n' "$PHP_VERSION_REQUIRED" "$major_minor" | sort -V | head -n1)" != "$PHP_VERSION_REQUIRED" ]; then
            log "WARNING" "Versión de PHP antigua. Recomendado: v${PHP_VERSION_REQUIRED}+"
        fi
        
        # Verificar extensiones requeridas
        local required_extensions=("pdo" "mysqli" "mbstring" "curl" "json" "xml" "zip" "gd")
        local missing_extensions=()
        
        for ext in "${required_extensions[@]}"; do
            if php -m | grep -qi "^$ext$"; then
                log "INFO" "✓ Extensión $ext instalada"
            else
                missing_extensions+=($ext)
                log "WARNING" "✗ Extensión $ext no instalada"
            fi
        done
        
        if [ ${#missing_extensions[@]} -eq 0 ]; then
            log "SUCCESS" "Todas las extensiones requeridas están instaladas"
            return 0
        else
            log "WARNING" "Extensiones faltantes: ${missing_extensions[*]}"
            return 1
        fi
    else
        log "ERROR" "PHP no encontrado"
        log "INFO" "Instalar PHP: https://www.php.net/downloads"
        return 1
    fi
}

# Función para verificar Composer
check_composer() {
    log "SECTION" "VERIFICANDO COMPOSER"
    
    if command_exists composer; then
        local composer_version=$(composer -V | cut -d' ' -f3)
        log "SUCCESS" "Composer encontrado: v$composer_version"
        return 0
    else
        log "ERROR" "Composer no encontrado"
        log "INFO" "Instalar Composer: https://getcomposer.org/download/"
        return 1
    fi
}

# Función para verificar MySQL
check_mysql() {
    log "SECTION" "VERIFICANDO MYSQL"
    
    if command_exists mysql; then
        local mysql_version=$(mysql --version | cut -d' ' -f5 | cut -d',' -f1)
        log "SUCCESS" "MySQL encontrado: v$mysql_version"
        
        # Verificar si el servicio está corriendo
        if systemctl is-active --quiet mysql 2>/dev/null || systemctl is-active --quiet mariadb 2>/dev/null; then
            log "SUCCESS" "Servicio MySQL activo"
        else
            log "WARNING" "Servicio MySQL no está activo"
        fi
        
        return 0
    else
        log "ERROR" "MySQL no encontrado"
        log "INFO" "Instalar MySQL: https://dev.mysql.com/downloads/"
        return 1
    fi
}

# Función para verificar Git
check_git() {
    log "SECTION" "VERIFICANDO GIT"
    
    if command_exists git; then
        local git_version=$(git --version | cut -d' ' -f3)
        log "SUCCESS" "Git encontrado: v$git_version"
        return 0
    else
        log "WARNING" "Git no encontrado (opcional)"
        return 0
    fi
}

# ============================================
# INSTALACIÓN DE DEPENDENCIAS
# ============================================

# Función para instalar dependencias de Node
install_node_dependencies() {
    log "SECTION" "INSTALANDO DEPENDENCIAS DE NODE"
    
    if [ ! -f "${PROJECT_ROOT}/package.json" ]; then
        log "WARNING" "package.json no encontrado"
        return 0
    fi
    
    log "INFO" "Instalando dependencias de Node.js..."
    
    if npm install --no-audit --no-fund; then
        log "SUCCESS" "Dependencias de Node instaladas"
        return 0
    else
        log "ERROR" "Error al instalar dependencias de Node"
        return 1
    fi
}

# Función para instalar dependencias de PHP
install_php_dependencies() {
    log "SECTION" "INSTALANDO DEPENDENCIAS DE PHP"
    
    if [ ! -f "${PROJECT_ROOT}/composer.json" ]; then
        log "WARNING" "composer.json no encontrado"
        return 0
    fi
    
    log "INFO" "Instalando dependencias de PHP..."
    
    local composer_cmd="composer install"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        composer_cmd="$composer_cmd --no-dev --optimize-autoloader"
    else
        composer_cmd="$composer_cmd --dev"
    fi
    
    if $composer_cmd; then
        log "SUCCESS" "Dependencias de PHP instaladas"
        return 0
    else
        log "ERROR" "Error al instalar dependencias de PHP"
        return 1
    fi
}

# ============================================
# CONFIGURACIÓN DE ENTORNO
# ============================================

# Función para crear archivo .env
create_env_file() {
    log "SECTION" "CONFIGURANDO ARCHIVO .ENV"
    
    local env_example="${PROJECT_ROOT}/.env.example"
    local env_file="${PROJECT_ROOT}/.env"
    
    if [ ! -f "$env_example" ]; then
        log "WARNING" ".env.example no encontrado"
        
        # Crear .env básico
        cat > "$env_file" << EOF
APP_NAME=$PROJECT_NAME
APP_ENV=$ENVIRONMENT
APP_DEBUG=true
APP_URL=$APP_URL
APP_TIMEZONE=$APP_TIMEZONE
APP_LOCALE=$APP_LOCALE

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=$DB_NAME
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASSWORD
EOF
        log "INFO" "Archivo .env creado con valores por defecto"
    else
        cp "$env_example" "$env_file"
        log "SUCCESS" "Archivo .env creado desde .env.example"
    fi
    
    # Generar APP_KEY
    if [ "$GENERATE_KEY" = true ] && command_exists php; then
        log "INFO" "Generando APP_KEY..."
        php artisan key:generate 2>/dev/null || true
    fi
    
    return 0
}

# ============================================
# CONFIGURACIÓN DE BASE DE DATOS
# ============================================

# Función para crear base de datos
setup_database() {
    log "SECTION" "CONFIGURANDO BASE DE DATOS"
    
    if [ "$SETUP_DATABASE" != true ]; then
        log "INFO" "Configuración de base de datos omitida"
        return 0
    fi
    
    # Solicitar contraseña si no está configurada
    if [ -z "$DB_ROOT_PASSWORD" ]; then
        read -sp "Contraseña de root de MySQL: " DB_ROOT_PASSWORD
        echo
    fi
    
    # Crear base de datos
    log "INFO" "Creando base de datos: $DB_NAME"
    
    mysql -u root -p"$DB_ROOT_PASSWORD" << EOF
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Base de datos creada exitosamente"
        
        # Ejecutar migraciones
        if [ "$RUN_MIGRATIONS" = true ] && command_exists php; then
            log "INFO" "Ejecutando migraciones..."
            php artisan migrate --force
            
            if [ "$RUN_SEEDERS" = true ]; then
                log "INFO" "Ejecutando seeders..."
                php artisan db:seed --force
            fi
        fi
        
        return 0
    else
        log "ERROR" "Error al crear base de datos"
        return 1
    fi
}

# ============================================
# CONFIGURACIÓN DE DIRECTORIOS
# ============================================

# Función para crear directorios
setup_directories() {
    log "SECTION" "CREANDO DIRECTORIOS"
    
    local directories=(
        "$LOG_DIR"
        "$BACKUP_DIR"
        "$TEMP_DIR"
        "$CACHE_DIR"
        "${PROJECT_ROOT}/storage"
        "${PROJECT_ROOT}/storage/framework"
        "${PROJECT_ROOT}/storage/framework/cache"
        "${PROJECT_ROOT}/storage/framework/sessions"
        "${PROJECT_ROOT}/storage/framework/views"
        "${PROJECT_ROOT}/storage/logs"
        "${PROJECT_ROOT}/storage/uploads"
        "${PROJECT_ROOT}/bootstrap/cache"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log "INFO" "Directorio creado: $dir"
        fi
    done
    
    # Establecer permisos
    if [ "$SETUP_STORAGE" = true ]; then
        log "INFO" "Estableciendo permisos..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            chmod -R 775 "${PROJECT_ROOT}/storage"
            chmod -R 775 "${PROJECT_ROOT}/bootstrap/cache"
            
            # Verificar propietario
            local web_user="www-data"
            if id "$web_user" >/dev/null 2>&1; then
                chown -R $web_user:$web_user "${PROJECT_ROOT}/storage"
                chown -R $web_user:$web_user "${PROJECT_ROOT}/bootstrap/cache"
            fi
        fi
    fi
    
    log "SUCCESS" "Directorios configurados"
    return 0
}

# ============================================
# CONFIGURACIÓN DE SERVIDOR WEB
# ============================================

# Función para configurar Nginx
setup_nginx() {
    log "SECTION" "CONFIGURANDO NGINX"
    
    if ! command_exists nginx; then
        log "WARNING" "Nginx no instalado, omitiendo configuración"
        return 0
    fi
    
    local nginx_config="/etc/nginx/sites-available/${PROJECT_NAME}.conf"
    
    if [ ! -f "$nginx_config" ]; then
        log "INFO" "Creando configuración de Nginx..."
        
        cat > "$nginx_config" << EOF
server {
    listen 80;
    server_name ${APP_URL#http://};
    root ${PROJECT_ROOT}/public;

    index index.php index.html;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php${PHP_VERSION_REQUIRED}-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }

    location ~ /\.env {
        deny all;
    }
    
    client_max_body_size 10M;
}
EOF
        
        # Habilitar sitio
        ln -sf "$nginx_config" "/etc/nginx/sites-enabled/"
        
        # Probar configuración
        nginx -t
        
        if [ $? -eq 0 ]; then
            systemctl reload nginx
            log "SUCCESS" "Configuración de Nginx aplicada"
        else
            log "ERROR" "Error en configuración de Nginx"
        fi
    else
        log "INFO" "Configuración de Nginx ya existe"
    fi
    
    return 0
}

# ============================================
# CONFIGURACIÓN DE SERVICIOS
# ============================================

# Función para configurar supervisor (queues)
setup_supervisor() {
    if [ "$SETUP_QUEUE" != true ]; then
        return 0
    fi
    
    log "SECTION" "CONFIGURANDO SUPERVISOR"
    
    if ! command_exists supervisorctl; then
        log "WARNING" "Supervisor no instalado"
        return 0
    fi
    
    local supervisor_conf="/etc/supervisor/conf.d/${PROJECT_NAME}.conf"
    
    cat > "$supervisor_conf" << EOF
[program:${PROJECT_NAME}-queue]
process_name=%(program_name)s_%(process_num)02d
command=php ${PROJECT_ROOT}/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=${LOG_DIR}/queue-worker.log
stopwaitsecs=3600

[program:${PROJECT_NAME}-schedule]
command=php ${PROJECT_ROOT}/artisan schedule:work
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=${LOG_DIR}/schedule-worker.log
EOF
    
    supervisorctl reread
    supervisorctl update
    
    log "SUCCESS" "Supervisor configurado"
}

# Función para configurar cron
setup_cron() {
    if [ "$SETUP_SCHEDULER" != true ]; then
        return 0
    fi
    
    log "SECTION" "CONFIGURANDO CRON"
    
    local cron_job="* * * * * php ${PROJECT_ROOT}/artisan schedule:run >> /dev/null 2>&1"
    
    # Verificar si el cron job ya existe
    if ! crontab -l 2>/dev/null | grep -q "artisan schedule:run"; then
        (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
        log "SUCCESS" "Cron job añadido"
    else
        log "INFO" "Cron job ya existe"
    fi
}

# ============================================
# FRONTEND SETUP
# ============================================

# Función para compilar assets
compile_assets() {
    log "SECTION" "COMPILANDO ASSETS"
    
    if [ ! -f "${PROJECT_ROOT}/package.json" ]; then
        log "WARNING" "package.json no encontrado, omitiendo compilación"
        return 0
    fi
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log "INFO" "Compilando para producción..."
        npm run production
    else
        log "INFO" "Compilando para desarrollo..."
        npm run dev
    fi
    
    if [ $? -eq 0 ]; then
        log "SUCCESS" "Assets compilados correctamente"
    else
        log "ERROR" "Error al compilar assets"
        return 1
    fi
}

# ============================================
# POST-SETUP
# ============================================

# Función para mostrar resumen final
show_summary() {
    log "SECTION" "RESUMEN DE INSTALACIÓN"
    
    echo -e "${GREEN}✓${NC} Dependencias instaladas"
    echo -e "${GREEN}✓${NC} Archivo .env configurado"
    echo -e "${GREEN}✓${NC} Base de datos configurada"
    echo -e "${GREEN}✓${NC} Directorios creados"
    
    if [ "$SETUP_QUEUE" = true ]; then
        echo -e "${GREEN}✓${NC} Supervisor configurado"
    fi
    
    if [ "$SETUP_SCHEDULER" = true ]; then
        echo -e "${GREEN}✓${NC} Cron configurado"
    fi
    
    echo ""
    log "SUCCESS" "¡Configuración completada exitosamente!"
    echo ""
    log "INFO" "Para iniciar el servidor de desarrollo:"
    echo "  php artisan serve"
    echo ""
    log "INFO" "Acceso a la aplicación: $APP_URL"
    echo ""
    
    if [ "$ENVIRONMENT" = "development" ]; then
        log "WARNING" "Credenciales de base de datos guardadas en .env"
        log "INFO" "Usuario DB: $DB_USER"
        log "INFO" "Base de datos: $DB_NAME"
    fi
}

# ============================================
# FUNCIÓN PRINCIPAL
# ============================================

main() {
    local start_time=$(date +%s)
    local errors=0
    
    print_banner
    
    # Verificaciones del sistema
    check_os || ((errors++))
    check_memory
    
    # Verificar dependencias
    check_node || ((errors++))
    check_php || ((errors++))
    check_composer || ((errors++))
    check_mysql || ((errors++))
    check_git
    
    if [ $errors -gt 0 ]; then
        log "ERROR" "Faltan dependencias críticas. Por favor instálalas y vuelve a intentar."
        exit 1
    fi
    
    # Instalar dependencias
    if [ "$INSTALL_DEPENDENCIES" = true ]; then
        install_node_dependencies || ((errors++))
        install_php_dependencies || ((errors++))
    fi
    
    # Configurar entorno
    create_env_file || ((errors++))
    setup_directories || ((errors++))
    
    # Configurar base de datos
    if ask_yes_no "¿Configurar base de datos?" "yes"; then
        setup_database || ((errors++))
    fi
    
    # Compilar assets
    if ask_yes_no "¿Compilar assets?" "yes"; then
        compile_assets || ((errors++))
    fi
    
    # Configurar servicios adicionales
    if ask_yes_no "¿Configurar servidor web (Nginx)?" "no"; then
        setup_nginx
    fi
    
    if ask_yes_no "¿Configurar colas (Supervisor)?" "no"; then
        SETUP_QUEUE=true
        setup_supervisor
    fi
    
    if ask_yes_no "¿Configurar scheduler (Cron)?" "no"; then
        SETUP_SCHEDULER=true
        setup_cron
    fi
    
    # Mostrar resumen
    local end_time=$(date +%s)
    local elapsed_time=$((end_time - start_time))
    
    log "INFO" "Tiempo total: ${elapsed_time} segundos"
    
    if [ $errors -eq 0 ]; then
        show_summary
        exit 0
    else
        log "ERROR" "Configuración completada con $errors error(es)"
        exit 1
    fi
}

# ============================================
# MANEJO DE SEÑALES
# ============================================

trap 'log "WARNING" "Configuración interrumpida"; exit 1' INT TERM

# ============================================
# EJECUCIÓN PRINCIPAL
# ============================================

# Verificar que se está ejecutando en el entorno correcto
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi