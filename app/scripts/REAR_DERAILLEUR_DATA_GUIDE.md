# Rear Derailleur Data Collection Guide

## 🎯 **Mission: Build the Ultimate Rear Derailleur Database**

This guide will help you collect the most accurate, detailed rear derailleur specifications for CrankSmith's data moat.

## 📊 **Data Collection Template**

### **Spreadsheet Structure**
Create a new tab called `rear_derailleurs` with these exact columns:

| Column | Database Field | Example | Validation Rules |
|--------|----------------|---------|------------------|
| `id` | `components.id` | `shimano-xt-rd-m8100-sgs-12` | brand-series-model-cage-speeds |
| `manufacturer_name` | `manufacturer_id` | `Shimano` | Must be: Shimano, SRAM, Campagnolo, Microshift |
| `series_name` | `model_name` | `Deore XT M8100` | Official series name |
| `model_name` | `model_name` | `RD-M8100-SGS` | **CRITICAL** - Official model number |
| `year` | `components.year` | `2018` | Year series was introduced |
| `weight_grams` | `components.weight_grams` | `284` | Must be > 0 |
| `bike_type` | `components.bike_type` | `mtb` | Must be: mtb, road, gravel, hybrid |
| `msrp_usd` | `components.msrp_usd` | `125` | Must be ≥ 0 |
| `image_url` | `components.image_url` | `https://.../rd-m8100-sgs.jpg` | Optional |
| `speeds` | `details_rear_derailleur.speeds` | `12` | Must be 7-13 |
| `max_cog` | `details_rear_derailleur.max_cog_size` | `51` | Must be 10-55 |
| `min_cog` | `details_rear_derailleur.min_cog_size` | `10` | Must be 9-15 |
| `clutch_type` | `details_rear_derailleur.clutch_type` | `Shimano Shadow RD+` | See mapping below |
| `cage_length` | `details_rear_derailleur.cage_length` | `SGS` | See mapping below |
| `actuation` | `details_rear_derailleur.actuation_type` | `Mechanical` | Mechanical/Electronic |
| `mount_type` | `details_rear_derailleur.mount_type` | `Standard Hanger` | See mapping below |

## 🔍 **Research Sources (Priority Order)**

### **🥇 Gold Sources (Manufacturer Official)**
1. **Shimano**: `si.shimano.com` → Search model number (e.g., "RD-M8100-SGS")
2. **SRAM**: `sram.com/service` → Compatibility Maps & Specifications
3. **Campagnolo**: `campagnolo.com` → Technical Documentation

### **🥈 Silver Sources (Reputable Media)**
1. **BikeRadar**: Technical reviews and specifications
2. **Pinkbike**: Real-world testing data
3. **CyclingTips**: Detailed component analysis

### **🥉 Bronze Sources (Cross-Reference)**
1. **Online Retailers**: Competitive pricing and availability
2. **User Forums**: Real-world compatibility reports

## 🎯 **Target Components**

### **Phase 1: Modern 12-Speed MTB**
1. **Shimano XT RD-M8100-SGS** (Long cage, 1x systems)
2. **Shimano SLX RD-M7100-SGS** (Long cage, 1x systems)
3. **SRAM GX Eagle** (52t compatible, latest version)
4. **SRAM X01 Eagle AXS** (Electronic, wireless)

## 📋 **Data Collection Checklist**

### **Essential Information (Must Have)**
- [ ] **Model Number**: Exact official model (e.g., "RD-M8100-SGS")
- [ ] **Max Cog Size**: Largest cassette cog officially supported
- [ ] **Min Cog Size**: Smallest cassette cog supported
- [ ] **Cage Length**: SS/GS/SGS (Shimano) or Short/Medium/Long (SRAM)
- [ ] **Actuation Type**: Mechanical or Electronic
- [ ] **Weight**: In grams (official spec)
- [ ] **MSRP**: US retail price

### **Important Details (Should Have)**
- [ ] **Clutch Type**: Specific technology name
- [ ] **Mount Type**: Standard Hanger, SRAM UDH, etc.
- [ ] **Year**: When the series was introduced
- [ ] **Image URL**: Official product image

