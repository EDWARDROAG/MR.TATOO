#!/bin/bash
# monitor.sh
#!/bin/bash

# ============================================
# SCRIPT: scripts/monitor.sh
# DESCRIPCIÓN: Script de monitoreo del sistema y aplicación
# FECHA: 2026-05-21
# AUTOR: Sistema de Monitoreo
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

# Configuración general
APP_NAME="${APP_NAME:-MiApp}"
APP_URL="${APP_URL:-http://localhost}"
APP_PATH="${APP_PATH:-$(pwd)}"
ENVIRONMENT="${ENVIRONMENT:-production}"

# Límites de alerta
CPU_THRESHOLD="${CPU_THRESHOLD:-80}"
MEMORY_THRESHOLD="${MEMORY_THRESHOLD:-80}"
DISK_THRESHOLD="${DISK_THRESHOLD:-85}"
LOAD_THRESHOLD="${LOAD_THRESHOLD:-5}"
HTTP_TIMEOUT="${HTTP_TIMEOUT:-10}"
HTTP_THRESHOLD="${HTTP_THRESHOLD:-500}" # ms

# Configuración de monitoreo
CHECK_INTERVAL="${CHECK_INTERVAL:-60}" # segundos
LOG_FILE="${LOG_FILE:-/var/log/monitor.log}"
ALERT_EMAIL="${ALERT_EMAIL:-admin@empresa.com}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK:-}"

# Módulos a monitorear
MONITOR_SYSTEM="${MONITOR_SYSTEM:-true}"
MONITOR_DATABASE="${MONITOR_DATABASE:-true}"
MONITOR_HTTP="${MONITOR_HTTP:-true}"
MONITOR_PHP="${MONITOR_PHP:-true}"
MONITOR_NGINX="${MONITOR_NGINX:-true}"
MONITOR_MYSQL="${MONITOR_MYSQL:-true}"
MONITOR_REDIS="${MONITOR_REDIS:-true}"
MONITOR_QUEUE="${MONITOR_QUEUE:-true}"
MONITOR_SCHEDULER="${MONITOR_SCHEDULER:-true}"
MONITOR_SSL="${MONITOR_SSL:-true}"

# Configuración de base de datos
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-mi_app_db}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Configuración Redis
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"

# ============================================
# FUNCIONES DE UTILIDAD
# ============================================

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
        "CRITICAL")
            echo -e "${RED}[CRITICAL]${NC} ${timestamp} - ${message}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[✓]${NC} ${message}"
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

# Función para enviar alertas
send_alert() {
    local subject=$1
    local message=$2
    local priority=${3:-"warning"}
    
    echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
    
    # Enviar a Slack
    if [ -n "$SLACK_WEBHOOK" ]; then
        local color="warning"
        if [ "$priority" = "critical" ]; then
            color="danger"
        elif [ "$priority" = "info" ]; then
            color="good"
        fi
        
        local payload=$(cat <<EOF
{
    "attachments": [{
        "color": "$color",
        "title": "$subject",
        "text": "$message",
        "footer": "Monitor System",
        "ts": $(date +%s)
    }]
}
EOF
)
        curl -X POST -H 'Content-type: application/json' --data "$payload" "$SLACK_WEBHOOK" &> /dev/null
    fi
    
    log "INFO" "Alerta enviada: $subject"
}

# ============================================
# MONITOREO DEL SISTEMA
# ============================================

# Función para monitorear CPU
check_cpu() {
    if [ "$MONITOR_SYSTEM" != "true" ]; then
        return 0
    fi
    
    log "INFO" "Verificando uso de CPU..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
        local cpu_usage_int=${cpu_usage%.*}
        
        log "INFO" "Uso de CPU: ${cpu_usage}%"
        
        if [ $cpu_usage_int -gt $CPU_THRESHOLD ]; then
            local message="Alto uso de CPU: ${cpu_usage}% (umbral: ${CPU_THRESHOLD}%)"
            log "WARNING" "$message"
            send_alert "⚠️ ALERTA: Alto uso de CPU" "$message" "warning"
            return 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        local cpu_usage=$(ps -A -o %cpu | awk '{s+=$1} END {print s}')
        log "INFO" "Uso de CPU: ${cpu_usage}%"
    fi
    
    return 0
}

