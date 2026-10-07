"""
=============================================================================
ConvertAnyFile - Scientific Computing Lab
Module: Matrix Operations & Linear Algebra (matrix_operations.py)
=============================================================================
This module provides standard linear algebra computations:
  1. Matrix Addition (A + B)
  2. Matrix Subtraction (A - B)
  3. Matrix Multiplication (A x B)
  4. Transpose (A^T)
  5. Determinant (|A|)
  6. Matrix Inverse (A^-1)
  7. Eigenvalues & Eigenvectors
  8. Linear System Solver (AX = B)
=============================================================================
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from typing import List, Tuple, Any, Optional
import numpy as np


def format_matrix(matrix: np.ndarray, precision: int = 4) -> str:
    """Formats a 2D numpy array neatly with aligned columns."""
    if matrix.ndim == 1:
        matrix = matrix.reshape(1, -1)
    rows, cols = matrix.shape
    lines = []
    col_widths = []
    
    # Format each cell
    str_cells = []
    for r in range(rows):
        row_strs = []
        for c in range(cols):
            val = matrix[r, c]
            if np.iscomplexobj(matrix):
                s = f"{val.real:.{precision}g} + {val.imag:.{precision}g}j" if val.imag != 0 else f"{val.real:.{precision}g}"
            else:
                s = f"{val:.{precision}g}"
            row_strs.append(s)
        str_cells.append(row_strs)

    # Calculate column widths
    for c in range(cols):
        max_w = max(len(str_cells[r][c]) for r in range(rows))
        col_widths.append(max_w)

    # Build bracketed lines
    for r in range(rows):
        formatted_row = "  ".join(f"{str_cells[r][c]:>{col_widths[c]}}" for c in range(cols))
        lines.append(f"[  {formatted_row}  ]")

    return "\n".join(lines)


def parse_matrix_input(prompt: str) -> np.ndarray:
    """
    Parses matrix rows entered by user.
    Example: 1 2; 3 4 or row-by-row input.
    """
    print(f"\n{prompt}")
    print("Format options:")
    print("  * Semicolon-separated rows: 1 2 3; 4 5 6; 7 8 9")
    print("  * Or enter rows one by one. Enter blank line when finished.")

    first_line = input("Enter matrix: ").strip()
    if not first_line:
        raise ValueError("No matrix data entered.")

    if ";" in first_line:
        # Semicolon delimited
        row_strs = [r.strip() for r in first_line.split(";") if r.strip()]
        data = []
        for r_str in row_strs:
            vals = [float(x) for x in r_str.replace(",", " ").split()]
            data.append(vals)
        mat = np.array(data, dtype=float)
    else:
        # Multi-line input
        data = [[float(x) for x in first_line.replace(",", " ").split()]]
        while True:
            nxt = input("Enter next row (or ENTER to finish): ").strip()
            if not nxt:
                break
            data.append([float(x) for x in nxt.replace(",", " ").split()])
        mat = np.array(data, dtype=float)

    # Validate row lengths
    row_lens = [len(r) for r in data]
    if len(set(row_lens)) != 1:
        raise ValueError(f"Inconsistent number of columns in rows: {row_lens}")

    return mat


# ---------------------------------------------------------------------------
# CORE LINEAR ALGEBRA OPERATIONS
# ---------------------------------------------------------------------------

def matrix_add(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Computes element-wise matrix addition A + B."""
    if a.shape != b.shape:
        raise ValueError(f"Addition dimension mismatch: {a.shape} vs {b.shape}. Matrices must have identical dimensions.")
    return a + b


