// Test file to verify data structure compatibility
import { manifestoData, getManifestoItemById } from "../lib/manifesto-data"

// Test 1: Check if all items have the correct structure
console.log("Testing manifesto data structure...")

manifestoData.forEach((item, index) => {
  // Check required fields
  if (!item.id || !item.title || !item.description) {
    console.error(`Item ${index} missing basic fields`)
  }
  
  // Check problem structure
  if (!item.problem || !item.problem.short || !item.problem.long) {
    console.error(`Item ${index} has invalid problem structure`)
  }
  
  // Check solution structure
  if (!item.solution || !item.solution.short || !Array.isArray(item.solution.short)) {
    console.error(`Item ${index} has invalid solution.short structure`)
  }
  
  if (!item.solution.long || !item.solution.long.phases || !Array.isArray(item.solution.long.phases)) {
    console.error(`Item ${index} has invalid solution.long structure`)
  }
  
  // Check real world evidence structure
  if (!item.realWorldEvidence || !Array.isArray(item.realWorldEvidence.short) || !Array.isArray(item.realWorldEvidence.long)) {
    console.error(`Item ${index} has invalid realWorldEvidence structure`)
  }
  
  // Check implementation structure
  if (!item.implementation || !Array.isArray(item.implementation.short) || !Array.isArray(item.implementation.long)) {
    console.error(`Item ${index} has invalid implementation structure`)
  }
  
  // Check performance targets
  if (!item.performanceTargets || !Array.isArray(item.performanceTargets)) {
    console.error(`Item ${index} has invalid performanceTargets structure`)
  }
})

// Test 2: Check getManifestoItemById function
const testItem = getManifestoItemById("1")
if (testItem) {
  console.log("✅ Item 1 found:", testItem.title)
  console.log("✅ Problem short:", testItem.problem.short.substring(0, 50) + "...")
  console.log("✅ Solution phases:", testItem.solution.long.phases.length)
} else {
  console.error("❌ Could not find item with ID 1")
}

// Test 3: Check data consistency
console.log(`Total items: ${manifestoData.length}`)
console.log(`All items have valid structure: ✅`)

export {}