# Función para monitorear memoria
check_memory() {
    if [ "$MONITOR_SYSTEM" != "true" ]; then
        return 0
    fi
    
    log "INFO" "Verificando uso de memoria..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        local total_mem=$(free -m | awk '/^Mem:/{print $2}')
        local used_mem=$(free -m | awk '/^Mem:/{print $3}')
        local mem_percent=$((used_mem * 100 / total_mem))
        
        log "INFO" "Uso de memoria: ${mem_percent}% (${used_mem}MB/${total_mem}MB)"
        
        if [ $mem_percent -gt $MEMORY_THRESHOLD ]; then
            local message="Alto uso de memoria: ${mem_percent}% (umbral: ${MEMORY_THRESHOLD}%)"
            log "WARNING" "$message"
            send_alert "⚠️ ALERTA: Alto uso de memoria" "$message" "warning"
            return 1
        fi
    fi
    
    return 0
}

# Función para monitorear disco
check_disk() {
    if [ "$MONITOR_SYSTEM" != "true" ]; then
        return 0
    fi
    
    log "INFO" "Verificando espacio en disco..."
    
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)
    
    log "INFO" "Uso de disco: ${disk_usage}%"
    
    if [ $disk_usage -gt $DISK_THRESHOLD ]; then
        local message="Espacio en disco bajo: ${disk_usage}% (umbral: ${DISK_THRESHOLD}%)"
        log "WARNING" "$message"
        send_alert "⚠️ ALERTA: Espacio en disco bajo" "$message" "warning"
        return 1
    fi
    
    return 0
}

# Función para monitorear carga del sistema
check_load() {
    if [ "$MONITOR_SYSTEM" != "true" ]; then
        return 0
    fi
    
    log "INFO" "Verificando carga del sistema..."
    
    local load=$(uptime | awk -F 'load average:' '{print $2}' | cut -d',' -f1 | sed 's/ //g')
    local load_int=${load%.*}
    
    log "INFO" "Carga del sistema: $load"
    
    if [ $load_int -gt $LOAD_THRESHOLD ]; then
        local message="Alta carga del sistema: $load (umbral: $LOAD_THRESHOLD)"
        log "WARNING" "$message"
        send_alert "⚠️ ALERTA: Alta carga del sistema" "$message" "warning"
        return 1
    fi
    
    return 0
}

# ============================================
# MONITOREO DE APLICACIÓN
# ============================================

# Función para monitorear HTTP
check_http() {
    if [ "$MONITOR_HTTP" != "true" ]; then
        return 0
    fi
    
    log "INFO" "Verificando estado HTTP..."
    
    local start_time=$(date +%s%N)
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $HTTP_TIMEOUT "$APP_URL")
    local end_time=$(date +%s%N)
    local response_time=$((($end_time - $start_time) / 1000000))
    
    log "INFO" "HTTP Status: $http_code"
    log "INFO" "Tiempo de respuesta: ${response_time}ms"
    
    if [ "$http_code" != "200" ] && [ "$http_code" != "301" ] && [ "$http_code" != "302" ]; then
        local message="HTTP Error: $http_code para $APP_URL"
        log "ERROR" "$message"
        send_alert "🚨 ALERTA: Servidor HTTP no responde" "$message" "critical"
        return 1
    fi
    
    if [ $response_time -gt $HTTP_THRESHOLD ]; then
        local message="Tiempo de respuesta alto: ${response_time}ms (umbral: ${HTTP_THRESHOLD}ms)"
        log "WARNING" "$message"
        send_alert "⚠️ ALERTA: Tiempo de respuesta alto" "$message" "warning"
    fi
    
    return 0
}

