#!/bin/bash
# deploy.sh
#!/bin/bash

# ============================================
# SCRIPT: scripts/deploy.sh
# DESCRIPCIÓN: Script de despliegue automatizado
# FECHA: 2026-05-21
# AUTOR: Sistema de Despliegue
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
NC='\033[0m' # No Color

# Configuración de entornos
ENVIRONMENTS=("development" "staging" "production")
CURRENT_ENV="${DEPLOY_ENV:-development}"
APP_NAME="${APP_NAME:-mi_app}"
APP_PATH="${APP_PATH:-$(pwd)}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/${APP_NAME}}"

# Configuración de repositorio
REPO_URL="${REPO_URL:-git@github.com:usuario/mi_app.git}"
BRANCH="${BRANCH:-main}"
TAG="${TAG:-}"

# Configuración de backup
BACKUP_BEFORE_DEPLOY="${BACKUP_BEFORE_DEPLOY:-true}"
BACKUP_PATH="${BACKUP_PATH:-${DEPLOY_PATH}/backups}"
KEEP_BACKUPS="${KEEP_BACKUPS:-5}"

# Configuración de hooks
PRE_DEPLOY_HOOK="${PRE_DEPLOY_HOOK:-}"
POST_DEPLOY_HOOK="${POST_DEPLOY_HOOK:-}"

# Configuración de notificaciones
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK:-}"

# Configuración de salud
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-http://localhost/health}"
HEALTH_CHECK_RETRIES="${HEALTH_CHECK_RETRIES:-3}"
HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-5}"

# Logging
LOG_FILE="${LOG_FILE:-/var/log/deploy.log}"
LOG_LEVEL="${LOG_LEVEL:-INFO}"

# ============================================
# FUNCIONES DE UTILIDAD
# ============================================

# Función para imprimir mensajes
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Colores por nivel
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
            echo -e "${GREEN}[SUCCESS]${NC} ${timestamp} - ${message}"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} ${timestamp} - ${message}"
            ;;
        "STEP")
            echo -e "${CYAN}[STEP]${NC} ${timestamp} - ${message}"
            ;;
        *)
            echo "${timestamp} - ${message}"
            ;;
    esac
    
    # Escribir en archivo de log
    if [ -n "$LOG_FILE" ]; then
        echo "[$level] $timestamp - $message" >> "$LOG_FILE"
    fi
}

# Función para verificar comandos necesarios
check_requirements() {
    local requirements=("git" "rsync" "tar" "gzip")
    local missing=()
    
    log "INFO" "Verificando requisitos del sistema..."
    
    for cmd in "${requirements[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            missing+=($cmd)
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        log "ERROR" "Comandos faltantes: ${missing[*]}"
        log "INFO" "Instala los paquetes necesarios:"
        log "INFO" "Ubuntu/Debian: sudo apt-get install git rsync"
        log "INFO" "CentOS/RHEL: sudo yum install git rsync"
        return 1
    fi
    
    # Verificar entorno
    if [ ! -d "$APP_PATH" ]; then
        log "ERROR" "Directorio de aplicación no existe: $APP_PATH"
        return 1
    fi
    
    log "SUCCESS" "Todos los requisitos están satisfechos"
    return 0
}

# ============================================
# FUNCIONES DE VALIDACIÓN
# ============================================

# Función para validar entorno
validate_environment() {
    local env=$1
    local valid=false
    
    for environment in "${ENVIRONMENTS[@]}"; do
        if [ "$environment" = "$env" ]; then
            valid=true
            break
        fi
    done
    
    if [ "$valid" = false ]; then
        log "ERROR" "Entorno no válido: $env"
        log "INFO" "Entornos disponibles: ${ENVIRONMENTS[*]}"
        return 1
    fi
    
    # Confirmar despliegue en producción
    if [ "$env" = "production" ]; then
        echo -e "${RED}⚠️  ADVERTENCIA: Estás desplegando en PRODUCCIÓN ⚠️${NC}"
        read -p "¿Estás seguro de continuar? (yes/no): " confirmation
        if [ "$confirmation" != "yes" ]; then
            log "WARNING" "Despliegue cancelado por el usuario"
            return 1
        fi
    fi
    
    log "SUCCESS" "Entorno validado: $env"
    return 0
}

