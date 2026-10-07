"""
Automated Comprehensive Test Suite for Scientific Lab
Simulates user interactions across all modules.
"""

import sys
import io
import unittest
from statistics_module import calculate_descriptive_stats
from regression import calculate_linear_regression
from root_finding import parse_equation, bisection_method, newton_raphson_method, secant_method
from matrix_operations import (
    matrix_add, matrix_subtract, matrix_multiply,
    matrix_transpose, matrix_determinant, matrix_inverse,
    matrix_eigen, solve_linear_system
)
from integration import (
    parse_function, trapezoidal_rule,
    simpsons_one_third_rule, simpsons_three_eighth_rule
)
import numpy as np


class TestScientificLab(unittest.TestCase):

    def test_statistics(self):
        data = [10.0, 20.0, 30.0, 40.0, 50.0]
        res = calculate_descriptive_stats(data)
        self.assertEqual(res["count"], 5)
        self.assertAlmostEqual(res["mean"], 30.0)
        self.assertAlmostEqual(res["median"], 30.0)
        self.assertAlmostEqual(res["range"], 40.0)
        self.assertAlmostEqual(res["sample_variance"], 250.0)
        self.assertAlmostEqual(res["sample_std_dev"], np.sqrt(250.0))
        self.assertAlmostEqual(res["q1"], 20.0)
        self.assertAlmostEqual(res["q3"], 40.0)
        self.assertAlmostEqual(res["iqr"], 20.0)
        print("  [PASS] Descriptive Statistics Module verified.")

    def test_regression(self):
        x = [1.0, 2.0, 3.0, 4.0, 5.0]
        y = [2.0, 4.0, 5.0, 8.0, 10.0]
        res = calculate_linear_regression(x, y)
        self.assertEqual(res["n"], 5)
        self.assertAlmostEqual(res["slope"], 2.0)
        self.assertAlmostEqual(res["intercept"], -0.2)
        self.assertGreater(res["r_squared"], 0.95)
        self.assertEqual(res["equation"], "y = 2.0000x - 0.2000")
        print("  [PASS] Linear Regression Module verified.")

    def test_root_finding(self):
        sym, f = parse_equation("x**3 - x - 2")
        bis = bisection_method(f, 1.0, 2.0, tol=1e-5)
        self.assertTrue(bis["converged"])
        self.assertAlmostEqual(bis["root"], 1.52138, places=4)

        newt = newton_raphson_method(sym, f, 1.5, tol=1e-5)
        self.assertTrue(newt["converged"])
        self.assertAlmostEqual(newt["root"], 1.52138, places=4)

        sec = secant_method(f, 1.0, 2.0, tol=1e-5)
        self.assertTrue(sec["converged"])
        self.assertAlmostEqual(sec["root"], 1.52138, places=4)
        print("  [PASS] Root Finding Module (Bisection, Newton-Raphson, Secant) verified.")

    def test_matrix_operations(self):
        A = np.array([[2.0, 1.0], [5.0, 3.0]])
        B = np.array([[1.0, 4.0], [2.0, 0.0]])

        # Add & Sub
        add_res = matrix_add(A, B)
        self.assertTrue(np.allclose(add_res, [[3.0, 5.0], [7.0, 3.0]]))
        sub_res = matrix_subtract(A, B)
        self.assertTrue(np.allclose(sub_res, [[1.0, -3.0], [3.0, 3.0]]))

        # Multiply
        mul_res = matrix_multiply(A, B)
        self.assertTrue(np.allclose(mul_res, [[4.0, 8.0], [11.0, 20.0]]))

        # Transpose
        trans_res = matrix_transpose(A)
        self.assertTrue(np.allclose(trans_res, [[2.0, 5.0], [1.0, 3.0]]))

        # Det & Inv
        det = matrix_determinant(A)
        self.assertAlmostEqual(det, 1.0)
        inv = matrix_inverse(A)
        self.assertTrue(np.allclose(np.matmul(A, inv), np.eye(2)))

        # Eigenvalues
        vals, vecs = matrix_eigen(A)
        self.assertEqual(len(vals), 2)

        # Solve Linear System
        A_sys = np.array([[2.0, 1.0], [1.0, -1.0]])
        B_sys = np.array([5.0, 1.0])
        x_sol = solve_linear_system(A_sys, B_sys)
        self.assertTrue(np.allclose(x_sol, [2.0, 1.0]))
        print("  [PASS] Matrix Operations & Linear Algebra Module verified.")

    def test_numerical_integration(self):
        sym, f = parse_function("1 / (1 + x**2)")
        # Integral of 1/(1+x^2) from 0 to 1 is pi / 4 ~ 0.785398163
        trap = trapezoidal_rule(f, 0.0, 1.0, 6)
        simp13 = simpsons_one_third_rule(f, 0.0, 1.0, 6)
        simp38 = simpsons_three_eighth_rule(f, 0.0, 1.0, 6)

        expected = np.pi / 4.0
        self.assertAlmostEqual(simp13["result"], expected, places=5)
        self.assertAlmostEqual(trap["result"], expected, places=2)
        self.assertAlmostEqual(simp38["result"], expected, places=4)
        print("  [PASS] Numerical Integration Module (Trapezoidal, Simpson 1/3, 3/8) verified.")

    def test_visualization(self):
        import matplotlib.pyplot as plt
        # Mock show to avoid blocking in unit test
        orig_show = plt.show
        plt.show = lambda: None
        try:
            from visualization import plot_line_graph, plot_scatter_plot, plot_math_function, plot_sine_cosine_demo, plot_normal_distribution_demo
            plot_line_graph([1, 2], [3, 4])
            plot_scatter_plot([1, 2], [3, 4])
            plot_math_function("x**2 - 4", -3, 3)
            plot_sine_cosine_demo()
            plot_normal_distribution_demo(0, 1)
            print("  [PASS] Graphing & Visualization Module verified.")
        finally:
            plt.show = orig_show


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("RUNNING SCIENTIFIC LAB AUTOMATED TEST SUITE")
    print("=" * 60)
    unittest.main(verbosity=2)
