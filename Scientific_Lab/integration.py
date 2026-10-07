"""
=============================================================================
ConvertAnyFile - Scientific Computing Lab
Module: Numerical Integration (integration.py)
=============================================================================
This module computes definite integrals Integral [a, b] f(x) dx using:
  1. Trapezoidal Rule
  2. Simpson's 1/3 Rule (Parabolic interpolation, requires even n)
  3. Simpson's 3/8 Rule (Cubic interpolation, requires n divisible by 3)
  4. Exact Symbolic Integration via SymPy (Analytical ground truth)
  5. Adaptive Gauss-Kronrod Quadrature via SciPy (scipy.integrate.quad)
=============================================================================
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import math
from typing import Dict, Any, List, Tuple, Callable
import numpy as np
import sympy as sp
from scipy import integrate as sp_integrate
import matplotlib.pyplot as plt

x_sym = sp.Symbol('x')


def parse_function(expr_str: str) -> Tuple[sp.Expr, Callable[[float], float]]:
    """Parses a mathematical expression into SymPy expression and callable f(x)."""
    cleaned = expr_str.strip().replace("^", "**")
    sym_expr = sp.sympify(cleaned)
    func = sp.lambdify(x_sym, sym_expr, modules=['numpy', 'math'])
    return sym_expr, func


# ---------------------------------------------------------------------------
# 1. TRAPEZOIDAL RULE
# ---------------------------------------------------------------------------
def trapezoidal_rule(func: Callable[[float], float], a: float, b: float, n: int) -> Dict[str, Any]:
    """
    Computes Integral [a, b] f(x) dx using Composite Trapezoidal Rule:
    I ~ (h/2) * [ f(a) + 2*Sum f(x_i) + f(b) ]
    Error Order: O(h^2)
    """
    if n < 1:
        raise ValueError("Number of intervals n must be at least 1.")

    h = (b - a) / float(n)
    steps = []
    total_sum = 0.0

    for i in range(n + 1):
        xi = a + i * h
        f_xi = float(func(xi))
        weight = 1 if (i == 0 or i == n) else 2
        term = weight * f_xi
        total_sum += term
        steps.append({
            "i": i,
            "x": xi,
            "fx": f_xi,
            "weight": weight,
            "term": term
        })

    integral_val = (h / 2.0) * total_sum

    return {
        "method": "Trapezoidal Rule",
        "a": a,
        "b": b,
        "n": n,
        "h": h,
        "result": integral_val,
        "error_order": "O(h^2)",
        "formula": "I ~ (h/2) * [ f(x0) + 2*Sumf(x_i) + f(x_n) ]",
        "steps": steps
    }


# ---------------------------------------------------------------------------
# 2. SIMPSON'S 1/3 RULE
# ---------------------------------------------------------------------------
def simpsons_one_third_rule(func: Callable[[float], float], a: float, b: float, n_input: int) -> Dict[str, Any]:
    """
    Computes Integral [a, b] f(x) dx using Composite Simpson's 1/3 Rule:
    I ~ (h/3) * [ f(x0) + 4*Sum f(x_odd) + 2*Sum f(x_even) + f(x_n) ]
    Requires an EVEN number of sub-intervals (n).
    Error Order: O(h^4)
    """
    # Enforce even n
    n = n_input if n_input % 2 == 0 else n_input + 1
    h = (b - a) / float(n)
    steps = []
    total_sum = 0.0

    for i in range(n + 1):
        xi = a + i * h
        f_xi = float(func(xi))
        if i == 0 or i == n:
            weight = 1
        elif i % 2 == 1:
            weight = 4
        else:
            weight = 2

        term = weight * f_xi
        total_sum += term
        steps.append({
            "i": i,
            "x": xi,
            "fx": f_xi,
            "weight": weight,
            "term": term
        })

    integral_val = (h / 3.0) * total_sum

    return {
        "method": "Simpson's 1/3 Rule",
        "a": a,
        "b": b,
        "n": n,
        "adjusted_n": n != n_input,
        "h": h,
        "result": integral_val,
        "error_order": "O(h^4)",
        "formula": "I ~ (h/3) * [ f(x0) + 4*Sumf(x_odd) + 2*Sumf(x_even) + f(x_n) ]",
        "steps": steps
    }


# ---------------------------------------------------------------------------
# 3. SIMPSON'S 3/8 RULE
# ---------------------------------------------------------------------------
def simpsons_three_eighth_rule(func: Callable[[float], float], a: float, b: float, n_input: int) -> Dict[str, Any]:
    """
    Computes Integral [a, b] f(x) dx using Composite Simpson's 3/8 Rule:
    I ~ (3h/8) * [ f(x0) + 3*f(x1) + 3*f(x2) + 2*f(x3) + ... + f(x_n) ]
    Requires n to be a MULTIPLE of 3.
    Error Order: O(h^4)
    """
    rem = n_input % 3
    n = n_input if rem == 0 else n_input + (3 - rem)
    h = (b - a) / float(n)
    steps = []
    total_sum = 0.0

    for i in range(n + 1):
        xi = a + i * h
        f_xi = float(func(xi))
        if i == 0 or i == n:
            weight = 1
        elif i % 3 == 0:
            weight = 2
        else:
            weight = 3

        term = weight * f_xi
        total_sum += term
        steps.append({
            "i": i,
            "x": xi,
            "fx": f_xi,
            "weight": weight,
            "term": term
        })

    integral_val = (3.0 * h / 8.0) * total_sum

    return {
        "method": "Simpson's 3/8 Rule",
        "a": a,
        "b": b,
        "n": n,
        "adjusted_n": n != n_input,
        "h": h,
        "result": integral_val,
        "error_order": "O(h^4)",
        "formula": "I ~ (3h/8) * [ f(x0) + 3*f(x1) + 3*f(x2) + 2*f(x3) + ... + f(x_n) ]",
        "steps": steps
    }


# ---------------------------------------------------------------------------
# 4. REPORT & VISUALIZATION
# ---------------------------------------------------------------------------
def print_integration_report(res: Dict[str, Any], exact_val: Optional[float] = None) -> None:
    """Prints a detailed tabular numerical integration report."""
    print("\n" + "=" * 70)
    print(f"         NUMERICAL INTEGRATION: {res['method'].upper()}")
    print("=" * 70)
    print(f"Integration Limits      : a = {res['a']}, b = {res['b']}")
    print(f"Number of Intervals (n) : {res['n']}" + (" (auto-adjusted for rule parity)" if res.get("adjusted_n") else ""))
    print(f"Step Size (h)           : {res['h']:.6f}")
    print(f"Formula                 : {res['formula']}")
    print(f"Theoretical Error Order : {res['error_order']}")
    print("-" * 70)
    print(f"NUMERICAL RESULT        : {res['result']:.8f}")
    if exact_val is not None:
        abs_err = abs(res['result'] - exact_val)
        rel_err = (abs_err / abs(exact_val)) * 100 if abs(exact_val) > 1e-12 else 0.0
        print(f"Exact / Quad Value      : {exact_val:.8f}")
        print(f"Absolute Error |I - I*| : {abs_err:.4e}")
        print(f"Relative Error (%)      : {rel_err:.4f}%")
    print("-" * 70)

    # Show first few steps and last step
    steps = res["steps"]
    print("INTERMEDIATE QUADRATURE TABLE:")
    print(f"{'i':<4} {'x_i':<12} {'f(x_i)':<14} {'Weight':<8} {'Weighted Term':<16}")
    print("-" * 70)
    if len(steps) <= 12:
        for s in steps:
            print(f"{s['i']:<4} {s['x']:<12.6g} {s['fx']:<14.6g} {s['weight']:<8} {s['term']:<16.6g}")
    else:
        for s in steps[:5]:
            print(f"{s['i']:<4} {s['x']:<12.6g} {s['fx']:<14.6g} {s['weight']:<8} {s['term']:<16.6g}")
        print(f"{'...':<4} {'...':<12} {'...':<14} {'...':<8} {'...':<16}")
        for s in steps[-4:]:
            print(f"{s['i']:<4} {s['x']:<12.6g} {s['fx']:<14.6g} {s['weight']:<8} {s['term']:<16.6g}")
    print("=" * 70)


def plot_integration(func: Callable[[float], float], a: float, b: float, method_name: str, result_val: float) -> None:
    """Plots the integrand function and shades the computed definite integral area."""
    span = b - a
    x_plot = np.linspace(a - 0.2 * span, b + 0.2 * span, 300)
    y_plot = np.array([float(func(x)) for x in x_plot])

    # Region to shade
    x_shade = np.linspace(a, b, 200)
    y_shade = np.array([float(func(x)) for x in x_shade])

    plt.figure(figsize=(9, 5.5))
    plt.plot(x_plot, y_plot, color="#1e40af", linewidth=2.2, label="Integrand f(x)")
    plt.fill_between(x_shade, y_shade, color="#93c5fd", alpha=0.5, label=f"Integral Area ~ {result_val:.6f}")
    plt.axvline(a, color="#dc2626", linestyle="--", linewidth=1.2, label=f"Lower Limit a = {a}")
    plt.axvline(b, color="#16a34a", linestyle="--", linewidth=1.2, label=f"Upper Limit b = {b}")
    plt.axhline(0, color="#111827", linestyle=":", linewidth=0.8)

    plt.title(f"Numerical Integration Area: {method_name}", fontsize=13, fontweight="bold")
    plt.xlabel("x", fontsize=11)
    plt.ylabel("f(x)", fontsize=11)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend(loc="best", frameon=True, shadow=True)
    plt.tight_layout()

    print("\nDisplaying Matplotlib Integration Area window...")
    plt.show()


def run_integration_menu() -> None:
    """Interactive command-line menu for Numerical Integration."""
    print("\n---------------------------------------------------------")
    print("             NUMERICAL INTEGRATION LAB")
    print("---------------------------------------------------------")
    print("Enter integrand f(x) (e.g., 1 / (1 + x^2), sin(x), x^2, exp(x))")
    print("Or press ENTER for classic benchmark: 1 / (1 + x^2) from 0 to 1 [Exact = pi/4 ~ 0.785398]")

    raw_eq = input("\nEnter integrand f(x): ").strip()
    if not raw_eq:
        raw_eq = "1 / (1 + x**2)"
        a = 0.0
        b = 1.0
        n = 6
        print(f"Using default: f(x) = {raw_eq}, limits: [{a}, {b}], intervals: n = {n}")
    else:
        raw_a = input("Enter lower limit a [default: 0.0]: ").strip()
        raw_b = input("Enter upper limit b [default: 1.0]: ").strip()
        raw_n = input("Enter number of sub-intervals n [default: 6]: ").strip()
        a = float(raw_a) if raw_a else 0.0
        b = float(raw_b) if raw_b else 1.0
        n = int(raw_n) if raw_n else 6

    try:
        sym_expr, func = parse_function(raw_eq)
    except Exception as err:
        print(f"[Error] Could not parse function: {err}")
        return

    # Compute exact analytical integral using SymPy
    exact_val = None
    try:
        analytical_res = sp.integrate(sym_expr, (x_sym, a, b))
        exact_val = float(analytical_res.evalf())
        print(f"\n[SymPy Exact Symbolic Integral]: {analytical_res} ~ {exact_val:.8f}")
    except Exception:
        # Fallback to SciPy quad
        try:
            quad_res, _ = sp_integrate.quad(func, a, b)
            exact_val = float(quad_res)
            print(f"\n[SciPy Adaptive Quadrature]: {exact_val:.8f}")
        except Exception:
            pass

    print("\nSelect Numerical Quadrature Method:")
    print("1. Trapezoidal Rule")
    print("2. Simpson's 1/3 Rule")
    print("3. Simpson's 3/8 Rule")
    print("4. Comprehensive Comparison of All Methods")

    choice = input("\nEnter choice (1-4) [default: 4]: ").strip()
    if not choice:
        choice = "4"

    try:
        if choice == "1":
            res = trapezoidal_rule(func, a, b, n)
            print_integration_report(res, exact_val)
            show_plot = input("\nWould you like to display the Integration Area Plot? (y/n) [default: y]: ").strip().lower()
            if show_plot in ("", "y", "yes"):
                plot_integration(func, a, b, res["method"], res["result"])

        elif choice == "2":
            res = simpsons_one_third_rule(func, a, b, n)
            print_integration_report(res, exact_val)
            show_plot = input("\nWould you like to display the Integration Area Plot? (y/n) [default: y]: ").strip().lower()
            if show_plot in ("", "y", "yes"):
                plot_integration(func, a, b, res["method"], res["result"])

        elif choice == "3":
            res = simpsons_three_eighth_rule(func, a, b, n)
            print_integration_report(res, exact_val)
            show_plot = input("\nWould you like to display the Integration Area Plot? (y/n) [default: y]: ").strip().lower()
            if show_plot in ("", "y", "yes"):
                plot_integration(func, a, b, res["method"], res["result"])

        elif choice == "4":
            trap_res = trapezoidal_rule(func, a, b, n)
            simp13_res = simpsons_one_third_rule(func, a, b, n)
            simp38_res = simpsons_three_eighth_rule(func, a, b, n)

            print("\n" + "=" * 70)
            print("         COMPREHENSIVE NUMERICAL INTEGRATION COMPARISON")
            print("=" * 70)
            print(f"Integrand: Integral[{a}, {b}] {sym_expr} dx")
            if exact_val is not None:
                print(f"Exact Analytical Reference Value: {exact_val:.8f}")
            print("-" * 70)
            print(f"{'Method':<24} {'Intervals (n)':<14} {'Result':<16} {'Abs Error':<16}")
            print("-" * 70)

            for item in [trap_res, simp13_res, simp38_res]:
                err_str = f"{abs(item['result'] - exact_val):.4e}" if exact_val is not None else "N/A"
                print(f"{item['method']:<24} {item['n']:<14} {item['result']:<16.8f} {err_str:<16}")
            print("=" * 70)

            show_plot = input("\nWould you like to display the Integration Area Plot? (y/n) [default: y]: ").strip().lower()
            if show_plot in ("", "y", "yes"):
                plot_integration(func, a, b, "Simpson's 1/3 Rule", simp13_res["result"])

        # Viva Quick Notes
        print("\n[VIVA QUICK EXPLANATION]")
        print("* Trapezoidal Rule: Approximates integrand with straight lines (1st-degree polynomials); error O(h^2).")
        print("* Simpson's 1/3 Rule: Approximates integrand with parabolic arcs (2nd-degree polynomials); error O(h^4).")
        print("* Parity constraint: Simpson's 1/3 mathematically requires an even number of subintervals (pairs of intervals).")

    except Exception as err:
        print(f"[Error] Integration calculation failed: {err}")


if __name__ == "__main__":
    run_integration_menu()
