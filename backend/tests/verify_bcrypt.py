import bcrypt

hashes = {
    'Admin@123': '$2a$10$wT8Kz5B1jS4F5E9g3r6pMe6U5K8Q7e4D3C2B1A0Z9Y8X7W6V5U4Tu',
    'Staff@123': '$2a$10$gN4J1y9X3Z8W7V6U5T4S3e2R1Q0P9O8N7M6L5K4J3I2H1G0F9E8Da',
    'Student@123': '$2a$10$vP3K5m8R2T6W9Z1X4Y7Q8e9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3Ga',
    'Password@123': '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2'
}

for pwd, h in hashes.items():
    print(f"Testing {pwd} with hash {h[:20]}... (len {len(h)})")
    try:
        valid = bcrypt.checkpw(pwd.encode('utf-8'), h.encode('utf-8'))
        print(f"  Valid: {valid}")
    except Exception as e:
        print(f"  Error: {e}")
        # Generate genuine hash for reference
        gen = bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt(10)).decode('utf-8')
        print(f"  Generated genuine bcrypt hash: {gen}")
