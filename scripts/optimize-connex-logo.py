from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/webdev-static-assets/connex-icon.png')
targets = [
    Path('/home/ubuntu/personal-assistant-app/assets/images/icon.png'),
    Path('/home/ubuntu/personal-assistant-app/assets/images/splash-icon.png'),
    Path('/home/ubuntu/personal-assistant-app/assets/images/favicon.png'),
    Path('/home/ubuntu/personal-assistant-app/assets/images/android-icon-foreground.png'),
]

image = Image.open(source).convert('RGB').resize((1024, 1024), Image.Resampling.LANCZOS)
for target in targets:
    image.save(target, format='PNG', optimize=True, compress_level=9)
print('optimized', len(targets), 'logo assets')
for target in targets:
    print(target, target.stat().st_size)
