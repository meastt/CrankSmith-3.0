# CrankSmith Data Moat - Smart Uploader System

## Overview

This system provides a robust, validated approach to building CrankSmith's data moat. It combines the reliability of spreadsheet-based data collection with intelligent validation and transformation for database uploads.

## 🎯 Mission: Build the Ultimate Cycling Component Database

### Phase 1: Modern 12-Speed MTB Drivetrains
**Target Components:**
- **Cassettes**: Shimano XT M8100, SLX M7100, SRAM GX Eagle, X01 Eagle
- **Chains**: Compatible chains for each system
- **Rear Derailleurs**: Matching derailleurs for each cassette
- **Cranksets**: 1x and 2x options for each system

### Data Quality Standards
- ✅ **Manufacturer Specifications**: Primary source
- ✅ **Reputable Cycling Media**: Secondary verification
- ✅ **Real-world Testing Data**: When available
- ✅ **Cross-reference Multiple Sources**: For accuracy

## 📊 Data Collection Workflow

### 1. Spreadsheet Structure
Use the standardized format for each component type:

**Cassettes:**
```csv
id,manufacturer_name,series_name,model_name,year,weight_grams,bike_type,msrp_usd,image_url,speeds,cogs,freehub_standard,chain_compatibility
shimano-xt-cs-m8100-12-10-51,Shimano,Deore XT M8100,CS-M8100-12,2018,470,mtb,165,https://...,12,10-12-14-16-18-21-24-28-33-39-45-51,Shimano Micro Spline,Shimano Hyperglide+
```

### 2. Data Validation Rules
The system automatically validates:
- ✅ Required fields present
- ✅ Valid manufacturer names
- ✅ Valid bike types (mtb, road, gravel, hybrid)
- ✅ Speed count matches cog count
- ✅ Weight and MSRP are positive numbers
- ✅ Freehub standards are recognized
- ✅ Cog format is correct (dash-separated)

### 3. Smart Transformation
The uploader automatically:
- 🔄 Converts spreadsheet format to database schema
- 🔄 Maps freehub standards to internal codes
- 🔄 Calculates cog ranges from individual cogs
- 🔄 Ensures manufacturer records exist
- 🔄 Handles image URLs (stored separately)

## 🚀 Usage

### Quick Start
```bash
# Test the uploader with sample data
npm run ts-node app/scripts/testUploader.ts

# Run the full uploader
npm run ts-node app/scripts/smartUploader.ts
```

### Custom Data Upload
```typescript
import { uploadCassettesFromSpreadsheet } from './smartUploader';

const myCassettes = [
  // Your spreadsheet data here
];

const results = await uploadCassettesFromSpreadsheet(myCassettes);
console.log(`Uploaded ${results.successful}/${results.total} cassettes`);
```

## 📋 Component Categories

### Priority 1: Modern 12-Speed MTB
- **Shimano**: XT M8100, SLX M7100, Deore M6100
- **SRAM**: GX Eagle, X01 Eagle, XX1 Eagle
- **Chains**: Shimano HG+, SRAM Eagle
- **Derailleurs**: Matching capacity and cog limits

### Priority 2: Road 12-Speed
- **Shimano**: Dura-Ace R9200, Ultegra R8100
- **SRAM**: Red AXS, Force AXS
- **Campagnolo**: Super Record, Record, Chorus

### Priority 3: Gravel & Adventure
- **Mixed Systems**: Road/MTB hybrid setups
- **1x Systems**: Wide-range cassettes
- **2x Systems**: Traditional road gearing

## 🔧 Technical Details

### Database Schema
The system works with the existing CrankSmith schema:
- `components` table: Basic component info
- `details_cassette` table: Cassette-specific data
- `manufacturers` table: Manufacturer information

### Validation Features
- **Data Integrity**: Ensures all required fields
- **Business Logic**: Validates gear ratios and compatibility
- **Format Checking**: Verifies data formats and ranges
- **Error Reporting**: Detailed error messages for fixes

### Error Handling
- **Graceful Failures**: Continues processing on individual errors
- **Detailed Logging**: Full error reports with context
- **Rollback Safety**: Uses upsert operations for safety

## 📈 Success Metrics

### Data Quality
- ✅ 100% manufacturer-verified specifications
- ✅ Cross-referenced with multiple sources
- ✅ Real-world compatibility validation
- ✅ Complete cog and gear ratio data

### Coverage Goals
- 🎯 **Phase 1**: 50+ modern 12-speed components
- 🎯 **Phase 2**: 100+ road and gravel components
- 🎯 **Phase 3**: 200+ total components across all categories

### User Value
- 🚀 **Accurate Calculations**: Perfect gear ratio calculations
- 🚀 **Reliable Compatibility**: No false compatibility warnings
- 🚀 **Complete Coverage**: All major modern systems
- 🚀 **Real-time Updates**: Fresh pricing and availability

## 🛠️ Development

### Adding New Component Types
1. Create new interface in `types/components.ts`
2. Add validation rules to processor class
3. Create database upload logic
4. Add to spreadsheet templates

### Extending Validation
The validation system is modular and can be extended for:
- New manufacturers
- New freehub standards
- New bike types
- Custom business rules

## 📞 Support

For questions about the data upload system:
1. Check the validation errors in the console output
2. Verify spreadsheet format matches examples
3. Ensure all required fields are populated
4. Cross-reference with manufacturer specifications

---

**Next Steps:**
1. ✅ Test the uploader with your cassette data
2. 🔄 Upload the first 4 cassettes
3. 📊 Verify data appears correctly in the app
4. 🚀 Continue with chains, derailleurs, and cranksets
5. 🎯 Expand to road and gravel systems

Let's build the most comprehensive cycling component database ever created! 🚴‍♂️ 