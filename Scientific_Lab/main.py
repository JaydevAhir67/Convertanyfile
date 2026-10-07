"""
=============================================================================
CONVERTANYFILE - SCIENTIFIC COMPUTING LAB
Master Entry Point (main.py)
=============================================================================
A standalone scientific computing suite implemented in pure Python.
Features:
  1. Descriptive Statistics (Mean, Median, Mode, Variance, Std Dev, IQR)
  2. Linear Regression (Ordinary Least Squares, Slope, Intercept, R^2, Plot)
  3. Root Finding (Bisection, Newton-Raphson, Secant, Regula Falsi, SymPy)
  4. Matrix Operations (Add, Sub, Mult, Transpose, Det, Inv, Eig, Solver)
  5. Numerical Integration (Trapezoidal, Simpson's 1/3, Simpson's 3/8, SymPy)
  6. Graphing & Scientific Visualization (Matplotlib Suite)
=============================================================================
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import platform

# Import scientific modules
try:
    from statistics_module import run_statistics_menu
    from regression import run_regression_menu
    from root_finding import run_root_finding_menu
    from matrix_operations import run_matrix_menu
    from integration import run_integration_menu
    from visualization import run_visualization_menu
except ImportError as err:
    print(f"[Fatal Startup Error] Failed to import scientific module: {err}")
    print("Please make sure you have activated your virtual environment (.venv) and installed requirements:")
    print("  pip install -r requirements.txt")
    sys.exit(1)


def display_main_banner():
    """Prints the project banner and header."""
    print("\n" + "=" * 50)
    print("           CONVERTANYFILE")
    print("      SCIENTIFIC COMPUTING LAB")
    print("=" * 50)
    print(f" Python Version : {platform.python_version()} ({platform.system()})")
    print(" Architecture   : Standalone College Practical Suite")
    print(" Powered By     : NumPy, Pandas, SymPy, SciPy, Matplotlib")
    print("=" * 50)


def display_menu():
    """Prints the main interactive options."""
    print("\n1. Descriptive Statistics")
    print("2. Linear Regression")
    print("3. Root Finding")
    print("4. Matrix Operations")
    print("5. Numerical Integration")
    print("6. Graphing / Visualization")
    print("7. Exit")
    print("-" * 50)


def main():
    """Main application loop."""
    display_main_banner()

    while True:
        display_menu()
        try:
            choice = input("Enter your choice (1-7): ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n\nExiting Scientific Computing Lab. Goodbye!")
            break

        if choice in ("1", "stats", "statistics"):
            try:
                run_statistics_menu()
            except Exception as e:
                print(f"[Error in Statistics Module]: {e}")
            input("\nPress ENTER to return to the main menu...")

        elif choice in ("2", "reg", "regression"):
            try:
                run_regression_menu()
            except Exception as e:
                print(f"[Error in Regression Module]: {e}")
            input("\nPress ENTER to return to the main menu...")

        elif choice in ("3", "root", "roots"):
            try:
                run_root_finding_menu()
            except Exception as e:
                print(f"[Error in Root Finding Module]: {e}")
            input("\nPress ENTER to return to the main menu...")

        elif choice in ("4", "matrix", "matrices"):
            try:
                run_matrix_menu()
            except Exception as e:
                print(f"[Error in Matrix Module]: {e}")
            input("\nPress ENTER to return to the main menu...")

        elif choice in ("5", "integration", "integral"):
            try:
                run_integration_menu()
            except Exception as e:
                print(f"[Error in Integration Module]: {e}")
            input("\nPress ENTER to return to the main menu...")

        elif choice in ("6", "graph", "plot", "visualization"):
            try:
                run_visualization_menu()
            except Exception as e:
                print(f"[Error in Visualization Module]: {e}")
            input("\nPress ENTER to return to the main menu...")

        elif choice in ("7", "exit", "quit", "q"):
            print("\n==================================================")
            print(" Thank you for using ConvertAnyFile Scientific Lab")
            print("==================================================")
            break

        else:
            print("\n[Invalid Selection] Please choose a valid number from 1 to 7.")


if __name__ == "__main__":
    main()
