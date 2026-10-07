"""
=============================================================================
ConvertAnyFile - Scientific Computing Lab
Module: Numerical Root Finding (root_finding.py)
=============================================================================
This module solves non-linear algebraic and transcendental equations f(x) = 0.
It implements:
  1. Bisection Method (Bracketing)
  2. Newton-Raphson Method (Open method with symbolic differentiation via SymPy)
  3. Secant Method & Regula Falsi (False Position)
  4. SciPy Verification (scipy.optimize.root_scalar)
=============================================================================
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import math
from typing import Dict, Any, List, Optional, Callable
import numpy as np
import sympy as sp
from scipy import optimize
import matplotlib.pyplot as plt

# Define symbol x for SymPy
x_sym = sp.Symbol('x')


def parse_equation(expr_str: str) -> Tuple_Sympy_Function:
    """
    Parses a mathematical expression string into both a SymPy symbolic expression
    and a fast numeric callable function f(x).
    """
    # Clean expression
    cleaned = expr_str.strip().replace("^", "**")
    if cleaned.endswith("=0"):
        cleaned = cleaned[:-2].strip()

    sym_expr = sp.sympify(cleaned)
    # Fast numerical evaluator using numpy/math
    func = sp.lambdify(x_sym, sym_expr, modules=['numpy', 'math'])
    return sym_expr, func


Tuple_Sympy_Function = Any


# ---------------------------------------------------------------------------
# 1. BISECTION METHOD
# ---------------------------------------------------------------------------
def bisection_method(
    func: Callable[[float], float],
    a_init: float,
    b_init: float,
    tol: float = 1e-6,
    max_iter: int = 50
) -> Dict[str, Any]:
    """
    Finds a root of f(x) = 0 in bracket [a, b] using the Bisection Method.
    Requires f(a) * f(b) <= 0 by the Intermediate Value Theorem.
    """
    a = float(a_init)
    b = float(b_init)
    fa = func(a)
    fb = func(b)

    if fa * fb > 0:
        raise ValueError(
            f"Intermediate Value Theorem violated: f({a}) = {fa:.4g} and f({b}) = {fb:.4g} "
            f"have the same sign. Root is not guaranteed in [{a}, {b}]."
        )

    iterations = []
    c = a
    prev_c = a
    converged = False

    for i in range(1, max_iter + 1):
        c = (a + b) / 2.0
        fc = func(c)
        error = abs(b - a) if i == 1 else abs(c - prev_c)

        iterations.append({
            "iter": i,
            "a": a,
            "b": b,
            "c": c,
            "fc": fc,
            "error": error
        })

        if abs(fc) < tol or error < tol:
            converged = True
            break

        if fa * fc < 0:
            b = c
            fb = fc
        else:
            a = c
            fa = fc

        prev_c = c

    return {
        "method": "Bisection Method",
        "root": c,
        "f_root": func(c),
        "iterations": iterations,
        "total_iters": len(iterations),
        "converged": converged,
        "tolerance": tol,
        "convergence_rate": "Linear (error halves each iteration: O(1/2?))"
    }


# ---------------------------------------------------------------------------
# 2. NEWTON-RAPHSON METHOD
# ---------------------------------------------------------------------------
def newton_raphson_method(
    sym_expr: sp.Expr,
    func: Callable[[float], float],
    x0: float,
    tol: float = 1e-6,
    max_iter: int = 50
) -> Dict[str, Any]:
    """
    Finds a root of f(x) = 0 using the Newton-Raphson Method:
    x_{n+1} = x_n - f(x_n) / f'(x_n)
    Uses SymPy for exact analytical derivative f'(x).
    """
    # Compute analytical derivative using SymPy
    deriv_expr = sp.diff(sym_expr, x_sym)
    dfunc = sp.lambdify(x_sym, deriv_expr, modules=['numpy', 'math'])

    x_curr = float(x0)
    iterations = []
    converged = False

    for i in range(1, max_iter + 1):
        fx = func(x_curr)
        dfx = dfunc(x_curr)

        if abs(dfx) < 1e-12:
            raise ZeroDivisionError(
                f"Newton-Raphson encountered horizontal tangent: f'({x_curr:.4g}) ~ 0. "
                "Division by zero prevented."
            )

        x_next = x_curr - (fx / dfx)
        error = abs(x_next - x_curr)

        iterations.append({
            "iter": i,
            "x_n": x_curr,
            "fx": fx,
            "dfx": dfx,
            "x_next": x_next,
            "error": error
        })

        if abs(fx) < tol or error < tol:
            converged = True
            x_curr = x_next
            break

        x_curr = x_next

    return {
        "method": "Newton-Raphson Method",
        "root": x_curr,
        "f_root": func(x_curr),
        "derivative_expr": str(deriv_expr),
        "iterations": iterations,
        "total_iters": len(iterations),
        "converged": converged,
        "tolerance": tol,
        "convergence_rate": "Quadratic (number of accurate decimal digits roughly doubles: O(eps^2))"
    }


# ---------------------------------------------------------------------------
# 3. SECANT METHOD
# ---------------------------------------------------------------------------
def secant_method(
    func: Callable[[float], float],
    x0: float,
    x1: float,
    tol: float = 1e-6,
    max_iter: int = 50
) -> Dict[str, Any]:
    """
    Finds root using the Secant Method (does not require analytical derivative).
    x_{n+1} = x_n - f(x_n) * (x_n - x_{n-1}) / (f(x_n) - f(x_{n-1}))
    """
    p0 = float(x0)
    p1 = float(x1)
    iterations = []
    converged = False

    for i in range(1, max_iter + 1):
        f0 = func(p0)
        f1 = func(p1)

        if abs(f1 - f0) < 1e-12:
            raise ZeroDivisionError("Secant method failed: f(x1) - f(x0) is too close to zero.")

        p2 = p1 - (f1 * (p1 - p0)) / (f1 - f0)
        error = abs(p2 - p1)

        iterations.append({
            "iter": i,
            "x0": p0,
            "x1": p1,
            "f1": f1,
            "x2": p2,
            "error": error
        })

        if abs(f1) < tol or error < tol:
            converged = True
            p1 = p2
            break

        p0 = p1
        p1 = p2

    return {
        "method": "Secant Method",
        "root": p1,
        "f_root": func(p1),
        "iterations": iterations,
        "total_iters": len(iterations),
        "converged": converged,
        "tolerance": tol,
        "convergence_rate": "Superlinear (Golden ratio order ~ 1.618)"
    }


# ---------------------------------------------------------------------------
# 4. REPORT & VISUALIZATION
# ---------------------------------------------------------------------------
def print_iterations_table(res: Dict[str, Any]) -> None:
    """Prints a formatted table of numerical iterations."""
    print("\n" + "=" * 70)
    print(f"             {res['method'].upper()} RESULTS")
    print("=" * 70)
    print(f"Approximated Root (x*)  : {res['root']:.8f}")
    print(f"f(x*) at root           : {res['f_root']:.4e}")
    print(f"Total Iterations        : {res['total_iters']}")
    print(f"Convergence Status      : {'Converged Successfully' if res['converged'] else 'Max Iterations Reached'}")
    print(f"Convergence Rate        : {res['convergence_rate']}")
    if "derivative_expr" in res:
        print(f"Analytical f'(x)        : {res['derivative_expr']}")
    print("-" * 70)

    method = res["method"]
    if "Bisection" in method:
        print(f"{'Iter':<6} {'a':<12} {'b':<12} {'Midpoint (c)':<14} {'f(c)':<14} {'Error':<10}")
        print("-" * 70)
        for it in res["iterations"]:
            print(f"{it['iter']:<6} {it['a']:<12.6g} {it['b']:<12.6g} {it['c']:<14.6g} {it['fc']:<14.4e} {it['error']:<10.4e}")

    elif "Newton" in method:
        print(f"{'Iter':<6} {'x_n':<14} {'f(x_n)':<14} {'f\'(x_n)':<14} {'x_{n+1}':<14} {'Error':<10}")
        print("-" * 70)
        for it in res["iterations"]:
            print(f"{it['iter']:<6} {it['x_n']:<14.6g} {it['fx']:<14.4e} {it['dfx']:<14.4e} {it['x_next']:<14.6g} {it['error']:<10.4e}")

    elif "Secant" in method:
        print(f"{'Iter':<6} {'x_{n-1}':<14} {'x_n':<14} {'f(x_n)':<14} {'x_{n+1}':<14} {'Error':<10}")
        print("-" * 70)
        for it in res["iterations"]:
            print(f"{it['iter']:<6} {it['x0']:<14.6g} {it['x1']:<14.6g} {it['f1']:<14.4e} {it['x2']:<14.6g} {it['error']:<10.4e}")

    print("=" * 70)


def plot_root(sym_expr: sp.Expr, func: Callable[[float], float], root: float, title: str) -> None:
    """Plots the function curve and marks the discovered root."""
    # Choose span around root
    span = max(2.0, abs(root) * 0.8)
    x_min = root - span
    x_max = root + span
    x_vals = np.linspace(x_min, x_max, 400)

    try:
        y_vals = np.array([float(func(val)) for val in x_vals])
    except Exception:
        # Avoid plotting if evaluation fails across domain
        return

    plt.figure(figsize=(9, 5.5))
    plt.plot(x_vals, y_vals, label=f"f(x) = {sym_expr}", color="#2563eb", linewidth=2)
    plt.axhline(0, color="#111827", linestyle="--", linewidth=1.2, label="y = 0 (X-axis)")
    plt.axvline(0, color="#d1d5db", linestyle=":", linewidth=1.0)
    plt.scatter([root], [func(root)], color="#dc2626", s=90, zorder=6, label=f"Root x* ~ {root:.6f}")

    plt.title(f"Root Finding Visualization: {title}", fontsize=13, fontweight="bold")
    plt.xlabel("x", fontsize=11)
    plt.ylabel("f(x)", fontsize=11)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend(loc="best", frameon=True, shadow=True)
    plt.tight_layout()

    print("\nDisplaying Matplotlib Root Visualization window...")
    plt.show()


def run_root_finding_menu() -> None:
    """Interactive command-line menu for Root Finding."""
    print("\n---------------------------------------------------------")
    print("               NUMERICAL ROOT FINDING LAB")
    print("---------------------------------------------------------")
    print("Enter a non-linear equation in terms of x (e.g., x^3 - x - 2, cos(x) - x, x^2 - 4)")
    print("Or press ENTER to use default equation: x^3 - x - 2 = 0")

    raw_eq = input("\nEnter equation f(x): ").strip()
    if not raw_eq:
        raw_eq = "x**3 - x - 2"
        print(f"Using default equation: f(x) = {raw_eq}")

    try:
        sym_expr, func = parse_equation(raw_eq)
    except Exception as err:
        print(f"[Error] Could not parse equation '{raw_eq}': {err}")
        return

    print("\nSelect Root Finding Method:")
    print("1. Bisection Method (Bracketing)")
    print("2. Newton-Raphson Method (Requires Initial Guess & Derivative)")
    print("3. Secant Method (Requires 2 Initial Guesses)")
    print("4. Compare All Methods + SciPy Solver")

    choice = input("\nEnter choice (1-4) [default: 1]: ").strip()
    if not choice:
        choice = "1"

    try:
        if choice == "1":
            raw_a = input("Enter lower bound a [default: 1.0]: ").strip()
            raw_b = input("Enter upper bound b [default: 2.0]: ").strip()
            a = float(raw_a) if raw_a else 1.0
            b = float(raw_b) if raw_b else 2.0

            res = bisection_method(func, a, b)
            print_iterations_table(res)

            # Compare with SciPy
            try:
                scipy_root = optimize.root_scalar(func, bracket=[a, b], method='brentq').root
                print(f"SciPy root_scalar (brentq benchmark): {scipy_root:.8f}")
            except Exception:
                pass

            show_plot = input("\nWould you like to display the Root Plot? (y/n) [default: y]: ").strip().lower()
            if show_plot in ("", "y", "yes"):
                plot_root(sym_expr, func, res["root"], "Bisection Method")

        elif choice == "2":
            raw_x0 = input("Enter initial guess x0 [default: 1.5]: ").strip()
            x0 = float(raw_x0) if raw_x0 else 1.5

            res = newton_raphson_method(sym_expr, func, x0)
            print_iterations_table(res)

            # Compare with SciPy newton
            try:
                scipy_root = optimize.root_scalar(func, x0=x0, method='newton').root
                print(f"SciPy root_scalar (newton benchmark): {scipy_root:.8f}")
            except Exception:
                pass

            show_plot = input("\nWould you like to display the Root Plot? (y/n) [default: y]: ").strip().lower()
            if show_plot in ("", "y", "yes"):
                plot_root(sym_expr, func, res["root"], "Newton-Raphson Method")

        elif choice == "3":
            raw_x0 = input("Enter first guess x0 [default: 1.0]: ").strip()
            raw_x1 = input("Enter second guess x1 [default: 2.0]: ").strip()
            x0 = float(raw_x0) if raw_x0 else 1.0
            x1 = float(raw_x1) if raw_x1 else 2.0

            res = secant_method(func, x0, x1)
            print_iterations_table(res)
            show_plot = input("\nWould you like to display the Root Plot? (y/n) [default: y]: ").strip().lower()
            if show_plot in ("", "y", "yes"):
                plot_root(sym_expr, func, res["root"], "Secant Method")

        elif choice == "4":
            print("\n--- RUNNING COMPARISON OF NUMERICAL METHODS ---")
            bis_res = bisection_method(func, 1.0, 2.0)
            newt_res = newton_raphson_method(sym_expr, func, 1.5)
            sec_res = secant_method(func, 1.0, 2.0)

            print(f"\nEquation: f(x) = {sym_expr} = 0")
            print(f"{'Method':<20} {'Root Found':<16} {'Iterations':<12} {'Order of Convergence':<20}")
            print("-" * 70)
            print(f"{'Bisection':<20} {bis_res['root']:<16.8f} {bis_res['total_iters']:<12} {'Linear (O(1/2^n))':<20}")
            print(f"{'Newton-Raphson':<20} {newt_res['root']:<16.8f} {newt_res['total_iters']:<12} {'Quadratic (O(eps^2))':<20}")
            print(f"{'Secant':<20} {sec_res['root']:<16.8f} {sec_res['total_iters']:<12} {'Superlinear (1.618)':<20}")

            show_plot = input("\nWould you like to display the Root Plot? (y/n) [default: y]: ").strip().lower()
            if show_plot in ("", "y", "yes"):
                plot_root(sym_expr, func, newt_res["root"], "Comparison")

        # Viva Quick Notes
        print("\n[VIVA QUICK EXPLANATION]")
        print("* Bisection: Guaranteed convergence if f(a)*f(b) < 0, but slow (linear convergence).")
        print("* Newton-Raphson: Quadratic convergence (fast), but fails if f'(x) ~ 0 or initial guess is far from root.")
        print("* Secant: Approximates derivative numerically using finite difference; no analytical derivative needed.")

    except Exception as err:
        print(f"[Error] Root finding failed: {err}")


if __name__ == "__main__":
    run_root_finding_menu()