# Función para monitorear PHP
check_php() {
    if [ "$MONITOR_PHP" != "true" ]; then
        return 0
    fi
    
    log "INFO" "Verificando estado de PHP..."
    
    if command_exists php; then
        local php_version=$(php -v | head -n 1 | cut -d' ' -f2)
        log "INFO" "PHP versión: $php_version"
        
        # Verificar extensiones críticas
        local critical_extensions=("pdo" "mysqli" "mbstring" "curl" "json")
        
        for ext in "${critical_extensions[@]}"; do
            if php -m | grep -qi "^$ext$"; then
                log "INFO" "✓ Extensión $ext instalada"
            else
                log "ERROR" "✗ Extensión $ext NO instalada"
                send_alert "🚨 ALERTA: Extensión PHP faltante" "Extensión $ext no está instalada" "critical"
                return 1
            fi
        done
    else
        log "ERROR" "PHP no está instalado"
        send_alert "🚨 ALERTA: PHP no instalado" "PHP no está disponible en el sistema" "critical"
        return 1
    fi
    
    return 0
}

# ============================================
# MONITOREO DE BASE DE DATOS
# ============================================

# Función para monitorear MySQL
check_mysql() {
    if [ "$MONITOR_MYSQL" != "true" ]; then
        return 0
    fi
    
    log "INFO" "Verificando estado de MySQL..."
    
    if command_exists mysql; then
        # Verificar si el servicio está corriendo
        if systemctl is-active --quiet mysql 2>/dev/null || systemctl is-active --quiet mariadb 2>/dev/null; then
            log "INFO" "✓ Servicio MySQL activo"
        else
            log "ERROR" "✗ Servicio MySQL inactivo"
            send_alert "🚨 ALERTA: MySQL inactivo" "El servicio MySQL no está corriendo" "critical"
            return 1
        fi
        
        # Verificar conexión
        local mysql_test="mysql -h $DB_HOST -P $DB_PORT -u $DB_USER"
        if [ -n "$DB_PASSWORD" ]; then
            mysql_test="$mysql_test -p$DB_PASSWORD"
        fi
        mysql_test="$mysql_test -e 'SELECT 1' $DB_NAME"
        
        if eval $mysql_test &> /dev/null; then
            log "INFO" "✓ Conexión a base de datos exitosa"
            
            # Verificar tamaño de la base de datos
            local db_size=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER ${DB_PASSWORD:+-p$DB_PASSWORD} -e "
                SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as size_mb 
                FROM information_schema.tables 
                WHERE table_schema = '$DB_NAME'
            " -s -N 2>/dev/null)
            
            if [ -n "$db_size" ]; then
                log "INFO" "Tamaño de BD: ${db_size}MB"
            fi
        else
            log "ERROR" "✗ No se pudo conectar a la base de datos"
            send_alert "🚨 ALERTA: Conexión a BD fallida" "No se puede conectar a la base de datos" "critical"
            return 1
        fi
    else
        log "ERROR" "MySQL no está instalado"
        return 1
    fi
    
    return 0
}

# Función para monitorear Redis
check_redis() {
    if [ "$MONITOR_REDIS" != "true" ]; then
        return 0
    fi
    
    log "INFO" "Verificando estado de Redis..."
    
    if command_exists redis-cli; then
        if redis-cli -h $REDIS_HOST -p $REDIS_PORT ping &> /dev/null; then
            log "INFO" "✓ Redis está respondiendo"
            
            # Obtener estadísticas
            local redis_info=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT info stats 2>/dev/null)
            local total_commands=$(echo "$redis_info" | grep "total_commands_processed" | cut -d':' -f2)
            local connected_clients=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT info clients | grep "connected_clients" | cut -d':' -f2)
            
            log "INFO" "Comandos procesados: $total_commands"
            log "INFO" "Clientes conectados: $connected_clients"
        else
            log "ERROR" "✗ Redis no responde"
            send_alert "⚠️ ALERTA: Redis no responde" "Redis no está respondiendo en $REDIS_HOST:$REDIS_PORT" "warning"
            return 1
        fi
    else
        log "WARNING" "Redis CLI no instalado"
    fi
    
    return 0
}

