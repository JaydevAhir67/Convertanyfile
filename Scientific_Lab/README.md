# ConvertAnyFile - Scientific Computing Lab

> **A Standalone, College-Ready Scientific Computing Suite in Pure Python**  
> Developed for Academic Demonstrations, PSC Mini-Projects, and Practical Vivas.

---

## 🎯 Project Objective

The **ConvertAnyFile - Scientific Computing Lab** is an independent, pure Python application designed to demonstrate computational mathematics, numerical algorithms, and data visualization.

It requires **no web servers, no Node.js, no Flask, no frontend, and no browser**. It runs directly from any standard Python IDE (VS Code, IDLE, PyCharm, Jupyter) or the Windows Command Prompt / PowerShell.

---

## 📁 Project Structure

```text
Scientific_Lab/
│
├── main.py                 # Master CLI menu and application controller
├── statistics_module.py    # Descriptive statistics & dispersion analysis
├── regression.py           # OLS linear regression, predictions & graph
├── root_finding.py         # Bisection, Newton-Raphson, Secant, & SymPy solving
├── matrix_operations.py    # Linear algebra, inverse, determinant, eigenvalues
├── integration.py          # Trapezoidal, Simpson's 1/3, 3/8 & SymPy integration
├── visualization.py        # Dedicated Matplotlib graphing & plotting suite
├── requirements.txt        # Isolated Python library dependencies
├── run.bat                 # One-click Windows launcher (activates .venv)
└── README.md               # Complete documentation & viva reference guide
```

---

## 🐍 Technologies Used

| Technology | Purpose in Scientific Lab |
|------------|---------------------------|
| **Python 3.10+ / 3.14** | Core programming language |
| **NumPy** | Vectorized matrix operations, linear algebra, numerical arrays |
| **Pandas** | Tabular data structures and statistical summaries |
| **SciPy** | Statistical distributions, numerical quadrature, root finding |
| **SymPy** | Symbolic mathematics, analytical derivatives, exact integration |
| **Matplotlib** | Interactive 2D scientific plotting and visualization |

---

## 🔬 Core Features & Modules

### 1. Descriptive Statistics (`statistics_module.py`)
- **Central Tendency:** Mean ($\mu$), Median, Mode (handles unimodal, multimodal, and non-modal datasets).
- **Measures of Dispersion:** Range, Sample Variance ($s^2$ with Bessel's correction $n-1$), Population Variance ($\sigma^2$), Sample Standard Deviation ($s$), Population Standard Deviation ($\sigma$).
- **Five-Number Summary:** Minimum, First Quartile ($Q1$), Median ($Q2$), Third Quartile ($Q3$), Maximum, Interquartile Range ($\text{IQR} = Q3 - Q1$).
- **Distribution Shape:** Sample Skewness, Excess Kurtosis.
- **Outlier Detection:** Tukey's $1.5 \times \text{IQR}$ fences and Z-score testing.
- **Dual Verification:** Compares manual formula algorithms against NumPy, SciPy, and Pandas.
- **Visualization:** Synchronized Boxplot and Frequency Histogram with vertical mean/median markers.

### 2. Linear Regression (`regression.py`)
- **Model:** Ordinary Least Squares (OLS) fitting $y = mx + c$.
- **Slope & Intercept:**
  $$m = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2}, \quad c = \bar{y} - m\bar{x}$$
- **Goodness of Fit:** Pearson correlation coefficient ($r$), Coefficient of Determination ($R^2 = r^2$), Standard Error of Estimate ($S_e$).
- **Residual Analysis:** Detailed table showing observed $y$, predicted $\hat{y}$, and residuals $(y - \hat{y})$.
- **Prediction Tool:** Enter custom $x$ values to compute predicted $y$.
- **Visualization:** Scatter plot of observed data, fitted red regression line, and dashed residual segments.

### 3. Numerical Root Finding (`root_finding.py`)
- **Bisection Method:** Bracketing method requiring $f(a) \cdot f(b) \le 0$ (Intermediate Value Theorem); linear convergence $O(1/2^n)$.
- **Newton-Raphson Method:** Open method using **SymPy analytical derivatives**:
  $$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$$
  Demonstrates quadratic convergence rate $O(\epsilon^2)$.
- **Secant Method:** Approximates tangents using secant slopes without analytical derivatives.
- **SciPy & SymPy Benchmarking:** Compares custom loops against `scipy.optimize.root_scalar` (`brentq` / `newton`).
- **Visualization:** Function curve $y = f(x)$, $x$-axis baseline, and marked root coordinate.

### 4. Matrix Operations (`matrix_operations.py`)
- **Arithmetic:** Matrix Addition ($A + B$), Matrix Subtraction ($A - B$), Matrix Multiplication ($A \times B$).
- **Transformations:** Matrix Transpose ($A^T$).
- **Determinant:** $\det(A)$ with singularity classification.
- **Inverse:** $A^{-1}$ using Gauss-Jordan / NumPy LU-decomposition, with identity matrix verification ($A A^{-1} \approx I$).
- **Eigen Analysis:** Computes real and complex Eigenvalues ($\lambda$) and Eigenvectors ($v$) where $A v = \lambda v$.
- **System of Linear Equations:** Solves $AX = B$ for unknown vector $X$.

