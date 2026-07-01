import os
import shutil
import glob

brain_dir = r"C:\Users\SathyasudarVetriVasa\.gemini\antigravity\brain\4dc60922-9131-4521-bba2-81d93069c96f"
dest_dir = r"c:\Sathyasudar\demo-react-project\phishguard-ai\public\images"

os.makedirs(dest_dir, exist_ok=True)

# List of patterns to look for in brain directory
mappings = {
    "dashboard_hero_illustration*.png": "dashboard_hero.png",
    "report_mail_success*.png": "report_success.png",
    "leaderboard_trophy*.png": "leaderboard_trophy.png",
    "empty_state_illustration*.png": "empty_state.png"
}

for pattern, dest_name in mappings.items():
    src_files = glob.glob(os.path.join(brain_dir, pattern))
    if src_files:
        # Get the latest file matching the pattern
        latest_file = max(src_files, key=os.path.getctime)
        dest_path = os.path.join(dest_dir, dest_name)
        shutil.copy2(latest_file, dest_path)
        print(f"Copied {latest_file} -> {dest_path}")
    else:
        print(f"No file found for pattern: {pattern}")
