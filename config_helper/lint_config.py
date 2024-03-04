"""
Usage: python3 lint_config.py path/to/config.json

Purpose: Lints a config.json configuration file used by a deployment of the Filmdrop UI application (https://github.com/Element84/filmdrop-ui).
Checks for missing required keys, extra keys, type errors, and optional keys not included.

Supported console version this works for: 5.0.0
"""

import sys
import json
import os

def lint_config(file_path):
    # Read the config file
    try:
        with open(file_path, 'r') as file:
            config = json.load(file)
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        sys.exit(1)

    # Define the expected keys and their types
    expected_keys = {
        "STAC_API_URL": str,
        "PUBLIC_URL": str,
        "LOGO_URL": str,
        "LOGO_ALT": str,
        "DASHBOARD_BTN_URL": str,
        "ANALYZE_BTN_URL": str,
        "API_MAX_ITEMS": int,
        "DEFAULT_COLLECTION": str,
        "COLLECTIONS": list,
        "SCENE_TILER_URL": str,
        "SCENE_TILER_PARAMS": dict,
        "MOSAIC_MIN_ZOOM_LEVEL": int,
        "ACTION_BUTTON": dict,
        "MOSAIC_TILER_URL": str,
        "MOSAIC_TILER_PARAMS": dict,
        "MOSAIC_MAX_ITEMS": int,
        "SEARCH_MIN_ZOOM_LEVELS": dict,
        "CONFIG_COLORMAP": str,
        "BASEMAP_URL": str,
        "BASEMAP_DARK_THEME": bool,
        "BASEMAP_HTML_ATTRIBUTION": str,
        "SEARCH_BY_GEOM_ENABLED": bool,
        "CART_ENABLED": bool,
        "SHOW_BRAND_LOGO": bool,
        "POPUP_DISPLAY_FIELDS": dict,
        "APP_NAME": str,
        "APP_FAVICON": str,
        "MAP_ZOOM": int,
        "MAP_CENTER": list,
        "LAYER_LIST_ENABLED": bool,
        "LAYER_LIST_SERVICES": list,
        "STAC_LINK_ENABLED": bool,
        "SHOW_ITEM_AUTO_ZOOM": bool,
    }

    print("*********************************************************************")
    print("**************** Running Filmdrop UI Config Lint ********************")
    print("*********************************************************************")

    # Check for missing required keys
    required_keys = ["STAC_API_URL","SEARCH_MIN_ZOOM_LEVELS"]
    missing_required_keys = [key for key in required_keys if key not in config]
    if missing_required_keys:
        print("Required key(s) missing:")
        for key in missing_required_keys:
            print(f" - {key}")
        print("************************************")

    # Check for extra keys that can't be used
    extra_keys = [key for key in config.keys() if key not in expected_keys]
    if extra_keys:
        print("Extra key(s) found that can't be used:")
        for key in extra_keys:
            print(f" - {key}")
        print("************************************")

    # Check for optional keys not included
    optional_keys = [key for key in expected_keys.keys() if key not in config]
    if optional_keys:
        print("Optional key(s) not included:")
        for key in optional_keys:
            print(f" - {key}")
        print("************************************")

    # Check for type errors
    for key, expected_type in expected_keys.items():
        if key in config and not isinstance(config[key], expected_type):
            print(f"Type error for key '{key}': expected {expected_type.__name__}, got {type(config[key]).__name__}")
            print("************************************")

    # Perform additional validations as needed

    # If everything looks good
    if not missing_required_keys and not extra_keys:
        print("Configuration looks good!")

if __name__ == "__main__":
    # Get the file path from command line arguments
    if len(sys.argv) != 2:
        print("Usage: ./lint_config.py path/to/config.json")
        sys.exit(1)

    file_path = sys.argv[1]

    # Check if the file is a JSON file
    if not file_path.endswith(".json"):
        print("Invalid file format. Expected a JSON file.")
        sys.exit(1)

    # Check if the file exists
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)

    # Lint the config file
    lint_config(file_path)
