#!/usr/bin/env python3
"""
=============================================================================
ConvertAnyFile - One-Click Master Startup Script
File Name: run_project.py
=============================================================================
Runs both the modern React 3D Frontend (Port 3000) and the PHP/XAMPP Backend
(Port 8000) concurrently with unified logging, automatic port discovery,
dependency installation, and graceful shutdown.

Usage:
    python run_project.py
    python run_project.py --no-browser
    python run_project.py --frontend-only
    python run_project.py --php-only
    python run_project.py --port 3000 --php-port 8000
=============================================================================
"""

import os
import sys
import time
import socket
import signal
import shutil
import argparse
import platform
import subprocess
import webbrowser
from threading import Thread

# ANSI Color Codes for terminal styling
class Colors:
    CYAN = "\033[96m"
    MAGENTA = "\033[95m"
    BLUE = "\033[94m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"

# Disable colors on Windows cmd if ANSI isn't enabled
if platform.system() == "Windows":
    os.system("color")

active_subprocesses = []

def print_banner(frontend_port, php_port, php_available, php_path):
    print(f"\n{Colors.CYAN}{Colors.BOLD}" + "=" * 70)
    print("      CONVERTANYFILE - ONE-CLICK FULL-STACK LAUNCHER")
    print("=" * 70 + f"{Colors.RESET}")
    print(f"{Colors.GREEN}✓ System Engine:{Colors.RESET}   Python {platform.python_version()} on {platform.system()} ({platform.machine()})")
    print(f"{Colors.GREEN}✓ Workspace Root:{Colors.RESET}  {os.path.abspath(os.getcwd())}")
    print(f"{Colors.GREEN}✓ Frontend URL:{Colors.RESET}    {Colors.BOLD}http://localhost:{frontend_port}{Colors.RESET}")
    
    if php_available:
        print(f"{Colors.GREEN}✓ PHP Backend URL:{Colors.RESET} {Colors.BOLD}http://localhost:{php_port}{Colors.RESET}")
        print(f"{Colors.GREEN}✓ System Check:{Colors.RESET}    {Colors.BOLD}http://localhost:{php_port}/system-check.php{Colors.RESET}")
        print(f"{Colors.DIM}  (PHP Binary: {php_path}){Colors.RESET}")
    else:
        print(f"{Colors.YELLOW}⚠ PHP Backend:{Colors.RESET}     PHP CLI not found in PATH or standard XAMPP paths.")
        print(f"{Colors.DIM}  For full PHP+MySQL execution: start Apache & MySQL via XAMPP Control Panel.{Colors.RESET}")
        print(f"{Colors.DIM}  Place 'convertanyfile/' into C:\\xampp\\htdocs\\convertanyfile\\{Colors.RESET}")
    
    print("-" * 70)
    print(f"{Colors.BOLD}Pre-Seeded Examiner Demonstration Account:{Colors.RESET}")
    print(f"  • Email:    {Colors.CYAN}examiner@example.local{Colors.RESET}")
    print(f"  • Password: {Colors.CYAN}ChangeMe123!{Colors.RESET} (Bcrypt secured)")
    print(f"  • Access:   Full Local Enterprise / Admin")
    print("-" * 70)
    print(f"{Colors.DIM}Press Ctrl+C at any time to gracefully stop all active servers.{Colors.RESET}\n")

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def find_available_port(start_port: int, max_attempts: int = 20) -> int:
    port = start_port
    while is_port_in_use(port) and max_attempts > 0:
        port += 1
        max_attempts -= 1
    return port

def find_php_binary():
    # 1. Check system PATH
    php_path = shutil.which("php")
    if php_path:
        return php_path

    # 2. Check standard Windows XAMPP and Wamp locations
    if platform.system() == "Windows":
        candidates = [
            r"C:\xampp\php\php.exe",
            r"D:\xampp\php\php.exe",
            r"E:\xampp\php\php.exe",
            r"C:\tools\php\php.exe",
            r"C:\wamp64\bin\php\php8.2.0\php.exe",
            r"C:\wamp64\bin\php\php8.1.0\php.exe",
            r"C:\Program Files\PHP\php.exe",
        ]
        for c in candidates:
            if os.path.isfile(c):
                return c

    # 3. Check standard Unix locations
    unix_candidates = [
        "/usr/bin/php",
        "/usr/local/bin/php",
        "/opt/homebrew/bin/php",
        "/opt/lampp/bin/php"
    ]
    for u in unix_candidates:
        if os.path.isfile(u) and os.access(u, os.X_OK):
            return u

    return None

def stream_logs(proc, prefix, color):
    try:
        for line in iter(proc.stdout.readline, ''):
            if not line:
                break
            clean_line = line.rstrip()
            if clean_line:
                print(f"{color}[{prefix}]{Colors.RESET} {clean_line}")
    except Exception:
        pass