# ============================================
# FUNCIONES DE BACKUP
# ============================================

# Función para crear backup
create_backup() {
    if [ "$BACKUP_BEFORE_DEPLOY" != "true" ]; then
        log "INFO" "Backup antes de despliegue deshabilitado"
        return 0
    fi
    
    log "STEP" "Creando backup del sistema actual..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="${APP_NAME}_backup_${timestamp}.tar.gz"
    local backup_file="${BACKUP_PATH}/${backup_name}"
    
    # Crear directorio de backups
    mkdir -p "$BACKUP_PATH"
    
    # Crear backup
    if tar -czf "$backup_file" -C "$DEPLOY_PATH" . 2>/dev/null; then
        local backup_size=$(du -h "$backup_file" | cut -f1)
        log "SUCCESS" "Backup creado: $backup_name ($backup_size)"
        
        # Limpiar backups antiguos
        clean_old_backups
        
        return 0
    else
        log "ERROR" "Error al crear backup"
        return 1
    fi
}

# Función para limpiar backups antiguos
clean_old_backups() {
    log "INFO" "Limpiando backups antiguos (manteniendo últimos $KEEP_BACKUPS)..."
    
    local backups_count=$(ls -1 "$BACKUP_PATH"/${APP_NAME}_backup_*.tar.gz 2>/dev/null | wc -l)
    
    if [ "$backups_count" -gt "$KEEP_BACKUPS" ]; then
        local to_delete=$((backups_count - KEEP_BACKUPS))
        ls -1t "$BACKUP_PATH"/${APP_NAME}_backup_*.tar.gz | tail -n "$to_delete" | while read -r file; do
            rm -f "$file"
            log "DEBUG" "Backup eliminado: $(basename "$file")"
        done
        log "INFO" "Eliminados $to_delete backups antiguos"
    fi
}

# ============================================
# FUNCIONES DE GIT
# ============================================

# Función para clonar/actualizar repositorio
update_repository() {
    log "STEP" "Actualizando repositorio..."
    
    local repo_dir="${APP_PATH}/repo"
    
    # Clonar o actualizar repositorio
    if [ ! -d "$repo_dir/.git" ]; then
        log "INFO" "Clonando repositorio: $REPO_URL"
        git clone "$REPO_URL" "$repo_dir"
        if [ $? -ne 0 ]; then
            log "ERROR" "Error al clonar repositorio"
            return 1
        fi
    else
        log "INFO" "Actualizando repositorio"
        cd "$repo_dir"
        git fetch --all
        git reset --hard origin/$BRANCH
        if [ $? -ne 0 ]; then
            log "ERROR" "Error al actualizar repositorio"
            return 1
        fi
    fi
    
    # Checkout de tag o rama específica
    cd "$repo_dir"
    if [ -n "$TAG" ]; then
        log "INFO" "Cambiando a tag: $TAG"
        git checkout "tags/$TAG"
    else
        log "INFO" "Cambiando a rama: $BRANCH"
        git checkout "$BRANCH"
    fi
    
    # Obtener commit actual
    local current_commit=$(git rev-parse --short HEAD)
    log "INFO" "Commit actual: $current_commit"
    
    return 0
}

# ============================================
# FUNCIONES DE DESPLIEGUE
# ============================================

# Función para ejecutar hooks
run_hook() {
    local hook_path=$1
    local hook_name=$2
    
    if [ -n "$hook_path" ] && [ -f "$hook_path" ]; then
        log "INFO" "Ejecutando hook: $hook_name"
        chmod +x "$hook_path"
        
        if "$hook_path"; then
            log "SUCCESS" "Hook completado: $hook_name"
            return 0
        else
            log "ERROR" "Hook falló: $hook_name"
            return 1
        fi
    else
        log "DEBUG" "Hook no encontrado: $hook_name"
        return 0
    fi
}

