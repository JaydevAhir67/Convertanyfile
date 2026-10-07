"""
=============================================================================
ConvertAnyFile - Scientific Computing Lab
Module: Descriptive Statistics (statistics_module.py)
=============================================================================
This module computes fundamental statistical measures from numerical data.
It showcases both manual algorithmic calculations and industry-standard
NumPy / Pandas / SciPy library methods for college viva demonstration.
=============================================================================
"""

import math
from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt


def calculate_descriptive_stats(numbers: List[float]) -> Dict[str, Any]:
    """
    Computes comprehensive descriptive statistics using both manual algorithms
    and NumPy/Pandas functions.

    Parameters:
        numbers (List[float]): A list of numerical observations.

    Returns:
        Dict[str, Any]: Dictionary containing all statistical metrics and explanations.
    """
    if not numbers or len(numbers) == 0:
        raise ValueError("At least one numerical value is required.")

    n = len(numbers)
    sorted_nums = sorted(numbers)

    # ---------------------------------------------------------
    # 1. MEAN (Arithmetic Average)
    # Manual Algorithm: sum(x) / n
    # Library Method: np.mean(numbers)
    # ---------------------------------------------------------
    total_sum = sum(sorted_nums)
    manual_mean = total_sum / n
    np_mean = float(np.mean(sorted_nums))

    # ---------------------------------------------------------
    # 2. MEDIAN (Middle Value of Sorted Dataset)
    # Manual Algorithm: if n is odd, middle element; if even, average of two middle elements.
    # Library Method: np.median(numbers)
    # ---------------------------------------------------------
    if n % 2 == 1:
        manual_median = sorted_nums[n // 2]
    else:
        manual_median = (sorted_nums[n // 2 - 1] + sorted_nums[n // 2]) / 2.0
    np_median = float(np.median(sorted_nums))

    # ---------------------------------------------------------
    # 3. MODE (Most Frequently Occurring Value)
    # Manual Algorithm: Frequency counter using dictionary
    # Library Method: scipy.stats.mode(numbers)
    # ---------------------------------------------------------
    freq_map: Dict[float, int] = {}
    for val in sorted_nums:
        freq_map[val] = freq_map.get(val, 0) + 1

    max_freq = max(freq_map.values()) if freq_map else 0
    if max_freq > 1:
        modes = [k for k, v in freq_map.items() if v == max_freq]
        mode_str = ", ".join(f"{m:g}" for m in modes)
        if len(modes) > 1:
            mode_desc = f"Multimodal ({mode_str}), frequency = {max_freq}"
        else:
            mode_desc = f"{modes[0]:g} (frequency = {max_freq})"
    else:
        modes = []
        mode_desc = "No unique mode (all values appear once)"

    # ---------------------------------------------------------
    # 4. RANGE, MINIMUM, MAXIMUM
    # Formula: Range = Max - Min
    # ---------------------------------------------------------
    min_val = sorted_nums[0]
    max_val = sorted_nums[-1]
    data_range = max_val - min_val

    # ---------------------------------------------------------
    # 5. VARIANCE & STANDARD DEVIATION
    # Sample Variance with Bessel's Correction (dividing by n - 1):
    # s^2 = Sum(x - mu)^2 / (n - 1)
    # Population Variance (dividing by n):
    # sigma^2 = Sum(x - mu)^2 / n
    # ---------------------------------------------------------
    if n > 1:
        sum_sq_diff = sum((x - manual_mean) ** 2 for x in sorted_nums)
        sample_variance = sum_sq_diff / (n - 1)
        sample_std_dev = math.sqrt(sample_variance)

        pop_variance = sum_sq_diff / n
        pop_std_dev = math.sqrt(pop_variance)
    else:
        sample_variance = 0.0
        sample_std_dev = 0.0
        pop_variance = 0.0
        pop_std_dev = 0.0

    # NumPy equivalents:
    # np.var(numbers, ddof=1) -> Sample Variance
    # np.std(numbers, ddof=1) -> Sample Std Dev
    np_sample_var = float(np.var(sorted_nums, ddof=1)) if n > 1 else 0.0
    np_sample_std = float(np.std(sorted_nums, ddof=1)) if n > 1 else 0.0

    # ---------------------------------------------------------
    # 6. QUARTILES (Q1, Q3) AND INTERQUARTILE RANGE (IQR)
    # Q1: 25th percentile
    # Q3: 75th percentile
    # IQR: Q3 - Q1 (measure of statistical dispersion)
    # ---------------------------------------------------------
    q1 = float(np.percentile(sorted_nums, 25))
    q3 = float(np.percentile(sorted_nums, 75))
    iqr = q3 - q1

    # Outlier detection using Tukey's 1.5 * IQR rule
    lower_fence = q1 - 1.5 * iqr
    upper_fence = q3 + 1.5 * iqr
    outliers = [x for x in sorted_nums if x < lower_fence or x > upper_fence]

    # ---------------------------------------------------------
    # 7. SKEWNESS & KURTOSIS (Higher-order moments)
    # ---------------------------------------------------------
    skewness = float(stats.skew(sorted_nums)) if n > 2 and sample_std_dev > 0 else 0.0
    kurtosis = float(stats.kurtosis(sorted_nums)) if n > 3 and sample_std_dev > 0 else 0.0

    return {
        "count": n,
        "sum": total_sum,
        "mean": manual_mean,
        "np_mean": np_mean,
        "median": manual_median,
        "np_median": np_median,
        "mode_desc": mode_desc,
        "modes": modes,
        "min": min_val,
        "max": max_val,
        "range": data_range,
        "sample_variance": sample_variance,
        "np_sample_var": np_sample_var,
        "sample_std_dev": sample_std_dev,
        "np_sample_std": np_sample_std,
        "pop_variance": pop_variance,
        "pop_std_dev": pop_std_dev,
        "q1": q1,
        "q3": q3,
        "iqr": iqr,
        "lower_fence": lower_fence,
        "upper_fence": upper_fence,
        "outliers": outliers,
        "skewness": skewness,
        "kurtosis": kurtosis,
        "sorted_data": sorted_nums,
    }


import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def print_descriptive_report(stats_res: Dict[str, Any]) -> None:
    """Prints a clean, formatted report ready for college viva screenshots."""
    print("\n" + "=" * 60)
    print("       DESCRIPTIVE STATISTICS SUMMARY REPORT")
    print("=" * 60)
    print(f"Sample Size (N)       : {stats_res['count']}")
    print(f"Sum (Sum x)           : {stats_res['sum']:.6g}")
    print(f"Mean (Average, mu)    : {stats_res['mean']:.6g}  (NumPy: {stats_res['np_mean']:.6g})")
    print(f"Median (50th %ile)    : {stats_res['median']:.6g}  (NumPy: {stats_res['np_median']:.6g})")
    print(f"Mode                  : {stats_res['mode_desc']}")
    print(f"Minimum               : {stats_res['min']:.6g}")
    print(f"Maximum               : {stats_res['max']:.6g}")
    print(f"Range (Max - Min)     : {stats_res['range']:.6g}")
    print("-" * 60)
    print("MEASURES OF DISPERSION (SPREAD):")
    print(f"Sample Variance (s^2) : {stats_res['sample_variance']:.6g}  [Bessel's: n-1]")
    print(f"Sample Std Dev (s)    : {stats_res['sample_std_dev']:.6g}")
    print(f"Population Var (sig^2): {stats_res['pop_variance']:.6g}  [dividing by n]")
    print(f"Population Std Dev (s): {stats_res['pop_std_dev']:.6g}")
    print("-" * 60)
    print("FIVE-NUMBER SUMMARY & QUARTILES:")
    print(f"Q1 (25th Percentile)  : {stats_res['q1']:.6g}")
    print(f"Median (Q2)           : {stats_res['median']:.6g}")
    print(f"Q3 (75th Percentile)  : {stats_res['q3']:.6g}")
    print(f"IQR (Q3 - Q1)         : {stats_res['iqr']:.6g}")
    print(f"Outlier Fences [1.5x] : [{stats_res['lower_fence']:.4g}, {stats_res['upper_fence']:.4g}]")
    if stats_res["outliers"]:
        print(f"Detected Outliers     : {stats_res['outliers']}")
    else:
        print("Detected Outliers     : None detected")
    print("-" * 60)
    print("SHAPE OF DISTRIBUTION:")
    print(f"Skewness              : {stats_res['skewness']:.4f} " +
          ("(Symmetric)" if abs(stats_res['skewness']) < 0.2 else
           "(Right-skewed / positive)" if stats_res['skewness'] > 0 else "(Left-skewed / negative)"))
    print(f"Excess Kurtosis       : {stats_res['kurtosis']:.4f} " +
          ("(Mesokurtic / Normal)" if abs(stats_res['kurtosis']) < 0.5 else
           "(Leptokurtic / Heavy-tailed)" if stats_res['kurtosis'] > 0 else "(Platykurtic / Light-tailed)"))
    print("=" * 60)


def plot_statistics(stats_res: Dict[str, Any]) -> None:
    """Visualizes the dataset with a Histogram, KDE curve, and Boxplot."""
    data = stats_res["sorted_data"]
    mean_val = stats_res["mean"]
    median_val = stats_res["median"]

    fig, (ax_box, ax_hist) = plt.subplots(
        2, 1, figsize=(9, 6), sharex=True, gridspec_kw={"height_ratios": [0.3, 0.7]}
    )

    # Box Plot
    ax_box.boxplot(data, vert=False, patch_artist=True,
                   boxprops=dict(facecolor="#60a5fa", color="#1e40af"),
                   medianprops=dict(color="#dc2626", linewidth=2),
                   flierprops=dict(marker='o', color='red', markersize=6))
    ax_box.set_title("Box Plot & Histogram with Descriptive Metrics", fontsize=13, fontweight="bold")
    ax_box.set_yticks([])
    ax_box.grid(True, linestyle="--", alpha=0.5)

    # Histogram
    num_bins = min(15, max(5, int(math.sqrt(len(data)))))
    ax_hist.hist(data, bins=num_bins, color="#3b82f6", edgecolor="#1e3a8a", alpha=0.75, density=False)
    ax_hist.axvline(mean_val, color="#dc2626", linestyle="--", linewidth=2, label=f"Mean: {mean_val:.2f}")
    ax_hist.axvline(median_val, color="#16a34a", linestyle="-.", linewidth=2, label=f"Median: {median_val:.2f}")
    ax_hist.set_xlabel("Value", fontsize=11)
    ax_hist.set_ylabel("Frequency", fontsize=11)
    ax_hist.grid(True, linestyle="--", alpha=0.5)
    ax_hist.legend(loc="upper right")

    plt.tight_layout()
    print("\nDisplaying Matplotlib Statistical Visualization window...")
    plt.show()


def parse_numbers_input(user_input: str) -> List[float]:
    """Parses a space- or comma-separated string of numbers."""
    cleaned = user_input.replace(",", " ")
    parts = cleaned.split()
    if not parts:
        raise ValueError("No input provided.")
    return [float(p) for p in parts]


def run_statistics_menu() -> None:
    """Interactive command-line menu for Descriptive Statistics."""
    print("\n---------------------------------------------------------")
    print("              DESCRIPTIVE STATISTICS LAB")
    print("---------------------------------------------------------")
    print("Example input: 10 20 30 40 50 60 70 80 90 100")
    print("Or press ENTER to use default sample dataset [12, 15, 18, 20, 22, 25, 28, 30, 35, 75]")
    
    raw = input("\nEnter numbers (separated by space or comma): ").strip()
    if not raw:
        numbers = [12.0, 15.0, 18.0, 20.0, 22.0, 25.0, 28.0, 30.0, 35.0, 75.0]
        print(f"Using default sample dataset: {numbers}")
    else:
        try:
            numbers = parse_numbers_input(raw)
        except ValueError as e:
            print(f"[Error] Invalid numeric input: {e}")
            return

    try:
        results = calculate_descriptive_stats(numbers)
        print_descriptive_report(results)

        # Mathematical Explanation for College Viva
        print("\n[VIVA QUICK EXPLANATION]")
        print("* Mean (mu): Center of gravity of data points; sensitive to extreme values/outliers.")
        print("* Median: 50th percentile robust against extreme skewness.")
        print("* Sample Variance (s^2): Uses Bessel's correction (n - 1) to eliminate bias when estimating population variance.")
        print("* IQR (Q3 - Q1): Span of middle 50% data, used for Tukey's outlier fences [Q1 - 1.5*IQR, Q3 + 1.5*IQR].")

        show_plot = input("\nWould you like to display the Graph (Boxplot + Histogram)? (y/n) [default: y]: ").strip().lower()
        if show_plot in ("", "y", "yes"):
            plot_statistics(results)

    except Exception as err:
        print(f"[Error] Calculation failed: {err}")


if __name__ == "__main__":
    run_statistics_menu()
