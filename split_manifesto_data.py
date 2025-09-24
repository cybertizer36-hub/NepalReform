#!/usr/bin/env python3
"""
Split manifesto data into summary and individual agenda files for optimization.
This script separates the large manifesto.json files into:
1. summary.json - Contains data used in ManifestoCard components
2. Individual agenda files - Contains detailed data used in agenda detail pages
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any

def load_json_file(file_path: str) -> Dict[str, Any]:
    """Load JSON data from file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Error: File {file_path} not found.")
        return {}
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {file_path}: {e}")
        return {}

def save_json_file(data: Any, file_path: str) -> None:
    """Save data to JSON file with proper formatting."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2, ensure_ascii=False)

def extract_summary_data(item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract only the data needed for ManifestoCard component.
    
    Fields for ManifestoCard:
    - id (for links and voting)
    - title, description
    - category, priority, timeline (badges)
    - problem.short
    - solution.short (array - shows first 3)
    - performanceTargets (array - shows first 2)
    - realWorldEvidence.short (array - in expanded view)
    - implementation.short (array - in expanded view)
    - legalFoundation (optional - in expanded view)
    """
    summary = {
        "id": item.get("id"),
        "title": item.get("title"),
        "description": item.get("description"),
        "category": item.get("category"),
        "priority": item.get("priority"),
        "timeline": item.get("timeline")
    }
    
    # Problem short
    if "problem" in item and isinstance(item["problem"], dict):
        summary["problem"] = {
            "short": item["problem"].get("short", "")
        }
    
    # Solution short (array)
    if "solution" in item and isinstance(item["solution"], dict):
        summary["solution"] = {
            "short": item["solution"].get("short", [])
        }
    
    # Performance targets (array)
    summary["performanceTargets"] = item.get("performanceTargets", [])
    
    # Real world evidence short (array)
    if "realWorldEvidence" in item and isinstance(item["realWorldEvidence"], dict):
        summary["realWorldEvidence"] = {
            "short": item["realWorldEvidence"].get("short", [])
        }
    
    # Implementation short (array)
    if "implementation" in item and isinstance(item["implementation"], dict):
        summary["implementation"] = {
            "short": item["implementation"].get("short", [])
        }
    
    # Legal foundation (optional)
    if "legalFoundation" in item:
        summary["legalFoundation"] = item["legalFoundation"]
    
    return summary

def extract_detailed_data(item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract detailed data for individual agenda pages.
    
    This includes:
    - id (for reference)
    - title (for page title)
    - problem.long
    - solution.long (with phases)
    - realWorldEvidence.long (detailed country data)
    - implementation.long (detailed timeline data)
    - Any other fields not in summary
    """
    detailed = {
        "id": item.get("id"),
        "title": item.get("title"),
        "description": item.get("description"),
        "category": item.get("category"),
        "priority": item.get("priority"),
        "timeline": item.get("timeline")
    }
    
    # Problem long
    if "problem" in item and isinstance(item["problem"], dict):
        detailed["problem"] = {
            "long": item["problem"].get("long", "")
        }
    
    # Solution long (with phases)
    if "solution" in item and isinstance(item["solution"], dict):
        detailed["solution"] = {
            "long": item["solution"].get("long", {})
        }
    
    # Real world evidence long (detailed country data)
    if "realWorldEvidence" in item and isinstance(item["realWorldEvidence"], dict):
        detailed["realWorldEvidence"] = {
            "long": item["realWorldEvidence"].get("long", [])
        }
    
    # Implementation long (detailed timeline data)
    if "implementation" in item and isinstance(item["implementation"], dict):
        detailed["implementation"] = {
            "long": item["implementation"].get("long", [])
        }
    
    # Include performance targets and legal foundation for completeness
    detailed["performanceTargets"] = item.get("performanceTargets", [])
    if "legalFoundation" in item:
        detailed["legalFoundation"] = item["legalFoundation"]
    
    return detailed

def process_language(language: str, language_code: str) -> None:
    """Process manifesto data for a specific language."""
    print(f"\n🌐 Processing {language} data...")
    
    # File paths
    manifesto_file = f"public/locales/{language_code}/manifesto.json"
    summary_file = f"public/locales/{language_code}/summary.json"
    agenda_dir = f"public/locales/{language_code}/agenda"
    
    # Load existing manifesto data
    manifesto_data = load_json_file(manifesto_file)
    
    if not manifesto_data:
        print(f"❌ No data found for {language}")
        return
    
    # Extract agenda items
    agenda_items = []
    if "manifestoData" in manifesto_data:
        agenda_items = manifesto_data["manifestoData"]
    elif isinstance(manifesto_data, list):
        agenda_items = manifesto_data
    else:
        print(f"❌ Unexpected data structure in {language} manifesto file")
        return
    
    print(f"📋 Found {len(agenda_items)} agenda items")
    
    # Create summary data
    summary_items = []
    
    # Process each agenda item
    for item in agenda_items:
        if not isinstance(item, dict) or "id" not in item:
            print(f"⚠️  Skipping invalid item: {item}")
            continue
        
        agenda_id = item["id"]
        
        # Extract summary data
        summary_data = extract_summary_data(item)
        summary_items.append(summary_data)
        
        # Extract detailed data
        detailed_data = extract_detailed_data(item)
        
        # Save individual agenda file
        agenda_file = f"{agenda_dir}/{agenda_id}.json"
        save_json_file(detailed_data, agenda_file)
        print(f"✅ Created {agenda_file}")
    
    # Save summary file
    summary_structure = {
        "manifestoData": summary_items
    }
    save_json_file(summary_structure, summary_file)
    print(f"✅ Created {summary_file} with {len(summary_items)} items")

def main():
    """Main function to split manifesto data for both languages."""
    print("🚀 Starting manifesto data splitting process...")
    
    # Check if we're in the correct directory
    if not os.path.exists("public/locales"):
        print("❌ Error: public/locales directory not found!")
        print("   Make sure you're running this script from the project root directory.")
        return
    
    # Process both languages
    languages = [
        ("English", "en"),
        ("Nepali", "np")
    ]
    
    for language, code in languages:
        try:
            process_language(language, code)
        except Exception as e:
            print(f"❌ Error processing {language}: {e}")
    
    print("\n🎉 Data splitting completed!")
    print("\nFiles created:")
    print("📁 public/locales/en/summary.json - English summary data for ManifestoCard")
    print("📁 public/locales/en/agenda/ - Individual English agenda files")
    print("📁 public/locales/np/summary.json - Nepali summary data for ManifestoCard")
    print("📁 public/locales/np/agenda/ - Individual Nepali agenda files")
    
    print("\n📋 Next steps:")
    print("1. Update your components to use the new file structure")
    print("2. Modify data loading hooks to load summary vs detailed data as needed")
    print("3. Test the application with the new data structure")
    print("4. Consider removing the original large manifesto.json files once confirmed working")

if __name__ == "__main__":
    main()
