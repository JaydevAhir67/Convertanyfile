export interface UnitCategory {
  id: string;
  name: string;
  baseUnit: string;
  units: { [key: string]: { name: string; factor: number; symbol: string } };
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length & Distance',
    baseUnit: 'm',
    units: {
      m: { name: 'Meter', factor: 1, symbol: 'm' },
      km: { name: 'Kilometer', factor: 1000, symbol: 'km' },
      cm: { name: 'Centimeter', factor: 0.01, symbol: 'cm' },
      mm: { name: 'Millimeter', factor: 0.001, symbol: 'mm' },
      mi: { name: 'Mile', factor: 1609.344, symbol: 'mi' },
      yd: { name: 'Yard', factor: 0.9144, symbol: 'yd' },
      ft: { name: 'Foot', factor: 0.3048, symbol: 'ft' },
      in: { name: 'Inch', factor: 0.0254, symbol: 'in' },
      nmi: { name: 'Nautical Mile', factor: 1852, symbol: 'nmi' }
    }
  },
  {
    id: 'weight',
    name: 'Weight & Mass',
    baseUnit: 'kg',
    units: {
      kg: { name: 'Kilogram', factor: 1, symbol: 'kg' },
      g: { name: 'Gram', factor: 0.001, symbol: 'g' },
      mg: { name: 'Milligram', factor: 0.000001, symbol: 'mg' },
      lb: { name: 'Pound', factor: 0.45359237, symbol: 'lb' },
      oz: { name: 'Ounce', factor: 0.02834952, symbol: 'oz' },
      ton: { name: 'Metric Ton', factor: 1000, symbol: 't' },
      st: { name: 'Stone', factor: 6.350293, symbol: 'st' }
    }
  },
  {
    id: 'temperature',
    name: 'Temperature',
    baseUnit: 'c',
    units: {
      c: { name: 'Celsius', factor: 1, symbol: '°C' },
      f: { name: 'Fahrenheit', factor: 1, symbol: '°F' },
      k: { name: 'Kelvin', factor: 1, symbol: 'K' },
      r: { name: 'Rankine', factor: 1, symbol: '°R' }
    }
  },
  {
    id: 'area',
    name: 'Area',
    baseUnit: 'sqm',
    units: {
      sqm: { name: 'Square Meter', factor: 1, symbol: 'm²' },
      sqkm: { name: 'Square Kilometer', factor: 1000000, symbol: 'km²' },
      sqft: { name: 'Square Foot', factor: 0.092903, symbol: 'ft²' },
      sqyd: { name: 'Square Yard', factor: 0.836127, symbol: 'yd²' },
      acre: { name: 'Acre', factor: 4046.856, symbol: 'ac' },
      ha: { name: 'Hectare', factor: 10000, symbol: 'ha' }
    }
  },
  {
    id: 'volume',
    name: 'Volume',
    baseUnit: 'l',
    units: {
      l: { name: 'Liter', factor: 1, symbol: 'L' },
      ml: { name: 'Milliliter', factor: 0.001, symbol: 'mL' },
      m3: { name: 'Cubic Meter', factor: 1000, symbol: 'm³' },
      gal: { name: 'US Gallon', factor: 3.78541, symbol: 'gal' },
      qt: { name: 'US Quart', factor: 0.946353, symbol: 'qt' },
      pt: { name: 'US Pint', factor: 0.473176, symbol: 'pt' },
      cup: { name: 'US Cup', factor: 0.236588, symbol: 'cup' },
      floz: { name: 'Fluid Ounce', factor: 0.0295735, symbol: 'fl oz' }
    }
  },
  {
    id: 'time',
    name: 'Time',
    baseUnit: 's',
    units: {
      s: { name: 'Second', factor: 1, symbol: 's' },
      ms: { name: 'Millisecond', factor: 0.001, symbol: 'ms' },
      min: { name: 'Minute', factor: 60, symbol: 'min' },
      h: { name: 'Hour', factor: 3600, symbol: 'h' },
      d: { name: 'Day', factor: 86400, symbol: 'd' },
      wk: { name: 'Week', factor: 604800, symbol: 'wk' },
      yr: { name: 'Year (365d)', factor: 31536000, symbol: 'yr' }
    }
  },
  {
    id: 'speed',
    name: 'Speed & Velocity',
    baseUnit: 'mps',
    units: {
      mps: { name: 'Meters / Second', factor: 1, symbol: 'm/s' },
      kph: { name: 'Kilometers / Hour', factor: 0.277778, symbol: 'km/h' },
      mph: { name: 'Miles / Hour', factor: 0.44704, symbol: 'mph' },
      knot: { name: 'Knot', factor: 0.514444, symbol: 'kn' },
      fps: { name: 'Feet / Second', factor: 0.3048, symbol: 'ft/s' }
    }
  },
  {
    id: 'data',
    name: 'Digital Data Storage',
    baseUnit: 'byte',
    units: {
      bit: { name: 'Bit', factor: 0.125, symbol: 'b' },
      byte: { name: 'Byte', factor: 1, symbol: 'B' },
      kb: { name: 'Kilobyte (KB)', factor: 1024, symbol: 'KB' },
      mb: { name: 'Megabyte (MB)', factor: 1048576, symbol: 'MB' },
      gb: { name: 'Gigabyte (GB)', factor: 1073741824, symbol: 'GB' },
      tb: { name: 'Terabyte (TB)', factor: 1099511627776, symbol: 'TB' }
    }
  },
  {
    id: 'energy',
    name: 'Energy & Work',
    baseUnit: 'j',
    units: {
      j: { name: 'Joule', factor: 1, symbol: 'J' },
      kj: { name: 'Kilojoule', factor: 1000, symbol: 'kJ' },
      cal: { name: 'Calorie', factor: 4.184, symbol: 'cal' },
      kcal: { name: 'Kilocalorie', factor: 4184, symbol: 'kcal' },
      wh: { name: 'Watt-hour', factor: 3600, symbol: 'Wh' },
      kwh: { name: 'Kilowatt-hour', factor: 3600000, symbol: 'kWh' },
      ev: { name: 'Electronvolt', factor: 1.602176634e-19, symbol: 'eV' }
    }
  }
];

