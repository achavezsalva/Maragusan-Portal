# Security Specification: Maragusan Digital Portal

## Data Invariants
1. A user cannot be created with an 'admin' role by the client; roles must be validated or set by server logic (or restricted).
2. Announcements must belong to a valid department.
3. Citizens can only view/edit their own service requests and feedback.
4. Staff can only create announcements for their assigned department.
5. Admins have omnipotent access.
6. IDs must be valid strings (alphanumeric, 128 chars max).

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Citizen trying to create a user document with `role: 'admin'`.
2. **Post Poisoning**: Citizen trying to create an announcement in the `announcements` collection.
3. **Cross-Department Posting**: Staff A (Department X) trying to post an announcement for Department Y.
4. **Data Deletion**: Staff trying to delete another department's announcement.
5. **PII Scraping**: Anonymous user trying to list all users' emails.
6. **Self-Promotion**: Citizen trying to update their own document to change `role` to 'staff'.
7. **Orphaned Service Request**: Creating a service request with a non-existent `user_id`.
8. **Feedback Injection**: Random user trying to resolve a feedback entry they didn't create.
9. **Document ID Overload**: Trying to write a document with a 2MB string as its ID.
10. **Timestamp Fraud**: Client providing a `created_at` date in the future instead of using `request.time`.
11. **Shadow Field Injection**: Adding a `verified: true` field to a Service Request to skip processing.
12. **Unauthorized Metadata Update**: Citizen trying to change a department's name.

## Test Runner (Logic Overview)
- `users/{userId}`: `create` fails if `role == 'admin'` and user is not already authorized.
- `announcements`: `create` fails if `author.department_id != announcement.department_id`.
- `service_requests`: `list` only returns developer's own requests unless they are admin.
- All writes must use `request.time` for timestamps.
