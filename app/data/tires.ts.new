// app/data/tires.ts
import { TireMeasurement, TireDatabase } from '../types/tires';

// Measured tire circumferences from reliable sources
export const TIRE_MEASUREMENTS: TireMeasurement[] = [
  // 700c Road Tires - based on Jan Heine and BRR measurements
  {
    tireSize: "700x23c",
    rimWidth: 19,
    circumference: 2096,
    source: "BRR_measured_2023",
    notes: "Continental Grand Prix 5000"
  },
  {
    tireSize: "700x23c",
    rimWidth: 21,
    circumference: 2102,
    source: "BRR_measured_2023"
  },
  {
    tireSize: "700x25c",
    rimWidth: 19,
    circumference: 2105,
    source: "jan_heine_compass",
    notes: "Compass Barlow Pass 700x25"
  },
  {
    tireSize: "700x25c",
    rimWidth: 21,
    circumference: 2111,
    source: "BRR_measured_2023",
    notes: "Continental Grand Prix 5000"
  },
  {
    tireSize: "700x25c",
    rimWidth: 23,
    circumference: 2117,
    source: "BRR_measured_2023"
  },
  {
    tireSize: "700x28c",
    rimWidth: 19,
    circumference: 2114,
    source: "jan_heine_compass"
  },
  {
    tireSize: "700x28c",
    rimWidth: 21,
    circumference: 2120,
    source: "BRR_measured_2023",
    notes: "Continental Grand Prix 5000"
  },
  {
    tireSize: "700x28c",
    rimWidth: 23,
    circumference: 2126,
    source: "BRR_measured_2023"
  },
  {
    tireSize: "700x32c",
    rimWidth: 21,
    circumference: 2155,
    source: "jan_heine_compass"
  },
  {
    tireSize: "700x32c",
    rimWidth: 23,
    circumference: 2161,
    source: "BRR_measured_2023"
  },
  {
    tireSize: "700x35c",
    rimWidth: 21,
    circumference: 2168,
    source: "jan_heine_compass"
  },
  {
    tireSize: "700x35c",
    rimWidth: 23,
    circumference: 2174,
    source: "compass_measured"
  },
  {
    tireSize: "700x38c",
    rimWidth: 23,
    circumference: 2180,
    source: "jan_heine_compass"
  },
  {
    tireSize: "700x40c",
    rimWidth: 23,
    circumference: 2200,
    source: "gravel_community"
  },

  // 650b Gravel/Adventure
  {
    tireSize: "650x47b",
    rimWidth: 21,
    circumference: 2090,
    source: "jan_heine_compass",
    notes: "Compass Snoqualmie Pass"
  },
  {
    tireSize: "650x42b",
    rimWidth: 21,
    circumference: 2070,
    source: "compass_measured"
  },

  // MTB 29er (700c)
  {
    tireSize: "29x2.1",
    rimWidth: 23,
    circumference: 2300,
    source: "mtb_measured_2023"
  },
  {
    tireSize: "29x2.25",
    rimWidth: 25,
    circumference: 2320,
    source: "mtb_measured_2023"
  },
  {
    tireSize: "29x2.4",
    rimWidth: 30,
    circumference: 2350,
    source: "mtb_measured_2023"
  },

  // MTB 27.5" (650b)
  {
    tireSize: "27.5x2.1",
    rimWidth: 23,
    circumference: 2140,
    source: "mtb_measured_2023"
  },
  {
    tireSize: "27.5x2.25",
    rimWidth: 25,
    circumference: 2160,
    source: "mtb_measured_2023"
  },
  {
    tireSize: "27.5x2.4",
    rimWidth: 30,
    circumference: 2190,
    source: "mtb_measured_2023"
  },

  // MTB 26"
  {
    tireSize: "26x1.9",
    rimWidth: 19,
    circumference: 1970,
    source: "sheldon_brown"
  },
  {
    tireSize: "26x2.1",
    rimWidth: 23,
    circumference: 2010,
    source: "mtb_measured_2023"
  },
  {
    tireSize: "26x2.25",
    rimWidth: 25,
    circumference: 2040,
    source: "mtb_measured_2023"
  }
];

// Convert array to database structure for efficient lookup
export const TIRE_DATABASE: TireDatabase = TIRE_MEASUREMENTS.reduce((db, measurement) => {
  if (!db[measurement.tireSize]) {
    db[measurement.tireSize] = {};
  }
  db[measurement.tireSize][measurement.rimWidth.toString()] = measurement;
  return db;
}, {} as TireDatabase);

// Common tire sizes by bike type
export const COMMON_TIRE_SIZES = {
  road: ["700x23c", "700x25c", "700x28c", "700x32c"],
  gravel: ["700x32c", "700x35c", "700x38c", "700x40c", "650x42b", "650x47b"],
  mtb: ["29x2.1", "29x2.25", "29x2.4", "27.5x2.1", "27.5x2.25", "27.5x2.4", "26x1.9", "26x2.1", "26x2.25"],
  hybrid: ["700x32c", "700x35c", "700x38c"]
};

// Common rim widths by bike type
export const COMMON_RIM_WIDTHS = {
  road: [17, 19, 21, 23],
  gravel: [19, 21, 23, 25],
  mtb: [23, 25, 27, 30, 35],
  hybrid: [19, 21, 23]
};