export class UnitEngine {
  public static getCategories(): string[] {
    return UNIT_CATEGORIES.map(c => c.id);
  }

  public static getUnitsForCategory(categoryId: string): string[] {
    const cat = UNIT_CATEGORIES.find(c => c.id === categoryId);
    return cat ? Object.keys(cat.units) : [];
  }

  public static explainFormula(fromUnit: string, toUnit: string): string {
    const cat = UNIT_CATEGORIES.find(c => c.units[fromUnit] && c.units[toUnit]);
    if (!cat) return '1-to-1 dimensional scaling';
    if (cat.id === 'temperature') {
      return `${fromUnit.toUpperCase()} -> ${toUnit.toUpperCase()} affine degree transformation`;
    }
    const fromFactor = cat.units[fromUnit]?.factor || 1;
    const toFactor = cat.units[toUnit]?.factor || 1;
    const fromSym = cat.units[fromUnit]?.symbol || fromUnit;
    const toSym = cat.units[toUnit]?.symbol || toUnit;
    return `1 ${fromSym} = ${(fromFactor / toFactor).toPrecision(6)} ${toSym}`;
  }

  public static convert(
    value: number,
    arg2: string,
    arg3: string,
    arg4?: string
  ): { result: number; formula: string; explanation: string } {
    let categoryId: string;
    let fromUnit: string;
    let toUnit: string;

    if (arg4) {
      // Called as convert(value, categoryId, fromUnit, toUnit)
      categoryId = arg2;
      fromUnit = arg3;
      toUnit = arg4;
    } else {
      // Called as convert(value, fromUnit, toUnit)
      fromUnit = arg2;
      toUnit = arg3;
      const foundCat = UNIT_CATEGORIES.find(c => c.units[fromUnit] && c.units[toUnit]);
      categoryId = foundCat ? foundCat.id : 'length';
    }

    if (isNaN(value)) {
      return { result: 0, formula: 'N/A', explanation: 'Enter a valid numeric quantity' };
    }

    const cat = UNIT_CATEGORIES.find(c => c.id === categoryId);
    if (!cat) throw new Error(`Unknown unit category: ${categoryId}`);

    // Handle Temperature separately (non-zero origin)
    if (categoryId === 'temperature') {
      let celsius = value;
      if (fromUnit === 'f') celsius = (value - 32) * (5 / 9);
      else if (fromUnit === 'k') celsius = value - 273.15;
      else if (fromUnit === 'r') celsius = (value - 491.67) * (5 / 9);

      let targetVal = celsius;
      let formula = '';
      if (toUnit === 'c') {
        targetVal = celsius;
        formula = `${value}° ${fromUnit.toUpperCase()} -> ${celsius.toFixed(2)} °C`;
      } else if (toUnit === 'f') {
        targetVal = celsius * (9 / 5) + 32;
        formula = `(${celsius.toFixed(2)} × 9/5) + 32 = ${targetVal.toFixed(2)} °F`;
      } else if (toUnit === 'k') {
        targetVal = celsius + 273.15;
        formula = `${celsius.toFixed(2)} + 273.15 = ${targetVal.toFixed(2)} K`;
      } else if (toUnit === 'r') {
        targetVal = (celsius + 273.15) * (9 / 5);
        formula = `(${celsius.toFixed(2)} + 273.15) × 9/5 = ${targetVal.toFixed(2)} °R`;
      }

      return {
        result: parseFloat(targetVal.toFixed(4)),
        formula,
        explanation: `Temperature scale conversion using zero-offset affine transformation.`
      };
    }

    const fromFactor = cat.units[fromUnit]?.factor;
    const toFactor = cat.units[toUnit]?.factor;

    if (!fromFactor || !toFactor) {
      throw new Error(`Invalid unit keys: ${fromUnit} -> ${toUnit}`);
    }

    // Convert to base unit, then to target unit
    const inBase = value * fromFactor;
    const result = inBase / toFactor;

    const fromSymbol = cat.units[fromUnit].symbol;
    const toSymbol = cat.units[toUnit].symbol;

    const formula = `1 ${fromSymbol} = ${(fromFactor / toFactor).toPrecision(6)} ${toSymbol}`;
    const explanation = `Multiply by conversion ratio: (${value} × ${fromFactor}) ÷ ${toFactor} = ${result.toFixed(6)}`;

    return {
      result: parseFloat(result.toPrecision(8)),
      formula,
      explanation
    };
  }
}
