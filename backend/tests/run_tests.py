import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from tests.test_lost_and_found import (
    setup_database,
    test_seeded_csv_data,
    test_get_categories,
    test_get_locations,
    test_list_lost_reports,
    test_list_found_reports,
    test_list_matches,
    test_create_lost_report,
    test_create_found_report,
    test_trigger_matching,
    test_verify_match,
    test_claim_conflict_resolution,
    test_handover_requires_approved_claim,
    test_successful_handover,
    test_rbac_security
)


def run_all_tests():
    print("=" * 75)
    print("RUNNING LOST AND FOUND SYSTEM TEST SUITE (TABLES 34-41)")
    print("=" * 75)

    # Initialize in-memory test database fixture
    gen = setup_database()
    next(gen)

    tests = [
        ("test_seeded_csv_data", test_seeded_csv_data),
        ("test_get_categories", test_get_categories),
        ("test_get_locations", test_get_locations),
        ("test_list_lost_reports", test_list_lost_reports),
        ("test_list_found_reports", test_list_found_reports),
        ("test_list_matches", test_list_matches),
        ("test_create_lost_report", test_create_lost_report),
        ("test_create_found_report", test_create_found_report),
        ("test_trigger_matching", test_trigger_matching),
        ("test_verify_match", test_verify_match),
        ("test_claim_conflict_resolution", test_claim_conflict_resolution),
        ("test_handover_requires_approved_claim", test_handover_requires_approved_claim),
        ("test_successful_handover", test_successful_handover),
        ("test_rbac_security", test_rbac_security),
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

    print("=" * 75)
    print(f"SUMMARY: {passed} passed, {failed} failed out of {len(tests)} tests.")
    print("=" * 75)
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