### 5. Numerical Integration (`integration.py`)
- **Trapezoidal Rule:**
  $$I \approx \frac{h}{2} \left[ f(x_0) + 2\sum_{i=1}^{n-1} f(x_i) + f(x_n) \right], \quad \text{Error: } O(h^2)$$
- **Simpson's 1/3 Rule:** Requires even $n$; parabolic interpolation:
  $$I \approx \frac{h}{3} \left[ f(x_0) + 4\sum_{\text{odd}} f(x_i) + 2\sum_{\text{even}} f(x_i) + f(x_n) \right], \quad \text{Error: } O(h^4)$$
- **Simpson's 3/8 Rule:** Requires $n$ divisible by 3; cubic interpolation.
- **SymPy Symbolic Integration:** Computes exact analytical closed-form value.
- **SciPy Adaptive Quadrature:** High-precision numerical benchmark via `scipy.integrate.quad`.
- **Visualization:** Plots function and shades integral area under the curve.

### 6. Graphing & Scientific Visualization (`visualization.py`)
- Scientific line graphs with markers and styled grids.
- Scatter plots with custom coordinates.
- Mathematical function plotter over arbitrary intervals $[a, b]$.
- Dual trigonometric waveforms: $\sin(x)$ vs $\cos(x)$.
- Gaussian / Normal distribution bell curves with $\pm 1\sigma, \pm 2\sigma$ markers.

---

## 🚀 Installation & Running

### Option 1: Quick Run via Batch File (Windows)
Double-click `run.bat` or run:
```cmd
run.bat
```
This automatically activates the project's virtual environment (`.venv`) and launches the interactive menu.

### Option 2: Running via Python IDE (VS Code, IDLE, PyCharm)
1. Open the `Scientific_Lab` folder in your IDE.
2. Select the Python interpreter inside `.venv` (or your system Python).
3. Open `main.py` and click **Run** (or press `F5`).

### Option 3: Command Line Manual Setup
```bash
# 1. Navigate to the project directory
cd Scientific_Lab

# 2. Create virtual environment
python -m venv .venv

# 3. Activate virtual environment
# Windows (cmd / PowerShell):
.venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the master application
python main.py
```

You can also run any module independently:
```bash
python statistics_module.py
python regression.py
python root_finding.py
python matrix_operations.py
python integration.py
python visualization.py
```

---

## 🎓 College Viva & Practical Cheat Sheet

| Question | Viva Answer |
|----------|-------------|
| **Why use Bessel's correction $(n-1)$ for variance?** | When calculating sample variance from a sample mean, one degree of freedom is lost. Dividing by $n-1$ produces an unbiased estimator of the true population variance $\sigma^2$. |
| **What does $R^2$ represent in regression?** | $R^2$ (coefficient of determination) measures the proportion of variance in the dependent variable $Y$ that is predictable from the independent variable $X$. $R^2 = 1$ indicates a perfect linear fit. |
| **Why is Newton-Raphson faster than Bisection?** | Bisection has **linear convergence** ($O(1/2^n)$), halving interval size each step. Newton-Raphson has **quadratic convergence** ($O(\epsilon^2)$), roughly doubling the number of correct decimal digits each iteration near the root. |
| **When does Newton-Raphson fail?** | When $f'(x) \approx 0$ (horizontal tangent line causing division by zero), when cycling infinitely between points, or when starting too far from the root. |
| **Why does Simpson's 1/3 Rule require an even number of intervals?** | Simpson's 1/3 rule fits a parabola across pairs of consecutive intervals (groups of 2 subintervals / 3 points). Therefore, the total number of subintervals $n$ must be an even integer. |
| **What is the condition for matrix invertibility?** | A matrix $A$ has an inverse $A^{-1}$ if and only if it is square ($n \times n$) and non-singular, meaning $\det(A) \neq 0$. |
| **What is an Eigenvalue and Eigenvector?** | For a square matrix $A$, a non-zero vector $v$ is an eigenvector if multiplying by $A$ only scales the vector by scalar $\lambda$: $Av = \lambda v$. |

---

## 🧪 Sample Demonstration Inputs

### 1. Statistics
- **Input:** `12 15 18 20 22 25 28 30 35 75` (or press ENTER for default).
- **Shows:** Mean = 28, Median = 23.5, IQR = 14.25, Outlier detected at 75.

### 2. Linear Regression
- **X values:** `1 2 3 4 5 6 7`
- **Y values:** `2.2 3.8 5.5 7.1 9.0 11.2 13.1`
- **Shows:** $m \approx 1.814$, $c \approx 0.386$, $R^2 \approx 0.999$, interactive prediction tool, and Matplotlib plot.

### 3. Root Finding
- **Equation:** `x^3 - x - 2 = 0`
- **Method:** Bisection $[1, 2]$ or Newton-Raphson with $x_0 = 1.5$.
- **Result:** $x^* \approx 1.5213797$.

### 4. Matrix Operations
- **Matrix A:** `6 2 1; 2 3 1; 1 1 1`
- **Shows:** $\det(A) = 5$, Inverse $A^{-1}$, verification $A \times A^{-1} = I$, Eigenvalues.

### 5. Numerical Integration
- **Function:** `1 / (1 + x^2)` from $a = 0$ to $b = 1$, $n = 6$.
- **Shows:** Simpson's 1/3 result $\approx 0.785398$, Exact SymPy value $\pi/4 \approx 0.78539816$.
