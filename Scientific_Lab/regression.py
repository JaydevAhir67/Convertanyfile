"""
=============================================================================
ConvertAnyFile - Scientific Computing Lab
Module: Linear Regression (regression.py)
=============================================================================
This module computes Ordinary Least Squares (OLS) Linear Regression (y = mx + c).
It demonstrates both the manual mathematical derivation and the SciPy/NumPy
library functions, displaying a complete mathematical report and Matplotlib graph.
=============================================================================
"""

import math
from typing import List, Dict, Any, Tuple
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt


def calculate_linear_regression(x_vals: List[float], y_vals: List[float]) -> Dict[str, Any]:
    """
    Computes linear regression slope, intercept, correlation coefficient (r),
    and R-squared (coefficient of determination).

    Parameters:
        x_vals (List[float]): Independent variable values.
        y_vals (List[float]): Dependent variable values.

    Returns:
        Dict[str, Any]: Regression parameters, residuals, and validation metrics.
    """
    n = min(len(x_vals), len(y_vals))
    if n < 2:
        raise ValueError("At least 2 coordinate pairs (x, y) are required for linear regression.")

    x = np.array(x_vals[:n], dtype=float)
    y = np.array(y_vals[:n], dtype=float)

    # ---------------------------------------------------------
    # 1. MANUAL CALCULATION (Ordinary Least Squares)
    # x_bar = Sumx / n,  y_bar = Sumy / n
    # Slope (m) = Sum(x - x_bar)(y - y_bar) / Sum(x - x_bar)^2
    # Intercept (c) = y_bar - m * x_bar
    # ---------------------------------------------------------
    x_mean = float(np.mean(x))
    y_mean = float(np.mean(y))

    dx = x - x_mean
    dy = y - y_mean

    ss_xy = float(np.sum(dx * dy))       # Covariance numerator
    ss_xx = float(np.sum(dx ** 2))       # Variance of X
    ss_yy = float(np.sum(dy ** 2))       # Variance of Y

    if abs(ss_xx) < 1e-12:
        raise ValueError("Variance of independent variable X is zero (vertical line). Cannot fit y = mx + c.")

    slope = ss_xy / ss_xx
    intercept = y_mean - slope * x_mean

    # Pearson Correlation Coefficient (r)
    # r = ss_xy / sqrt(ss_xx * ss_yy)
    if ss_yy > 0:
        r_value = ss_xy / math.sqrt(ss_xx * ss_yy)
    else:
        r_value = 0.0

    r_squared = r_value ** 2

    # ---------------------------------------------------------
    # 2. SCIPY & NUMPY VERIFICATION
    # ---------------------------------------------------------
    # Using scipy.stats.linregress
    scipy_res = stats.linregress(x, y)
    
    # Using numpy.polyfit (degree 1)
    np_slope, np_intercept = np.polyfit(x, y, deg=1)

    # ---------------------------------------------------------
    # 3. PREDICTIONS & RESIDUALS (y - y_hat)
    # ---------------------------------------------------------
    y_pred = slope * x + intercept
    residuals = y - y_pred

    # Standard error of the estimate: Se = sqrt(Sum(y - y_hat)^2 / (n - 2))
    if n > 2:
        std_err = math.sqrt(float(np.sum(residuals ** 2)) / (n - 2))
    else:
        std_err = 0.0

    sign_str = "+" if intercept >= 0 else "-"
    equation_str = f"y = {slope:.4f}x {sign_str} {abs(intercept):.4f}"

    points = []
    for xi, yi, y_hat, res in zip(x, y, y_pred, residuals):
        points.append({
            "x": float(xi),
            "y": float(yi),
            "y_pred": float(y_hat),
            "residual": float(res)
        })

    return {
        "n": n,
        "x": x,
        "y": y,
        "x_mean": x_mean,
        "y_mean": y_mean,
        "slope": slope,
        "intercept": intercept,
        "equation": equation_str,
        "r": r_value,
        "r_squared": r_squared,
        "std_err": std_err,
        "scipy_slope": scipy_res.slope,
        "scipy_intercept": scipy_res.intercept,
        "scipy_rvalue": scipy_res.rvalue,
        "scipy_pvalue": scipy_res.pvalue,
        "scipy_stderr": scipy_res.stderr,
        "points": points,
    }


