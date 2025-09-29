import json
from typing import Any, Dict

def debug_print(title: str, data: Any):
    """Función auxiliar para debug"""
    print(f"=== DEBUG: {title} ===")
    if isinstance(data, (dict, list)):
        print(json.dumps(data, indent=2, default=str))
    else:
        print(data)