# Función para sincronizar archivos
sync_files() {
    log "STEP" "Sincronizando archivos..."
    
    local source_dir="${APP_PATH}/repo"
    local target_dir="${DEPLOY_PATH}/current"
    
    # Crear directorio temporal para nuevo despliegue
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local release_dir="${DEPLOY_PATH}/releases/${timestamp}"
    
    mkdir -p "$release_dir"
    
    # Copiar archivos excluyendo directorios sensibles
    rsync -av --delete \
        --exclude='.git/' \
        --exclude='.env' \
        --exclude='node_modules/' \
        --exclude='storage/logs/' \
        --exclude='.idea/' \
        --exclude='.vscode/' \
        --exclude='tests/' \
        --exclude='*.log' \
        "$source_dir/" "$release_dir/"
    
    if [ $? -ne 0 ]; then
        log "ERROR" "Error al sincronizar archivos"
        rm -rf "$release_dir"
        return 1
    fi
    
    # Crear enlace simbólico
    ln -sfn "$release_dir" "$target_dir"
    
    log "SUCCESS" "Archivos sincronizados en: $release_dir"
    echo "$release_dir"
    return 0
}

# Función para configurar entorno
setup_environment() {
    local release_dir=$1
    
    log "STEP" "Configurando entorno..."
    
    # Copiar archivo de entorno específico
    local env_file="${APP_PATH}/repo/.env.${CURRENT_ENV}"
    if [ -f "$env_file" ]; then
        cp "$env_file" "${release_dir}/.env"
        log "INFO" "Archivo .env copiado para entorno: $CURRENT_ENV"
    else
        log "WARNING" "Archivo .env no encontrado: $env_file"
    fi
    
    # Crear directorios necesarios
    mkdir -p "${release_dir}/storage/logs"
    mkdir -p "${release_dir}/storage/cache"
    mkdir -p "${release_dir}/storage/sessions"
    mkdir -p "${release_dir}/storage/views"
    
    # Establecer permisos
    chmod -R 755 "${release_dir}/storage"
    chmod -R 755 "${release_dir}/bootstrap/cache"
    
    log "SUCCESS" "Entorno configurado"
    return 0
}

# ============================================
# FUNCIONES DE VERIFICACIÓN
# ============================================

# Función para verificar salud de la aplicación
health_check() {
    local url=$1
    local retries=$2
    local interval=$3
    
    log "STEP" "Verificando salud de la aplicación..."
    
    for i in $(seq 1 $retries); do
        log "DEBUG" "Intento $i de $retries: $url"
        
        if curl -s -f -o /dev/null "$url"; then
            log "SUCCESS" "Health check pasado exitosamente"
            return 0
        fi
        
        if [ $i -lt $retries ]; then
            log "WARNING" "Health check falló, reintentando en ${interval}s..."
            sleep "$interval"
        fi
    done
    
    log "ERROR" "Health check falló después de $retries intentos"
    return 1
}

# Función para verificar servicios
check_services() {
    log "STEP" "Verificando servicios..."
    
    # Verificar Nginx
    if command -v nginx &> /dev/null; then
        if systemctl is-active --quiet nginx; then
            log "INFO" "✅ Nginx está activo"
        else
            log "WARNING" "⚠️ Nginx no está activo"
        fi
    fi
    
    # Verificar PHP-FPM
    if command -v php-fpm &> /dev/null; then
        if systemctl is-active --quiet php*-fpm; then
            log "INFO" "✅ PHP-FPM está activo"
        else
            log "WARNING" "⚠️ PHP-FPM no está activo"
        fi
    fi
    
    # Verificar MySQL
    if command -v mysql &> /dev/null; then
        if systemctl is-active --quiet mysql; then
            log "INFO" "✅ MySQL está activo"
        else
            log "WARNING" "⚠️ MySQL no está activo"
        fi
    fi
    
    return 0
}

# ============================================
# FUNCIONES DE NOTIFICACIÓN
# ============================================

# Función para enviar a Slack
send_slack_notification() {
    local message=$1
    local color=$2
    
    if [ -z "$SLACK_WEBHOOK" ]; then
        return 0
    fi
    
    local payload=$(cat <<EOF
{
    "attachments": [{
        "color": "$color",
        "text": "$message",
        "footer": "Deploy Script",
        "ts": $(date +%s)
    }]
}
EOF
)
    
    curl -X POST -H 'Content-type: application/json' --data "$payload" "$SLACK_WEBHOOK" &> /dev/null
}