import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def print_regression_report(reg: Dict[str, Any]) -> None:
    """Prints a clear, formatted regression report."""
    print("\n" + "=" * 65)
    print("           LINEAR REGRESSION ANALYSIS REPORT")
    print("=" * 65)
    print(f"Number of Data Points (N) : {reg['n']}")
    print(f"Mean of X (x_bar)         : {reg['x_mean']:.6g}")
    print(f"Mean of Y (y_bar)         : {reg['y_mean']:.6g}")
    print("-" * 65)
    print("REGRESSION PARAMETERS (y = mx + c):")
    print(f"Slope (m)                 : {reg['slope']:.6f}  (SciPy: {reg['scipy_slope']:.6f})")
    print(f"Intercept (c)             : {reg['intercept']:.6f}  (SciPy: {reg['scipy_intercept']:.6f})")
    print(f"Fitted Equation           : {reg['equation']}")
    print("-" * 65)
    print("GOODNESS OF FIT & CORRELATION:")
    print(f"Pearson Correlation (r)   : {reg['r']:.6f}")
    strength = "Very Strong" if abs(reg['r']) >= 0.8 else "Moderate" if abs(reg['r']) >= 0.5 else "Weak"
    direction = "Positive" if reg['r'] > 0 else "Negative"
    print(f"Correlation Assessment    : {strength} {direction} Linear Relationship")
    print(f"Coefficient of Determ. R^2: {reg['r_squared']:.6f} ({reg['r_squared']*100:.2f}% variance explained)")
    print(f"Std Error of Regression   : {reg['std_err']:.6f}")
    if reg['n'] > 2:
        print(f"P-value (Slope != 0)      : {reg['scipy_pvalue']:.4e} " +
              ("(Statistically Significant at p < 0.05)" if reg['scipy_pvalue'] < 0.05 else "(Not Significant)"))
    print("-" * 65)
    print("DATA POINTS & RESIDUALS TABLE:")
    print(f"{'Index':<6} {'X':<10} {'Y Actual':<12} {'Y Predicted':<14} {'Residual (e)':<14}")
    print("-" * 65)
    for i, pt in enumerate(reg["points"], 1):
        print(f"{i:<6} {pt['x']:<10.4g} {pt['y']:<12.4g} {pt['y_pred']:<14.4g} {pt['residual']:<14.4g}")
    print("=" * 65)


def plot_regression(reg: Dict[str, Any]) -> None:
    """Plots the scatter points, fitted regression line, and residual projections."""
    x = reg["x"]
    y = reg["y"]
    slope = reg["slope"]
    intercept = reg["intercept"]

    plt.figure(figsize=(9, 6))

    # Scatter points of actual data
    plt.scatter(x, y, color="#2563eb", s=60, zorder=5, label="Observed Data (X, Y)")

    # Line of best fit
    x_line = np.linspace(min(x) - 0.1 * (max(x) - min(x)), max(x) + 0.1 * (max(x) - min(x)), 200)
    y_line = slope * x_line + intercept
    plt.plot(x_line, y_line, color="#dc2626", linewidth=2.2, label=f"Fit: {reg['equation']}\n(R^2 = {reg['r_squared']:.4f})")

    # Plot vertical residual lines from points to the line
    for xi, yi in zip(x, y):
        y_hat = slope * xi + intercept
        plt.plot([xi, xi], [yi, y_hat], color="#9ca3af", linestyle=":", linewidth=1.2)

    plt.title("Ordinary Least Squares (OLS) Linear Regression", fontsize=13, fontweight="bold")
    plt.xlabel("Independent Variable (X)", fontsize=11)
    plt.ylabel("Dependent Variable (Y)", fontsize=11)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend(loc="best", frameon=True, shadow=True)
    plt.tight_layout()

    print("\nDisplaying Matplotlib Regression Plot window...")
    plt.show()


def run_regression_menu() -> None:
    """Interactive command-line runner for Linear Regression."""
    print("\n---------------------------------------------------------")
    print("                LINEAR REGRESSION LAB")
    print("---------------------------------------------------------")
    print("Example: X = 1 2 3 4 5  |  Y = 2 4 5 8 10")
    print("Or press ENTER for default sample experimental dataset.")

    raw_x = input("\nEnter X values (separated by space or comma): ").strip()
    raw_y = input("Enter Y values (separated by space or comma): ").strip()

    if not raw_x or not raw_y:
        x_vals = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0]
        y_vals = [2.2, 3.8, 5.5, 7.1, 9.0, 11.2, 13.1]
        print(f"Using default sample coordinates:\n  X = {x_vals}\n  Y = {y_vals}")
    else:
        try:
            x_vals = [float(p) for p in raw_x.replace(",", " ").split()]
            y_vals = [float(p) for p in raw_y.replace(",", " ").split()]
            if len(x_vals) != len(y_vals):
                print(f"[Warning] Mismatched lengths: X has {len(x_vals)} items, Y has {len(y_vals)} items. Truncating to shorter length.")
        except ValueError as err:
            print(f"[Error] Invalid coordinates: {err}")
            return

    try:
        reg_result = calculate_linear_regression(x_vals, y_vals)
        print_regression_report(reg_result)

        # Viva Quick Notes
        print("\n[VIVA QUICK EXPLANATION]")
        print("* Slope (m): Rate of change; change in Y per unit change in X.")
        print("* Intercept (c): Value of Y when X = 0.")
        print("* R^2 (Coefficient of Determination): Fraction of variance in Y predictable from X.")
        print("* Minimization criterion: Ordinary Least Squares minimizes the sum of squared residuals: Sum(y - y_hat)^2.")

        # Interactive Prediction
        while True:
            pred_input = input("\nWould you like to predict Y for a custom X value? (Enter value or press Enter to skip): ").strip()
            if not pred_input:
                break
            try:
                x_test = float(pred_input)
                y_test = reg_result["slope"] * x_test + reg_result["intercept"]
                print(f"-> Prediction: For X = {x_test}, predicted Y = {y_test:.6f}")
            except ValueError:
                print("Invalid number.")

        show_plot = input("\nWould you like to display the Regression Plot? (y/n) [default: y]: ").strip().lower()
        if show_plot in ("", "y", "yes"):
            plot_regression(reg_result)

    except Exception as err:
        print(f"[Error] Regression failed: {err}")


if __name__ == "__main__":
    run_regression_menu()
