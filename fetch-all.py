#!/usr/bin/env python3
import os
import subprocess
import sys

script_dir = os.path.dirname(os.path.abspath(__file__))

for script in ["fetch-matches.py", "fetch-members.py"]:
    result = subprocess.run(
        [sys.executable, os.path.join(script_dir, script)],
        cwd=script_dir,
    )
    if result.returncode != 0:
        sys.exit(result.returncode)