# Función para enviar a Discord
send_discord_notification() {
    local message=$1
    
    if [ -z "$DISCORD_WEBHOOK" ]; then
        return 0
    fi
    
    local payload=$(cat <<EOF
{
    "content": "$message",
    "username": "Deploy Bot"
}
EOF
)
    
    curl -X POST -H 'Content-type: application/json' --data "$payload" "$DISCORD_WEBHOOK" &> /dev/null
}

# Función para notificar resultado
send_notifications() {
    local success=$1
    local message=$2
    
    local color="good"
    local status_emoji="✅"
    
    if [ $success -ne 0 ]; then
        color="danger"
        status_emoji="❌"
    fi
    
    local full_message="${status_emoji} DEPLOY ${APP_NAME} - ${CURRENT_ENV}\n${message}"
    
    send_slack_notification "$full_message" "$color"
    send_discord_notification "$full_message"
}

# ============================================
# FUNCIÓN DE ROLLBACK
# ============================================

# Función para hacer rollback
rollback_deploy() {
    log "WARNING" "Iniciando rollback..."
    
    local current_link="${DEPLOY_PATH}/current"
    local releases_dir="${DEPLOY_PATH}/releases"
    local last_release=""
    
    # Encontrar el último release
    if [ -L "$current_link" ]; then
        last_release=$(readlink "$current_link")
        log "INFO" "Rollback a: $last_release"
    else
        log "ERROR" "No se encontró release anterior para rollback"
        return 1
    fi
    
    # Actualizar enlace simbólico
    ln -sfn "$last_release" "$current_link"
    
    # Reiniciar servicios
    restart_services
    
    log "SUCCESS" "Rollback completado exitosamente"
    return 0
}

# ============================================
# FUNCIÓN DE LIMPIEZA
# ============================================

# Función para limpiar releases antiguos
clean_old_releases() {
    log "STEP" "Limpiando releases antiguos..."
    
    local releases_dir="${DEPLOY_PATH}/releases"
    local keep_releases="${KEEP_RELEASES:-5}"
    
    if [ -d "$releases_dir" ]; then
        local releases_count=$(ls -1 "$releases_dir" | wc -l)
        
        if [ "$releases_count" -gt "$keep_releases" ]; then
            ls -1t "$releases_dir" | tail -n +$((keep_releases + 1)) | while read -r release; do
                rm -rf "${releases_dir}/${release}"
                log "DEBUG" "Release eliminado: $release"
            done
            log "INFO" "Eliminados $((releases_count - keep_releases)) releases antiguos"
        fi
    fi
}

# ============================================
# FUNCIONES DE SERVICIOS
# ============================================

# Función para reiniciar servicios
restart_services() {
    log "STEP" "Reiniciando servicios..."
    
    # Reiniciar PHP-FPM
    if command -v php-fpm &> /dev/null; then
        systemctl reload php*-fpm 2>/dev/null || true
        log "INFO" "PHP-FPM reiniciado"
    fi
    
    # Reiniciar Nginx (recargar configuración)
    if command -v nginx &> /dev/null; then
        systemctl reload nginx 2>/dev/null || true
        log "INFO" "Nginx recargado"
    fi
    
    # Limpiar cache de OPcache si existe
    if command -v php &> /dev/null; then
        php -r "opcache_reset();" 2>/dev/null || true
        log "INFO" "Cache de OPcache limpiado"
    fi
    
    log "SUCCESS" "Servicios reiniciados"
}

# ============================================
# FUNCIÓN PRINCIPAL DE DESPLIEGUE
# ============================================

