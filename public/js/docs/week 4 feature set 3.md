# Feature Set 3: Protected User Admin Page

## 1. Overview

The purpose of this feature is to create a protected user administration page for Kizuna Rail. Authenticated users can view and manage their own account information, while users with the admin role can view, update and delete any user account.

The page will retrieve user information dynamically through client-side JavaScript requests to the API. Updating or deleting a user should update the displayed list without requiring a page refresh.

## 2. Data Model, Sessions and Roles

### User data

The feature will use the existing User model and database collection.

The implementation must first confirm the existing user fields and database structure. The page should display appropriate user information without exposing sensitive information such as passwords or password hashes.

### Session data

The feature will use the authentication session established by Feature Set 1.

The server must use the authenticated user's session to identify the current user and determine their role.

### Roles

- **Admin:** Can view, update and delete any user.
- **Regular user:** Can view, update and delete only their own account.
- **Unauthenticated user:** Cannot access the protected page or user API operations.

A regular user must not be able to change their role to admin through the update operation.

## 3. Page Routes and API Endpoints

The exact route names must follow the existing project conventions.

### Protected user admin page

**Proposed route:** `GET /users`

- Requires authentication.
- Redirects unauthenticated users to the login page.
- Renders the user administration page for authenticated users.

### Retrieve users

**Proposed endpoint:** `GET /api/users`

- Requires authentication.
- Admin users receive all users.
- Regular users receive only their own information.

Expected response:

- `200 OK` — Returns the permitted user information.
- `401 Unauthorized` — User is not authenticated.
- `500 Internal Server Error` — Unexpected server error.

### Update a user

**Proposed endpoint:** `PUT /api/users/:id`

- Requires authentication.
- Users can update their own information.
- Admin users can update any user's information.
- Regular users cannot update another user's account or change their role.

Expected responses:

- `200 OK` — User successfully updated.
- `400 Bad Request` — Invalid input.
- `401 Unauthorized` — User is not authenticated.
- `403 Forbidden` — User is not permitted to perform the operation.
- `404 Not Found` — User does not exist.
- `500 Internal Server Error` — Unexpected server error.

### Delete a user

**Proposed endpoint:** `DELETE /api/users/:id`

- Requires authentication.
- Users can delete their own accounts.
- Admin users can delete any user's account.
- Regular users cannot delete another user's account.

Expected responses:

- `200 OK` or `204 No Content` — User successfully deleted.
- `401 Unauthorized` — User is not authenticated.
- `403 Forbidden` — User is not permitted to perform the operation.
- `404 Not Found` — User does not exist.
- `500 Internal Server Error` — Unexpected server error.

The final response formats and status codes will follow the project's existing API conventions.

## 4. User Experience and Access Control

### Signed-out users

- Attempting to access the user admin page redirects the user to the login page.
- API requests without authentication are rejected.

### Signed-in admin users

- Can access the user admin page.
- Can see all users.
- Can update or delete any user.
- The displayed list updates without a full page refresh after successful operations.

### Signed-in regular users

- Can access the user admin page.
- Can see only their own information.
- Can update or delete their own account.
- Cannot access or modify another user's information.

### Frontend behaviour

Client-side JavaScript will:

1. Request the permitted user information from the API.
2. Display the returned users dynamically.
3. Provide update and delete actions.
4. Send update and delete requests to the API.
5. Refresh the displayed user information after successful operations without reloading the page.
6. Display appropriate feedback when an operation fails.

## 5. Test Plan

### Authentication tests

- A signed-out user attempting to access the page is redirected to login.
- A signed-out user cannot retrieve users through the API.
- An authenticated user can access the page.

### Admin tests

- An admin can retrieve all users.
- An admin can update another user's information.
- An admin can delete another user's account.
- The displayed list reflects successful updates and deletions without a page refresh.

### Regular user tests

- A regular user can retrieve only their own information.
- A regular user can update their own information.
- A regular user can delete their own account.
- A regular user cannot retrieve another user's information by changing an ID or manipulating a request.
- A regular user cannot update or delete another user's account.
- A regular user cannot change their role to admin.

### Error handling tests

- Updating a nonexistent user returns `404 Not Found`.
- Deleting a nonexistent user returns `404 Not Found`.
- Invalid update data is rejected.
- Unauthorized requests are rejected with the appropriate status code.

## 6. Dependencies

This feature depends on Feature Set 1: Core Authentication and the authentication functionality established by Feature Set 2.

The implementation will reuse the existing authentication middleware, session configuration, user model and project conventions wherever possible.