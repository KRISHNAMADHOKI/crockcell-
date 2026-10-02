CROCKCELL FINAL V3

This package is a complete replacement set for the current CROCKCELL GitHub Pages files.

Files:
- index.html
- signup.html
- forgot-password.html
- home.html
- search.html
- profile.html
- messages.html
- create.html
- reels.html
- activity.html
- edit-profile.html
- core.js

Important fixes:
1. One consistent localStorage key system is used.
2. Legacy CROCKCELL storage keys are migrated automatically.
3. Firebase ID-token refresh/retry is centralized in core.js.
4. Profile -> Message target handoff is fixed.
5. Reels use a stable HTTPS demo video source and manual controls are available if autoplay is blocked.
6. JavaScript syntax was checked for all files.

GitHub upload:
1. Remove the old website files from the repository.
2. Upload ALL files from this package, including core.js.
3. Commit once.
4. Wait for one green Pages build and deployment.
5. Open the Pages site and test Login -> Profile -> Search -> User Profile -> Message -> Reels.

Do NOT delete or change the Firebase project, Firestore data, or Firestore rules.
