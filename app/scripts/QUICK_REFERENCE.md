# 🚀 Quick Reference: Rear Derailleur Data Collection

## 📋 **Your Mission**
Collect data for 4 modern 12-speed MTB rear derailleurs:
1. **Shimano XT RD-M8100-SGS**
2. **Shimano SLX RD-M7100-SGS** 
3. **SRAM GX Eagle**
4. **SRAM X01 Eagle AXS**

## 🔍 **Top Research Sources**
- **Shimano**: `si.shimano.com` → Search "RD-M8100-SGS"
- **SRAM**: `sram.com/service` → Compatibility Maps
- **Cross-check**: BikeRadar, Pinkbike for verification

## 📊 **Required Fields**
| Field | Example | Validation |
|-------|---------|------------|
| `id` | `shimano-xt-rd-m8100-sgs-12` | brand-series-model-cage-speeds |
| `manufacturer_name` | `Shimano` | Shimano, SRAM, Campagnolo, Microshift |
| `series_name` | `Deore XT M8100` | Official series name |
| `model_name` | `RD-M8100-SGS` | **CRITICAL** - Exact model number |
| `year` | `2018` | Year introduced |
| `weight_grams` | `284` | Must be > 0 |
| `bike_type` | `mtb` | mtb, road, gravel, hybrid |
| `msrp_usd` | `125` | Must be ≥ 0 |
| `speeds` | `12` | Must be 7-13 |
| `max_cog` | `51` | Must be 10-55 |
| `min_cog` | `10` | Must be 9-15 |
| `clutch_type` | `Shimano Shadow RD+` | See mapping below |
| `cage_length` | `SGS` | SS/GS/SGS (Shimano) or Short/Medium/Long (SRAM) |
| `actuation` | `Mechanical` | Mechanical or Electronic |
| `mount_type` | `Standard Hanger` | Standard Hanger, SRAM UDH, Direct Mount |

## 🔧 **Key Mappings**

### **Cage Length**
- `SS` → `short`
- `GS` → `medium` 
- `SGS` → `long`
- `Short` → `short`
- `Medium` → `medium`
- `Long` → `long`

### **Clutch Type**
- `Shimano Shadow RD+` → `shimano-shadow-rd-plus`
- `Shimano Shadow RD` → `shimano-shadow-rd`
- `SRAM Type 3` → `sram-type-3`
- `SRAM Type 2.1` → `sram-type-2-1`
- `None` → `none`

### **Actuation**
- `Mechanical` → `mechanical`
- `Electronic` → `electronic`
- `Wireless` → `electronic`

### **Mount Type**
- `Standard Hanger` → `standard`
- `SRAM UDH` → `sram-udh`
- `Direct Mount` → `direct-mount`

## ✅ **Validation Checklist**
- [ ] Max cog ≥ Min cog
- [ ] Max cog: 10-55 teeth
- [ ] Min cog: 9-15 teeth
- [ ] Weight > 0 grams
- [ ] MSRP ≥ 0 USD
- [ ] Speeds: 7-13
- [ ] Valid cage length
- [ ] Valid actuation type
- [ ] Valid mount type

## 🎯 **Success Criteria**
- ✅ All 4 derailleurs documented
- ✅ 100% manufacturer-verified specs
- ✅ Cross-referenced with multiple sources
- ✅ All validation rules passed

---

**Ready to build the data moat!** 🏗️🚴‍♂️ 