### **Nice to Have**
- [ ] **Cable Pull Ratio**: For mechanical systems
- [ ] **Compatibility Notes**: Special requirements or limitations

## 🔧 **Data Validation Rules**

### **ID Format**
```
brand-series-model-cage-speeds
Example: shimano-xt-rd-m8100-sgs-12
```

### **Cog Range Validation**
- Max cog must be ≥ Min cog
- Max cog: 10-55 teeth
- Min cog: 9-15 teeth
- Total capacity = Max cog - Min cog

### **Cage Length Mapping**
| Input | Database Value | Description |
|-------|----------------|-------------|
| `SS` | `short` | Short cage (Shimano) |
| `GS` | `medium` | Medium cage (Shimano) |
| `SGS` | `long` | Long cage (Shimano) |
| `Short` | `short` | Short cage (SRAM) |
| `Medium` | `medium` | Medium cage (SRAM) |
| `Long` | `long` | Long cage (SRAM) |

### **Clutch Type Mapping**
| Input | Database Value | Description |
|-------|----------------|-------------|
| `Shimano Shadow RD+` | `shimano-shadow-rd-plus` | Latest Shimano clutch |
| `Shimano Shadow RD` | `shimano-shadow-rd` | Standard Shimano clutch |
| `SRAM Type 3` | `sram-type-3` | Latest SRAM clutch |
| `SRAM Type 2.1` | `sram-type-2-1` | Previous SRAM clutch |
| `None` | `none` | No clutch |

### **Actuation Mapping**
| Input | Database Value | Description |
|-------|----------------|-------------|
| `Mechanical` | `mechanical` | Cable-actuated |
| `Electronic` | `electronic` | Electronic/wireless |
| `Wireless` | `electronic` | Wireless electronic |

### **Mount Type Mapping**
| Input | Database Value | Description |
|-------|----------------|-------------|
| `Standard Hanger` | `standard` | Traditional derailleur hanger |
| `SRAM UDH` | `sram-udh` | SRAM Universal Derailleur Hanger |
| `Direct Mount` | `direct-mount` | Direct mount to frame |

## 🚀 **Research Process**

### **Step 1: Manufacturer Documentation**
1. Go to manufacturer website
2. Search for exact model number
3. Find "Specifications" or "Technical Data" section
4. Record all available specifications

### **Step 2: Cross-Reference**
1. Check multiple sources for consistency
2. Verify pricing across retailers
3. Confirm compatibility with cassettes

### **Step 3: Validation**
1. Ensure all required fields are present
2. Verify data ranges are within acceptable limits
3. Check that cage length matches cog capacity

## 📊 **Example Data Entry**

```javascript
{
  id: 'shimano-xt-rd-m8100-sgs-12',
  manufacturer_name: 'Shimano',
  series_name: 'Deore XT M8100',
  model_name: 'RD-M8100-SGS',
  year: 2018,
  weight_grams: 284,
  bike_type: 'mtb',
  msrp_usd: 125,
  image_url: 'https://bike.shimano.com/content/dam/product-info/images/components/jev/RD-M8100-SGS_C6_750x750.png',
  speeds: 12,
  max_cog: 51,
  min_cog: 10,
  clutch_type: 'Shimano Shadow RD+',
  cage_length: 'SGS',
  actuation: 'Mechanical',
  mount_type: 'Standard Hanger'
}
```

## 🎯 **Success Criteria**

### **Data Quality**
- ✅ 100% manufacturer-verified specifications
- ✅ Cross-referenced with multiple sources
- ✅ All required fields completed
- ✅ Data validation passed

### **Coverage Goals**
- 🎯 **Phase 1**: 4 modern 12-speed MTB derailleurs
- 🎯 **Phase 2**: 8+ road and gravel derailleurs
- 🎯 **Phase 3**: 20+ total derailleurs across all categories

### **User Value**
- 🚀 **Perfect Compatibility**: Accurate cog size limits
- 🚀 **Smart Recommendations**: Cage length optimization
- 🚀 **Complete Coverage**: All major modern systems
- 🚀 **Real-time Updates**: Fresh pricing and availability

---

**Ready to build the most comprehensive rear derailleur database ever created!** 🚴‍♂️ 