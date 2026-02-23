"""
Validate all 67 county SKILL.md files against required schema.
Run in CI to catch malformed or incomplete skill files.

Usage:
    python3 scripts/validate_county_skills.py
    python3 scripts/validate_county_skills.py --county brevard
    python3 scripts/validate_county_skills.py --fail-fast

Exit codes:
    0: All valid
    1: Validation failures found
"""

import argparse
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False
    print("Warning: PyYAML not installed. Frontmatter validation limited.")

REQUIRED_FRONTMATTER_FIELDS = [
    "name", "co_no", "county_slug", "portal_type",
    "anti_scrape", "rate_limit_rpm", "phase"
]

VALID_PORTAL_TYPES = {"municode", "arcgis", "pdf"}
VALID_PHASES = {"P0", "P1", "P3"}

REQUIRED_SECTIONS = [
    "Supabase Query Patterns",
    "3-Mode Research Protocol",
    "County Profile",
    "Standard FL Zoning Categories",
    "Progressive Disclosure",
]

FORBIDDEN_PATTERNS = [
    (r'(?i)api[_-]?key\s*[:=]\s*["\']?[a-zA-Z0-9]{20,}', "Hardcoded API key"),
    (r'(?i)secret\s*[:=]\s*["\']?[a-zA-Z0-9]{20,}', "Hardcoded secret"),
    (r'(?i)password\s*[:=]\s*["\']?\S{8,}', "Hardcoded password"),
    (r'ghp_[a-zA-Z0-9]{36}', "GitHub Personal Access Token"),
    (r'sbp_[a-zA-Z0-9]{36}', "Supabase management token"),
]


def validate_skill_file(path: Path) -> Tuple[bool, List[str]]:
    """Validate a single SKILL.md file. Returns (is_valid, errors)."""
    errors = []
    
    if not path.exists():
        return False, [f"File not found: {path}"]
    
    content = path.read_text(encoding="utf-8")
    
    # Check frontmatter
    fm_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not fm_match:
        errors.append("Missing or malformed YAML frontmatter (--- block)")
    else:
        frontmatter_text = fm_match.group(1)
        
        if HAS_YAML:
            try:
                fm = yaml.safe_load(frontmatter_text) or {}
            except yaml.YAMLError as e:
                errors.append(f"Invalid YAML frontmatter: {e}")
                fm = {}
        else:
            # Basic regex extraction
            fm = {}
            for line in frontmatter_text.split('\n'):
                if ':' in line:
                    k, _, v = line.partition(':')
                    fm[k.strip()] = v.strip()
        
        # Check required fields
        for field in REQUIRED_FRONTMATTER_FIELDS:
            if field not in fm:
                errors.append(f"Missing required frontmatter field: {field}")
        
        # Validate field values
        if "portal_type" in fm and fm["portal_type"] not in VALID_PORTAL_TYPES:
            errors.append(f"Invalid portal_type: {fm['portal_type']} (must be: {VALID_PORTAL_TYPES})")
        
        if "phase" in fm and str(fm["phase"]) not in VALID_PHASES:
            errors.append(f"Invalid phase: {fm['phase']} (must be: {VALID_PHASES})")
        
        if "co_no" in fm:
            try:
                co_no = int(fm["co_no"])
                if not 1 <= co_no <= 67:
                    errors.append(f"co_no out of range: {co_no} (must be 1-67)")
            except (ValueError, TypeError):
                errors.append(f"co_no must be integer: {fm['co_no']}")
        
        if "rate_limit_rpm" in fm:
            try:
                rate = int(fm["rate_limit_rpm"])
                if not 1 <= rate <= 120:
                    errors.append(f"rate_limit_rpm out of range: {rate} (must be 1-120)")
            except (ValueError, TypeError):
                errors.append(f"rate_limit_rpm must be integer: {fm['rate_limit_rpm']}")
    
    # Check required sections
    for section in REQUIRED_SECTIONS:
        if section not in content:
            errors.append(f"Missing required section: '{section}'")
    
    # Check forbidden patterns
    for pattern, description in FORBIDDEN_PATTERNS:
        if re.search(pattern, content):
            errors.append(f"Security violation: {description} found in skill file")
    
    # Check Supabase queries use parameterized syntax
    if "Supabase Query Patterns" in content:
        hardcoded_id_match = re.search(r'eq\.\d{5,}', content)
        if hardcoded_id_match:
            errors.append(f"Hardcoded ID in Supabase query: {hardcoded_id_match.group(0)}")
    
    # Check minimum content length (real SKILL.md should be substantial)
    if len(content) < 1000:
        errors.append(f"SKILL.md too short: {len(content)} chars (expected >1000)")
    
    return len(errors) == 0, errors


def run_validation(skills_dir: Path, county_filter: str = "", fail_fast: bool = False) -> int:
    """Run validation on all county SKILL.md files."""
    county_dirs = sorted(skills_dir.glob("county-*/SKILL.md"))
    
    if county_filter:
        county_dirs = [p for p in county_dirs if county_filter in p.parent.name]
    
    if not county_dirs:
        print(f"No county skill files found in {skills_dir}")
        return 1
    
    passed = 0
    failed = 0
    total = len(county_dirs)
    
    print(f"Validating {total} county SKILL.md files...")
    print("=" * 60)
    
    for skill_path in county_dirs:
        county_slug = skill_path.parent.name.replace("county-", "")
        is_valid, errors = validate_skill_file(skill_path)
        
        if is_valid:
            passed += 1
            print(f"  ✅ {county_slug}")
        else:
            failed += 1
            print(f"  ❌ {county_slug} ({len(errors)} error{'s' if len(errors) > 1 else ''}):")
            for error in errors:
                print(f"      - {error}")
            
            if fail_fast:
                print(f"\nFAIL FAST: Stopping at first failure ({county_slug})")
                print(f"\nResult: {passed} passed, {failed} failed / {total} total")
                return 1
    
    print("=" * 60)
    print(f"\nResult: {passed} passed, {failed} failed / {total} total")
    
    if failed > 0:
        print(f"\n❌ {failed} skill file(s) failed validation")
        return 1
    else:
        print(f"\n✅ All {passed} county skill files valid")
        return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate ZoneWise county SKILL.md files")
    parser.add_argument("--skills-dir", default="zonewise/skills", help="Skills directory path")
    parser.add_argument("--county", default="", help="Filter to specific county slug")
    parser.add_argument("--fail-fast", action="store_true", help="Stop on first failure")
    args = parser.parse_args()
    
    skills_dir = Path(args.skills_dir)
    exit_code = run_validation(skills_dir, args.county, args.fail_fast)
    sys.exit(exit_code)