def check_node_dependencies():
    root_dir = os.path.abspath(os.getcwd())
    node_modules_dir = os.path.join(root_dir, "node_modules")
    if not os.path.isdir(node_modules_dir):
        print(f"{Colors.YELLOW}[LAUNCHER] node_modules not found. Installing frontend dependencies...{Colors.RESET}")
        npm_cmd = "npm.cmd" if platform.system() == "Windows" else "npm"
        try:
            res = subprocess.run([npm_cmd, "install"], cwd=root_dir, check=True)
            if res.returncode == 0:
                print(f"{Colors.GREEN}[LAUNCHER] Dependencies installed successfully!{Colors.RESET}")
        except Exception as e:
            print(f"{Colors.RED}[LAUNCHER] Failed to run npm install: {e}{Colors.RESET}")

def run():
    parser = argparse.ArgumentParser(
        description="ConvertAnyFile - Unified One-Click Localhost Startup Script",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--port", type=int, default=3000, help="Frontend port (default: 3000)")
    parser.add_argument("--php-port", type=int, default=8000, help="PHP server port (default: 8000)")
    parser.add_argument("--no-browser", action="store_true", help="Do not open the browser automatically")
    parser.add_argument("--frontend-only", action="store_true", help="Launch only Vite React frontend")
    parser.add_argument("--php-only", action="store_true", help="Launch only PHP backend server")
    args = parser.parse_args()

    root_dir = os.path.abspath(os.getcwd())
    convertanyfile_dir = os.path.join(root_dir, "convertanyfile")

    php_path = find_php_binary()
    php_available = (php_path is not None) and os.path.isdir(convertanyfile_dir)

    # Port allocation
    frontend_port = args.port
    if not args.php_only and is_port_in_use(frontend_port):
        frontend_port = find_available_port(frontend_port)
    
    php_port = args.php_port
    if not args.frontend_only and is_port_in_use(php_port):
        php_port = find_available_port(php_port)

    # Print Header Information
    print_banner(frontend_port, php_port, php_available, php_path)

    # Shutdown handler
    def shutdown(signum=None, frame=None):
        print(f"\n{Colors.YELLOW}[LAUNCHER] Shutting down active servers...{Colors.RESET}")
        for p in active_subprocesses:
            try:
                if platform.system() == "Windows":
                    p.terminate()
                else:
                    p.send_signal(signal.SIGTERM)
            except Exception:
                pass
        time.sleep(0.5)
        print(f"{Colors.GREEN}[LAUNCHER] All servers stopped cleanly. Goodbye!{Colors.RESET}")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, shutdown)

    # 1. Start PHP server if enabled and available
    if not args.frontend_only and php_available:
        print(f"{Colors.MAGENTA}[PHP BACKEND] Starting PHP built-in server on http://localhost:{php_port}...{Colors.RESET}")
        php_cmd = [
            php_path,
            "-S", f"0.0.0.0:{php_port}",
            "-t", convertanyfile_dir
        ]
        php_proc = subprocess.Popen(
            php_cmd,
            cwd=convertanyfile_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        active_subprocesses.append(php_proc)
        t_php = Thread(target=stream_logs, args=(php_proc, "PHP", Colors.MAGENTA), daemon=True)
        t_php.start()

    # 2. Start Frontend server if enabled
    if not args.php_only:
        check_node_dependencies()
        print(f"{Colors.CYAN}[FRONTEND] Starting Vite dev server on port {frontend_port}...{Colors.RESET}")
        npx_cmd = "npx.cmd" if platform.system() == "Windows" else "npx"
        vite_cmd = [
            npx_cmd,
            "vite",
            f"--port={frontend_port}",
            "--host=0.0.0.0"
        ]
        vite_proc = subprocess.Popen(
            vite_cmd,
            cwd=root_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        active_subprocesses.append(vite_proc)
        t_vite = Thread(target=stream_logs, args=(vite_proc, "FRONTEND", Colors.CYAN), daemon=True)
        t_vite.start()

    # 3. Auto-open browser if requested
    if not args.no_browser and not args.php_only:
        def open_browser():
            time.sleep(1.8)
            webbrowser.open(f"http://localhost:{frontend_port}")
        Thread(target=open_browser, daemon=True).start()

    # Keep script alive and monitor child processes
    try:
        while True:
            time.sleep(1)
            for p in active_subprocesses:
                if p.poll() is not None:
                    # One of the processes died
                    print(f"{Colors.RED}[LAUNCHER] A process exited unexpectedly (code {p.returncode}).{Colors.RESET}")
                    shutdown()
    except KeyboardInterrupt:
        shutdown()

if __name__ == "__main__":
    run()