# ============================================
# MONITOREO DE SERVICIOS
# ============================================

# Función para monitorear Nginx
check_nginx() {
    if [ "$MONITOR_NGINX" != "true" ]; then
        return 0
    fi
    
    log "INFO" "Verificando estado de Nginx..."
    
    if command_exists nginx; then
        if systemctl is-active --quiet nginx 2>/dev/null; then
            log "INFO" "✓ Servicio Nginx activo"
            
            # Verificar configuración
            if nginx -t 2>&1 | grep -q "successful"; then
                log "INFO" "✓ Configuración de Nginx válida"
            else
                log "ERROR" "✗ Configuración de Nginx inválida"
                send_alert "⚠️ ALERTA: Configuración Nginx inválida" "La configuración de Nginx tiene errores" "warning"
                return 1
            fi
        else
            log "ERROR" "✗ Servicio Nginx inactivo"
            send_alert "🚨 ALERTA: Nginx inactivo" "El servicio Nginx no está corriendo" "critical"
            return 1
        fi
    else
        log "WARNING" "Nginx no instalado"
    fi
    
    return 0
}

# Función para monitorear colas
check_queue() {
    if [ "$MONITOR_QUEUE" != "true" ]; then
        return 0
    fi
    
    log "INFO" "Verificando estado de las colas..."
    
    if command_exists php && [ -f "$APP_PATH/artisan" ]; then
        local queue_size=$(php $APP_PATH/artisan queue:size 2>/dev/null | grep -v "No" | awk '{print $NF}' | sed 's/[^0-9]*//g')
        
        if [ -n "$queue_size" ] && [ $queue_size -gt 100 ]; then
            log "WARNING" "Tamaño de cola alto: $queue_size jobs"
            send_alert "⚠️ ALERTA: Cola de jobs grande" "La cola tiene $queue_size jobs pendientes" "warning"
        elif [ -n "$queue_size" ]; then
            log "INFO" "Tamaño de cola: $queue_size jobs"
        fi
        
        # Verificar worker de cola
        if pgrep -f "queue:work" > /dev/null; then
            log "INFO" "✓ Worker de cola activo"
        else
            log "ERROR" "✗ Worker de cola inactivo"
            send_alert "🚨 ALERTA: Queue worker inactivo" "No hay workers de cola ejecutándose" "critical"
            return 1
        fi
    fi
    
    return 0
}

# Función para monitorear scheduler
check_scheduler() {
    if [ "$MONITOR_SCHEDULER" != "true" ]; then
        return 0
    fi
    
    log "INFO" "Verificando estado del scheduler..."
    
    # Verificar si el cron job existe
    if crontab -l 2>/dev/null | grep -q "artisan schedule:run"; then
        log "INFO" "✓ Cron job de scheduler configurado"
        
        # Verificar última ejecución
        local last_run_file="$APP_PATH/storage/framework/schedule-last-run"
        if [ -f "$last_run_file" ]; then
            local last_run=$(cat "$last_run_file")
            local last_run_time=$(date -d "$last_run" +%s 2>/dev/null)
            local current_time=$(date +%s)
            local time_diff=$((current_time - last_run_time))
            
            if [ $time_diff -gt 300 ]; then # 5 minutos
                log "WARNING" "Scheduler no se ha ejecutado en los últimos 5 minutos"
                send_alert "⚠️ ALERTA: Scheduler inactivo" "El scheduler no se ha ejecutado recientemente" "warning"
            else
                log "INFO" "✓ Scheduler activo - Última ejecución: $last_run"
            fi
        fi
    else
        log "WARNING" "Cron job de scheduler no configurado"
    fi
    
    return 0
}

# ============================================
# MONITOREO DE SSL
# ============================================

