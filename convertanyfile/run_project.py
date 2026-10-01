#!/usr/bin/env python3
"""
ConvertAnyFile - One-Click Master Startup Script (Localhost/XAMPP Directory)
File Name: run_project.py
Usage: python run_project.py
"""
import os, sys, time, socket, signal, shutil, argparse, platform, subprocess, webbrowser
from threading import Thread

def is_port_in_use(port, host="127.0.0.1"):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def find_php_binary():
    p = shutil.which("php")
    if p: return p
    if platform.system() == "Windows":
        for c in [r"C:\xampp\php\php.exe", r"D:\xampp\php\php.exe", r"C:\tools\php\php.exe"]:
            if os.path.isfile(c): return c
    for u in ["/usr/bin/php", "/usr/local/bin/php", "/opt/homebrew/bin/php"]:
        if os.path.isfile(u) and os.access(u, os.X_OK): return u
    return None

def run():
    parser = argparse.ArgumentParser(description="ConvertAnyFile Master Startup")
    parser.add_argument("--port", type=int, default=8000, help="PHP Server Port (default: 8000)")
    parser.add_argument("--no-browser", action="store_true", help="Do not auto-open browser")
    args = parser.parse_args()

    root_dir = os.path.abspath(os.path.dirname(__file__))
    php_path = find_php_binary()

    print("=" * 65)
    print("      CONVERTANYFILE - FULL LOCALHOST STARTUP RUNNER")
    print("=" * 65)
    print(f"• Root Directory:   {root_dir}")
    if php_path:
        print(f"• PHP Binary:       {php_path}")
        print(f"• Localhost URL:    http://localhost:{args.port}/")
        print(f"• Diagnostics URL:  http://localhost:{args.port}/system-check.php")
    else:
        print("• PHP CLI not found. Start Apache in XAMPP and visit: http://localhost/convertanyfile/")
    print("-" * 65)
    print("Examiner Demo Account:")
    print("  Email:    examiner@example.local")
    print("  Password: ChangeMe123! (Bcrypt hashed in database)")
    print("-" * 65)

    if not php_path:
        print("Tip: Install PHP or add C:\\xampp\\php to your system PATH to run standalone.")
        return

    proc = subprocess.Popen([php_path, "-S", f"0.0.0.0:{args.port}", "-t", root_dir])

    if not args.no_browser:
        Thread(target=lambda: (time.sleep(1.2), webbrowser.open(f"http://localhost:{args.port}/")), daemon=True).start()

    print(f"Server running! Press Ctrl+C to stop.")
    try:
        proc.wait()
    except KeyboardInterrupt:
        print("\nStopping PHP server...")
        proc.terminate()
        print("Stopped.")

if __name__ == "__main__":
    run()
