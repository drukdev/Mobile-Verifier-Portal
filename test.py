from PIL import Image

# Open the image
image = Image.open("src/assets/images/img.jpg").convert("RGBA")

# Get pixel data
data = image.getdata()

# Process each pixel
new_data = []
for item in data:
    # Change light-colored pixels (background) to transparent
    if item[0] > 200 and item[1] > 200 and item[2] > 200:
        new_data.append((255, 255, 255, 0))  # Transparent
    else:
        new_data.append(item)

# Apply transparency
image.putdata(new_data)

# Save as a PNG (preserves transparency)
image.save("src/assets/images/img1.jpg", "PNG")
