import sys
from tests.test_lost_and_found import (
    override_get_db,
    setup_test_db,
    test_list_categories,
    test_create_category_role_restricted,
    test_submit_lost_report,
    test_submit_found_report,
    test_ai_matching_and_triage,
    test_match_double_blind_verification,
    test_claim_lifecycle_and_handover,
    test_ownership_authorization_restriction
)

def run_all_tests():
    print("=" * 70)
    print("RUNNING LOST AND FOUND SYSTEM TEST SUITE (TABLES 34-41)")
    print("=" * 70)

    # Initialize in-memory database
    gen = setup_test_db()
    next(gen)

    tests = [
        ("test_list_categories", test_list_categories),
        ("test_create_category_role_restricted", test_create_category_role_restricted),
        ("test_submit_lost_report", test_submit_lost_report),
        ("test_submit_found_report", test_submit_found_report),
        ("test_ai_matching_and_triage", test_ai_matching_and_triage),
        ("test_match_double_blind_verification", test_match_double_blind_verification),
        ("test_claim_lifecycle_and_handover", test_claim_lifecycle_and_handover),
        ("test_ownership_authorization_restriction", test_ownership_authorization_restriction),
    ]

    passed = 0
    failed = 0

    for name, test_func in tests:
        try:
            test_func()
            print(f" [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f" [FAIL] {name}: {e}")
            import traceback
            traceback.print_exc()
            failed += 1

    try:
        next(gen)
    except StopIteration:
        pass

    print("=" * 70)
    print(f"RESULTS: {passed} PASSED, {failed} FAILED")
    print("=" * 70)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