def matrix_subtract(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Computes element-wise matrix subtraction A - B."""
    if a.shape != b.shape:
        raise ValueError(f"Subtraction dimension mismatch: {a.shape} vs {b.shape}. Matrices must have identical dimensions.")
    return a - b


def matrix_multiply(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """
    Computes dot-product matrix multiplication A x B.
    Requires cols(A) == rows(B).
    """
    if a.shape[1] != b.shape[0]:
        raise ValueError(
            f"Multiplication dimension mismatch: Columns of A ({a.shape[1]}) must match Rows of B ({b.shape[0]})."
        )
    return np.matmul(a, b)


def matrix_transpose(a: np.ndarray) -> np.ndarray:
    """Computes matrix transpose A^T (swaps rows and columns)."""
    return a.T


def matrix_determinant(a: np.ndarray) -> float:
    """Computes determinant of square matrix |A|."""
    if a.shape[0] != a.shape[1]:
        raise ValueError(f"Determinant requires a square matrix. Received shape {a.shape}.")
    return float(np.linalg.det(a))


def matrix_inverse(a: np.ndarray) -> np.ndarray:
    """Computes multiplicative inverse A^-1 where A x A^-1 = I."""
    if a.shape[0] != a.shape[1]:
        raise ValueError(f"Inverse requires a square matrix. Received shape {a.shape}.")
    det = np.linalg.det(a)
    if abs(det) < 1e-12:
        raise ValueError(f"Matrix is singular (|A| = {det:.4e} ~ 0). It possesses no multiplicative inverse.")
    return np.linalg.inv(a)


def matrix_eigen(a: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """Computes eigenvalues and eigenvectors for square matrix A."""
    if a.shape[0] != a.shape[1]:
        raise ValueError(f"Eigenvalues require a square matrix. Received shape {a.shape}.")
    eigenvalues, eigenvectors = np.linalg.eig(a)
    return eigenvalues, eigenvectors


def solve_linear_system(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Solves system of linear equations AX = B for unknown vector X."""
    if a.shape[0] != a.shape[1]:
        raise ValueError(f"Coefficient matrix A must be square. Received {a.shape}.")
    if b.shape[0] != a.shape[0]:
        raise ValueError(f"Constant vector B size ({b.shape[0]}) must match equations in A ({a.shape[0]}).")
    return np.linalg.solve(a, b)


# ---------------------------------------------------------------------------
# INTERACTIVE RUNNER
# ---------------------------------------------------------------------------

def run_matrix_menu() -> None:
    """Interactive command-line runner for matrix operations."""
    print("\n---------------------------------------------------------")
    print("                MATRIX OPERATIONS LAB")
    print("---------------------------------------------------------")
    print("1. Matrix Addition (A + B)")
    print("2. Matrix Subtraction (A - B)")
    print("3. Matrix Multiplication (A x B)")
    print("4. Matrix Transpose (A^T)")
    print("5. Determinant (|A|)")
    print("6. Matrix Inverse (A^-1)")
    print("7. Eigenvalues & Eigenvectors")
    print("8. Solve Linear System (AX = B)")

    choice = input("\nEnter choice (1-8) [default: 3]: ").strip()
    if not choice:
        choice = "3"

    try:
        if choice in ("1", "2", "3"):
            print("\nEnter Matrix A (or press Enter for default 2x2 [[2, 1], [5, 3]]):")
            raw_a = input("Matrix A: ").strip()
            if not raw_a:
                a = np.array([[2.0, 1.0], [5.0, 3.0]])
                b = np.array([[1.0, 4.0], [2.0, 0.0]])
                print(f"Using default Matrix A:\n{format_matrix(a)}")
                print(f"Using default Matrix B:\n{format_matrix(b)}")
            else:
                a = parse_matrix_input("Enter Matrix A:")
                b = parse_matrix_input("Enter Matrix B:")

            print("\nMatrix A:")
            print(format_matrix(a))
            print("\nMatrix B:")
            print(format_matrix(b))

            if choice == "1":
                res = matrix_add(a, b)
                print("\nResult (A + B):")
                print(format_matrix(res))
            elif choice == "2":
                res = matrix_subtract(a, b)
                print("\nResult (A - B):")
                print(format_matrix(res))
            elif choice == "3":
                res = matrix_multiply(a, b)
                print("\nResult (A x B):")
                print(format_matrix(res))
                print(f"Dimensions: {a.shape} x {b.shape} -> {res.shape}")

        elif choice in ("4", "5", "6", "7"):
            print("\nEnter Square Matrix A (or press Enter for default 3x3 [[6, 2, 1], [2, 3, 1], [1, 1, 1]]):")
            raw_a = input("Matrix A: ").strip()
            if not raw_a:
                a = np.array([[6.0, 2.0, 1.0], [2.0, 3.0, 1.0], [1.0, 1.0, 1.0]])
                print(f"Using default Matrix A (3x3):\n{format_matrix(a)}")
            else:
                a = parse_matrix_input("Enter Matrix A:")

            print("\nInput Matrix A:")
            print(format_matrix(a))

            if choice == "4":
                res = matrix_transpose(a)
                print("\nTranspose (A^T):")
                print(format_matrix(res))

            elif choice == "5":
                det = matrix_determinant(a)
                print(f"\nDeterminant |A|: {det:.6g}")
                print(f"Condition: {'Invertible / Non-singular (|A| != 0)' if abs(det) > 1e-12 else 'Singular / Non-invertible (|A| = 0)'}")

            elif choice == "6":
                det = matrix_determinant(a)
                print(f"Determinant |A|: {det:.6g}")
                inv = matrix_inverse(a)
                print("\nInverse Matrix (A^-1):")
                print(format_matrix(inv))
                # Verification identity check
                identity_check = np.matmul(a, inv)
                print("\nVerification check (A x A^-1 ~ I):")
                print(format_matrix(identity_check))

            elif choice == "7":
                vals, vecs = matrix_eigen(a)
                print("\nEigenvalues (lambda):")
                for i, v in enumerate(vals, 1):
                    print(f"  lambda_{i} = {v:.6g}")
                print("\nEigenvectors (Columns correspond to eigenvalues):")
                print(format_matrix(vecs))

        elif choice == "8":
            print("\nSolving Linear Equation System: AX = B")
            print("Default example (3 equations):")
            print("  2x + 1y - 1z = 8")
            print(" -3x - 1y + 2z = -11")
            print(" -2x + 1y + 2z = -3")
            use_default = input("Press ENTER to run default system, or 'c' to enter custom: ").strip()

            if not use_default:
                a = np.array([[2.0, 1.0, -1.0], [-3.0, -1.0, 2.0], [-2.0, 1.0, 2.0]])
                b = np.array([8.0, -11.0, -3.0])
            else:
                a = parse_matrix_input("Enter Coefficient Matrix A:")
                raw_b = input("Enter Constant Vector B (space-separated): ").strip()
                b = np.array([float(x) for x in raw_b.replace(",", " ").split()])

            print("\nCoefficient Matrix A:")
            print(format_matrix(a))
            print("\nConstant Vector B:")
            print(format_matrix(b.reshape(-1, 1)))

            x_solution = solve_linear_system(a, b)
            print("\nSolution Vector X:")
            for i, val in enumerate(x_solution, 1):
                print(f"  x{i} = {val:.6g}")

        # Viva Quick Notes
        print("\n[VIVA QUICK EXPLANATION]")
        print("* Matrix Multiplication: Valid only if columns of A equal rows of B. Non-commutative (AB != BA).")
        print("* Determinant: Geometric scaling factor of transformation. Zero determinant means dimension collapse (no inverse).")
        print("* Eigenvalues & Eigenvectors: Directions v where transformation A acts only as scalar stretch lambda: Av = lambda * v.")

    except Exception as err:
        print(f"[Error] Matrix operation failed: {err}")


if __name__ == "__main__":
    run_matrix_menu()
