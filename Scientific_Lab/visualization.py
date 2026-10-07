"""
=============================================================================
ConvertAnyFile - Scientific Computing Lab
Module: Graphing & Mathematical Visualization (visualization.py)
=============================================================================
This module provides a dedicated scientific plotting suite using Matplotlib:
  1. Line Graph (Time series / trends)
  2. Scatter Plot (Point distributions / clusters)
  3. Linear Regression Plot (Observed points + fitted line + equation)
  4. Mathematical Function Plotter (y = f(x) over arbitrary intervals [a, b])
  5. Multi-function Comparison (e.g. sin(x) vs cos(x))
  6. Normal / Gaussian Bell Curve Distribution
=============================================================================
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import math
from typing import List, Optional
import numpy as np
import sympy as sp
import matplotlib.pyplot as plt

x_sym = sp.Symbol('x')


def setup_plot_style():
    """Sets a clean, publication-ready aesthetic for scientific graphs."""
    plt.style.use('default')
    plt.rcParams['font.size'] = 10
    plt.rcParams['axes.labelsize'] = 11
    plt.rcParams['axes.titlesize'] = 12
    plt.rcParams['legend.fontsize'] = 10
    plt.rcParams['xtick.labelsize'] = 9
    plt.rcParams['ytick.labelsize'] = 9


def plot_line_graph(x: List[float], y: List[float], title: str = "Scientific Line Graph",
                    xlabel: str = "X Axis", ylabel: str = "Y Axis") -> None:
    """Plots a continuous or discrete line graph with marked data points."""
    setup_plot_style()
    plt.figure(figsize=(8.5, 5))
    plt.plot(x, y, marker='o', color='#2563eb', linewidth=2.2, markersize=6,
             label="Observed Series", linestyle='-')
    plt.title(title, fontweight="bold")
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend(frameon=True, shadow=True)
    plt.tight_layout()
    print("\nDisplaying Line Graph...")
    plt.show()


def plot_scatter_plot(x: List[float], y: List[float], title: str = "Scientific Scatter Plot",
                      xlabel: str = "X Variable", ylabel: str = "Y Variable") -> None:
    """Plots a 2D scatter plot with color accents."""
    setup_plot_style()
    plt.figure(figsize=(8.5, 5))
    plt.scatter(x, y, color='#0284c7', edgecolors='#0369a1', s=70, alpha=0.85, label="Data Points")
    plt.title(title, fontweight="bold")
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend(frameon=True, shadow=True)
    plt.tight_layout()
    print("\nDisplaying Scatter Plot...")
    plt.show()


def plot_math_function(expr_str: str, a: float, b: float, num_points: int = 500) -> None:
    """Evaluates and plots an analytical function y = f(x) over [a, b]."""
    setup_plot_style()
    cleaned = expr_str.strip().replace("^", "**")
    sym_expr = sp.sympify(cleaned)
    func = sp.lambdify(x_sym, sym_expr, modules=['numpy', 'math'])

    x_vals = np.linspace(a, b, num_points)
    try:
        y_vals = np.array([float(func(val)) for val in x_vals])
    except Exception as e:
        print(f"[Error] Failed to evaluate function over domain [{a}, {b}]: {e}")
        return

    plt.figure(figsize=(9, 5.5))
    plt.plot(x_vals, y_vals, color='#7c3aed', linewidth=2.4, label=f"f(x) = {sym_expr}")
    plt.axhline(0, color='#111827', linestyle='--', linewidth=0.9, alpha=0.8)
    plt.axvline(0, color='#111827', linestyle='--', linewidth=0.9, alpha=0.8)
    plt.title(f"Mathematical Function Plot: f(x) = {sym_expr}", fontweight="bold")
    plt.xlabel("x")
    plt.ylabel("f(x)")
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend(frameon=True, shadow=True)
    plt.tight_layout()
    print("\nDisplaying Function Plot...")
    plt.show()


def plot_sine_cosine_demo() -> None:
    """Plots classic trigonometric curves sin(x) vs cos(x) with phase comparison."""
    setup_plot_style()
    x = np.linspace(-2 * np.pi, 2 * np.pi, 400)
    y_sin = np.sin(x)
    y_cos = np.cos(x)

    plt.figure(figsize=(9, 5.5))
    plt.plot(x, y_sin, label="y = sin(x)", color="#2563eb", linewidth=2.2)
    plt.plot(x, y_cos, label="y = cos(x)", color="#dc2626", linewidth=2.2, linestyle="--")
    plt.axhline(0, color="#111827", linestyle=":", linewidth=1)
    plt.axvline(0, color="#111827", linestyle=":", linewidth=1)
    plt.title("Trigonometric Waveforms: sin(x) vs cos(x)", fontweight="bold")
    plt.xlabel("Angle (Radians)")
    plt.ylabel("Amplitude")
    plt.xticks(
        [-2 * np.pi, -np.pi, 0, np.pi, 2 * np.pi],
        [r"$-2\pi$", r"$-\pi$", r"$0$", r"$\pi$", r"$2\pi$"]
    )
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend(frameon=True, shadow=True)
    plt.tight_layout()
    print("\nDisplaying Trigonometric Waveform Plot...")
    plt.show()


def plot_normal_distribution_demo(mu: float = 0.0, sigma: float = 1.0) -> None:
    """Plots Gaussian / Normal Bell Curve distribution N(mu, sigma^2)."""
    setup_plot_style()
    x = np.linspace(mu - 4 * sigma, mu + 4 * sigma, 500)
    y = (1.0 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mu) / sigma) ** 2)

    plt.figure(figsize=(9, 5.5))
    plt.plot(x, y, color="#059669", linewidth=2.5, label=f"Normal Curve N(mu={mu}, sigma={sigma})")
    plt.fill_between(x, y, color="#a7f3d0", alpha=0.5)
    
    # 1-sigma, 2-sigma markers
    plt.axvline(mu, color="#047857", linestyle="-", linewidth=1.5, label=f"Mean mu = {mu}")
    plt.axvline(mu + sigma, color="#b45309", linestyle="--", linewidth=1.2, label=f"?1sigma (68.27%)")
    plt.axvline(mu - sigma, color="#b45309", linestyle="--", linewidth=1.2)
    plt.axvline(mu + 2 * sigma, color="#b91c1c", linestyle=":", linewidth=1.2, label=f"?2sigma (95.45%)")
    plt.axvline(mu - 2 * sigma, color="#b91c1c", linestyle=":", linewidth=1.2)

    plt.title(f"Gaussian (Normal) Distribution: mu = {mu}, sigma = {sigma}", fontweight="bold")
    plt.xlabel("x")
    plt.ylabel("Probability Density f(x)")
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend(frameon=True, shadow=True)
    plt.tight_layout()
    print("\nDisplaying Gaussian Distribution Plot...")
    plt.show()


def run_visualization_menu() -> None:
    """Interactive command-line menu for Graphing & Visualization."""
    print("\n---------------------------------------------------------")
    print("             GRAPHING & VISUALIZATION LAB")
    print("---------------------------------------------------------")
    print("1. Line Graph (Custom X, Y Coordinates)")
    print("2. Scatter Plot (Custom X, Y Coordinates)")
    print("3. Mathematical Function Plotter (e.g., x^3 - 3*x + 1, exp(-x^2))")
    print("4. Trigonometric Waves Demo (sin(x) vs cos(x))")
    print("5. Gaussian / Normal Distribution Bell Curve Demo")

    choice = input("\nEnter choice (1-5) [default: 3]: ").strip()
    if not choice:
        choice = "3"

    try:
        if choice in ("1", "2"):
            raw_x = input("Enter X values (or press ENTER for default [1, 2, 3, 4, 5, 6, 7]): ").strip()
            raw_y = input("Enter Y values (or press ENTER for default [4, 9, 15, 22, 35, 48, 65]): ").strip()

            if not raw_x or not raw_y:
                x_vals = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0]
                y_vals = [4.0, 9.0, 15.0, 22.0, 35.0, 48.0, 65.0]
            else:
                x_vals = [float(p) for p in raw_x.replace(",", " ").split()]
                y_vals = [float(p) for p in raw_y.replace(",", " ").split()]

            if choice == "1":
                plot_line_graph(x_vals, y_vals)
            else:
                plot_scatter_plot(x_vals, y_vals)

        elif choice == "3":
            raw_eq = input("Enter function f(x) [default: x**3 - 3*x + 1]: ").strip()
            if not raw_eq:
                raw_eq = "x**3 - 3*x + 1"
            raw_a = input("Enter interval start a [default: -3.0]: ").strip()
            raw_b = input("Enter interval end b [default: 3.0]: ").strip()
            a = float(raw_a) if raw_a else -3.0
            b = float(raw_b) if raw_b else 3.0

            plot_math_function(raw_eq, a, b)

        elif choice == "4":
            plot_sine_cosine_demo()

        elif choice == "5":
            raw_mu = input("Enter Mean (mu) [default: 0.0]: ").strip()
            raw_sigma = input("Enter Standard Deviation (sigma) [default: 1.0]: ").strip()
            mu = float(raw_mu) if raw_mu else 0.0
            sigma = float(raw_sigma) if raw_sigma else 1.0
            plot_normal_distribution_demo(mu, sigma)

        # Viva Quick Notes
        print("\n[VIVA QUICK EXPLANATION]")
        print("* Matplotlib Architecture: Figure (canvas) and Axes (subplot with data/scales).")
        print("* linspace vs arange: np.linspace specifies exact count of sample points; arange specifies step size.")
        print("* Vectorization: NumPy arrays evaluate mathematical functions across thousands of elements simultaneously in C speed.")

    except Exception as err:
        print(f"[Error] Visualization failed: {err}")


if __name__ == "__main__":
    run_visualization_menu()
