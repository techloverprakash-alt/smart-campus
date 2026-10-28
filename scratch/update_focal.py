import re

with open("src/modules/auth/screens/CommonPortal.jsx", "r", encoding="utf-8") as f:
    content = f.read()

new_content = re.sub(r'focalDesktop:\s*"[^"]+"', 'focalDesktop: "center center"', content)
new_content = re.sub(r'focalMobile:\s*"[^"]+"', 'focalMobile: "center center"', new_content)

with open("src/modules/auth/screens/CommonPortal.jsx", "w", encoding="utf-8", newline="") as f:
    f.write(new_content)

print("Updated CommonPortal.jsx successfully!")