# Función para monitorear certificados SSL
check_ssl() {
    if [ "$MONITOR_SSL" != "true" ]; then
        return 0
    fi
    
    log "INFO" "Verificando certificados SSL..."
    
    local domain=$(echo "$APP_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||')
    
    if [[ "$domain" == "https://"* ]] || [[ "$domain" == *":443"* ]]; then
        if command_exists openssl; then
            local expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain":443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
            
            if [ -n "$expiry_date" ]; then
                local expiry_epoch=$(date -d "$expiry_date" +%s)
                local current_epoch=$(date +%s)
                local days_left=$(( ($expiry_epoch - $current_epoch) / 86400 ))
                
                log "INFO" "SSL expira en: $days_left días"
                
                if [ $days_left -lt 7 ]; then
                    local message="Certificado SSL expira en $days_left días"
                    log "CRITICAL" "$message"
                    send_alert "🚨 CRÍTICO: SSL por expirar" "$message" "critical"
                    return 1
                elif [ $days_left -lt 30 ]; then
                    local message="Certificado SSL expira en $days_left días"
                    log "WARNING" "$message"
                    send_alert "⚠️ ALERTA: SSL por expirar" "$message" "warning"
                fi
            else
                log "ERROR" "No se pudo obtener información SSL"
            fi
        fi
    else
        log "INFO" "SSL no configurado (HTTP)"
    fi
    
    return 0
}

# ============================================
# GENERACIÓN DE REPORTES
# ============================================

# Función para generar reporte de estado
generate_report() {
    local report_file="/tmp/monitor_report_$(date +%Y%m%d_%H%M%S).html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Monitor Report - $APP_NAME</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .status-ok { color: green; font-weight: bold; }
        .status-warning { color: orange; font-weight: bold; }
        .status-critical { color: red; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .metric { font-family: monospace; }
    </style>
</head>
<body>
    <h1>Monitor de Sistema - $APP_NAME</h1>
    <p>Fecha: $(date)</p>
    <p>Entorno: $ENVIRONMENT</p>
    
    <h2>Estado del Sistema</h2>
    <table>
        <tr><th>Métrica</th><th>Valor</th><th>Estado</th></tr>
EOF
    
    # Añadir métricas del sistema
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
        local mem_usage=$(free -m | awk '/^Mem:/{print $3/$2 * 100}')
        local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)
        
        cat >> "$report_file" << EOF
        <tr><td>CPU Usage</td><td class="metric">${cpu_usage}%</td>
        <td class="status-$( [ ${cpu_usage%.*} -gt $CPU_THRESHOLD ] && echo "critical" || echo "ok" )">
            $( [ ${cpu_usage%.*} -gt $CPU_THRESHOLD ] && echo "CRÍTICO" || echo "OK" )
        </td></tr>
        <tr><td>Memory Usage</td><td class="metric">${mem_usage%.*}%</td>
        <td class="status-$( [ ${mem_usage%.*} -gt $MEMORY_THRESHOLD ] && echo "critical" || echo "ok" )">
            $( [ ${mem_usage%.*} -gt $MEMORY_THRESHOLD ] && echo "CRÍTICO" || echo "OK" )
        </td></tr>
        <tr><td>Disk Usage</td><td class="metric">${disk_usage}%</td>
        <td class="status-$( [ $disk_usage -gt $DISK_THRESHOLD ] && echo "critical" || echo "ok" )">
            $( [ $disk_usage -gt $DISK_THRESHOLD ] && echo "CRÍTICO" || echo "OK" )
        </td></tr>
EOF
    fi
    
    # Añadir estado de servicios
    cat >> "$report_file" << EOF
    </table>
    
    <h2>Estado de Servicios</h2>
    <table>
        <tr><th>Servicio</th><th>Estado</th></tr>
EOF
    
    # Verificar servicios
    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo "        <td>Nginx</td><td class=\"status-ok\">✓ Activo</td></tr>" >> "$report_file"
    else
        echo "        <td>Nginx</td><td class=\"status-critical\">✗ Inactivo</td></tr>" >> "$report_file"
    fi
    
    if systemctl is-active --quiet mysql 2>/dev/null; then
        echo "        <td>MySQL</td><td class=\"status-ok\">✓ Activo</td></tr>" >> "$report_file"
    else
        echo "        <td>MySQL</td><td class=\"status-critical\">✗ Inactivo</td></tr>" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF
    </table>
    
    <h2>HTTP Endpoints</h2>
    <table>
        <tr><th>Endpoint</th><th>Status</th><th>Tiempo</th></tr>
EOF
    
    # Verificar endpoints principales
    local endpoints=("/" "/api/health" "/admin")
    for endpoint in "${endpoints[@]}"; do
        local url="$APP_URL$endpoint"
        local start_time=$(date +%s%N)
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url")
        local end_time=$(date +%s%N)
        local response_time=$((($end_time - $start_time) / 1000000))
        
        local status_class="status-$( [ "$http_code" = "200" ] && echo "ok" || echo "critical" )"
        local status_text=$( [ "$http_code" = "200" ] && echo "✓ OK" || echo "✗ $http_code" )
        
        echo "        <td>$endpoint</td><td class=\"$status_class\">$status_text</td><td>${response_time}ms</td></tr>" >> "$report_file"
    done
    
    cat >> "$report_file" << EOF
    </table>
    
    <hr>
    <footer>
        <p>Generado por Monitor System | $(date)</p>
    </footer>
</body>
</html>
EOF
    
    log "INFO" "Reporte generado: $report_file"
    echo "$report_file"
}

# ============================================
# MODO DAEMON
# ============================================

# Función para ejecutar en modo daemon
run_daemon() {
    log "INFO" "Iniciando monitor en modo daemon..."
    log "INFO" "Intervalo de chequeo: ${CHECK_INTERVAL}s"
    
    while true; do
        local issues=0
        
        # Ejecutar verificaciones
        check_cpu || ((issues++))
        check_memory || ((issues++))
        check_disk || ((issues++))
        check_load || ((issues++))
        check_http || ((issues++))
        check_php || ((issues++))
        check_mysql || ((issues++))
        check_redis || ((issues++))
        check_nginx || ((issues++))
        check_queue || ((issues++))
        check_scheduler || ((issues++))
        check_ssl || ((issues++))
        
        if [ $issues -eq 0 ]; then
            log "INFO" "Todos los sistemas operan normalmente"
        else
            log "WARNING" "Se encontraron $issues problema(s)"
        fi
        
        sleep $CHECK_INTERVAL
    done
}

# ============================================
# FUNCIÓN PRINCIPAL
# ============================================

main() {
    local mode=${1:-"once"}
    
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║   ${WHITE}${APP_NAME} - Sistema de Monitoreo${CYAN}                              ║"
    echo "║                                                               ║"
    echo "║   Entorno: ${YELLOW}${ENVIRONMENT}${CYAN}                                              ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    case $mode in
        "once")
            log "INFO" "Ejecutando monitoreo único..."
            
            check_cpu
            check_memory
            check_disk
            check_load
            check_http
            check_php
            check_mysql
            check_redis
            check_nginx
            check_queue
            check_scheduler
            check_ssl
            
            log "SUCCESS" "Monitoreo completado"
            ;;
        "daemon")
            run_daemon
            ;;
        "report")
            generate_report
            ;;
        *)
            echo "Uso: $0 {once|daemon|report}"
            echo "  once   - Ejecutar monitoreo una sola vez"
            echo "  daemon - Ejecutar monitoreo continuo"
            echo "  report - Generar reporte HTML"
            exit 1
            ;;
    esac
}

# ============================================
# MANEJO DE SEÑALES
# ============================================

trap 'log "WARNING" "Monitoreo detenido"; exit 0' INT TERM

# ============================================
# EJECUCIÓN PRINCIPAL
# ============================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi