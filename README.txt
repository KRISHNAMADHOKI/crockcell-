CROCKCELL V2 CLEAN
===================

This is the clean rebuild base.

FILES
-----
core.js              One shared Firebase/auth/session system
style.css            Shared modern dark UI
index.html           Login / signup
home.html            Feed
create.html          Create post
profile.html         Profile + post count + post grid
edit-profile.html    Profile editor
search.html          Username search
messages.html        Messages base
settings.html        Settings

IMPORTANT
---------
1. Keep your old CROCKCELL ZIP backup untouched.
2. Upload these files together as one clean version.
3. Do not mix old home_cloud.html / old profile files with this V2 during testing.
4. Firebase project/API settings are kept in core.js.
5. Firestore rules must allow the authenticated operations your app needs.
6. Images are stored as base64 in Firestore for this prototype. Firestore has document-size limits, so later the production version should move images to proper storage.

NEXT V2 PHASES
--------------
- Better authentication/profile creation
- Real likes/comments
- Follow/unfollow
- Activity notifications
- Real-time messages
- Voice/video calling with WebRTC
- Stories
- Notes
- Reels
- Privacy/settings
- Better image storage
- Production security rules
