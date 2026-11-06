# Play Protect Diagnostics and Permission Inventory

## Sensitive Permission Inventory

The Device Manager Android application requests the following permissions, which may trigger Play Protect warnings based on Google's automated analysis for unknown apps:

1.  **`android.permission.READ_SMS` & `android.permission.RECEIVE_SMS` (implied or related):**
    *   **Purpose:** Required to read incoming SMS messages for device management and synchronization with the web dashboard, providing the user with remote access to their messages.
    *   **Justification:** Core functionality of a personal device management tool. The app uses Android's runtime permission system and prompts the user with rationale.

2.  **`android.permission.READ_CALL_LOG`:**
    *   **Purpose:** Required to access and synchronize call history to the web dashboard.
    *   **Justification:** Core functionality for remote device monitoring by the device owner. Runtime permissions are correctly implemented.

3.  **`android.permission.READ_CONTACTS`:**
    *   **Purpose:** Required to resolve phone numbers to contact names when displaying SMS or call logs in the web dashboard.
    *   **Justification:** Enhances the user experience of the remote management features.

4.  **`android.permission.ACCESS_FINE_LOCATION` & `android.permission.ACCESS_COARSE_LOCATION`:**
    *   **Purpose:** Required to track the device's location, allowing the owner to find a lost device via the web dashboard.
    *   **Justification:** Standard feature for device managers and "find my device" applications.

## Play Protect Compatibility Assessment

*   **Sensitive Permission Installation Block / Unknown App Warning:** Google Play Protect often flags internet-sideloaded apps that request SMS and Call Log permissions, as these are highly sensitive and commonly abused by malware.
*   **Mitigation Strategy Implemented:**
    *   The app implements a strict "double-gate" protocol (OS Permission + Sync toggle in the UI).
    *   It does not attempt to hide these permissions or use deceptive techniques.
    *   It requests permissions using standard `ActivityResultContracts`.
*   **Compliant Resolution if Blocked:** Users sideloading this app for personal use will need to bypass the Play Protect warning during installation (e.g., tapping "Install anyway" after expanding the "More details" section on the block screen). To remove the warning entirely, the application would need to be submitted to the Google Play Store for review, demonstrating a valid use case for these restricted permissions (e.g., as a default SMS handler or a device companion app), or submitted for a Play Protect appeal if distributed outside the store.

## APK Structural and Integrity Checks

*   **Signing:** The Release APK is now correctly signed with a 2048-bit RSA key using APK Signature Scheme v2.
*   **Alignment:** The Release APK is successfully `zipalign`ed (verified with `zipalign -c -v 4`).
*   **Manifest Declarations:** The warning regarding the `package` attribute in `AndroidManifest.xml` (which conflicts with modern Gradle namespace declarations) has been resolved.

## Note on Testing
Actual installation on a physical device has not been verified in this CI/CD automated environment, but standard Android build, alignment, and signing validations have passed successfully.
