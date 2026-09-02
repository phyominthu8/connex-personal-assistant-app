from PIL import Image, ImageDraw

size = 1024
image = Image.new("RGB", (size, size), "#4F46E5")
draw = ImageDraw.Draw(image)

# Layered compass diamond.
outer = [(512, 72), (952, 512), (512, 952), (72, 512)]
inner = [(512, 168), (856, 512), (512, 856), (168, 512)]
draw.polygon(outer, fill="#3730A3")
draw.polygon(inner, fill="#6366F1")

# Warm amber directional checkmark.
draw.line([(300, 520), (454, 674), (744, 340)], fill="#FBBF24", width=92, joint="curve")
draw.ellipse((262, 482, 354, 574), fill="#FBBF24")
draw.ellipse((700, 296, 792, 388), fill="#FBBF24")

for filename in ["icon.png", "splash-icon.png", "favicon.png", "android-icon-foreground.png"]:
    image.save(f"/home/ubuntu/personal-assistant-app/assets/images/{filename}")