deploy() {
    local start_time=$(date +%s)
    local release_dir=""
    local success=1
    
    log "INFO" "=========================================="
    log "INFO" "Iniciando despliegue"
    log "INFO" "Aplicación: $APP_NAME"
    log "INFO" "Entorno: $CURRENT_ENV"
    log "INFO" "Rama/Tag: ${TAG:-$BRANCH}"
    log "INFO" "=========================================="
    
    # Validar entorno
    if ! validate_environment "$CURRENT_ENV"; then
        send_notifications 1 "Validación de entorno falló"
        exit 1
    fi
    
    # Verificar requisitos
    if ! check_requirements; then
        send_notifications 1 "Verificación de requisitos falló"
        exit 1
    fi
    
    # Pre-deploy hook
    if ! run_hook "$PRE_DEPLOY_HOOK" "pre-deploy"; then
        send_notifications 1 "Pre-deploy hook falló"
        exit 1
    fi
    
    # Crear backup
    if ! create_backup; then
        log "WARNING" "Backup falló, continuando..."
    fi
    
    # Actualizar repositorio
    if ! update_repository; then
        send_notifications 1 "Actualización de repositorio falló"
        rollback_deploy
        exit 1
    fi
    
    # Sincronizar archivos
    release_dir=$(sync_files)
    if [ $? -ne 0 ]; then
        send_notifications 1 "Sincronización de archivos falló"
        rollback_deploy
        exit 1
    fi
    
    # Configurar entorno
    if ! setup_environment "$release_dir"; then
        send_notifications 1 "Configuración de entorno falló"
        rollback_deploy
        exit 1
    fi
    
    # Verificar servicios
    check_services
    
    # Reiniciar servicios
    restart_services
    
    # Health check
    if ! health_check "$HEALTH_CHECK_URL" "$HEALTH_CHECK_RETRIES" "$HEALTH_CHECK_INTERVAL"; then
        send_notifications 1 "Health check falló - iniciando rollback"
        rollback_deploy
        exit 1
    fi
    
    # Limpiar releases antiguos
    clean_old_releases
    
    # Post-deploy hook
    if ! run_hook "$POST_DEPLOY_HOOK" "post-deploy"; then
        log "WARNING" "Post-deploy hook falló, pero el despliegue fue exitoso"
    fi
    
    # Calcular tiempo de despliegue
    local end_time=$(date +%s)
    local elapsed_time=$((end_time - start_time))
    
    success=0
    log "SUCCESS" "=========================================="
    log "SUCCESS" "✅ Despliegue completado exitosamente"
    log "SUCCESS" "Tiempo total: ${elapsed_time} segundos"
    log "SUCCESS" "Release: $(basename "$release_dir")"
    log "SUCCESS" "=========================================="
    
    # Enviar notificación de éxito
    send_notifications 0 "Despliegue completado en ${elapsed_time}s\nRelease: $(basename "$release_dir")\nEntorno: $CURRENT_ENV"
    
    return 0
}

# ============================================
# FUNCIÓN DE AYUDA
# ============================================

show_help() {
    cat << EOF
Uso: $0 [opciones]

Opciones:
  -e, --env ENV         Entorno de despliegue (development, staging, production)
  -b, --branch BRANCH   Rama a desplegar (default: main)
  -t, --tag TAG         Tag a desplegar (sobrescribe branch)
  -r, --rollback        Realizar rollback al release anterior
  -h, --help            Mostrar esta ayuda
  --backup              Crear backup antes del despliegue
  --no-backup           No crear backup
  --health-check URL    URL para health check
  --skip-health-check   Saltar health check

Ejemplos:
  $0 -e staging -b develop
  $0 -e production -t v1.0.0
  $0 -e production --rollback
  $0 -e staging --no-backup

Variables de entorno:
  DEPLOY_ENV            Entorno de despliegue
  APP_NAME              Nombre de la aplicación
  DEPLOY_PATH           Ruta de despliegue
  REPO_URL              URL del repositorio Git
  BRANCH                Rama por defecto
  SLACK_WEBHOOK         Webhook de Slack para notificaciones
EOF
}

# ============================================
# PROCESAMIENTO DE ARGUMENTOS
# ============================================

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            CURRENT_ENV="$2"
            shift 2
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -r|--rollback)
            ROLLBACK=true
            shift
            ;;
        --backup)
            BACKUP_BEFORE_DEPLOY=true
            shift
            ;;
        --no-backup)
            BACKUP_BEFORE_DEPLOY=false
            shift
            ;;
        --health-check)
            HEALTH_CHECK_URL="$2"
            shift 2
            ;;
        --skip-health-check)
            SKIP_HEALTH_CHECK=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Exportar variables de entorno
export DEPLOY_ENV="$CURRENT_ENV"

# ============================================
# EJECUCIÓN PRINCIPAL
# ============================================

# Manejo de señales
trap 'log "WARNING" "Despliegue interrumpido"; exit 1' INT TERM

# Ejecutar despliegue o rollback
if [ "$ROLLBACK" = true ]; then
    rollback_deploy
else
    deploy
fi